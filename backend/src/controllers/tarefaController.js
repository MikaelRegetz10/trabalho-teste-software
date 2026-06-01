const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Validador auxiliar de regras de negócio
async function validarMembroGrupo(grupoId, usuarioId) {
  const res = await db.query('SELECT id FROM membro_grupo WHERE grupo_id = $1 AND usuario_id = $2', [grupoId, usuarioId]);
  return res.rows.length > 0;
}

exports.listarTarefas = async (req, res) => {
  const { status, responsavel_id, data_inicio, data_fim } = req.query;
  let queryText = 'SELECT * FROM tarefa WHERE grupo_id = $1';
  const params = [req.grupoId];
  let counter = 2;

  if (status) { queryText += ` AND status = $${counter++}`; params.push(status); }
  if (responsavel_id) { queryText += ` AND responsavel_id = $${counter++}`; params.push(responsavel_id); }
  if (data_inicio) { queryText += ` AND data_hora_execucao >= $${counter++}`; params.push(data_inicio); }
  if (data_fim) { queryText += ` AND data_hora_execucao <= $${counter++}`; params.push(data_fim); }

  try {
    const result = await db.query(queryText, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar tarefas.' });
  }
};

exports.criarTarefa = async (req, res) => {
  const { idoso_id, responsavel_id, titulo, descricao, data_hora_execucao, e_critica, antecedencia_min } = req.body;

  if (!idoso_id || !responsavel_id || !titulo || !data_hora_execucao || antecedencia_min === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  if (antecedencia_min < 1) return res.status(400).json({ error: 'Antecedência mínima deve ser de pelo menos 1 minuto.' });

  try {
    const pertenceAoGrupo = await validarMembroGrupo(req.grupoId, responsavel_id);
    if (!pertenceAoGrupo) return res.status(400).json({ error: 'O responsável pela tarefa deve pertencer ao grupo familiar.' });
  } catch (err) { return res.status(500).json({ error: 'Erro de validação de dados.' }); }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const tarefaId = uuidv4();

    const insertTarefa = `
      INSERT INTO tarefa (id, grupo_id, idoso_id, criado_por, responsavel_id, titulo, descricao, data_hora_execucao, status, e_critica, antecedencia_min, criado_em, atualizado_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente', $9, $10, NOW(), NOW())
    `;
    await client.query(insertTarefa, [tarefaId, req.grupoId, idoso_id, req.userId, responsavel_id, titulo, descricao, data_hora_execucao, e_critica || false, antecedencia_min]);

    await client.query(
      `INSERT INTO historico_tarefa (id, tarefa_id, usuario_id, acao, detalhe, realizado_em) VALUES ($1, $2, $3, 'criacao', 'Tarefa criada no sistema.', NOW())`,
      [uuidv4(), tarefaId, req.userId]
    );

    const agendadoPara = new Date(new Date(data_hora_execucao).getTime() - (antecedencia_min * 60000));
    await client.query(
      `INSERT INTO notificacao (id, tarefa_id, usuario_id, agendado_para, enviada, tentativa, criado_em) VALUES ($1, $2, $3, $4, false, 0, NOW())`,
      [uuidv4(), tarefaId, responsavel_id, agendadoPara]
    );

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Tarefa criada com sucesso.', tarefaId });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao persistir a tarefa.' });
  } finally {
    client.release();
  }
};

exports.obterTarefaCompleta = async (req, res) => {
  const { tarefaId } = req.params;
  try {
    const tarefaRes = await db.query('SELECT * FROM tarefa WHERE id = $1 AND grupo_id = $2', [tarefaId, req.grupoId]);
    if (tarefaRes.rows.length === 0) return res.status(404).json({ error: 'Tarefa não localizada no grupo.' });

    const historicoRes = await db.query('SELECT * FROM historico_tarefa WHERE tarefa_id = $1 ORDER BY realizado_em DESC', [tarefaId]);
    const notificacoesRes = await db.query('SELECT * FROM notificacao WHERE tarefa_id = $1 ORDER BY agendado_para ASC', [tarefaId]);

    return res.json({ ...tarefaRes.rows[0], historico: historicoRes.rows, notificacoes: notificacoesRes.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados da tarefa.' });
  }
};

exports.atualizarTarefa = async (req, res) => {
  const { tarefaId } = req.params;
  const { titulo, descricao, data_hora_execucao, responsavel_id, e_critica, antecedencia_min } = req.body;

  try {
    const tRes = await db.query('SELECT criado_por FROM tarefa WHERE id = $1 AND grupo_id = $2', [tarefaId, req.grupoId]);
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    
    if (tRes.rows[0].criado_por !== req.userId && req.userPapel !== 'administrador') {
      return res.status(403).json({ error: 'Ação permitida apenas para o criador ou administradores.' });
    }

    if (responsavel_id) {
      const pertence = await validarMembroGrupo(req.grupoId, responsavel_id);
      if (!pertence) return res.status(400).json({ error: 'O novo responsável deve pertencer ao grupo.' });
    }
  } catch (e) { return res.status(500).json({ error: 'Erro nas validações de edição.' }); }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const updateText = `
      UPDATE tarefa SET titulo = COALESCE($1, titulo), descricao = COALESCE($2, descricao), 
      data_hora_execucao = COALESCE($3, data_hora_execucao), responsavel_id = COALESCE($4, responsavel_id),
      e_critica = COALESCE($5, e_critica), antecedencia_min = COALESCE($6, antecedencia_min), atualizado_em = NOW()
      WHERE id = $7 RETURNING *
    `;
    const resUpdate = await client.query(updateText, [titulo, descricao, data_hora_execucao, responsavel_id, e_critica, antecedencia_min, tarefaId]);

    await client.query(
      `INSERT INTO historico_tarefa (id, tarefa_id, usuario_id, acao, detalhe, realizado_em) VALUES ($1, $2, $3, 'edicao', 'Modificação nas propriedades da tarefa.', NOW())`,
      [uuidv4(), tarefaId, req.userId]
    );

    if (data_hora_execucao || antecedencia_min) {
      const t = resUpdate.rows[0];
      const agendadoPara = new Date(new Date(t.data_hora_execucao).getTime() - (t.antecedencia_min * 60000));
      await client.query(
        `UPDATE notificacao SET agendado_para = $1, enviado = false WHERE tarefa_id = $2 AND enviado = false`,
        [agendadoPara, tarefaId]
      );
    }

    await client.query('COMMIT');
    return res.json({ message: 'Tarefa alterada com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao processar atualização da tarefa.' });
  } finally {
    client.release();
  }
};

exports.atualizarStatusTarefa = async (req, res) => {
  const { tarefaId } = req.params;
  const { status } = req.body;

  if (!['concluida', 'cancelada', 'pendente'].includes(status)) {
    return res.status(400).json({ error: 'Status informado é inválido.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const tRes = await client.query('SELECT e_critica, status FROM tarefa WHERE id = $1 AND grupo_id = $2', [tarefaId, req.grupoId]);
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    const acao = status === 'concluida' ? 'conclusao' : (status === 'cancelada' ? 'cancelamento' : 'edicao');

    await client.query('UPDATE tarefa SET status = $1, atualizado_em = NOW() WHERE id = $2', [status, tarefaId]);
    await client.query(
      `INSERT INTO historico_tarefa (id, tarefa_id, usuario_id, acao, detalhe, realizado_em) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), tarefaId, req.userId, acao, `Status alterado explicitamente para ${status}.`, NOW()]
    );

    await client.query('COMMIT');
    return res.json({ message: `Status alterado com sucesso para ${status}.` });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  } finally {
    client.release();
  }
};

exports.excluirTarefa = async (req, res) => {
  const { tarefaId } = req.params;

  try {
    const tRes = await db.query('SELECT criado_por FROM tarefa WHERE id = $1 AND grupo_id = $2', [tarefaId, req.grupoId]);
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    if (tRes.rows[0].criado_por !== req.userId && req.userPapel !== 'administrador') {
      return res.status(403).json({ error: 'Apenas o criador ou administradores do grupo possuem permissão para excluir.' });
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM notificacao WHERE tarefa_id = $1', [tarefaId]);
      await client.query('DELETE FROM historico_tarefa WHERE tarefa_id = $1', [tarefaId]);
      await client.query('DELETE FROM tarefa WHERE id = $1', [tarefaId]);
      await client.query('COMMIT');
      return res.json({ message: 'Tarefa removida permanentemente do sistema.' });
    } catch (e) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Erro ao remover registros dependentes.' });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao tentar deletar a tarefa.' });
  }
};
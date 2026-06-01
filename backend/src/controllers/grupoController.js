const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.criarGrupo = async (req, res) => {
  const { nome_idoso, data_nascimento_idoso, observacoes_saude, nome_grupo } = req.body;
  if (!nome_idoso || !nome_grupo) return res.status(400).json({ error: 'Nome do idoso e do grupo são obrigatórios.' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const idosoId = uuidv4();
    await client.query(
      `INSERT INTO idoso (id, nome, data_nascimento, observacoes_saude, criado_em, atualizado_em) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [idosoId, nome_idoso, data_nascimento_idoso, observacoes_saude]
    );

    const grupoId = uuidv4();
    await client.query(
      `INSERT INTO grupo_familiar (id, idoso_id, nome, criado_em) VALUES ($1, $2, $3, NOW())`,
      [grupoId, idosoId, nome_grupo]
    );

    await client.query(
      `INSERT INTO membro_grupo (id, grupo_id, usuario_id, papel, entrou_em) VALUES ($1, $2, $3, 'administrador', NOW())`,
      [uuidv4(), grupoId, req.userId]
    );

    await client.query('COMMIT');
    return res.status(201).json({ grupoId, nome_grupo, idosoId });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao criar grupo familiar.' });
  } finally {
    client.release();
  }
};

exports.obterGrupo = async (req, res) => {
  try {
    const grupoRes = await db.query(
      `SELECT g.id, g.nome, i.id as idoso_id, i.nome as idoso_nome, i.data_nascimento, i.observacoes_saude 
       FROM grupo_familiar g JOIN idoso i ON g.idoso_id = i.id WHERE g.id = $1`, [req.grupoId]
    );
    
    const membrosRes = await db.query(
      `SELECT u.id, u.nome, u.email, m.papel, m.entrou_em 
       FROM membro_grupo m JOIN usuario u ON m.usuario_id = u.id WHERE m.grupo_id = $1`, [req.grupoId]
    );

    if (grupoRes.rows.length === 0) return res.status(404).json({ error: 'Grupo não encontrado.' });

    return res.json({ ...grupoRes.rows[0], membros: membrosRes.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados do grupo.' });
  }
};

exports.adicionarMembroDireto = async (req, res) => {
  const { usuario_id, papel } = req.body;
  if (!usuario_id || !papel) return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

  try {
    const userExist = await db.query('SELECT id FROM usuario WHERE id = $1', [usuario_id]);
    if (userExist.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

    await db.query(
      `INSERT INTO membro_grupo (id, grupo_id, usuario_id, papel, entrou_em) VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), req.grupoId, usuario_id, papel]
    );
    return res.status(201).json({ message: 'Membro adicionado com sucesso.' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Usuário já é membro deste grupo.' });
    return res.status(500).json({ error: 'Erro ao adicionar membro.' });
  }
};

exports.removerMembro = async (req, res) => {
  if (req.userPapel !== 'administrador') return res.status(403).json({ error: 'Apenas administradores podem remover membros.' });
  const { usuarioId } = req.params;

  try {
    const result = await db.query('DELETE FROM membro_grupo WHERE grupo_id = $1 AND usuario_id = $2', [req.grupoId, usuarioId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Membro não encontrado no grupo.' });
    return res.json({ message: 'Membro removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover membro.' });
  }
};

exports.obterHistoricoGrupo = async (req, res) => {
  try {
    const queryText = `
      SELECT h.id, h.acao, h.detalhe, h.realizado_em,
             u.id as usuario_id, u.nome as usuario_nome,
             t.id as tarefa_id, t.titulo as tarefa_titulo
      FROM historico_tarefa h
      JOIN usuario u ON h.usuario_id = u.id
      JOIN tarefa t ON h.tarefa_id = t.id
      WHERE t.grupo_id = $1
      ORDER BY h.realizado_em DESC
    `;
    const result = await db.query(queryText, [req.grupoId]);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar histórico do grupo.' });
  }
};
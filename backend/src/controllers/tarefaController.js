const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Validador auxiliar de regras de negócio adaptado para o Supabase Client
async function validarMembroGrupo(grupoId, usuarioId) {
  const { data, error } = await db.supabase
    .from('membro_grupo')
    .select('id')
    .eq('grupo_id', grupoId)
    .eq('usuario_id', usuarioId);

  if (error) return false;
  return data && data.length > 0;
}

exports.listarTarefas = async (req, res) => {
  const { status, responsavel_id, data_inicio, data_fim } = req.query;
  
  try {
    // Inicializa a query básica filtrando obrigatoriamente pelo grupo logado
    let query = db.supabase
      .from('tarefa')
      .select('*')
      .eq('grupo_id', req.grupoId);

    // Adiciona dinamicamente os filtros condicionais enviados por query string
    if (status) query = query.eq('status', status);
    if (responsavel_id) query = query.eq('responsavel_id', responsavel_id);
    if (data_inicio) query = query.gte('data_hora_execucao', data_inicio); // gte: maior ou igual que (>=)
    if (data_fim) query = query.lte('data_hora_execucao', data_fim);       // lte: menor ou igual que (<=)

    const { data: tarefas, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(tarefas);
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

  try {
    const tarefaId = uuidv4();

    // 1. Cria a tarefa no sistema
    const { error: tarefaError } = await db.supabase
      .from('tarefa')
      .insert([
        {
          id: tarefaId,
          grupo_id: req.grupoId,
          idoso_id,
          criado_por: req.userId,
          responsavel_id,
          titulo,
          descricao,
          data_hora_execucao,
          status: 'pendente',
          e_critica: e_critica || false,
          antecedencia_min
        }
      ]);

    if (tarefaError) return res.status(500).json({ error: 'Erro ao persistir a tarefa: ' + tarefaError.message });

    // 2. Registra a criação no histórico de tarefas
    const { error: historicoError } = await db.supabase
      .from('historico_tarefa')
      .insert([
        {
          id: uuidv4(),
          tarefa_id: tarefaId,
          usuario_id: req.userId,
          acao: 'criacao',
          detalhe: 'Tarefa criada no sistema.'
        }
      ]);

    if (historicoError) return res.status(500).json({ error: 'Erro ao salvar histórico: ' + historicoError.message });

    // 3. Calcula o agendamento da notificação baseando-se na antecedência em milissegundos
    const agendadoPara = new Date(new Date(data_hora_execucao).getTime() - (antecedencia_min * 60000));
    
    const { error: notificacaoError } = await db.supabase
      .from('notificacao')
      .insert([
        {
          id: uuidv4(),
          tarefa_id: tarefaId,
          usuario_id: responsavel_id,
          agendado_para: agendadoPara.toISOString(),
          enviada: false,
          tentativa: 0
        }
      ]);

    if (notificacaoError) return res.status(500).json({ error: 'Erro ao agendar notificação: ' + notificacaoError.message });

    return res.status(201).json({ message: 'Tarefa criada com sucesso.', tarefaId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar a criação da tarefa.' });
  }
};

exports.obterTarefaCompleta = async (req, res) => {
  const { tarefaId } = req.params;
  try {
    // 1. Busca os dados da tarefa filtrando pelo ID e validando o vínculo com o grupo
    const { data: tarefas, error: tarefaError } = await db.supabase
      .from('tarefa')
      .select('*')
      .eq('id', tarefaId)
      .eq('grupo_id', req.grupoId);

    if (tarefaError) return res.status(500).json({ error: tarefaError.message });
    if (!tarefas || tarefas.length === 0) return res.status(404).json({ error: 'Tarefa não localizada no grupo.' });

    const tarefa = tarefas[0];

    // 2. Busca o histórico da tarefa ordenando por data decrescente
    const { data: historico, error: histError } = await db.supabase
      .from('historico_tarefa')
      .select('*')
      .eq('tarefa_id', tarefaId)
      .order('realizado_em', { ascending: false });

    if (histError) return res.status(500).json({ error: histError.message });

    // 3. Busca os agendamentos de notificações ordenando por data crescente
    const { data: notificacoes, error: notifError } = await db.supabase
      .from('notificacao')
      .select('*')
      .eq('tarefa_id', tarefaId)
      .order('agendado_para', { ascending: true });

    if (notifError) return res.status(500).json({ error: notifError.message });

    return res.json({ 
      ...tarefa, 
      historico: historico || [], 
      notificacoes: notificacoes || [] 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados da tarefa.' });
  }
};

exports.atualizarTarefa = async (req, res) => {
  const { tarefaId } = req.params;
  const { titulo, descricao, data_hora_execucao, responsavel_id, e_critica, antecedencia_min } = req.body;

  try {
    // Valida se a tarefa existe e captura quem a criou
    const { data: tarefas, error: fetchError } = await db.supabase
      .from('tarefa')
      .select('criado_por')
      .eq('id', tarefaId)
      .eq('grupo_id', req.grupoId);

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!tarefas || tarefas.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    
    if (tarefas[0].criado_por !== req.userId && req.userPapel !== 'administrador') {
      return res.status(403).json({ error: 'Ação permitida apenas para o criador ou administradores.' });
    }

    if (responsavel_id) {
      const pertence = await validarMembroGrupo(req.grupoId, responsavel_id);
      if (!pertence) return res.status(400).json({ error: 'O novo responsável deve pertencer ao grupo.' });
    }
  } catch (e) { return res.status(500).json({ error: 'Erro nas validações de edição.' }); }

  try {
    // 1. Atualiza as propriedades enviadas na tarefa (Supabase ignora campos definidos como undefined)
    const { data: updatedTarefas, error: updateError } = await db.supabase
      .from('tarefa')
      .update({
        titulo,
        descricao,
        data_hora_execucao,
        responsavel_id,
        e_critica,
        antecedencia_min,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', tarefaId)
      .select('*');

    if (updateError) return res.status(500).json({ error: updateError.message });

    // 2. Insere histórico de modificação
    const { error: histError } = await db.supabase
      .from('historico_tarefa')
      .insert([
        {
          id: uuidv4(),
          tarefa_id: tarefaId,
          usuario_id: req.userId,
          acao: 'edicao',
          detalhe: 'Modificação nas propriedades da tarefa.'
        }
      ]);

    if (histError) return res.status(500).json({ error: histError.message });

    // 3. Se houver reajuste no horário ou na antecedência mínima, recalcula a notificação pendente
    if (data_hora_execucao || antecedencia_min) {
      const t = updatedTarefas[0];
      const agendadoPara = new Date(new Date(t.data_hora_execucao).getTime() - (t.antecedencia_min * 60000));
      
      const { error: notifError } = await db.supabase
        .from('notificacao')
        .update({ 
          agendado_para: agendadoPara.toISOString(), 
          enviada: false 
        })
        .eq('tarefa_id', tarefaId)
        .eq('enviada', false);

      if (notifError) return res.status(500).json({ error: notifError.message });
    }

    return res.json({ message: 'Tarefa alterada com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar atualização da tarefa.' });
  }
};

exports.atualizarStatusTarefa = async (req, res) => {
  const { tarefaId } = req.params;
  const { status } = req.body;

  if (!['concluida', 'cancelada', 'pendente'].includes(status)) {
    return res.status(400).json({ error: 'Status informado é inválido.' });
  }

  try {
    // Valida a existência da tarefa no respectivo grupo
    const { data: tarefas, error: fetchError } = await db.supabase
      .from('tarefa')
      .select('e_critica, status')
      .eq('id', tarefaId)
      .eq('grupo_id', req.grupoId);

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!tarefas || tarefas.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    const acao = status === 'concluida' ? 'conclusao' : (status === 'cancelada' ? 'cancelamento' : 'edicao');

    // 1. Atualiza o status da tarefa
    const { error: updateError } = await db.supabase
      .from('tarefa')
      .update({ 
        status, 
        atualizado_em: new Date().toISOString() 
      })
      .eq('id', tarefaId);

    if (updateError) return res.status(500).json({ error: updateError.message });

    // 2. Adiciona o evento de alteração ao histórico
    const { error: histError } = await db.supabase
      .from('historico_tarefa')
      .insert([
        {
          id: uuidv4(),
          tarefa_id: tarefaId,
          usuario_id: req.userId,
          acao,
          detalhe: `Status alterado explicitamente para ${status}.`
        }
      ]);

    if (histError) return res.status(500).json({ error: histError.message });

    return res.json({ message: `Status alterado com sucesso para ${status}.` });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};

exports.excluirTarefa = async (req, res) => {
  const { tarefaId } = req.params;

  try {
    // Valida se a tarefa existe e quem possui a posse dela
    const { data: tarefas, error: fetchError } = await db.supabase
      .from('tarefa')
      .select('criado_por')
      .eq('id', tarefaId)
      .eq('grupo_id', req.grupoId);

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!tarefas || tarefas.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    if (tarefas[0].criado_por !== req.userId && req.userPapel !== 'administrador') {
      return res.status(403).json({ error: 'Apenas o criador ou administradores do grupo possuem permissão para excluir.' });
    }

    // Deleta os registros vinculados sequencialmente em cascata (caso não configurado via ON DELETE CASCADE no banco)
    const { error: notifDelError } = await db.supabase.from('notificacao').delete().eq('tarefa_id', tarefaId);
    if (notifDelError) return res.status(500).json({ error: notifDelError.message });

    const { error: histDelError } = await db.supabase.from('historico_tarefa').delete().eq('tarefa_id', tarefaId);
    if (histDelError) return res.status(500).json({ error: histDelError.message });

    const { error: tarefaDelError } = await db.supabase.from('tarefa').delete().eq('id', tarefaId);
    if (tarefaDelError) return res.status(500).json({ error: tarefaDelError.message });

    return res.json({ message: 'Tarefa removida permanentemente do sistema.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao tentar deletar a tarefa.' });
  }
};
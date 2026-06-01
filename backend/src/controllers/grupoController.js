const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.criarGrupo = async (req, res) => {
  const { nome_idoso, data_nascimento_idoso, observacoes_saude, nome_grupo } = req.body;
  if (!nome_idoso || !nome_grupo) return res.status(400).json({ error: 'Nome do idoso e do grupo são obrigatórios.' });

  try {
    const idosoId = uuidv4();
    const grupoId = uuidv4();

    // 1. Insere o idoso
    const { error: idosoError } = await db.supabase
      .from('idoso')
      .insert([
        { 
          id: idosoId, 
          nome: nome_idoso, 
          data_nascimento: data_nascimento_idoso || null, 
          observacoes_saude 
        }
      ]);

    if (idosoError) return res.status(500).json({ error: 'Erro ao cadastrar idoso: ' + idosoError.message });

    // 2. Insere o grupo familiar
    const { error: grupoError } = await db.supabase
      .from('grupo_familiar')
      .insert([
        { 
          id: grupoId, 
          idoso_id: idosoId, 
          nome: nome_grupo 
        }
      ]);

    if (grupoError) return res.status(500).json({ error: 'Erro ao criar grupo familiar: ' + grupoError.message });

    // 3. Insere o criador como membro administrador do grupo
    const { error: membroError } = await db.supabase
      .from('membro_grupo')
      .insert([
        { 
          id: uuidv4(), 
          grupo_id: grupoId, 
          usuario_id: req.userId, 
          papel: 'administrador' 
        }
      ]);

    if (membroError) return res.status(500).json({ error: 'Erro ao vincular membro ao grupo: ' + membroError.message });

    return res.status(201).json({ grupoId, nome_grupo, idosoId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao criar grupo familiar.' });
  }
};

exports.obterGrupo = async (req, res) => {
  try {
    // 1. Busca dados do grupo juntando com o idoso envolvido (Simulação de JOIN por tabelas relacionadas)
    const { data: grupoData, error: grupoError } = await db.supabase
      .from('grupo_familiar')
      .select(`
        id, 
        nome, 
        idoso:idoso_id (
          id, 
          nome, 
          data_nascimento, 
          observacoes_saude
        )
      `)
      .eq('id', req.grupoId)
      .single();

    if (grupoError || !grupoData) return res.status(404).json({ error: 'Grupo não encontrado.' });

    // 2. Busca os membros associados ao grupo juntando dados da tabela de usuário
    const { data: membrosData, error: membrosError } = await db.supabase
      .from('membro_grupo')
      .select(`
        papel, 
        entrou_em,
        usuario:usuario_id (
          id, 
          nome, 
          email
        )
      `)
      .eq('grupo_id', req.grupoId);

    if (membrosError) return res.status(500).json({ error: membrosError.message });

    // Formata os objetos aninhados do Supabase para manter compatibilidade com o formato esperado pelo frontend/testes
    const membrosFormatados = membrosData.map(m => ({
      id: m.usuario?.id,
      nome: m.usuario?.nome,
      email: m.usuario?.email,
      papel: m.papel,
      entrou_em: m.entrou_em
    }));

    return res.json({
      id: grupoData.id,
      nome: grupoData.nome,
      idoso_id: grupoData.idoso?.id,
      idoso_nome: grupoData.idoso?.nome,
      data_nascimento: grupoData.idoso?.data_nascimento,
      observacoes_saude: grupoData.idoso?.observacoes_saude,
      membros: membrosFormatados
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados do grupo.' });
  }
};

exports.adicionarMembroDireto = async (req, res) => {
  const { usuario_id, papel } = req.body;
  if (!usuario_id || !papel) return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

  try {
    // Verifica se o usuário existe
    const { data: userExist, error: userError } = await db.supabase
      .from('usuario')
      .select('id')
      .eq('id', usuario_id);

    if (userError) return res.status(500).json({ error: userError.message });
    if (!userExist || userExist.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Adiciona o vínculo de membro
    const { error: insertError } = await db.supabase
      .from('membro_grupo')
      .insert([
        { 
          id: uuidv4(), 
          grupo_id: req.grupoId, 
          usuario_id, 
          papel 
        }
      ]);

    if (insertError) {
      if (insertError.code === '23505') return res.status(409).json({ error: 'Usuário já é membro deste grupo.' });
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(201).json({ message: 'Membro adicionado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar membro.' });
  }
};

exports.removerMembro = async (req, res) => {
  if (req.userPapel !== 'administrador') return res.status(403).json({ error: 'Apenas administradores podem remover membros.' });
  const { usuarioId } = req.params;

  try {
    const { data, error, count } = await db.supabase
      .from('membro_grupo')
      .delete({ count: 'exact' })
      .eq('grupo_id', req.grupoId)
      .eq('usuario_id', usuarioId);

    if (error) return res.status(500).json({ error: error.message });
    if (count === 0) return res.status(404).json({ error: 'Membro não encontrado no grupo.' });

    return res.json({ message: 'Membro removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover membro.' });
  }
};

exports.obterHistoricoGrupo = async (req, res) => {
  try {
    // Busca histórico utilizando sintaxe de relacionamentos do Supabase Client para imitar os JOINs
    const { data: historico, error } = await db.supabase
      .from('historico_tarefa')
      .select(`
        id, 
        acao, 
        detalhe, 
        realizado_em,
        usuario:usuario_id (id, nome),
        tarefa:tarefa_id (id, titulo, grupo_id)
      `)
      .from('historico_tarefa')
      // Filtramos indiretamente garantindo que a tarefa pertence ao grupo atual
      .eq('tarefa.grupo_id', req.grupoId)
      .order('realizado_em', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Como o Supabase filtra após a junção estrutural, limpamos os resultados nulos decorrentes do filtro na relação tarefa
    const historicoFiltradoEFormatado = historico
      .filter(h => h.tarefa !== null)
      .map(h => ({
        id: h.id,
        acao: h.acao,
        detalhe: h.detalhe,
        realizado_em: h.realizado_em,
        usuario_id: h.usuario?.id,
        usuario_nome: h.usuario?.nome,
        tarefa_id: h.tarefa?.id,
        tarefa_titulo: h.tarefa?.titulo
      }));

    return res.json(historicoFiltradoEFormatado);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar histórico do grupo.' });
  }
};
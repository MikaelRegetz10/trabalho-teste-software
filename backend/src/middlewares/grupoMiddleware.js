const db = require('../config/db');

module.exports = async (req, res, next) => {
  const grupoId = req.params.grupoId || req.body.grupo_id;

  if (!grupoId) {
    return res.status(400).json({ error: 'ID do grupo não fornecido.' });
  }

  try {
    const { data: membroGrupo, error } = await db.supabase
      .from('membro_grupo')
      .select('papel')
      .eq('grupo_id', grupoId)
      .eq('usuario_id', req.userId);

    if (error) return res.status(500).json({ error: error.message });

    if (!membroGrupo || membroGrupo.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Você não é membro deste grupo.' });
    }

    req.userPapel = membroGrupo[0].papel;
    req.grupoId = grupoId;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao validar vínculo com o grupo.' });
  }
};
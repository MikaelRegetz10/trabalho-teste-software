const db = require('../config/db');

module.exports = async (req, res, next) => {
  const grupoId = req.params.grupoId || req.body.grupo_id;

  if (!grupoId) {
    return res.status(400).json({ error: 'ID do grupo não fornecido.' });
  }

  try {
    const queryText = `
      SELECT papel FROM membro_grupo 
      WHERE grupo_id = $1 AND usuario_id = $2
    `;
    const resMembro = await db.query(queryText, [grupoId, req.userId]);

    if (resMembro.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Você não é membro deste grupo.' });
    }

    req.userPapel = resMembro.rows[0].papel;
    req.grupoId = grupoId;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao validar vínculo com o grupo.' });
  }
};
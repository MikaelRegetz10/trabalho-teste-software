const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const expirarConvitesAntigos = async () => {
  await db.query(`UPDATE convite SET status = 'expirado' WHERE expira_em < NOW() AND status = 'pendente'`);
};

exports.criarConvite = async (req, res) => {
  const { email_convidado } = req.body;
  if (!email_convidado) return res.status(400).json({ error: 'E-mail do convidado obrigatório.' });

  try {
    await expirarConvitesAntigos();
    const token = uuidv4();
    const id = uuidv4();

    const queryText = `
      INSERT INTO convite (id, grupo_id, convidado_por, email_convidado, token, status, criado_em, expira_em)
      VALUES ($1, $2, $3, $4, $5, 'pendente', NOW(), NOW() + INTERVAL '7 days')
    `;
    await db.query(queryText, [id, req.grupoId, req.userId, email_convidado, token]);
    return res.status(201).json({ message: 'Convite gerado com sucesso.', token });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar convite.' });
  }
};

exports.aceitarConvite = async (req, res) => {
  const { token } = req.params;
  await expirarConvitesAntigos();

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const conviteRes = await client.query('SELECT * FROM convite WHERE token = $1', [token]);
    if (conviteRes.rows.length === 0) return res.status(404).json({ error: 'Convite não encontrado.' });

    const convite = conviteRes.rows[0];
    if (convite.status !== 'pendente') return res.status(400).json({ error: `Este convite não está mais pendente (Status: ${convite.status}).` });

    await client.query(
      `INSERT INTO membro_grupo (id, grupo_id, usuario_id, papel, entrou_em) VALUES ($1, $2, $3, 'cuidador', NOW())`,
      [uuidv4(), convite.grupo_id, req.userId]
    );

    await client.query(`UPDATE convite SET status = 'aceito', respondido_em = NOW() WHERE id = $1`, [convite.id]);

    await client.query('COMMIT');
    return res.json({ message: 'Convite aceito com sucesso. Você agora faz parte do grupo!' });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Você já é membro deste grupo.' });
    return res.status(500).json({ error: 'Erro ao aceitar convite.' });
  } finally {
    client.release();
  }
};

exports.recusarConvite = async (req, res) => {
  const { token } = req.params;
  await expirarConvitesAntigos();

  try {
    const result = await db.query(
      `UPDATE convite SET status = 'recusado', respondido_em = NOW() WHERE token = $1 AND status = 'pendente' RETURNING id`,
      [token]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Convite inválido, expirado ou já respondido.' });
    return res.json({ message: 'Convite recusado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao recusar convite.' });
  }
};
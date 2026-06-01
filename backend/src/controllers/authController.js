const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

  try {
    const userExists = await db.query('SELECT id FROM usuario WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(409).json({ error: 'E-mail já cadastrado.' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const id = uuidv4();

    const insertText = `
      INSERT INTO usuario (id, nome, email, senha_hash, telefone, criado_em, atualizado_em)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email
    `;
    const newUser = await db.query(insertText, [id, nome, email, senhaHash, telefone]);

    const token = jwt.sign({ userId: newUser.rows[0].id, email: newUser.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.status(201).json({ token });
    } catch (err) {
        return res.status(500).json({ error: err.message, detalhe: err.hint || 'Sem dicas' });    }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

  try {
    const result = await db.query('SELECT * FROM usuario WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const usuario = result.rows[0];
    const validSenha = await bcrypt.compare(senha, usuario.senha_hash);
    if (!validSenha) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ userId: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};
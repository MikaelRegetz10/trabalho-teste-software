const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

  try {
    const { data: userExists, error: checkError } = await db.supabase
      .from('usuario')
      .select('id')
      .eq('email', email);

    if (checkError) return res.status(500).json({ error: checkError.message });
    if (userExists && userExists.length > 0) return res.status(409).json({ error: 'E-mail já cadastrado.' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const id = uuidv4();

    const { data: newUser, error: insertError } = await db.supabase
      .from('usuario')
      .insert([
        { id, nome, email, senha_hash: senhaHash, telefone }
      ])
      .select('id', 'email')
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({ token });
    } catch (err) {
        return res.status(500).json({ error: err.message, detalhe: err.hint || 'Sem dicas' });    }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

  try {
    const { data: usuarios, error: fetchError } = await db.supabase
      .from('usuario')
      .select('*')
      .eq('email', email);

    if (fetchError) return res.status(500).json({ error: fetchError.message });

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = usuarios[0];
    const validSenha = await bcrypt.compare(senha, usuario.senha_hash);
    if (!validSenha) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};
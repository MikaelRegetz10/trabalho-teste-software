const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Função auxiliar para expirar convites antigos
const expirarConvitesAntigos = async () => {
  const { error } = await db.supabase
    .from('convite')
    .update({ status: 'expirado' })
    .lt('expira_em', new Date().toISOString())
    .eq('status', 'pendente');
    
  if (error) console.error('Erro ao expirar convites antigos:', error.message);
};

exports.criarConvite = async (req, res) => {
  const { email_convidado } = req.body;
  if (!email_convidado) return res.status(400).json({ error: 'E-mail do convidado obrigatório.' });

  try {
    await expirarConvitesAntigos();
    const token = uuidv4();
    const id = uuidv4();

    // Calcula a data de expiração para 7 dias no futuro em JS
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    const { error: insertError } = await db.supabase
      .from('convite')
      .insert([
        {
          id,
          grupo_id: req.grupoId,
          convidado_por: req.userId,
          email_convidado,
          token,
          status: 'pendente',
          expira_em: expiraEm.toISOString()
        }
      ]);

    if (insertError) return res.status(500).json({ error: insertError.message });

    return res.status(201).json({ message: 'Convite gerado com sucesso.', token });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar convite.' });
  }
};

exports.aceitarConvite = async (req, res) => {
  const { token } = req.params;
  await expirarConvitesAntigos();

  try {
    // 1. Busca o convite pelo token
    const { data: convites, error: fetchError } = await db.supabase
      .from('convite')
      .select('*')
      .eq('token', token);

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!convites || convites.length === 0) return res.status(404).json({ error: 'Convite não encontrado.' });

    const convite = convites[0];
    if (convite.status !== 'pendente') {
      return res.status(400).json({ error: `Este convite não está mais pendente (Status: ${convite.status}).` });
    }

    // 2. Insere o novo membro no grupo familiar
    const { error: insertMembroError } = await db.supabase
      .from('membro_grupo')
      .insert([
        {
          id: uuidv4(),
          grupo_id: convite.grupo_id,
          usuario_id: req.userId,
          papel: 'cuidador'
        }
      ]);

    if (insertMembroError) {
      // Código de erro do Postgres para Unique Constraint Violation (Usuário já cadastrado no grupo)
      if (insertMembroError.code === '23505') {
        return res.status(409).json({ error: 'Você já é membro deste grupo.' });
      }
      return res.status(500).json({ error: insertMembroError.message });
    }

    // 3. Atualiza o status do convite para aceito
    const { error: updateConviteError } = await db.supabase
      .from('convite')
      .update({ status: 'aceito', respondido_em: new Date().toISOString() })
      .eq('id', convite.id);

    if (updateConviteError) return res.status(500).json({ error: updateConviteError.message });

    return res.json({ message: 'Convite aceito com sucesso. Você agora faz parte do grupo!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao aceitar convite.' });
  }
};

exports.recusarConvite = async (req, res) => {
  const { token } = req.params;
  await expirarConvitesAntigos();

  try {
    const { data: updatedConvites, error: updateError } = await db.supabase
      .from('convite')
      .update({ status: 'recusado', respondido_em: new Date().toISOString() })
      .eq('token', token)
      .eq('status', 'pendente')
      .select('id');

    if (updateError) return res.status(500).json({ error: updateError.message });
    
    if (!updatedConvites || updatedConvites.length === 0) {
      return res.status(400).json({ error: 'Convite inválido, expirado ou já respondido.' });
    }

    return res.json({ message: 'Convite recusado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao recusar convite.' });
  }
};
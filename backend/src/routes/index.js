const express = require('express');
const router = express.Router(); // <--- OBRIGATÓRIO SER ESSA LINHA

// Importação global do arquivo de configuração do banco (contém db.supabase)
const db = require('../config/db');

const auth = require('../middlewares/authMiddleware');
const grupoCheck = require('../middlewares/grupoMiddleware');

const authCtrl = require('../controllers/authController');
const grupoCtrl = require('../controllers/grupoController');
const convCtrl = require('../controllers/conviteController');
const tareCtrl = require('../controllers/tarefaController');

// Rotas de Autenticação
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);

// Rotas de Grupos (Criação global e listagem/manipulação sob escopo)
router.post('/grupos', auth, grupoCtrl.criarGrupo);
router.get('/grupos/:grupoId', auth, grupoCheck, grupoCtrl.obterGrupo);
router.post('/grupos/:grupoId/membros', auth, grupoCheck, grupoCtrl.adicionarMembroDireto);
router.delete('/grupos/:grupoId/membros/:usuarioId', auth, grupoCheck, grupoCtrl.removerMembro);

// Rotas de Convites
router.post('/grupos/:grupoId/convites', auth, grupoCheck, convCtrl.criarConvite);
router.post('/convites/:token/aceitar', auth, convCtrl.aceitarConvite);
router.post('/convites/:token/recusar', auth, convCtrl.recusarConvite);

// Rotas de Tarefas do Grupo
router.get('/grupos/:grupoId/tarefas', auth, grupoCheck, tareCtrl.listarTarefas);
router.post('/grupos/:grupoId/tarefas', auth, grupoCheck, tareCtrl.criarTarefa);
router.get('/grupos/:grupoId/historico', auth, grupoCheck, grupoCtrl.obterHistoricoGrupo);

// Operações unitárias com injeção de verificação de grupo pelo ID parametrizado (Adaptadas para Supabase Client)
router.get('/tarefas/:tarefaId', auth, async (req, res, next) => {
  const { data: t, error } = await db.supabase
    .from('tarefa')
    .select('grupo_id')
    .eq('id', req.params.tarefaId);

  if (error) return res.status(500).json({ error: error.message });
  if (!t || t.length === 0) return res.status(404).json({ error: 'Tarefa inexistente.' });
  
  req.params.grupoId = t[0].grupo_id;
  next();
}, grupoCheck, tareCtrl.obterTarefaCompleta);

router.put('/tarefas/:tarefaId', auth, async (req, res, next) => {
  const { data: t, error } = await db.supabase
    .from('tarefa')
    .select('grupo_id')
    .eq('id', req.params.tarefaId);

  if (error) return res.status(500).json({ error: error.message });
  if (!t || t.length === 0) return res.status(404).json({ error: 'Tarefa inexistente.' });
  
  req.params.grupoId = t[0].grupo_id;
  next();
}, grupoCheck, tareCtrl.atualizarTarefa);

router.patch('/tarefas/:tarefaId/status', auth, async (req, res, next) => {
  const { data: t, error } = await db.supabase
    .from('tarefa')
    .select('grupo_id')
    .eq('id', req.params.tarefaId);

  if (error) return res.status(500).json({ error: error.message });
  if (!t || t.length === 0) return res.status(404).json({ error: 'Tarefa inexistente.' });
  
  req.params.grupoId = t[0].grupo_id;
  next();
}, grupoCheck, tareCtrl.atualizarStatusTarefa);

router.delete('/tarefas/:tarefaId', auth, async (req, res, next) => {
  const { data: t, error } = await db.supabase
    .from('tarefa')
    .select('grupo_id')
    .eq('id', req.params.tarefaId);

  if (error) return res.status(500).json({ error: error.message });
  if (!t || t.length === 0) return res.status(404).json({ error: 'Tarefa inexistente.' });
  
  req.params.grupoId = t[0].grupo_id;
  next();
}, grupoCheck, tareCtrl.excluirTarefa);

module.exports = router;
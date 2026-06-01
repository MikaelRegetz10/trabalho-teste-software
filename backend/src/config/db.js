const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL ou SUPABASE_KEY não configurados no .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  // Mantemos o método query para não quebrar o código atual imediatamente,
  // mas ele usará o cliente RPC do Supabase ou disparará um aviso.
  query: async (text, params) => {
    console.log('Executando query via Supabase Client:', text);
    // Nota: O Supabase Client não aceita SQL puro por padrão via REST.
    // É necessário criar Funções no Banco (RPC) ou usar o formato .from().select()
    // Por enquanto, esta função retornará um erro amigável se tentarem SQL puro.
    throw new Error('O sistema agora usa API Key. É necessário migrar as queries SQL para o padrão do Supabase Client (.from().select()).');
  },
  supabase
};

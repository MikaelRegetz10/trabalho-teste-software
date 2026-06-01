# VôLembrar 👵👴

O **VôLembrar** é uma solução digital desenvolvida para auxiliar famílias e cuidadores na gestão do cuidado de idosos. O sistema permite a organização de tarefas, acompanhamento de saúde e coordenação entre múltiplos cuidadores através de grupos familiares.

## 🚀 Funcionalidades

- **Gestão de Usuários**: Cadastro e autenticação segura com JWT.
- **Grupos Familiares**: Criação de grupos vinculados a um idoso específico.
- **Sistema de Convites**: Convide outros membros da família ou cuidadores profissionais para participar do grupo via e-mail.
- **Controle de Tarefas**: Agendamento de medicamentos, consultas e atividades diárias com marcação de criticidade.
- **Gestão de Idosos**: Registro de informações de saúde e observações importantes.
- **Histórico e Notificações**: Acompanhamento de ações realizadas e alertas para tarefas pendentes.

## 🛠️ Tecnologias Utilizadas

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework Web**: [Express.js](https://expressjs.com/)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) (Hospedado via [Supabase](https://supabase.com/))
- **Segurança**: [JSON Web Token (JWT)](https://jwt.io/) e [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Documentação API**: Postman (Coleções inclusas no repositório)

## 📁 Estrutura do Projeto

```text
├── backend/            # Código fonte da API Node.js
│   ├── src/            # Implementação (controllers, routes, middlewares)
│   ├── .env.example    # Exemplo de variáveis de ambiente
│   └── package.json    # Dependências e scripts
├── script.sql          # Schema do banco de dados para replicação
└── VoLembrar.postman_collection.json # Testes de API
```

## 🚥 Pré-requisitos

- Node.js (v18+)
- Instância do PostgreSQL ou conta no Supabase
- NPM ou Yarn

## ⚙️ Configuração para Desenvolvimento

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/trabalho-teste-software.git
   cd trabalho-teste-software
   ```

2. **Configure o Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Variáveis de Ambiente**:
   Crie um arquivo `.env` na pasta `backend/` seguindo o modelo do [.env.example](backend/.env.example):
   ```env
   PORT=3000
   DATABASE_URL=sua_url_do_banco
   JWT_SECRET=sua_chave_secreta
   SUPABASE_URL=sua_url_supabase
   SUPABASE_KEY=sua_chave_anon_supabase
   ```

4. **Banco de Dados**:
   Execute o conteúdo de [script.sql](script.sql) no seu banco de dados para criar as tabelas necessárias.

5. **Execute a aplicação**:
   ```bash
   npm run dev
   ```

## 🧪 Testando a API

Você pode importar o arquivo [VoLembrar.postman_collection.json](backend/VoLembrar.postman_collection.json) no seu Postman para visualizar e testar todos os endpoints disponíveis.

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [package.json](backend/package.json) para mais detalhes.

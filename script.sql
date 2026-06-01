
-- Extensão necessária para gerar os IDs em UUID automaticamente se desejar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USUARIO
CREATE TABLE usuario (
    id UUID PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. IDOSO
CREATE TABLE idoso (
    id UUID PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    observacoes_saude TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. GRUPO FAMILIAR
CREATE TABLE grupo_familiar (
    id UUID PRIMARY KEY,
    idoso_id UUID UNIQUE NOT NULL REFERENCES idoso(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. MEMBRO GRUPO (Enum simulado por CHECK para compatibilidade direta)
CREATE TABLE membro_grupo (
    id UUID PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupo_familiar(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    papel VARCHAR(20) NOT NULL CHECK (papel IN ('administrador', 'cuidador')),
    entrou_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_grupo_usuario UNIQUE (grupo_id, usuario_id)
);

-- 5. CONVITE
CREATE TABLE convite (
    id UUID PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupo_familiar(id) ON DELETE CASCADE,
    convidado_por UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    email_convidado VARCHAR(100) NOT NULL,
    token UUID UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'aceito', 'recusado', 'expirado')),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    expira_em TIMESTAMP NOT NULL,
    respondido_em TIMESTAMP
);

-- 6. TAREFA
CREATE TABLE tarefa (
    id UUID PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupo_familiar(id) ON DELETE CASCADE,
    idoso_id UUID NOT NULL REFERENCES idoso(id) ON DELETE CASCADE,
    criado_por UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    responsavel_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_hora_execucao TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'concluida', 'cancelada')),
    e_critica BOOLEAN NOT NULL DEFAULT FALSE,
    antecedencia_min INTEGER NOT NULL CHECK (antecedencia_min >= 1),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. HISTORICO TAREFA
CREATE TABLE historico_tarefa (
    id UUID PRIMARY KEY,
    tarefa_id UUID NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('criacao', 'edicao', 'conclusao', 'cancelamento')),
    detalhe TEXT,
    realizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. NOTIFICACAO
CREATE TABLE notificacao (
    id UUID PRIMARY KEY,
    tarefa_id UUID NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    agendado_para TIMESTAMP NOT NULL,
    enviada BOOLEAN NOT NULL DEFAULT FALSE,
    enviada_em TIMESTAMP,
    tentativa INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
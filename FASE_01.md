# Fase 01 — Arquitetura e Fundação

## Objetivo
Criar a base estrutural do projeto para permitir evolução organizada do backend, frontend e regras do sistema RPG, com separação clara de responsabilidades.

## O que foi implementado

### 1. Estrutura do projeto
A estrutura inicial foi organizada em:

```text
rpg-sistem/
├── backend/
├── frontend/
├── shared/
└── documentos do projeto
```

A separação foi pensada para permitir futuras implementações em repositórios distintos, mantendo o front e o back independentes.

### 2. Configuração do TypeScript e tooling
Foi configurado o ambiente base com:

- TypeScript em modo estrito
- compilação separada por pacote
- scripts de build, dev e lint
- suporte ao React no frontend
- suporte ao NestJS no backend

### 3. Frontend inicial
Foi criado um app React com Vite e estrutura funcional mínima para receber a engine gráfica.

### 4. Backend inicial
Foi montado o projeto NestJS com base para:

- módulos de aplicação
- autenticação
- usuários
- campanhas
- conexão com MongoDB

### 5. Shared
Foi criado o pacote compartilhado para conter contratos e modelos reutilizáveis entre frontend e backend.

## Decisões de arquitetura
- frontend responsável pela interface e visualização 3D
- backend responsável pela fonte de verdade de dados
- autenticação com JWT
- persistência em MongoDB
- estrutura preparada para futura separação em repos distintos

## Validação
Foi validado:

- build do frontend
- build do backend
- estrutura de módulos
- compilação TypeScript
- organização de pacotes

## Resultado da fase
A base do projeto ficou pronta para receber a lógica de negócio e a engine 3D.

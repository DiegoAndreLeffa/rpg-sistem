# Fase 02 — Backend, Banco e Autenticação

## Objetivo
Implementar a base funcional do backend para persistência, autenticação e suporte inicial à gestão de campanhas.

## O que foi implementado

### 1. Infraestrutura de banco
Foi configurado o MongoDB com conexão via `MONGO_URI` no arquivo `.env` do backend.

A aplicação foi ajustada para ler corretamente as variáveis de ambiente com `@nestjs/config` e `MongooseModule.forRootAsync`.

### 2. Estrutura de usuários
Foi implementado o módulo de usuários com:

- schema de `User`
- criação de usuário
- busca por email
- busca por ID
- retorno público do usuário

### 3. Autenticação JWT
Foi implementado fluxo completo de autenticação com:

- registro de usuário
- login
- geração de JWT
- validação do token
- guard para rotas protegidas
- endpoint `/auth/me`
- logout mockado com resposta de confirmação

### 4. Campanhas
Foi implementado o módulo de campanhas com:

- criação de campanha
- listagem de campanhas do usuário
- busca de campanha por ID
- atualização de campanha
- exclusão de campanha
- validação de ownership para impedir acesso indevido

### 5. Validação de DTOs e regras
O backend usa validação dos payloads e regras de negócio como:

- email duplicado rejeitado
- senha inválida rejeitada
- campanha não pertencente ao usuário negada

## Endpoints criados

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users
- `GET /users/me`

### Campaigns
- `POST /campaigns`
- `GET /campaigns`
- `GET /campaigns/:id`
- `PATCH /campaigns/:id`
- `DELETE /campaigns/:id`

### Health
- `GET /health`

## Documentação
Foi criado o arquivo:

- `backend/API_ROUTES.md`

Com exemplos de uso, payloads e respostas esperadas para cada rota.

## Validação
A fase foi validada com:

- backend iniciando corretamente
- conexão com MongoDB funcionando
- build compilando
- rotas mapeadas no Nest
- autenticação e autorização funcionando

## Resultado da fase
A base do backend ficou pronta para receber as próximas camadas da regra do sistema, como mapas, entidades, game state e multiplayer.

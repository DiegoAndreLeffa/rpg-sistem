# Fase 04 — Game State

## Objetivo
Criar a fonte central de verdade da partida para que o mapa e as entidades possam ser reconstruídos de forma determinística e segura.

## O que foi implementado

### 1. Game State Manager
Foi criado um gerenciador de estado com suporte às operações fundamentais:

- criação de entidade
- atualização de entidade
- exclusão de entidade
- listagem de entidades
- serialização em JSON
- desserialização
- reconstrução do estado

### 2. Estrutura central
A estrutura do estado foi organizada em:

- `campaignId`
- `map`
- `entities`
- `settings`

### 3. Entidades do jogo
Foram definidos tipos para as principais entidades do RPG:

- `PLAYER`
- `ENEMY`
- `NPC`
- `OBJECT`
- `BUILDING`
- `DOOR`
- `LIGHT`
- `AUDIO_SOURCE`

Cada entidade contém:

- `id`
- `kind`
- `name`
- `layer`
- `position`
- `rotation`
- `scale`
- `properties`
- `createdAt`
- `updatedAt`

### 4. Integração com a cena 3D
A cena da fase 03 foi conectada ao Game State, de modo que:

- os objetos na tela são criados a partir do estado
- alterações de posição/escala/rotação são persistidas no estado
- o mapa pode ser reconstruído usando o estado como fonte de verdade

### 5. Rebuild do mapa
Foi adicionado um botão de demonstração para reconstruir a cena a partir do estado atual, validando o princípio do roadmap.

## Validação
Foi validado:

- criação de entidades
- atualização de transformações
- serialização do estado
- reconstrução da cena a partir do Game State
- funcionamento da integração com o ambiente 3D

## Resultado da fase
A base do Game State ficou pronta e alinhada com a regra arquitetural do projeto: a visualização 3D representa o estado, e não vice-versa.

# Roadmap Master — RPG Tabletop 3D

A ideia é que cada fase seja uma unidade fechada: **desenvolver → testar → validar → aprovar → avançar**.

> **Regra fundamental:** nenhuma fase é considerada concluída apenas porque "funciona". Ela só passa quando os critérios de validação definidos no final da fase forem atendidos.

---

# 0. Visão geral do projeto

O sistema será uma **VTT (Virtual Tabletop) 3D para RPG**, permitindo que um Mestre crie, edite e conduza partidas em mapas tridimensionais enquanto jogadores participam em tempo real.

O sistema deverá permitir:

* Criação de mapas 2D/3D;
* Construção de cenários;
* Casas, paredes, portas e objetos;
* Inserção de modelos 3D;
* Personagens de jogadores;
* Inimigos;
* NPCs;
* Payload para configuração automática de personagens;
* HP e atributos;
* Status;
* Sistema de visão individual;
* Fog of War;
* Iluminação dinâmica;
* Dados 3D;
* Sistema de áudio e música;
* Áudio 3D;
* Multiplayer;
* Controle de permissões;
* Save completo da partida;
* Load;
* MongoDB;
* Ferramentas avançadas para o Mestre;
* Segurança;
* Monitoramento;
* Otimização.

---

# Arquitetura geral

```text
                         RPG TABLETOP
                              │
                ┌─────────────┴─────────────┐
                │                           │
           FRONTEND                      BACKEND
                │                           │
        React + Three.js              NestJS + WS
                │                           │
                └─────────────┬─────────────┘
                              │
                       ┌──────▼──────┐
                       │  GAME STATE │
                       │   SERVER    │
                       └──────┬──────┘
                              │
       ┌──────────┬───────────┼───────────┬──────────┐
       │          │           │           │          │
      MAP      ENTITIES     VISION      AUDIO       DICE
       │          │           │           │          │
       └──────────┴───────────┴───────────┴──────────┘
                              │
                       ┌──────▼──────┐
                       │  SNAPSHOT   │
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │  MongoDB    │
                       └─────────────┘
```

## Princípio arquitetural

O **Three.js não é a fonte da verdade**.

Ele apenas representa visualmente o estado.

```text
Servidor
   ↓
Game State
   ↓
Three.js
   ↓
Visualização
```

Isso será fundamental para:

* Multiplayer;
* Save/Load;
* Segurança;
* Fog of War;
* Permissões;
* Reconexão;
* Replay futuro.

---

# FASE 01 — Arquitetura e Fundação

## 🎯 Objetivo

Criar a base estrutural do projeto antes da implementação das funcionalidades.

---

## 📋 Tarefas

### 1.1 Criar estrutura do projeto

```text
frontend/
backend/
shared/
```

### 1.2 Configurar TypeScript

Definir:

* Strict mode;
* Aliases;
* ESLint;
* Prettier;
* Scripts;
* Build.

### 1.3 Criar camada Shared

```text
shared/
├── types/
├── schemas/
├── events/
├── enums/
└── constants/
```

### 1.4 Definir padrões

* Naming;
* IDs;
* Erros;
* Eventos;
* DTOs;
* Responses;
* Logs.

### 1.5 Definir arquitetura de comunicação

```text
REST
```

para:

* autenticação;
* campanhas;
* arquivos;
* saves.

E:

```text
WebSocket
```

para:

* movimentação;
* Game State;
* eventos;
* áudio;
* dados;
* multiplayer.

---

## 🧪 Testes

### Teste 01 — Build

**Ação:**

Executar frontend e backend.

**Esperado:**

* Ambos iniciam;
* Nenhum erro de compilação.

---

### Teste 02 — Shared

Criar um tipo no `shared`.

**Esperado:**

Frontend e backend conseguem utilizá-lo.

---

### Teste 03 — DTO inválido

Enviar payload inválido.

**Esperado:**

Backend rejeita.

---

### Teste 04 — Evento

Criar evento:

```text
ENTITY_CREATED
```

**Esperado:**

Cliente consegue interpretar corretamente.

---

## ✅ Critérios de aprovação

* [ ] Projeto compila;
* [ ] Frontend inicia;
* [ ] Backend inicia;
* [ ] Shared funciona;
* [ ] DTO validation funciona;
* [ ] Estrutura de eventos definida;
* [ ] Padrões documentados.

---

# FASE 02 — Backend, Banco e Autenticação

## 🎯 Objetivo

Criar usuários, campanhas e infraestrutura persistente.

---

## 📋 Tarefas

### Usuário

```text
User
├── id
├── name
├── email
├── passwordHash
└── createdAt
```

### Campanha

```text
Campaign
├── id
├── name
├── ownerId
├── players
├── settings
└── createdAt
```

### Implementar

* MongoDB;
* Módulo de usuários;
* Cadastro;
* Login;
* Logout;
* Tokens;
* Guards;
* Campaign CRUD.

---

## 🧪 Testes

### Teste 01 — Cadastro

Criar usuário.

**Esperado:**

Usuário criado no MongoDB.

---

### Teste 02 — Email duplicado

Criar segundo usuário com mesmo email.

**Esperado:**

Operação rejeitada.

---

### Teste 03 — Login

Credenciais corretas.

**Esperado:**

Token válido.

---

### Teste 04 — Login inválido

Senha errada.

**Esperado:**

Acesso negado.

---

### Teste 05 — Campanha

Usuário autenticado cria campanha.

**Esperado:**

Campanha vinculada ao usuário.

---

### Teste 06 — Acesso indevido

Usuário B tenta acessar campanha privada de A.

**Esperado:**

Acesso negado.

---

## ✅ Critérios

* [ ] MongoDB funcionando;
* [ ] Cadastro;
* [ ] Login;
* [ ] Autorização;
* [ ] Campanhas;
* [ ] Proteção de endpoints.

---

# FASE 03 — Engine 3D

## 🎯 Objetivo

Criar a fundação gráfica.

---

## 📋 Tarefas

Implementar:

* Scene;
* Camera;
* Renderer;
* OrbitControls;
* Grid;
* Plano;
* Raycasting;
* Resize;
* Selection;
* TransformControls.

### Ferramentas

```text
SELECT
MOVE
ROTATE
SCALE
```

---

## 🧪 Testes

### Teste 01 — Renderização

Abrir aplicação.

**Esperado:**

Canvas renderizado.

### Teste 02 — Camera

Testar:

* Zoom;
* Pan;
* Rotação.

**Esperado:**

Movimentação fluida.

### Teste 03 — Seleção

Clicar objeto.

**Esperado:**

Objeto destacado.

### Teste 04 — Transformação

Mover, rotacionar e escalar.

**Esperado:**

Transformações corretas.

### Teste 05 — Resize

Redimensionar navegador.

**Esperado:**

Cena continua correta.

---

## ✅ Critérios

* [ ] Cena;
* [ ] Camera;
* [ ] Grid;
* [ ] Seleção;
* [ ] Transform;
* [ ] Resize;
* [ ] Sem erros.

---

# FASE 04 — Game State

## 🎯 Objetivo

Criar a fonte central de verdade da partida.

---

## 📋 Estrutura

```text
GameState
├── campaign
├── map
├── entities
├── players
├── lights
├── vision
├── audio
├── dice
├── combat
└── settings
```

---

## Entidades

```text
Player
Enemy
NPC
Object
Building
Door
Light
AudioSource
```

---

## 📋 Tarefas

Criar:

* State Manager;
* Entity Manager;
* Map Manager;
* Serialization;
* State updates;
* Entity IDs.

---

## 🧪 Testes

### Teste 01 — Criar

Criar entidade.

**Esperado:**

Game State contém entidade.

### Teste 02 — Atualizar

Alterar posição.

**Esperado:**

Estado atualizado.

### Teste 03 — Deletar

Excluir entidade.

**Esperado:**

Entidade removida.

### Teste 04 — Serialização

```text
State → JSON → State
```

**Esperado:**

Estados equivalentes.

### Teste 05 — Reconstrução

Limpar cena.

Reconstruir usando Game State.

**Esperado:**

Cena idêntica.

### Teste 06 — IDs

Criar 10.000 entidades.

**Esperado:**

Nenhum ID duplicado.

---

## ✅ Critérios

> O mapa deve poder ser destruído visualmente e reconstruído exclusivamente através do Game State.

---

# FASE 05 — Editor de Mapa

## 🎯 Objetivo

Permitir ao Mestre construir o cenário.

---

## 📋 Tarefas

### Terreno

* Plano;
* Grid;
* Texturas;
* Escala;
* Tamanho.

### Construções

* Parede;
* Casa;
* Porta;
* Janela;
* Torre;
* Escada.

### Objetos

* Mesa;
* Cadeira;
* Baú;
* Árvore;
* Pedra.

### Ferramentas

```text
Select
Move
Rotate
Scale
Delete
Duplicate
```

### Inspector

```text
Position
Rotation
Scale
Layer
Properties
```

### Undo/Redo

```text
CTRL + Z
CTRL + Y
```

### Layers

```text
Terrain
Buildings
Objects
Players
Enemies
NPCs
Lighting
Audio
GM Only
```

### Medição

```text
Player ───────── Enemy
          15m
```

---

## 🧪 Testes

### Teste 01

Criar 100 objetos.

### Teste 02

Mover.

### Teste 03

Rotacionar.

### Teste 04

Escalar.

### Teste 05

Duplicar.

### Teste 06

Excluir.

### Teste 07

Undo.

### Teste 08

Redo.

### Teste 09

Alterar layer.

### Teste 10

Medir distância.

### Teste 11

Salvar estado.

### Teste 12

Reconstruir mapa.

---

## ✅ Critérios

O Mestre deve conseguir montar um mapa completo sem editar código.

---

# FASE 06 — Assets e Modelos 3D

## 🎯 Objetivo

Permitir que modelos sejam carregados dinamicamente.

---

## 📋 Formatos

Prioridade:

```text
GLB
GLTF
OBJ
```

---

## 📋 Asset Manager

```text
Assets
├── Models
├── Textures
├── Audio
├── Images
└── Maps
```

---

## Tarefas

* Upload;
* Storage (Cloudinary `raw`);
* Metadata;
* Validação;
* Cache;
* Associação;
* Exclusão.

### Arquitetura de referência (assets 3D)

```text
Jogador
   │
   │ Upload GLB/GLTF/OBJ
   ▼
Backend (validação)
   │
   ▼
Cloudinary (raw)
   │
   ▼
MongoDB (somente referência)
```

No MongoDB, persistir apenas metadados e referência do arquivo:

```json
{
  "assetId": "character_123",
  "type": "model",
  "format": "glb",
  "cloudinaryPublicId": "characters/player123",
  "url": "https://...",
  "size": 4829132
}
```

### Regras obrigatórias de validação de upload

* Limite para modelos 3D: **15 MB**;
* Rejeitar arquivos acima do limite com mensagem explícita;
* Aceitar apenas formatos permitidos (GLB/GLTF/OBJ).

### Governança de armazenamento (Asset Quota System)

Implementar controle em cascata:

```text
Limite da conta
↓
Limite da campanha
↓
Limite por usuário
↓
Tamanho do arquivo
↓
Tipo do arquivo
```

Também implementar:

* Gerenciamento de quota por campanha e por usuário;
* Detecção e exclusão de assets órfãos;
* Limpeza de assets quando entidade/personagem for removida.

---

## 🧪 Testes

### Teste 01

Upload GLB.

### Teste 02

Upload GLTF.

### Teste 03

Upload OBJ.

### Teste 04

Arquivo inválido.

### Teste 05

Arquivo corrompido.

### Teste 06

Arquivo acima do limite.

**Esperado:**

Mensagem clara de limite excedido (15 MB).

### Teste 07

Excluir asset.

### Teste 08

Reutilizar asset.

### Teste 09

Save/Load do asset.

### Teste 10

Upload quando quota por usuário for excedida.

**Esperado:**

Upload bloqueado com erro de quota.

### Teste 11

Excluir entidade que referencia asset.

**Esperado:**

Asset sem referência é limpo (ou marcado para limpeza) sem quebrar o estado.

---

## ✅ Critérios

Um modelo carregado pelo usuário precisa continuar disponível após salvar e carregar a partida.

---

# FASE 07 — Entidades e Personagens

## 🎯 Objetivo

Criar personagens, inimigos e NPCs.

---

## 📋 Personagem

```text
Character
├── characterData
├── model
├── position
├── rotation
├── scale
├── HP
├── status
├── owner
└── visibility
```

---

## Payload

```text
PAYLOAD
 ↓
VALIDATION
 ↓
CHARACTER SCHEMA
 ↓
CHARACTER STATE
 ↓
MODEL
```

O jogador **não precisa configurar manualmente o personagem na plataforma**.

Ele fornece:

1. Payload;
2. Modelo 3D.

O sistema configura automaticamente o personagem.

---

## 🧪 Testes

### Teste 01

Payload válido.

**Esperado:**

Personagem criado automaticamente.

### Teste 02

Payload inválido.

**Esperado:**

Erro de validação.

### Teste 03

Payload + GLB.

**Esperado:**

Personagem completo.

### Teste 04

Trocar modelo.

**Esperado:**

Dados permanecem.

### Teste 05

Alterar HP.

**Esperado:**

Estado atualizado.

### Teste 06

Aplicar status.

### Teste 07

Salvar e carregar.

---

## ✅ Critérios

O jogador deve conseguir entrar na partida com seu personagem sem precisar preencher manualmente sua ficha na plataforma.

---

# FASE 08 — Multiplayer

## 🎯 Objetivo

Permitir partidas em tempo real.

---

## 📋 Tarefas

* Lobby;
* Join;
* Leave;
* WebSocket;
* Presence;
* State sync;
* Reconnection.

---

## Eventos

```text
PLAYER_JOINED
PLAYER_LEFT

ENTITY_CREATED
ENTITY_UPDATED
ENTITY_DELETED

MAP_UPDATED

HP_CHANGED
STATUS_CHANGED

DICE_ROLLED

AUDIO_PLAY
AUDIO_STOP
```

---

## 🧪 Testes

### Teste 01 — Dois jogadores

A move.

B vê.

### Teste 02

B move.

A vê.

### Teste 03 — Três jogadores

Todos sincronizados.

### Teste 04 — Disconnect

Jogador desconecta.

### Teste 05 — Reconnect

Jogador retorna.

**Esperado:**

Recebe Game State atual.

### Teste 06 — Concorrência

Dois jogadores alteram estado simultaneamente.

**Esperado:**

Servidor mantém consistência.

### Teste 07 — Latência

Simular conexão ruim.

**Esperado:**

Sistema não quebra.

---

# FASE 09 — Permissões e Segurança

## 🎯 Objetivo

Garantir que cada usuário só possa fazer o que tem autorização para fazer.

---

## Roles

```text
MASTER
PLAYER
SPECTATOR
```

---

## Mestre

Pode:

```text
Mapa
Entidades
Inimigos
NPCs
Luzes
Áudio
Fog of War
Save
```

## Jogador

Pode:

```text
Próprio personagem
Ações permitidas
Dados
```

---

## 🧪 Testes

### Teste 01

Player tenta mover inimigo.

**Esperado:**

DENIED.

### Teste 02

Player tenta editar mapa.

**Esperado:**

DENIED.

### Teste 03

Player tenta salvar.

**Esperado:**

DENIED.

### Teste 04

Player tenta acessar inimigo oculto.

**Esperado:**

DENIED.

### Teste 05

Player falsifica HP.

**Esperado:**

Servidor rejeita.

### Teste 06

Player falsifica dado.

**Esperado:**

Servidor rejeita.

### Teste 07

Player tenta controlar outro player.

**Esperado:**

DENIED.

---

# FASE 10 — Sistema de Visão

## 🎯 Objetivo

Criar visão individual por jogador.

---

## 📋 Tarefas

* Vision radius;
* Line of Sight;
* Raycasting;
* Obstáculos;
* Paredes;
* Portas;
* Fog of War;
* Área explorada.

---

## 🧪 Testes

### Teste 01

Vision radius = 10.

**Esperado:**

Área correta.

### Teste 02

Parede.

**Esperado:**

Bloqueia visão.

### Teste 03

Porta fechada.

**Esperado:**

Bloqueia visão.

### Teste 04

Porta aberta.

**Esperado:**

Visão atravessa.

### Teste 05

Dois jogadores em áreas diferentes.

**Esperado:**

Cada um recebe visão própria.

### Teste 06

Jogador tenta receber entidade escondida.

**Esperado:**

Dados não são enviados.

---

# FASE 11 — Iluminação

## 🎯 Objetivo

Criar iluminação dinâmica integrada à visão.

---

## Tipos

```text
Point Light
Spot Light
Ambient Light
```

### Propriedades

```text
Position
Intensity
Color
Range
Enabled
```

---

## 🧪 Testes

### Teste 01

Adicionar tocha.

**Esperado:**

Área iluminada.

### Teste 02

Parede bloqueando.

**Esperado:**

Luz bloqueada.

### Teste 03

Porta aberta.

**Esperado:**

Luz atravessa.

### Teste 04

Porta fechada.

**Esperado:**

Luz bloqueada.

### Teste 05

Dois jogadores.

**Esperado:**

Percepção diferente conforme posição.

### Teste 06

100 luzes.

**Esperado:**

FPS dentro do limite definido.

---

# FASE 12 — Sistemas de RPG

## 🎯 Objetivo

Criar a camada de regras genéricas.

---

## HP

```text
currentHP
maxHP
```

## Status

```text
Poison
Burn
Frozen
Stunned
Bleeding
Sleeping
```

## Ações

```text
ATTACK
DAMAGE
HEAL
APPLY_STATUS
REMOVE_STATUS
DEATH
```

## Iniciativa

```text
Round 3

1. Goblin — 18
2. Player A — 16
3. Player B — 12
```

## Turnos

* Próximo;
* Anterior;
* Finalizar;
* Round.

---

## 🧪 Testes

* Aplicar dano;
* Curar;
* Matar;
* Aplicar status;
* Remover status;
* Iniciativa;
* Próximo turno;
* Novo round;
* Sincronização multiplayer.

---

# FASE 13 — Dados 3D

## 🎯 Objetivo

Criar dados físicos e sincronizados.

---

## Dados

```text
D4
D6
D8
D10
D12
D20
D100
```

## Expressões

```text
1d20
2d6
1d20 + 5
2d6 + 3
```

---

## Física

* Gravity;
* Mass;
* Collision;
* Friction;
* Restitution;
* Rotation.

---

## 🧪 Testes

### Teste 01

10.000 D20.

**Esperado:**

Somente resultados de 1–20.

### Teste 02

10.000 D6.

**Esperado:**

Somente 1–6.

### Teste 03

2D6.

**Esperado:**

2–12.

### Teste 04

2D6 + 3.

**Esperado:**

5–15.

### Teste 05

Dados colidem.

**Esperado:**

Física correta.

### Teste 06

Cinco jogadores rolam simultaneamente.

**Esperado:**

Todos recebem resultados consistentes.

### Teste 07

Cliente tenta definir resultado.

**Esperado:**

Servidor ignora.

---

# FASE 14 — Sistema de Áudio

## 🎯 Objetivo

Dar ao Mestre controle completo da experiência sonora.

---

## Música

* Play;
* Pause;
* Stop;
* Volume;
* Loop;
* Playlist;
* Shuffle;
* Crossfade.

## Ambiente

* Chuva;
* Vento;
* Floresta;
* Caverna;
* Rio.

## SFX

* Porta;
* Baú;
* Ataque;
* Magia;
* Criaturas.

## Áudio 3D

```text
Position
Distance
Attenuation
Direction
```

## Áudio privado

Som enviado somente para determinado jogador.

---

## 🧪 Testes

### Teste 01

Mestre toca música.

**Esperado:**

Todos escutam.

### Teste 02

Mestre pausa.

**Esperado:**

Todos pausam.

### Teste 03

Troca de música.

**Esperado:**

Transição sincronizada.

### Teste 04

Áudio 3D.

**Esperado:**

Volume muda conforme distância.

### Teste 05

Audio Zone.

**Esperado:**

Entrar na região altera áudio.

### Teste 06

Áudio privado.

**Esperado:**

Somente jogador selecionado escuta.

### Teste 07

Volume local.

**Esperado:**

Somente aquele jogador altera volume.

### Teste 08

Mestre altera volume global.

**Esperado:**

Todos recebem mudança.

---

# FASE 15 — Save / Load

## 🎯 Objetivo

Salvar a partida como um **snapshot completo**.

---

## O save deve conter

```text
Campaign
Map
Terrain

Buildings
Walls
Doors
Objects

Players
Enemies
NPCs

Position
Rotation
Scale

HP
Status
Character Data
Models

Lights
Vision
Fog of War

Audio State
Initiative
Combat
Game State
```

---

## 🧪 TESTE PRINCIPAL

Criar:

```text
Player A
HP = 37
Position = X10 Z15

Player B
HP = 82
Position = X20 Z5

Goblin
HP = 4

Door = OPEN

Torch = ON

Music = 02:31

Fog of War = CURRENT
```

Salvar.

Alterar tudo.

Carregar.

### Resultado esperado

> **100% do estado relevante da partida deve retornar ao momento do save.**

---

## Testes adicionais

* Save vazio;
* Save grande;
* Dois saves;
* Load;
* Save somente Mestre;
* Jogador tentando salvar;
* Save corrompido;
* Load inexistente;
* Reconstrução visual.

---

# FASE 16 — Ferramentas Avançadas do Mestre

## 🎯 Objetivo

Dar ferramentas suficientes para conduzir uma sessão real.

---

## Ferramentas

* Desenho;
* Texto;
* Setas;
* Círculos;
* Retângulos;
* Ping;
* Marcadores;
* Templates;
* Área de efeito;
* Medição.

## GM Only

```text
Trap
Hidden Enemy
Secret Door
GM Note
Spawn
```

---

## Interações

* Porta;
* Baú;
* Alavanca;
* Botão;
* NPC;
* Objetos.

---

## 🧪 Testes

* Criar marcador;
* Mover marcador;
* Deletar;
* GM Only;
* Player não consegue ver;
* Player recebe elemento quando revelado;
* Interação com porta;
* Interação com objeto.

---

# FASE 17 — Performance

## 🎯 Objetivo

Garantir que o sistema continue utilizável em mapas complexos.

---

## Three.js

Implementar quando necessário:

* Frustum culling;
* LOD;
* Instancing;
* Occlusion;
* Texture compression;
* Lazy loading;
* Asset streaming;
* Dispose de geometries;
* Dispose de materials;
* Dispose de textures.

## Multiplayer

* Delta updates;
* Batching;
* Compression;
* Rate limiting.

---

## 🧪 Stress Test

Criar:

```text
20 jogadores
1.000 entidades
100 luzes
100 áudios
100 dados
Mapa grande
```

Medir:

```text
FPS
CPU
GPU
RAM
Network
Latency
```

### Critério

Definir metas antes do teste, por exemplo:

```text
FPS: ≥ 50
Latency: ≤ 100ms
Sem crash
Sem memory leak crítico
```

Os valores finais devem ser ajustados conforme hardware-alvo.

---

# FASE 18 — Observabilidade

## 🎯 Objetivo

Conseguir descobrir problemas sem precisar reproduzir tudo manualmente.

---

## Implementar

* Logging;
* Error tracking;
* Metrics;
* WebSocket monitoring;
* Performance monitoring;
* Session diagnostics.

---

## Game diagnostics

```text
SESSION #18392

Players: 5
Entities: 127
Lights: 23
Audio Sources: 8

FPS: 58
Latency: 42ms
Events/s: 17
Memory: 1.2GB
```

---

## Histórico

```text
19:42 Player A entrou
19:43 Player A moveu
19:44 Goblin atacou
19:44 D20 → 17
19:45 Player A perdeu 8 HP
19:47 Porta abriu
19:48 Mestre salvou
```

---

## 🧪 Testes

* Log de login;
* Log de erro;
* Log de WebSocket;
* Métricas;
* Rastreamento de evento;
* Identificação de sessão;
* Identificação de usuário;
* Correlação de erro.

---

# FASE 19 — Testes E2E

Agora vamos validar a aplicação como se fosse uma sessão real.

## Cenário

```text
Mestre
 ↓
Cria campanha
 ↓
Cria mapa
 ↓
Adiciona paredes
 ↓
Adiciona portas
 ↓
Adiciona luzes
 ↓
Adiciona inimigos
 ↓
Abre sala
 ↓
Jogadores entram
 ↓
Importam personagens
 ↓
Modelos carregam
 ↓
Jogadores movimentam
 ↓
Visão atualiza
 ↓
Inimigo aparece
 ↓
Iniciativa
 ↓
Dado 3D
 ↓
Ataque
 ↓
Dano
 ↓
SFX
 ↓
Mestre abre porta
 ↓
Luz muda
 ↓
Visão muda
 ↓
Música muda
 ↓
Mestre salva
 ↓
Partida continua
 ↓
Load
 ↓
Estado restaurado
```

---

## 🧪 Testes E2E

### E2E 01 — Criar partida

Mestre cria campanha e sala.

**Esperado:**

Jogadores conseguem entrar.

---

### E2E 02 — Personagem

Jogador envia payload + modelo.

**Esperado:**

Personagem aparece automaticamente.

---

### E2E 03 — Movimento

Jogador movimenta personagem.

**Esperado:**

Todos recebem atualização.

---

### E2E 04 — Visão

Jogador entra em área escura.

**Esperado:**

Visão correta.

---

### E2E 05 — Combate

Jogador ataca inimigo.

**Esperado:**

Dado → resultado → dano → HP atualizado.

---

### E2E 06 — Porta

Mestre abre porta.

**Esperado:**

* Porta abre;
* Som toca;
* Luz passa;
* Visão atualiza.

---

### E2E 07 — Música

Mestre troca ambiente.

**Esperado:**

Todos recebem alteração.

---

### E2E 08 — Save

Mestre salva.

Alterar estado.

Load.

**Esperado:**

Partida restaurada.

---

# FASE 20 — Segurança e Stress Final

## 🔐 Segurança

Testar ataques e manipulações:

```text
Player → Enemy
Player → Map
Player → Save
Player → Hidden Entity
Player → Hidden Audio
Player → Dice Result
Player → Other Player
```

### Também testar

* Payload malicioso;
* Arquivo malicioso;
* Upload gigante;
* Spam de WebSocket;
* Eventos inválidos;
* IDs inexistentes;
* Campanha inexistente;
* Token inválido;
* Token expirado;
* Rate limit.

---

# FASE 21 — Polimento e Release

## 🎯 Objetivo

Transformar o protótipo funcional em produto utilizável.

---

## UI Mestre

```text
┌─────────────────────────────────────────┐
│ MAPA                                    │
│                                         │
│              GAME                       │
│                                         │
├─────────────┬───────────────────────────┤
│ TOOLS       │ INSPECTOR                 │
│             │                           │
│ Select      │ Entity                    │
│ Move        │ HP                        │
│ Rotate      │ Position                  │
│ Light       │ Status                    │
│ Audio       │ Model                     │
│ Dice        │                           │
└─────────────┴───────────────────────────┘
```

## UI jogador

```text
┌──────────────────────────────┐
│                              │
│          GAME MAP            │
│                              │
│                              │
├──────────────────────────────┤
│ HP 38/50       🎲            │
│ Character / Actions          │
└──────────────────────────────┘
```

---

## Tarefas

* UX;
* Atalhos;
* Tooltips;
* Loading;
* Error states;
* Feedback visual;
* Menus;
* Responsividade;
* Onboarding;
* Documentação.

---

# 🧪 Checklist final

Antes de chamar o projeto de MVP:

## Plataforma

* [ ] Cadastro
* [ ] Login
* [ ] Campanhas
* [ ] Lobby
* [ ] Salas

## Editor

* [ ] Plano
* [ ] Grid
* [ ] Construções
* [ ] Paredes
* [ ] Portas
* [ ] Objetos
* [ ] Transform
* [ ] Inspector
* [ ] Layers
* [ ] Undo/Redo
* [ ] Medição

## Personagens

* [ ] Payload
* [ ] Modelo 3D
* [ ] Player
* [ ] Enemy
* [ ] NPC
* [ ] HP
* [ ] Status

## Multiplayer

* [ ] WebSocket
* [ ] Sincronização
* [ ] Reconnection
* [ ] Presence
* [ ] Permissões

## Visão

* [ ] Vision
* [ ] Line of Sight
* [ ] Fog of War
* [ ] Visão individual

## Iluminação

* [ ] Point Light
* [ ] Spot Light
* [ ] Shadows
* [ ] Bloqueio por paredes
* [ ] Integração com visão

## RPG

* [ ] HP
* [ ] Dano
* [ ] Cura
* [ ] Status
* [ ] Iniciativa
* [ ] Turnos
* [ ] Combate

## Dados

* [ ] D4
* [ ] D6
* [ ] D8
* [ ] D10
* [ ] D12
* [ ] D20
* [ ] D100
* [ ] Física
* [ ] Server-side result

## Áudio

* [ ] Música
* [ ] Playlist
* [ ] SFX
* [ ] Ambiente
* [ ] 3D Audio
* [ ] Audio Zones
* [ ] Áudio privado
* [ ] Controle do Mestre

## Persistência

* [ ] Save
* [ ] Load
* [ ] Snapshot
* [ ] MongoDB
* [ ] Save somente Mestre
* [ ] Restauração completa

## Ferramentas

* [ ] Desenho
* [ ] Marcadores
* [ ] Texto
* [ ] Templates
* [ ] GM Only
* [ ] Interações

## Qualidade

* [ ] Performance
* [ ] Segurança
* [ ] Stress test
* [ ] E2E
* [ ] Logs
* [ ] Métricas
* [ ] Error tracking

---

# 🏁 Definition of Done do projeto

O projeto só será considerado **MVP concluído** quando uma sessão completa puder acontecer seguindo este fluxo:

```text
                    ┌──────────────┐
                    │    MESTRE    │
                    └──────┬───────┘
                           │
                    Criar campanha
                           │
                    Criar o mapa
                           │
                  Montar o cenário
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Players                    Inimigos
             │                           │
       Payload + Modelo             Mestre controla
             │                           │
             └─────────────┬─────────────┘
                           │
                     PARTIDA ONLINE
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           VISÃO       ILUMINAÇÃO      ÁUDIO
             │             │             │
             └─────────────┼─────────────┘
                           │
                       COMBATE
                           │
                    ┌──────┴──────┐
                    │             │
                  DADOS          HP
                    │             │
                    └──────┬──────┘
                           │
                       SAVE GAME
                           │
                        MongoDB
                           │
                         LOAD
                           │
                    PARTIDA VOLTA
                    AO MESMO ESTADO
```

### A regra final é:

> **Se o Mestre conseguir criar uma partida, os jogadores conseguirem entrar, importar seus personagens, jogar em tempo real, enxergar somente o que devem, interagir com o cenário, usar iluminação, áudio e dados 3D, e o Mestre conseguir salvar e restaurar a partida exatamente como estava, temos uma VTT funcional.**

Depois disso, o que vier é principalmente **expansão, otimização e novas funcionalidades**, e não mais a construção da fundação do sistema.

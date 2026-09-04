# Fase 08 — Multiplayer

## Objetivo
Permitir partidas em tempo real com Mestre e Players conectados simultaneamente, cada um com sua própria tela de entrada (home, login, register) e sua própria experiência de VTT (mestre com editor completo, player em modo somente leitura), mantendo o mapa e as entidades sincronizados via WebSocket.

## O que foi implementado

### 1. Perfis de usuário (roles)
- Adicionado campo `role` (`MASTER`, `PLAYER`, `SPECTATOR`) ao schema de usuário, com fallback para `PLAYER` em contas antigas sem o campo.
- `role` passou a fazer parte do payload do JWT e da resposta pública do usuário (`user.role`).

### 2. Autenticação separada por perfil
- `POST /auth/register`: aceita `role` opcional no cadastro (default `PLAYER`).
- `POST /auth/login`: login genérico (mantido para compatibilidade).
- `POST /auth/login/master`: autentica apenas contas com `role = MASTER`; se a conta existir mas não for mestre, retorna `401`.
- `POST /auth/login/player`: autentica apenas contas com `role = PLAYER`; mesma regra de bloqueio por role incorreta.
- `GET /auth/me`: retorna o usuário autenticado já incluindo `role`.

### 3. WebSocket — Lobby, Presença e Reconexão
No gateway `/game` (namespace único do backend):

- `join_campaign`: registra o socket na sala da campanha, guarda presença (`socketId`, `userId`, `role`, `connectedAt`) e emite `PLAYER_JOINED` + `PRESENCE_SYNC` para a sala.
- `leave_campaign`: remove o socket da sala e da lista de presença, emitindo `PLAYER_LEFT` + `PRESENCE_SYNC`.
- `request_presence`: permite a um cliente pedir a lista atual de presença sob demanda.
- Desconexão (`handleDisconnect`): limpa presença de todas as campanhas em que o socket estava e notifica a sala.
- **State sync ao entrar/reconectar**: o gateway mantém em memória o último Game State emitido por campanha (`latestStateByCampaign`) e envia `STATE_SYNC` para o socket assim que ele entra na sala — importante para quem reconecta no meio da partida.

### 4. Eventos utilizados
```text
PLAYER_JOINED
PLAYER_LEFT
PRESENCE_SYNC
STATE_SYNC
MAP_UPDATED
```

`MAP_UPDATED` é emitido pelo backend sempre que o Game State é persistido (`PUT /campaigns/:id/state`), com o estado completo já normalizado.

### 5. Sincronização automática de movimentos do Mestre
- O frontend do Mestre passou a escutar as mudanças do editor (`rpg-state-changed`) e, para ações de mutação de mapa/entidades (mover, criar, deletar, duplicar, transformar, undo/redo, trocar textura de terreno, associar/remover asset), envia automaticamente `PUT /campaigns/:id/state` com debounce curto (~180ms), evitando a necessidade de clicar manualmente em "Salvar" para os players verem a atualização.
- Deduplicação por snapshot evita reenvios desnecessários quando o estado não mudou de fato.

### 6. Sincronização de assets em tempo real
- O player mantém localmente a lista de assets conhecidos (`knownAssetIds`).
- Ao receber `MAP_UPDATED`/`STATE_SYNC`, o frontend verifica se alguma entidade referencia um asset ainda não conhecido; se sim, busca a lista atualizada em `GET /assets?campaignId=...` e sincroniza o editor (`rpg-editor-sync-assets`) — assim, um asset criado pelo Mestre aparece automaticamente para o Player sem precisar recarregar a página.
- Corrigido bug em que o rebuild de estado (`rpg-scene-rebuild`) podia zerar a lista local de assets quando o snapshot recebido não trazia o campo `assets`, fazendo objetos "sumirem" da cena ao serem movidos. Agora o rebuild preserva os assets já carregados quando o snapshot não os inclui.

### 7. Frontend — Home, Login, Register e rotas separadas
Nova camada de aplicação (`RootApp`) com roteamento simples baseado em `window.history`/`pathname`:

- `/` — Home page com botões: **Login Mestre**, **Login Player**, **Register**.
- `/register` — Cadastro de conta com escolha de perfil (`Player` ou `Mestre`).
- `/login/master` — Login exclusivo de Mestre (usa `/auth/login/master`).
- `/login/player` — Login exclusivo de Player (usa `/auth/login/player`).
- `/vtt/master` — Tela do Mestre: editor completo (todas as ferramentas de mapa, personagens, assets), cabeçalho com usuário, status da conexão WebSocket e contagem de conectados. Acesso bloqueado (mensagem de "Acesso negado") se a sessão autenticada não for `MASTER`.
- `/vtt/player` — Tela do Player: cena 3D em **modo somente leitura** (sem edição de mapa/entidades), painel lateral com status de conexão e presença.
- Sessão persistida em `localStorage` (`rpg-auth-session`), com logout que limpa a sessão e chama `POST /auth/logout`.

### 8. Modo read-only no canvas do Player
- `SceneCanvas` recebe `mode` (`master` | `player`).
- Em modo `player`, o `TransformControls` fica desanexado e comandos de mutação (adicionar, atualizar, deletar, duplicar entidade) são ignorados — o player pode navegar e medir na cena, mas não altera o mapa.

### 9. Ajustes de UI/UX
- Correção do bug em que o scroll da página inteira competia com o scroll de listas internas (assets, inspector); o scroll da página foi bloqueado e delegado às áreas de interface que precisam dele.
- Correção de regressão no zoom da cena 3D (o bloqueio de `wheel` aplicado para resolver o scroll da página havia desativado o zoom por wheel do `OrbitControls`); o zoom foi restaurado mantendo o scroll de UI funcionando corretamente.

## Validação
Testado com:

- build do backend
- build do frontend
- registro de conta Mestre e Player com `role` correto
- login `/auth/login/master` e `/auth/login/player`, incluindo bloqueio (`401`) quando a conta não corresponde ao perfil solicitado
- `GET /auth/me` retornando `role`
- teste automatizado de WebSocket com duas conexões simultâneas confirmando `PRESENCE_SYNC` com os dois participantes
- teste automatizado de `PUT /campaigns/:id/state` seguido da entrega de `MAP_UPDATED` para o socket do Player
- navegação manual home → register → login master/player → tela correta (master vs player)
- movimentação de peça pelo Mestre refletindo automaticamente na tela do Player, sem clique manual em salvar
- asset novo criado pelo Mestre aparecendo automaticamente na tela do Player
- correção do bug de objeto "sumir" da cena ao ser movido após sincronização de estado

## Resultado da fase
A fase 08 ficou concluída: existe separação real de telas e fluxo de autenticação entre Mestre e Player, a base de multiplayer (lobby, presença, reconexão com state sync) está funcionando, e os movimentos/assets do Mestre chegam automaticamente para os Players conectados em tempo real.

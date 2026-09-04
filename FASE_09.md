# Fase 09 — Permissões e Segurança

## Implementado

- Toda leitura e mutação de campanha exige JWT válido.
- A campanha possui participantes com papel `PLAYER` ou `SPECTATOR`; o proprietário é sempre `MASTER`.
- O Mestre adiciona ou remove participantes por `PUT`/`DELETE /campaigns/:id/members/:userId`.
- Somente Mestre salva estado, gerencia mapa, HP, status e assets.
- Player só pode criar ou trocar o modelo do próprio personagem; não pode criar inimigos/NPCs, alterar HP ou status.
- Estados enviados por REST e WebSocket ocultam entidades `gm` e personagens com visibilidade `gm` ou `owner` de quem não é proprietário.
- O WebSocket exige token no handshake e ignora `userId` e `role` fornecidos pelo navegador.

## Inclusão de participante

```http
PUT /campaigns/:campaignId/members/:userId
Authorization: Bearer <token-do-mestre>
Content-Type: application/json

{ "role": "PLAYER" }
```

Use `{ "role": "SPECTATOR" }` para acesso somente de observação. O participante precisa ser incluído antes de abrir a campanha ou conectar-se ao WebSocket.

## Validação executada

- `npm run build` no backend
- `npm run build` no frontend

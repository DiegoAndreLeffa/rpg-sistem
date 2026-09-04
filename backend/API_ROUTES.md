# API do Backend RPG Sistem

Base URL local:

```bash
http://localhost:3001
```

## 1) Health check

### GET /health
Retorna o status do backend.

Exemplo de requisição:

```bash
curl http://localhost:3001/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

---

## 2) Autenticação

### POST /auth/register
Cria um novo usuário e retorna token JWT + dados públicos do usuário.

Body:

```json
{
  "name": "Diego",
  "email": "diego@email.com",
  "password": "123456",
  "role": "PLAYER"
}
```

Exemplo de teste:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diego",
    "email": "diego@email.com",
    "password": "123456",
    "role": "PLAYER"
  }'
```

Resposta esperada:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66f0c7d9f1f2a6d4c2d0e123",
    "email": "diego@email.com",
    "name": "Diego",
    "role": "PLAYER"
  }
}
```

Possíveis erros:

- `409 Conflict` quando o email já estiver cadastrado.

```json
{
  "message": "Email already registered.",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### POST /auth/login
Autentica um usuário e retorna o mesmo padrão do registro.

Body:

```json
{
  "email": "diego@email.com",
  "password": "123456"
}
```

Exemplo de teste:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "diego@email.com",
    "password": "123456"
  }'
```

Resposta esperada:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66f0c7d9f1f2a6d4c2d0e123",
    "email": "diego@email.com",
    "name": "Diego",
    "role": "PLAYER"
  }
}
```

---

### POST /auth/login/master
Autentica somente contas com perfil `MASTER`.

Body:

```json
{
  "email": "mestre@email.com",
  "password": "123456"
}
```

Se o usuário existir, mas não for `MASTER`, retorna `401 Unauthorized`.

---

### POST /auth/login/player
Autentica somente contas com perfil `PLAYER`.

Body:

```json
{
  "email": "player@email.com",
  "password": "123456"
}
```

Se o usuário existir, mas não for `PLAYER`, retorna `401 Unauthorized`.

Possíveis erros:

- `401 Unauthorized` para credenciais inválidas.

```json
{
  "message": "Invalid credentials.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### POST /auth/logout
Endpoint protegido por JWT. Atualmente é stateless e apenas retorna uma confirmação.

Exemplo de teste:

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Resposta esperada:

```json
{
  "message": "Logged out."
}
```

---

### GET /auth/me
Endpoint protegido por JWT. Retorna o usuário logado em formato público.

Exemplo de teste:

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Resposta esperada:

```json
{
  "user": {
    "id": "66f0c7d9f1f2a6d4c2d0e123",
    "email": "diego@email.com",
    "name": "Diego",
    "role": "PLAYER"
  }
}
```

---

## 3) Usuários

### GET /users/me
Endpoint protegido por JWT. Retorna os dados públicos do usuário autenticado.

Exemplo de teste:

```bash
curl http://localhost:3001/users/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Resposta esperada:

```json
{
  "user": {
    "id": "66f0c7d9f1f2a6d4c2d0e123",
    "email": "diego@email.com",
    "name": "Diego",
    "role": "PLAYER"
  }
}
```

Possíveis erros:

- `404 Not Found` se o usuário não existir mais no banco.

```json
{
  "message": "User not found.",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 4) Campanhas

Todos os endpoints de campanhas são protegidos por JWT.

### POST /campaigns
Cria uma nova campanha para o usuário autenticado.

Body:

```json
{
  "name": "Campanha da Torre Negra",
  "settings": {
    "system": "dnd",
    "theme": "fantasy",
    "maxPlayers": 5
  }
}
```

Exemplo de teste:

```bash
curl -X POST http://localhost:3001/campaigns \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campanha da Torre Negra",
    "settings": {
      "system": "dnd",
      "theme": "fantasy",
      "maxPlayers": 5
    }
  }'
```

Resposta esperada:

```json
{
  "_id": "66f0c9ab5d1c3d9d9e9f7f11",
  "name": "Campanha da Torre Negra",
  "ownerId": "66f0c7d9f1f2a6d4c2d0e123",
  "playerIds": [],
  "settings": {
    "system": "dnd",
    "theme": "fantasy",
    "maxPlayers": 5
  },
  "createdAt": "2026-08-24T19:00:00.000Z",
  "updatedAt": "2026-08-24T19:00:00.000Z"
}
```

Obs.: o schema do Mongo faz o `toJSON` remover campos internos como `_id`/`__v`, mas em alguns casos de retorno bruto do Mongoose ainda podem aparecer. Em uso normal do Nest, a resposta costuma vir em formato limpo com `id` em vez de `_id`.

---

### GET /campaigns
Lista todas as campanhas do usuário autenticado.

Exemplo de teste:

```bash
curl http://localhost:3001/campaigns \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Resposta esperada:

```json
[
  {
    "id": "66f0c9ab5d1c3d9d9e9f7f11",
    "name": "Campanha da Torre Negra",
    "ownerId": "66f0c7d9f1f2a6d4c2d0e123",
    "playerIds": [],
    "settings": {
      "system": "dnd",
      "theme": "fantasy",
      "maxPlayers": 5
    },
    "createdAt": "2026-08-24T19:00:00.000Z",
    "updatedAt": "2026-08-24T19:00:00.000Z"
  }
]
```

---

### GET /campaigns/:id
Busca uma campanha específica, validando ownership.

Exemplo de teste:

```bash
curl http://localhost:3001/campaigns/66f0c9ab5d1c3d9d9e9f7f11 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Resposta esperada:

```json
{
  "id": "66f0c9ab5d1c3d9d9e9f7f11",
  "name": "Campanha da Torre Negra",
  "ownerId": "66f0c7d9f1f2a6d4c2d0e123",
  "playerIds": [],
  "settings": {
    "system": "dnd",
    "theme": "fantasy",
    "maxPlayers": 5
  },
  "createdAt": "2026-08-24T19:00:00.000Z",
  "updatedAt": "2026-08-24T19:00:00.000Z"
}
```

Possíveis erros:

- `404 Not Found` se a campanha não existir.
- `403 Forbidden` se a campanha pertencer a outro usuário.

```json
{
  "message": "Access denied.",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

### PATCH /campaigns/:id
Atualiza os dados de uma campanha.

Body:

```json
{
  "name": "Nova campanha",
  "settings": {
    "system": "dnd",
    "theme": "high-fantasy",
    "maxPlayers": 6
  }
}
```

Exemplo de teste:

```bash
curl -X PATCH http://localhost:3001/campaigns/66f0c9ab5d1c3d9d9e9f7f11 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova campanha",
    "settings": {
      "system": "dnd",
      "theme": "high-fantasy",
      "maxPlayers": 6
    }
  }'
```

Resposta esperada:

```json
{
  "id": "66f0c9ab5d1c3d9d9e9f7f11",
  "name": "Nova campanha",
  "ownerId": "66f0c7d9f1f2a6d4c2d0e123",
  "playerIds": [],
  "settings": {
    "system": "dnd",
    "theme": "high-fantasy",
    "maxPlayers": 6
  },
  "createdAt": "2026-08-24T19:00:00.000Z",
  "updatedAt": "2026-08-24T19:05:00.000Z"
}
```

---

### DELETE /campaigns/:id
Exclui uma campanha do usuário autenticado.

Exemplo de teste:

```bash
curl -X DELETE http://localhost:3001/campaigns/66f0c9ab5d1c3d9d9e9f7f11 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Resposta esperada:

```json
{
  "deleted": true
}
```

Possíveis erros:

- `404 Not Found` se a campanha não existir.
- `403 Forbidden` se a campanha não for sua.

---

## 5) Assets (Cloudinary raw)

### POST /assets/upload
Faz upload composto de assets 3D para Cloudinary e salva no MongoDB apenas metadados + referência.

Campos multipart adicionais:

- `campaignId` (opcional, default `campaign-demo`)
- `uploadedByUserId` (opcional, default `anonymous`)
- `retainWithoutEntity` (opcional, `true`/`false`)

Formato esperado:

- Campo `model` (obrigatório): `.glb`, `.gltf`, `.obj`
- Campo `texture` (opcional): `.png`, `.jpg`, `.jpeg`, `.webp`
- Campo `mtl` (opcional para GLB/GLTF e **obrigatório para OBJ**): `.mtl`

Limites:

- Máximo: **15 MB por arquivo**
- Quota total da conta
- Quota por campanha
- Quota por usuário dentro da campanha

Exemplo de teste:

```bash
curl -X POST http://localhost:3001/assets/upload \
  -F "model=@./meu-modelo.obj" \
  -F "mtl=@./meu-modelo.mtl" \
  -F "texture=@./textura.png"
```

Resposta esperada:

```json
{
  "id": "66f0d4b0c2b8d8a5e7f4a001",
  "name": "meu-modelo.glb",
  "provider": "cloudinary",
  "publicId": "rpg-sistem/assets/meu-modelo_abc123",
  "format": "GLB",
  "mimeType": "model/gltf-binary",
  "size": 4829132,
  "sourceUrl": "https://res.cloudinary.com/<cloud>/raw/upload/v.../rpg-sistem/assets/meu-modelo_abc123.glb",
  "texturePublicId": "rpg-sistem/assets/textura_xyz123",
  "textureSourceUrl": "https://res.cloudinary.com/<cloud>/image/upload/v.../rpg-sistem/assets/textura_xyz123.png",
  "textureMimeType": "image/png",
  "mtlPublicId": null,
  "mtlSourceUrl": null,
  "entityIds": [],
  "createdAt": "2026-08-26T00:00:00.000Z",
  "updatedAt": "2026-08-26T00:00:00.000Z"
}
```

Possíveis erros:

- `400 Bad Request` para formato inválido
- `400 Bad Request` para arquivo vazio
- `400 Bad Request` para arquivo acima de 15 MB
- `400 Bad Request` para `.obj` sem arquivo `.mtl`
- `400 Bad Request` para exceder quota da conta/campanha/usuário

```json
{
  "statusCode": 400,
  "message": "Modelos OBJ exigem o arquivo .mtl correspondente.",
  "error": "Bad Request"
}
```

### GET /assets
Lista assets já enviados.

Query opcional:

- `campaignId`: filtra assets por campanha

### GET /assets/:id
Busca um asset pelo id.

### DELETE /assets/:id
Remove o asset no Cloudinary e no MongoDB.

---

## 6) Estado persistente da campanha

### GET /campaigns/:id/state
Retorna o Game State persistido da campanha.

Exemplo:

```bash
curl http://localhost:3001/campaigns/campaign-demo/state
```

### PUT /campaigns/:id/state
Salva o Game State completo da campanha e sincroniza referências de assets.

Durante o save:

- Atualiza `entityIds` dos assets de acordo com as entidades;
- Remove assets órfãos que perderam referência de entidade e não estão marcados com retenção.

Exemplo:

```bash
curl -X PUT http://localhost:3001/campaigns/campaign-demo/state \
  -H "Content-Type: application/json" \
  -d '{
    "state": {
      "campaignId": "campaign-demo",
      "map": { "id": "map-demo", "name": "Sala de Jogo", "width": 20, "height": 20, "terrainTextureUrl": null },
      "assets": [],
      "entities": [],
      "players": [],
      "lights": [],
      "vision": { "fogEnabled": false, "revealMode": "global" },
      "audio": { "masterVolume": 1 },
      "dice": { "history": [] },
      "combat": { "active": false, "round": 1 },
      "settings": { "mode": "editor", "layer": "objects" }
    }
  }'
```

---

## 7) Entidades e Personagens (Fase 07)

### GET /campaigns/:id/characters
Lista personagens (`PLAYER`, `ENEMY`, `NPC`) com dados de ficha.

### POST /campaigns/:id/characters
Cria personagem automaticamente a partir de payload + asset 3D já enviado.

Exemplo:

```bash
curl -X POST http://localhost:3001/campaigns/campaign-demo/characters \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "66c000000000000000000001",
    "payload": {
      "name": "Arthas",
      "ownerUserId": "player-a",
      "kind": "PLAYER",
      "level": 1,
      "maxHp": 20,
      "currentHp": 20,
      "visibility": "owner",
      "metadata": {
        "race": "Humano",
        "class": "Fighter"
      }
    }
  }'
```

### PATCH /campaigns/:id/characters/:characterId/model
Troca modelo 3D do personagem sem alterar HP, status e dados da ficha.

### POST /campaigns/:id/characters/upload
Fluxo de entrada em uma etapa: recebe `payload` + arquivos (`model`, `texture?`, `mtl?`) e cria asset + personagem.

Campos multipart:

- `payload`: JSON da ficha básica do personagem
- `model`: arquivo do modelo 3D (obrigatório)
- `texture`: textura (opcional)
- `mtl`: obrigatório quando o modelo for OBJ

### PATCH /campaigns/:id/characters/:characterId/hp
Atualiza HP atual (e opcionalmente HP máximo).

### POST /campaigns/:id/characters/:characterId/status
Aplica status ao personagem (normalizado para minúsculo e sem duplicatas).

---

## 8) WebSocket (fundação)

Namespace:

```text
/game
```

Eventos de entrada:

- `join_campaign` com `{ campaignId, userId? }`
- `leave_campaign` com `{ campaignId, userId? }`

Eventos emitidos:

- `PLAYER_JOINED`
- `PLAYER_LEFT`
- `MAP_UPDATED` (quando estado da campanha é salvo)

---

## 9) Fluxo de teste recomendado

1. Inicie o backend:

```bash
cd backend
npm run dev
```

2. Registre um usuário:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diego",
    "email": "diego@email.com",
    "password": "123456"
  }'
```

3. Pegue o `accessToken` da resposta.

4. Use o token em todas as requisições protegidas:

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

5. Crie uma campanha, liste, edite e delete.

---

## 10) Observações importantes

- Todas as rotas protegidas exigem o header:

```http
Authorization: Bearer SEU_ACCESS_TOKEN
```

- O JWT é emitido em `/auth/register` e `/auth/login`.
- O backend segue a regra de "servidor como fonte da verdade" e não persiste sessão no servidor; a autenticação é feita via token.
- Em produção, o `JWT_SECRET` e o `MONGO_URI` devem estar no ambiente e fora do código.

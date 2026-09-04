# Fase 07 — Entidades e Personagens

## Objetivo
Permitir a criação de personagens, inimigos e NPCs a partir de um payload de dados combinado (opcionalmente) com upload de modelo 3D, sem exigir que o jogador configure manualmente a ficha na plataforma. Também foi fechada a governança de assets (quotas e limpeza de órfãos) antes de avançar para a fase de multiplayer.

## O que foi implementado

### 1. Schema de personagem no Game State
Foi adicionado `CharacterState` às entidades do tipo `PLAYER`, `ENEMY` e `NPC`:

- `ownerUserId`
- `visibility` (`public`, `owner`, `gm`)
- `data` (`name`, `archetype`, `level`, `metadata`)
- `hp` (`current`, `max`)
- `status` (lista de strings normalizadas)

O personagem reaproveita os campos já existentes de entidade (`position`, `rotation`, `scale`, `assetId`).

### 2. Criação de personagem por payload
- `POST /campaigns/:id/characters`: cria personagem/inimigo/NPC a partir de um payload JSON e de um `assetId` já existente.
- Validações: `name`, `level`, `maxHp`/`currentHp` (`currentHp` não pode ser maior que `maxHp`), `visibility`, `status` e `assetId` (precisa existir e pertencer à campanha).

### 3. Criação de personagem em uma única chamada (payload + upload)
- `POST /campaigns/:id/characters/upload`: recebe multipart com `payload` (JSON), `model`, `texture` (opcional) e `mtl` (obrigatório para `.obj`).
- O backend cria o asset no Cloudinary e, em seguida, cria o personagem já vinculado a esse asset, evitando duas etapas manuais no frontend.
- Reaproveita os mesmos limites e mensagens de erro da fase 06 (tamanho máximo de 15 MB, exigência de `.mtl` para `.obj`).

### 4. Troca de modelo sem perder dados da ficha
- `PATCH /campaigns/:id/characters/:characterId/model`: troca apenas o `assetId` do personagem, preservando `character.data`, `hp` e `status`.

### 5. HP e status
- `PATCH /campaigns/:id/characters/:characterId/hp`: atualiza `hp.current` (e opcionalmente `hp.max`), validando que `current` não ultrapasse `max`.
- `POST /campaigns/:id/characters/:characterId/status`: adiciona um status à lista (deduplicado), normalizado em minúsculas.

### 6. Listagem de personagens
- `GET /campaigns/:id/characters`: retorna todas as entidades do tipo `PLAYER`/`ENEMY`/`NPC` que possuem dados de personagem.

### 7. Salvar/Carregar estado da campanha
- `GET /campaigns/:id/state` e `PUT /campaigns/:id/state` persistem o Game State completo (mapa, entidades, personagens, players, assets referenciados) no MongoDB, permitindo continuar a partida depois de recarregar a página.

### 8. Quota system de assets
Foi implementado controle de quota em camadas, aplicado antes de aceitar um upload:

- Limite por tipo de arquivo (mantido da fase 06: 15 MB para modelos 3D).
- Limite de uso por usuário dentro da campanha.
- Limite de uso agregado da campanha.
- Quando o limite é excedido, o backend rejeita o upload com mensagem explicando qual limite foi atingido, sem gravar arquivo nem referência no banco.

### 9. Limpeza de assets órfãos
- Ao salvar o Game State, o backend recalcula quais assets ainda são referenciados por alguma entidade (`buildAssetReferencesFromState`) e sincroniza `entityIds` de cada asset.
- Assets sem nenhuma entidade vinculada e sem a flag `retainWithoutEntity` são candidatos à limpeza automática, evitando acúmulo de arquivos não utilizados no Cloudinary/MongoDB.
- A exclusão de uma entidade (`delete-entity` no editor + persistência do estado) libera o asset associado, refletindo na quota do usuário/campanha.

### 10. Frontend
- Formulário de criação de personagem por payload (JSON) e por payload + upload (modelo, textura, mtl) na mesma tela do editor.
- Ações para trocar modelo, atualizar HP e aplicar status do personagem selecionado.
- Botões de "Salvar estado da campanha" e "Carregar estado da campanha" para persistir/retomar a partida.

## Validação
Testado com:

- build do backend
- build do frontend
- criação de personagem via payload puro
- criação de personagem via payload + upload (glb e obj+mtl)
- troca de modelo preservando HP/status
- atualização de HP com validação de limite
- aplicação de status
- salvar e recarregar estado da campanha
- upload acima do limite de quota rejeitado com mensagem clara
- remoção de entidade liberando o asset (sem referência ativa)

## Resultado da fase
A fase 07 ficou concluída: personagens podem ser criados automaticamente a partir de payload e modelo 3D, o estado da campanha é persistido de forma completa, e a governança de assets (quota + limpeza de órfãos) está pronta antes do avanço para o multiplayer da fase 08.

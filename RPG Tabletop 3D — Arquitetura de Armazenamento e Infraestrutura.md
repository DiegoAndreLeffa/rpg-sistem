# RPG Tabletop 3D — Arquitetura de Armazenamento e Infraestrutura

## 1. Visão geral

O projeto consiste em uma plataforma de **Virtual Tabletop (VTT) 3D para RPG**, desenvolvida com Three.js, na qual um Mestre poderá criar, editar e gerenciar cenários e partidas enquanto os jogadores participam em tempo real.

A aplicação será composta por três principais serviços de infraestrutura:

```text
Vercel
└── Frontend
    ├── React
    ├── TypeScript
    └── Three.js

Railway
├── NestJS API
├── WebSocket
└── Storage Bucket

MongoDB Cloud
└── Banco de dados
```

A responsabilidade de cada serviço será bem definida:

* **Vercel:** hospedagem do frontend;
* **Railway:** hospedagem da API NestJS, WebSocket e armazenamento dos arquivos através do Storage Bucket;
* **MongoDB Cloud:** armazenamento dos dados estruturados da aplicação e do estado das partidas.

---

# 2. Princípio fundamental da arquitetura

O sistema deverá separar claramente:

```text
DADOS
```

de:

```text
ARQUIVOS
```

O MongoDB **não será utilizado para armazenar os arquivos dos modelos 3D, músicas ou outros assets pesados**.

O Railway Bucket será responsável pelos arquivos.

O MongoDB será responsável pelas informações referentes a esses arquivos.

---

# 3. Responsabilidade do MongoDB

O MongoDB será utilizado para armazenar todos os dados estruturados da aplicação.

Entre eles:

```text
Usuários
Campanhas
Partidas
Players
Personagens
Inimigos
NPCs
Objetos
Posições
Rotações
Escalas
HP
Status
Atributos
Inventário
Iluminação
Visão
Fog of War
Áudio
Iniciativa
Combate
Game State
Saves
Metadados dos assets
```

O banco não armazenará o arquivo físico do modelo.

---

# 4. Responsabilidade do Railway Bucket

O Railway Storage Bucket será o armazenamento oficial dos arquivos do sistema.

Serão armazenados principalmente:

```text
Modelos 3D
├── GLB
├── GLTF
└── OBJ

Texturas
├── PNG
├── JPG
└── outros formatos suportados

Áudio
├── MP3
├── WAV
└── outros formatos necessários

Música
├── trilhas
└── playlists

SFX
├── ataques
├── portas
├── criaturas
├── ambiente
└── outros efeitos

Imagens
├── mapas
├── thumbnails
├── imagens de personagens
└── assets de interface
```

O Bucket funcionará como **Object Storage** da plataforma.

---

# 5. Estrutura de armazenamento

Os arquivos serão organizados de forma lógica por campanha, proprietário e tipo.

Exemplo:

```text
bucket/
│
└── campaigns/
    │
    └── campaign_001/
        │
        ├── master/
        │   │
        │   ├── maps/
        │   ├── buildings/
        │   ├── walls/
        │   ├── doors/
        │   ├── objects/
        │   ├── enemies/
        │   ├── npcs/
        │   ├── textures/
        │   ├── audio/
        │   └── music/
        │
        └── players/
            │
            ├── player_001/
            │   └── character.glb
            │
            ├── player_002/
            │   └── character.glb
            │
            └── player_003/
                └── character.glb
```

Essa estrutura não representa necessariamente a única organização possível, mas estabelece o princípio de separação dos assets.

---

# 6. Asset Service

O sistema não deverá espalhar chamadas diretamente ao Railway Bucket pelo código inteiro da aplicação.

Será criada uma camada específica para gerenciamento de assets:

```text
Asset Service
```

Sua responsabilidade será abstrair completamente o armazenamento.

Arquitetura:

```text
Frontend
   │
   ▼
NestJS
   │
   ▼
Asset Service
   │
   ▼
Railway Bucket
```

O restante da aplicação não deverá precisar conhecer detalhes específicos da implementação do Bucket.

---

# 7. Interface de armazenamento

Será criada uma abstração semelhante a:

```text
AssetStorage
```

Responsável por operações como:

```text
upload()
delete()
getUrl()
exists()
getMetadata()
```

A implementação inicial será:

```text
AssetStorage
      │
      ▼
RailwayBucketStorage
```

Isso evita acoplamento excessivo da aplicação ao provedor de armazenamento.

---

# 8. Possibilidade de troca futura

A arquitetura deverá permitir trocar o provedor de armazenamento sem reescrever o restante da aplicação.

Hoje:

```text
AssetStorage
     │
     ▼
RailwayBucketStorage
     │
     ▼
Railway Bucket
```

No futuro, caso seja necessário:

```text
AssetStorage
     │
     ▼
OutroStorage
```

O restante da aplicação continuará utilizando:

```text
AssetStorage
```

sem precisar conhecer a implementação concreta.

Essa abstração deverá ser criada desde o início.

---

# 9. Metadados dos assets

O MongoDB armazenará os metadados de cada arquivo.

Exemplo:

```json
{
  "assetId": "asset_123",
  "campaignId": "campaign_001",
  "ownerId": "player_001",
  "ownerType": "PLAYER",
  "type": "CHARACTER_MODEL",
  "format": "glb",
  "size": 7348211,
  "storageKey": "campaigns/campaign_001/players/player_001/character.glb",
  "createdAt": "2026-08-31T00:00:00.000Z"
}
```

O campo:

```text
storageKey
```

representará a localização do arquivo dentro do Bucket.

---

# 10. Relação entre Asset e entidade

Um modelo 3D não deve ser confundido com o personagem.

Por exemplo:

```text
Character
├── id
├── owner
├── HP
├── status
├── attributes
└── assetId
```

Enquanto:

```text
Asset
├── id
├── storageKey
├── format
├── size
└── metadata
```

Isso permite trocar o modelo sem destruir os dados do personagem.

Exemplo:

```text
Personagem
   │
   └── assetId → barbarian_v1.glb
```

O Mestre pode trocar o modelo:

```text
Personagem
   │
   └── assetId → barbarian_v2.glb
```

sem alterar:

* HP;
* atributos;
* status;
* inventário;
* posição;
* proprietário.

---

# 11. Fluxo de upload

O upload deverá passar pelo backend.

Fluxo:

```text
Usuário
   │
   │ Upload
   ▼
Frontend
   │
   ▼
NestJS
   │
   ├── Autenticação
   ├── Autorização
   ├── Validação
   ├── Tipo do arquivo
   ├── Tamanho
   └── Campanha
   │
   ▼
Asset Service
   │
   ▼
Railway Bucket
   │
   ▼
Asset Metadata
   │
   ▼
MongoDB
```

---

# 12. Validação de assets

Antes do armazenamento, o backend deverá validar:

```text
Extensão
MIME type
Tamanho
Tipo do asset
Integridade do arquivo
Proprietário
Campanha
Permissão
```

Exemplo:

```text
Upload
   ↓
É um modelo permitido?
   ↓
Tamanho permitido?
   ↓
Arquivo válido?
   ↓
Usuário possui permissão?
   ↓
Campanha existe?
   ↓
Salvar
```

---

# 13. Permissões

As permissões serão controladas pelo backend.

O frontend não será considerado confiável para definir quem pode acessar determinado arquivo.

Exemplo:

```text
PLAYER
   │
   │ solicita enemy_secret.glb
   ▼
NestJS
   │
   ├── pertence à campanha?
   ├── possui permissão?
   ├── inimigo foi revelado?
   └── asset está disponível?
```

Caso não possua permissão:

```text
ACCESS DENIED
```

---

# 14. Assets do Mestre

O Mestre poderá possuir assets como:

```text
Mapas
Casas
Paredes
Portas
Objetos
Inimigos
NPCs
Texturas
Músicas
SFX
```

Esses arquivos poderão ser organizados em:

```text
campaigns/campaign_001/master/
```

O acesso será controlado pelo backend.

---

# 15. Assets dos jogadores

Os jogadores poderão anexar seus próprios modelos de personagem.

Fluxo:

```text
Jogador
   │
   ├── Payload
   │
   └── Modelo 3D
          │
          ▼
       NestJS
          │
          ▼
      Asset Service
          │
          ▼
    Railway Bucket
```

O payload já existente será utilizado para configurar automaticamente os dados do personagem.

O jogador não precisará preencher manualmente toda a ficha dentro da plataforma.

---

# 16. Payload + modelo

O processo será:

```text
PAYLOAD
   │
   ▼
Validação
   │
   ▼
Character Data
   │
   ├── HP
   ├── Attributes
   ├── Status
   ├── Inventory
   └── outras informações
```

Enquanto o modelo:

```text
GLB / GLTF / OBJ
   │
   ▼
Asset Service
   │
   ▼
Railway Bucket
```

Os dois serão relacionados através do estado do personagem.

---

# 17. Entrega dos assets

O frontend não deverá receber acesso irrestrito ao Bucket.

O fluxo preferencial será:

```text
Three.js
   │
   │ precisa do modelo
   ▼
NestJS
   │
   ├── verifica usuário
   ├── verifica campanha
   ├── verifica permissão
   └── localiza asset
   │
   ▼
URL temporária / acesso autorizado
   │
   ▼
Railway Bucket
   │
   ▼
Three.js
```

Isso será especialmente importante para:

* inimigos ocultos;
* mapas secretos;
* objetos GM Only;
* personagens;
* conteúdo privado.

---

# 18. Integração com Three.js

O Three.js será responsável por carregar e representar os modelos.

Exemplo conceitual:

```text
Character State
      │
      ├── position
      ├── rotation
      ├── scale
      └── assetId
               │
               ▼
         Asset Service
               │
               ▼
          Model URL
               │
               ▼
            Three.js
               │
               ▼
          3D Character
```

O Three.js não deverá armazenar a informação persistente do asset.

---

# 19. Save e Assets

O sistema de Save não deverá copiar os arquivos 3D para dentro do MongoDB.

O Save armazenará a referência aos assets.

Exemplo:

```json
{
  "characterId": "character_001",
  "assetId": "asset_123",
  "position": {
    "x": 10,
    "y": 0,
    "z": 15
  },
  "rotation": {
    "x": 0,
    "y": 1.57,
    "z": 0
  },
  "hp": 37
}
```

O arquivo continuará no Bucket.

---

# 20. Restauração da partida

Ao carregar um Save:

```text
MongoDB
   │
   ▼
Game State
   │
   ├── Asset IDs
   ├── Positions
   ├── HP
   ├── Status
   └── outras informações
   │
   ▼
Asset Service
   │
   ▼
Railway Bucket
   │
   ▼
Three.js
```

O sistema reconstrói visualmente a partida utilizando os assets armazenados.

---

# 21. Assets órfãos

O sistema deverá possuir mecanismo para identificar assets que não são mais utilizados.

Exemplo:

```text
Player possui:
barbarian_v1.glb
```

O jogador troca para:

```text
barbarian_v2.glb
```

O sistema deverá verificar se:

```text
barbarian_v1.glb
```

continua sendo utilizado por outra entidade, campanha ou save.

Caso não seja utilizado e esteja elegível para limpeza:

```text
Asset órfão
      ↓
Cleanup
      ↓
Bucket
```

Essa funcionalidade ajudará a controlar o crescimento do armazenamento.

---

# 22. Quotas

O sistema deverá futuramente possuir controle de utilização de armazenamento.

Exemplo:

```text
Campanha
│
├── Mestre
│   └── 2.3 GB
│
├── Player A
│   └── 120 MB
│
├── Player B
│   └── 85 MB
│
└── Player C
    └── 230 MB
```

O backend poderá controlar:

```text
Limite da plataforma
Limite da campanha
Limite por usuário
Limite por arquivo
```

---

# 23. Segurança

Nenhuma operação crítica deverá depender exclusivamente do frontend.

O servidor deverá validar:

```text
Upload
Download
Delete
Update
Ownership
Campaign access
Asset access
```

Exemplo:

```text
Player
   │
   │ DELETE enemy.glb
   ▼
NestJS
   │
   ▼
Permission Check
   │
   ▼
DENIED
```

Mesmo que o jogador manipule o frontend, não deverá conseguir executar operações para as quais não possui autorização.

---

# 24. Tipos de armazenamento

A arquitetura seguirá a seguinte divisão:

## MongoDB Cloud

Responsável por:

```text
Dados estruturados
Game State
Save
Usuários
Campanhas
Personagens
Inimigos
NPCs
HP
Status
Posições
Iluminação
Visão
Áudio
Iniciativa
Combate
Asset Metadata
```

## Railway Bucket

Responsável por:

```text
GLB
GLTF
OBJ
Texturas
Áudio
Músicas
SFX
Imagens
Mapas
Outros arquivos
```

## Vercel

Responsável por:

```text
Frontend
React
Three.js
Interface do Mestre
Interface dos jogadores
```

## Railway

Responsável por:

```text
NestJS
REST API
WebSocket
Asset Service
Regras de negócio
Autenticação
Autorização
Integração com MongoDB
Integração com Bucket
```

---

# 25. Arquitetura final

```text
                         ┌───────────────────┐
                         │      VERCEL       │
                         │                   │
                         │ React             │
                         │ TypeScript        │
                         │ Three.js          │
                         └─────────┬─────────┘
                                   │
                              HTTPS / WS
                                   │
                         ┌─────────▼─────────┐
                         │      RAILWAY      │
                         │                   │
                         │ NestJS            │
                         │ REST API          │
                         │ WebSocket         │
                         │ Asset Service     │
                         └───────┬───┬───────┘
                                 │   │
                    ┌────────────┘   └────────────┐
                    │                             │
            ┌───────▼────────┐          ┌─────────▼────────┐
            │   MONGODB      │          │ RAILWAY BUCKET   │
            │     CLOUD      │          │                  │
            │                │          │ GLB              │
            │ Game State     │          │ GLTF             │
            │ Saves          │          │ OBJ              │
            │ Players        │          │ Textures         │
            │ Characters     │          │ Audio            │
            │ Enemies        │          │ Music            │
            │ NPCs           │          │ SFX              │
            │ Positions      │          │ Images           │
            │ HP             │          │ Maps             │
            │ Status         │          │                  │
            │ Asset Metadata │          │                  │
            └────────────────┘          └──────────────────┘
```

---

# 26. Fluxo completo de um personagem

```text
Jogador
   │
   ├── Payload
   │
   └── Modelo 3D
          │
          ▼
       Frontend
          │
          ▼
       NestJS
          │
          ├── Validação
          ├── Autorização
          └── Character Service
          │
          ├───────────────┐
          │               │
          ▼               ▼
      MongoDB         Asset Service
          │               │
          │               ▼
          │        Railway Bucket
          │               │
          └───────┬───────┘
                  │
              Game State
                  │
                  ▼
               Three.js
                  │
                  ▼
          Personagem 3D
```

---

# 27. Fluxo completo de uma partida

```text
Mestre
   │
   ▼
Cria campanha
   │
   ▼
Cria mapa
   │
   ▼
Adiciona assets
   │
   ▼
Railway Bucket
   │
   ▼
MongoDB registra metadados
   │
   ▼
Jogadores entram
   │
   ▼
Jogadores carregam personagens
   │
   ▼
Payload + Modelo 3D
   │
   ▼
Game State
   │
   ▼
Multiplayer
   │
   ├── Movimento
   ├── Combate
   ├── Dados
   ├── HP
   ├── Status
   ├── Visão
   ├── Iluminação
   └── Áudio
   │
   ▼
Mestre salva
   │
   ▼
Snapshot
   │
   ▼
MongoDB
   │
   ▼
Load
   │
   ▼
Game State restaurado
   │
   ▼
Assets recuperados do Bucket
   │
   ▼
Three.js reconstrói a partida
```

---

# 28. Decisão arquitetural oficial

Para o projeto, a decisão será:

> **O Railway Storage Bucket será utilizado como armazenamento principal dos assets da VTT.**

O MongoDB será utilizado exclusivamente para os dados estruturados e metadados dos assets.

O frontend será hospedado na Vercel.

A API NestJS, WebSocket e Asset Service serão hospedados no Railway.

A arquitetura deverá possuir uma abstração `AssetStorage`, permitindo substituir o provedor de armazenamento no futuro sem modificar a lógica principal da aplicação.

---

# 29. Motivos da escolha

A escolha do Railway Bucket é baseada principalmente em:

### 1. Infraestrutura já utilizada

O Railway já será utilizado para hospedar:

```text
NestJS
WebSocket
API
```

Portanto, o Bucket integra-se naturalmente à infraestrutura existente.

### 2. Separação correta de responsabilidades

```text
MongoDB
=
dados

Bucket
=
arquivos
```

### 3. Adequação aos assets

Os principais arquivos do projeto serão:

```text
GLB
GLTF
OBJ
MP3
WAV
PNG
JPG
```

O uso de Object Storage é adequado para esse cenário.

### 4. Menor quantidade de serviços

A infraestrutura principal fica reduzida a:

```text
Vercel
Railway
MongoDB Cloud
```

Isso simplifica:

* configuração;
* autenticação;
* manutenção;
* monitoramento;
* deploy;
* gerenciamento de credenciais.

### 5. Flexibilidade futura

A abstração `AssetStorage` evita dependência irreversível do Railway.

---

# 30. Regra de ouro do sistema

A arquitetura deverá seguir três regras fundamentais:

## Regra 1

**MongoDB guarda informações.**

```text
"Esse personagem usa o modelo X"
```

Não:

```text
"MongoDB guarda o arquivo X"
```

## Regra 2

**Railway Bucket guarda arquivos.**

```text
character.glb
dragon.glb
door.mp3
battle_music.mp3
```

## Regra 3

**NestJS controla o acesso.**

O cliente nunca deverá decidir sozinho:

```text
quem pode acessar
quem pode modificar
quem pode excluir
quem pode visualizar
```

---

# 31. Resultado esperado

Ao final da implementação dessa arquitetura, teremos:

```text
Vercel
    ↓
Interface 3D
    ↓
Railway / NestJS
    ↓
Game State + regras + permissões
    ↓
┌─────────────────────┐
│                     │
▼                     ▼
MongoDB           Railway Bucket
│                     │
Dados              Arquivos
│                     │
└─────────┬───────────┘
          │
          ▼
      Three.js
          │
          ▼
      Partida 3D
```

Essa estrutura permite que o projeto cresça mantendo uma separação clara entre **dados, arquivos, regras de negócio e representação visual**, além de preparar a plataforma para multiplayer, Save/Load, permissões, assets privados, personagens personalizados e expansão futura.

# RPG Tabletop — Documento Geral do Projeto

## 1. Visão geral

O projeto consiste em uma **plataforma de mesa virtual de RPG (VTT — Virtual Tabletop)** construída com foco em **Three.js**, permitindo que um Mestre crie, edite e gerencie completamente uma partida de RPG em um ambiente visual 2D/3D, enquanto os jogadores participam da mesma sessão em tempo real.

A plataforma não deve ser presa a um sistema específico de RPG. A ideia é criar um **motor de RPG configurável**, no qual o Mestre determina como a campanha funciona, quais elementos existem, quais regras são utilizadas e quais permissões cada jogador possui.

O sistema deverá permitir:

- Criação e edição de mapas;
- Mapas 2D utilizando Three.js;
- Possibilidade futura de cenas 3D completas;
- Grid quadrado;
- Grid hexagonal;
- Mapas sem grid;
- Construções pré-fabricadas;
- Casas;
- Paredes;
- Portas;
- Janelas;
- Árvores;
- Objetos decorativos;
- Objetos interativos;
- Iluminação dinâmica;
- Sombras;
- Fog of War;
- Linha de visão;
- Visão individual por jogador;
- Personagens controlados pelos jogadores;
- Inimigos controlados pelo Mestre;
- NPCs;
- Bosses;
- Pets;
- Summons;
- Sistema de vida;
- Sistema de status;
- Sistema de permissões;
- Sistema de dados 3D;
- Sistema multiplayer em tempo real;
- Sistema de salvamento completo da partida;
- Carregamento de partidas salvas;
- Histórico de rolagens;
- Importação de personagens através de payload;
- Importação de modelos 3D;
- Controle completo da sessão pelo Mestre.

O objetivo é que o sistema seja suficientemente flexível para funcionar com diferentes sistemas de RPG, inclusive sistemas próprios.

---

# 2. Filosofia do projeto

A principal filosofia da plataforma será:

> **O sistema não determina como o RPG deve ser jogado. Ele fornece as ferramentas para que o Mestre determine como o RPG funciona.**

O sistema não deverá ser construído exclusivamente para D&D, Tormenta, Pathfinder ou qualquer outro sistema.

O Mestre poderá utilizar:

- D&D;
- Tormenta;
- Pathfinder;
- Sistemas próprios;
- Sistemas narrativos;
- Campanhas sem regras rígidas;
- Ou simplesmente utilizar a plataforma como um tabuleiro virtual.
  
  "Sistema pode usar o modelos como base e personalizar."

O projeto deve funcionar como uma **engine de VTT configurável**.

---

# 3. Mestre como administrador da campanha

O Mestre será o principal administrador da campanha e possuirá controle praticamente total sobre a sessão.

O Mestre poderá controlar:

- Mapa;
- Terreno;
- Construções;
- Objetos;
- Paredes;
- Portas;
- Iluminação;
- Grid;
- Personagens;
- Inimigos;
- NPCs;
- Bosses;
- HP;
- Status;
- Posições;
- Rotação;
- Escala;
- Visibilidade;
- Fog of War;
- Regras;
- Permissões;
- Dados;
- Objetos interativos;
- Estado da partida;
- Salvamentos.

O Mestre deverá poder editar praticamente qualquer elemento da partida.

---

# 4. Jogadores

Os jogadores participarão da mesma sessão multiplayer.

Cada jogador poderá possuir seus próprios personagens e peças.

O jogador não deverá necessariamente precisar configurar manualmente os dados do personagem dentro da plataforma.

O personagem será criado através de um **payload de dados**, que será fornecido posteriormente e já existe no projeto.

O jogador deverá basicamente:

1. Importar o payload do personagem;
2. Anexar o modelo visual correspondente;
3. Adicionar o personagem à partida.

A plataforma deverá interpretar o payload e realizar a configuração automaticamente.

Payload:
```
{
    "name": "Brock, O cozinheiro",
    "classSlug": "cozinheiro",
    "originSlug": "origem-personalizada",
    "raceSlug": "golias",
    "level": 1,
    "playerDisplayName": "O cozinheiro",
    "notes": ,
    "Apelido": "O cozinheiro",
    "Pronomes": "Ele/Dele",
    "Visibilidade": "private",
    "Vida máxima inicial": 28, 
    "Robustez inicial da classe": "Rolado (1d10 = 6)",
    "Habilidades iniciais": "Calor, Ingredientes, Comida Rapida, Temperar / Aquecer, Corte de Julienne, Prato de Emergencia, Tempero de Folego, Oleo Quente / Flambar, Estrutura de Gigante, Firmeza Herdada, Marca da Linhagem, Passo Colossal",
    "Dano base atual": "+5",
    "Bonus técnico atual": "+0", 
    "SAN atual da ficha": 3,
    "Evolução natural": "",
    "Vitalidade": "+28 Vida Maxima (proximo aumento 5 PE)",
    "Potencia Fisica": "+5 Dano Base (proximo aumento 6 PE)",
    "Potencia Tecnica": "+0 Bonus Tecnico (proximo aumento 5 PE)",
    "Estabilidade Mental": "+3 SAN (proximo aumento 5 PE)",
    "Escolhas de classe": "Oficio (Culinaria), Sobrevivencia, Fortitude, machado-de-guerra, armadura-leve-de-couro",
    "Escolhas de raça": "language-gigante, language-nidavelico",
    "maxLife": 28,
    "currentLife": 28,
    "maxSanity": 28,
    "currentSanity": 28,
    "attributes": [
        {
            "attribute": "FOR",
            "value": 3
        },
        {
            "attribute": "DES",
            "value": 1
        },
        {
            "attribute": "CON",
            "value": 2
        },
        {
            "attribute": "INT",
            "value": 1
        },
        {
            "attribute": "SAB",
            "value": 2
        },
        {
            "attribute": "CAR",
            "value": 1
        },
        {
            "attribute": "VON",
            "value": 1
        },
        {
            "attribute": "ENG",
            "value": 0
        }
    ],
    "skills": [
        {
            "skillSlug": "oficio-teorico",
            "rank": "TRAINED"
        },
        {
            "skillSlug": "sobrevivencia",
            "rank": "TRAINED"
        },
        {
            "skillSlug": "fortitude",
            "rank": "TRAINED"
        },
        {
            "skillSlug": "luta",
            "rank": "TRAINED"
        },
        {
            "skillSlug": "iniciativa",
            "rank": "TRAINED"
        },
        {
            "skillSlug": "adestramento",
            "rank": "TRAINED"
        }
    ],
    "selectedProficiencies": [
        {
            "sourceType": "race",
            "proficiencySlug": "language-gigante",
            "choiceGroup": "racial:languages",
            "grantLevel": 1
        },
        {
            "sourceType": "race",
            "proficiencySlug": "language-nidavelico",
            "choiceGroup": "racial:languages",
            "grantLevel": 1
        }
    ],
    "selectedStarterItems": [
        {
            "sourceType": "class",
            "itemSlug": "machado-de-guerra",
            "choiceGroup": "cozinheiro-arma-inicial",
            "instanceName": "Cutelo giga de cozinha"
        },
        {
            "sourceType": "class",
            "itemSlug": "armadura-leve-de-couro",
            "choiceGroup": "cozinheiro-armadura-inicial"
        }
    ]
}
```

---

# 5. Personagem = dados + representação visual

O personagem será dividido conceitualmente em duas partes:

```text
PERSONAGEM
│
├── Dados
│   ├── HP
│   ├── atributos
│   ├── habilidades
│   ├── movimento
│   ├── visão
│   ├── status
│   └── demais informações do payload
│
└── Visual
    └── Modelo 3D
```

O payload representa os **dados e regras do personagem**.

O modelo 3D representa apenas a **aparência visual**.

Essas duas partes devem permanecer independentes.

Por exemplo:

```text
aragorn.json
aragorn.glb
```

O sistema combina ambos:

```text
Payload
   ↓
Character Adapter
   ↓
Character Entity
   ↑
Modelo 3D
```

O modelo 3D poderá futuramente ser substituído sem alterar o personagem em si.

Por exemplo:

```text
guerreiro.glb
```

pode ser substituído por:

```text
guerreiro2.glb
```

e o personagem continuará sendo o mesmo, mantendo:

- HP;
- atributos;
- inventário;
- posição;
- status;
- permissões;
- identidade;
- demais dados.

---

# 6. Importação do personagem

A interface de criação do personagem deverá ser simples.

O jogador poderá encontrar algo semelhante a:

```text
┌──────────────────────────────────────┐
│          ADICIONAR PERSONAGEM        │
│                                      │
│  📄 Payload                          │
│                                      │
│  [ Arraste seu arquivo aqui ]        │
│                                      │
│                 +                    │
│                                      │
│  🎭 Modelo 3D                       │
│                                      │
│  [ Arraste seu modelo aqui ]         │
│                                      │
│                                      │
│             [ IMPORTAR ]             │
└──────────────────────────────────────┘
```

O sistema deverá:

1. Receber o payload;
2. Validar o payload;
3. Interpretar seus dados;
4. Utilizar um `CharacterAdapter`;
5. Criar a entidade interna do personagem;
6. Receber o modelo 3D;
7. Carregar o modelo utilizando o loader adequado;
8. Associar o modelo à entidade;
9. Inserir o personagem na cena.

---

# 7. Formatos de modelos 3D

O projeto não deverá ficar limitado ao OBJ.

Three.js permite trabalhar com diferentes formatos através de seus respectivos loaders.

O formato principal recomendado é:

## GLB / GLTF

GLB/GLTF deverá ser tratado como formato prioritário, pois pode conter:

- Modelo;
- Materiais;
- Texturas;
- Animações;
- Hierarquia;
- Informações visuais;
- Outros dados necessários para a representação.

O GLB também facilita o gerenciamento por poder encapsular grande parte dos recursos em um único arquivo.

## OBJ

OBJ também deverá ser aceito.

Porém, normalmente pode depender de arquivos adicionais:

```text
character.obj
character.mtl
texture.png
```

Isso torna o gerenciamento um pouco mais complexo.

Futuramente, o sistema poderá aceitar outros formatos, dependendo dos loaders utilizados:

```text
.glb
.gltf
.obj
.fbx
.stl
```

---

# 8. Character Adapter

O sistema deverá possuir uma camada intermediária entre o payload recebido e a engine do jogo.

```text
PAYLOAD
   ↓
Character Adapter
   ↓
Internal Character Model
   ↓
Game Engine
```

O `CharacterAdapter` será responsável por interpretar o payload e convertê-lo para o modelo interno utilizado pela plataforma.

Isso é importante porque o payload poderá mudar no futuro.

Caso a estrutura do payload seja modificada, idealmente será necessário alterar somente o `CharacterAdapter`, sem precisar alterar:

- Three.js;
- Sistema de visão;
- Sistema de combate;
- Multiplayer;
- Sistema de save;
- Permissões;
- Renderização.

Quando o payload real for fornecido, será necessário mapear exatamente cada campo para essa arquitetura.

---

# 9. Entidades / Pieces

O conceito central do mapa será o de **Piece/Entity**.

Tudo que estiver presente na cena poderá ser tratado como uma entidade.

Exemplos:

```text
🧙 Personagem
👹 Inimigo
🐉 Dragão
🏠 Casa
🔥 Fogueira
🚪 Porta
🌲 Árvore
💎 Baú
```

Uma entidade poderá possuir propriedades comuns:

```text
Entity
├── id
├── campaignId
├── sceneId
├── type
├── transform
├── appearance
├── gameplay
├── visibility
├── permissions
└── metadata
```

---

# 10. Transform

Cada entidade visual deverá possuir informações de transformação:

```text
transform
├── position
│   ├── x
│   ├── y
│   └── z
│
├── rotation
│   ├── x
│   ├── y
│   └── z
│
└── scale
    ├── x
    ├── y
    └── z
```

Isso permite salvar e restaurar exatamente:

- Posição;
- Rotação;
- Escala.

---

# 11. Tipos de entidade

Inicialmente, o sistema poderá trabalhar com:

```text
Player
Enemy
NPC
Object
```

Porém, a arquitetura deverá permitir expansão futura para:

```text
Boss
Trap
Projectile
Spell
Vehicle
Mount
Pet
Summon
InteractiveObject
Effect
```

Esses tipos poderão ser especializações de uma entidade base.

---

# 12. Personagens dos jogadores

Cada jogador poderá possuir seus próprios personagens.

Exemplo:

```text
MEUS PERSONAGENS

🧙 Kael
❤️ 35/40

🏹 Elara
❤️ 22/22

[ + Criar personagem ]
```

O jogador não deverá precisar preencher manualmente todas as informações.

O payload será responsável por fornecer os dados.

O jogador apenas fornece:

```text
Payload
+
Modelo 3D
```

---

# 13. Inimigos

O Mestre poderá adicionar inimigos da mesma maneira.

Por exemplo:

```text
Enemy
```

O Mestre poderá importar:

```text
goblin.json
goblin.glb
```

O sistema poderá criar:

```text
GOBLIN
├── Dados
│   ├── HP
│   ├── Movimento
│   ├── Visão
│   └── atributos
│
└── Visual
    └── goblin.glb
```

O inimigo será controlado pelo Mestre.

---

# 14. NPCs

O mesmo sistema poderá ser utilizado para NPCs.

```text
npc.json
npc.glb
```

O NPC poderá possuir:

- HP;
- atributos;
- visão;
- movimento;
- status;
- permissões;
- modelo;
- outras informações.

---

# 15. Permissões

O sistema deverá possuir um sistema robusto de permissões.

Cada entidade deverá possuir informações sobre quem pode:

- Ver;
- Mover;
- Editar;
- Excluir;
- Controlar;
- Alterar HP;
- Alterar atributos;
- Interagir.

Exemplo:

```text
Goblin
│
├── owner: GAME_MASTER
│
├── canMove: MASTER
├── canEdit: MASTER
├── canSee: MASTER
└── visibleTo:
      ├── Master
      └── Player 1
```

Enquanto:

```text
Kael
│
├── owner: PLAYER_1
│
├── canMove: PLAYER_1
├── canEdit: PLAYER_1
├── canSee: PLAYER_1
└── visibleTo:
      ├── Master
      └── Player 1
```

---

# 16. Níveis de controle

O sistema deverá inicialmente possuir três níveis de controle.

## Mestre

Controle absoluto.

Pode:

- Criar;
- Apagar;
- Mover;
- Editar;
- Esconder;
- Revelar;
- Alterar HP;
- Alterar atributos;
- Controlar personagens;
- Controlar inimigos;
- Editar mapa;
- Editar iluminação;
- Editar visão;
- Alterar permissões;
- Salvar a partida;
- Carregar partidas.

## Jogador

Controle limitado às próprias peças.

Pode:

- Criar personagem;
- Importar payload;
- Importar modelo;
- Mover personagem;
- Editar informações permitidas;
- Alterar HP, caso permitido;
- Adicionar peças próprias, caso permitido;
- Utilizar habilidades e ações.

Não deverá conseguir, por padrão:

- Alterar mapa;
- Alterar inimigos;
- Alterar iluminação global;
- Alterar Fog of War;
- Alterar personagens de outros jogadores;
- Salvar a partida.

## Espectador

Somente visualização.

Pode acompanhar a sessão sem possuir controle sobre as entidades.

---

# 17. Permissões configuráveis pelo Mestre

O Mestre poderá determinar individualmente o que cada jogador pode fazer.

Exemplo:

```text
PERSONAGEM: Kael

Permissões
─────────────────────────

Mover
☑ Jogador
☑ Mestre

Editar HP
☑ Jogador
☑ Mestre

Editar atributos
☐ Jogador
☑ Mestre

Excluir
☐ Jogador
☑ Mestre

Adicionar equipamentos
☑ Jogador
☑ Mestre

Alterar posição
☑ Jogador
☑ Mestre
```

Isso permitirá que campanhas com regras diferentes utilizem a mesma plataforma.

---

# 18. Mestre pode assumir controle de personagens

O Mestre deverá poder assumir temporariamente o controle de qualquer personagem.

Por exemplo:

```text
Kael

[ Assumir controle ]
```

Ou alterar:

```text
Controlador:
Player 1 ▼
```

para:

```text
Mestre
```

Isso será útil quando:

- Um jogador desconectar;
- Um personagem estiver sendo utilizado pelo Mestre;
- O Mestre precisar controlar um personagem;
- Um NPC passar a ser controlado por um jogador;
- Uma situação especial acontecer durante a campanha.

---

# 19. Editor de mapas

O mapa deverá ser totalmente editável pelo Mestre.

O sistema deverá começar suportando mapas 2D construídos sobre um plano utilizando Three.js.

Possibilidades:

- Grid quadrado;
- Grid hexagonal;
- Sem grid;
- Textura de chão;
- Terreno;
- Água;
- Floresta;
- Estradas;
- Paredes;
- Construções;
- Objetos;
- Decorações.

O Mestre poderá:

- Adicionar;
- Remover;
- Mover;
- Rotacionar;
- Redimensionar;
- Editar;
- Duplicar;
- Ocultar.

---

# 20. Objetos pré-fabricados

O sistema deverá possuir uma biblioteca de peças pré-fabricadas.

## Construções

- Casa;
- Torre;
- Castelo;
- Taverna;
- Cabana;
- Igreja;
- Masmorra;
- Ponte.

## Estruturas

- Parede;
- Porta;
- Janela;
- Escada;
- Pilar;
- Coluna;
- Cerca.

## Decoração

- Mesa;
- Cadeira;
- Baú;
- Barril;
- Fogareiro;
- Estante;
- Pedra;
- Árvore;
- Tocha.

O Mestre poderá simplesmente arrastar esses elementos para o mapa.

---

# 21. Propriedades dos objetos

Cada objeto poderá possuir propriedades próprias.

Exemplo:

```text
CASA
├── posição
├── rotação
├── escala
├── colisão
├── bloqueia_visão
├── bloqueia_luz
├── textura
└── iluminação
```

Uma parede, por exemplo, poderá:

```text
Colisão: SIM
Bloqueia visão: SIM
Bloqueia luz: SIM
```

Enquanto uma decoração poderá não possuir nenhuma dessas propriedades.

---

# 22. Camadas do mapa

O mapa deverá ser dividido conceitualmente em camadas:

```text
MAPA
│
├── 🌍 Terrain
├── 🧱 Structures
├── 🪑 Objects
├── 💡 Lights
├── 👤 Characters
├── 👹 Enemies
├── 🎯 Effects
└── 🌫️ Fog of War
```

O Mestre poderá controlar a visibilidade das camadas.

Exemplo:

```text
☑ Terrain
☑ Structures
☑ Objects
☑ Lights
☑ Characters
☑ Enemies
☐ Grid
```

---

# 23. Objetos interativos

O sistema deverá permitir que objetos tenham comportamentos.

Exemplo:

```text
🚪 Porta

Estado:
[ Fechada ]

Interação:
[ Abrir ]

Ao abrir:

☑ Permitir passagem
☑ Permitir visão
☑ Permitir luz
```

Quando a porta for aberta:

```text
███████ 🚪 ███████
        ↓
███████     ███████
```

O sistema deverá recalcular:

- Colisão;
- Linha de visão;
- Iluminação;
- Visibilidade.

---

# 24. Iluminação dinâmica

A iluminação será uma das funcionalidades principais da plataforma.

O sistema deverá permitir:

- Luzes pontuais;
- Luzes direcionais;
- Spotlights;
- Luz ambiente;
- Sombras;
- Luz de tochas;
- Fogueiras;
- Lanternas;
- Magias;
- Luz natural;
- Fontes de luz personalizadas.

Exemplo:

```text
🔥 Tocha

Raio:
10

Intensidade:
80%

Bloqueada por:
☑ Paredes
☑ Portas

Afeta:
☑ Jogadores
☑ Inimigos
```

---

# 25. Iluminação individual por jogador

A iluminação não deverá ser simplesmente uma iluminação global igual para todos.

Cada jogador poderá ter uma percepção diferente da cena.

O sistema deverá considerar:

```text
Player
 ↓
Vision Radius
 ↓
Line of Sight
 ↓
Obstacles
 ↓
Visible Area
```

Assim, dois jogadores em posições diferentes poderão enxergar áreas diferentes do mesmo mapa.

---

# 26. Sistema de visão

Cada personagem poderá possuir um valor de visão, que poderá vir diretamente do payload.

Exemplo:

```text
vision: 10
```

Outro personagem:

```text
vision: 20
```

Terá uma área de visão maior.

Outro:

```text
vision: 5
```

Terá uma área de visão menor.

O Mestre não deverá precisar configurar isso manualmente se essa informação já estiver presente no payload.

---

# 27. Linha de visão

Paredes e objetos poderão bloquear a visão.

Exemplo:

```text
👤 ──────────── █████████
                █
                █
                █
```

O jogador não poderá enxergar através da parede.

O sistema deverá calcular a linha de visão considerando:

- Posição do personagem;
- Alcance de visão;
- Paredes;
- Portas;
- Objetos que bloqueiam visão;
- Outros obstáculos configurados.

---

# 28. Fog of War

Além da linha de visão, haverá Fog of War.

Uma área poderá estar:

### Nunca explorada

```text
PRETO
```

### Já explorada

```text
ESCURO
```

### Atualmente visível

```text
NORMAL
```

Exemplo:

```text
████████████████
██████░░░░██████
████░░░░░░░░████
███░░ PLAYER ░███
████░░░░░░░░████
██████░░░░██████
████████████████
```

A área visível será calculada individualmente para cada jogador.

---

# 29. Segurança da visão

A plataforma não deverá simplesmente esconder visualmente uma entidade no Three.js.

O servidor deverá impedir que informações não autorizadas sejam enviadas ao jogador.

Por exemplo, um inimigo escondido não deverá ser enviado ao cliente apenas para depois ser ocultado visualmente.

O servidor deverá controlar quais informações cada jogador pode receber.

Conceito:

```text
GAME STATE
     │
 ┌───┴────┐
 │        │
Mestre  Jogador
 │        │
Tudo    Apenas o
        permitido
```

Isso evita que um jogador utilize o DevTools ou inspeção de rede para descobrir posições e entidades escondidas.

---

# 30. Sistema de vida

Cada personagem poderá possuir vida e outros dados relacionados.

Exemplo:

```text
🧙 Diego

❤️ 32 / 40
🛡️ 16

Classe:
Guerreiro

Status:
Normal
```

O Mestre poderá alterar o estado do personagem.

Dependendo das permissões, o jogador também poderá modificar determinados valores.

---

# 31. Status e condições

As entidades poderão possuir status.

Exemplo:

```text
Status:
- Normal
- Envenenado
- Atordoado
- Queimando
- Congelado
- Morto
```

O sistema deverá permitir que o payload forneça essas informações ou que o Mestre as altere.

---

# 32. Sistema de combate

O sistema de combate deverá inicialmente ser **agnóstico ao sistema de RPG**.

Não deverá existir uma obrigação de utilizar regras específicas.

A plataforma poderá trabalhar com ações genéricas.

Exemplo:

```text
Ação

Tipo:
[ Ataque ]

Alvo:
[ Goblin ]

Dano:
[ 1d8 + 3 ]

Resultado:
[ 7 ]

Dano final:
[ 10 ]
```

No futuro, sistemas específicos poderão ser adicionados.

---

# 33. Sistema de dados 3D

O sistema de dados 3D será uma funcionalidade fundamental da plataforma.

Não será simplesmente um gerador de números.

O dado deverá existir como um objeto físico dentro da cena.

O jogador ou Mestre poderá lançar dados 3D visualmente.

Dados iniciais:

```text
D4
D6
D8
D10
D12
D20
D100
```

---

# 34. Física dos dados

O dado deverá utilizar um physics engine integrado ao Three.js.

Fluxo:

```text
D20
 ↓
Three.js
 ↓
Physics Engine
 ↓
Impulso + rotação
 ↓
Colisão com mesa
 ↓
Dado para
 ↓
Detecção da face superior
 ↓
Resultado
```

O dado deverá poder:

- Cair;
- Quicar;
- Girar;
- Bater na mesa;
- Bater em outros dados;
- Bater em paredes/objetos;
- Parar naturalmente.

O Three.js cuidará de:

- Modelo;
- Textura;
- Câmera;
- Iluminação;
- Animação;
- Renderização.

O physics engine cuidará de:

- Gravidade;
- Massa;
- Colisão;
- Velocidade;
- Rotação;
- Impulso;
- Atrito;
- Quique.

---

# 35. Dados personalizados

O sistema deverá futuramente permitir dados personalizados.

Exemplo:

```text
🎲 Criar dado

Faces:
[ 24 ]

Formato:
[ Custom ]

Modelo:
[ Upload ]

Física:
Massa: 1
Restituição: 0.6
Atrito: 0.4
```

Isso permite que o sistema não fique limitado apenas aos dados tradicionais.

---

# 36. Rolagem de dados

O jogador poderá possuir uma bandeja de dados:

```text
DADOS

D20
D12
D10
D8
D6
D4

Modificador:
[ +5 ]

[ ROLAR ]
```

Uma rolagem:

```text
D20 → 17
+5
────
22
```

O resultado poderá aparecer para:

- Jogador;
- Mestre;
- Outros jogadores, dependendo das configurações.

---

# 37. Vários dados

O sistema deverá suportar expressões como:

```text
2d6 + 4
```

Nesse caso:

```text
🎲  🎲
 ↓   ↓
 4   6

4 + 6 + 4 = 14
```

Também deverá suportar:

```text
8d6
```

com oito dados sendo lançados simultaneamente.

---

# 38. Dados integrados às ações

O payload do personagem poderá definir ações que utilizam dados.

Por exemplo:

```text
1d20 + STR
```

O sistema poderá automaticamente criar:

```text
⚔️ Ataque

🎲 D20 + 4

[ ROLAR ]
```

O jogador lança o dado.

Resultado:

```text
D20 → 16
+4
────
20
```

Dessa forma, o Dice Engine poderá ser alimentado diretamente pelos dados existentes no payload.

---

# 39. Rolagem de iniciativa

O Mestre poderá realizar rolagens para múltiplos participantes.

Exemplo:

```text
MESTRE

🎲 Rolar iniciativa

[ ROLAR ]
```

Vários dados poderão aparecer simultaneamente:

```text
🎲 🎲 🎲 🎲 🎲
```

Cada participante recebe seu resultado.

---

# 40. Segurança do sistema de dados

O resultado da rolagem não deverá ser decidido pelo cliente.

Fluxo:

```text
PLAYER
   │
   │ "Rolar D20"
   ▼
SERVER
   │
   │ gera resultado
   ▼
  17
   │
   ├──────────► Player 1
   ├──────────► Player 2
   └──────────► Mestre
```

O cliente poderá receber algo como:

```json
{
  "dice": "d20",
  "result": 17,
  "rollId": "abc123"
}
```

O Three.js será responsável pela animação visual do dado.

O servidor será a autoridade sobre o resultado.

Isso impede que o jogador altere o resultado pelo DevTools.

---

# 41. Histórico de rolagens

As rolagens poderão ser registradas.

Exemplo:

```text
Dice History

#001
Diego
D20 + 5
Resultado: 18
21:32

#002
Mestre
2D6
Resultados: 4 + 6
Total: 10
21:34

#003
João
D20
Resultado: 3
21:36
```

Esse histórico poderá fazer parte do estado da sessão e, quando desejado, do save.

---

# 42. Multiplayer

A plataforma deverá funcionar em tempo real.

Arquitetura conceitual:

```text
                FRONTEND
                   │
        ┌──────────┴──────────┐
        │                     │
     Three.js              UI/React
        │                     │
        └──────────┬──────────┘
                   │
                WebSocket
                   │
                   ▼
                BACKEND
                   │
        ┌──────────┼──────────┐
        │          │          │
      Rooms     Players     Game State
        │          │          │
        └──────────┼──────────┘
                   │
                Database
```

---

# 43. Salas

O Mestre poderá criar uma campanha e uma sala.

Exemplo:

```text
Nova campanha

Nome:
"A Maldição da Floresta"

Sistema:
D&D 5e

[ Criar ]
```

A plataforma poderá gerar um código:

```text
Código da sala:

X7K92P
```

O jogador poderá entrar:

```text
Digite o código:

[ X7K92P ]

[ Entrar ]
```

Depois disso, todos estarão conectados à mesma sessão.

---

# 44. Atualização em tempo real

Se o Mestre mover uma parede:

```text
Mestre move parede
       ↓
Servidor recebe
       ↓
Atualiza estado
       ↓
WebSocket
       ↓
Todos os jogadores
       ↓
Three.js atualiza cena
```

O mesmo princípio deverá ser aplicado a:

- Movimentação;
- HP;
- Status;
- Inimigos;
- Objetos;
- Portas;
- Iluminação;
- Dados;
- Efeitos;
- Demais alterações da partida.

---

# 45. Servidor como fonte da verdade

O servidor deverá ser a autoridade sobre o estado do jogo.

Por exemplo:

```text
Player
 ↓
"quero ir para X=10 Y=5"
 ↓
SERVER
 ↓
verifica se pode
 ↓
atualiza posição
 ↓
envia para jogadores
```

Não deverá ser:

```text
Player
 ↓
Three.js
 ↓
"me movi"
```

O objetivo é evitar:

- Inconsistências;
- Exploits;
- Estados divergentes;
- Manipulação pelo cliente.

---

# 46. Arquitetura recomendada

Considerando a stack já conhecida do projeto, uma arquitetura adequada seria:

## Frontend

```text
React
+
TypeScript
+
Three.js
```

## Backend

```text
NestJS
+
WebSocket
+
TypeORM
```

## Banco

```text
MongoDB
```

## Cache / estado temporário

Futuramente:

```text
Redis
```

O projeto poderá utilizar um storage separado para os arquivos de modelos 3D.

---

# 47. Estado do jogo

O estado da partida deverá existir de forma independente da renderização do Three.js.

A regra arquitetural fundamental será:

> **O estado da partida não é o estado interno do Three.js.**

O Three.js deverá apenas receber o estado e renderizá-lo.

Conceitualmente:

```text
GAME STATE
    ↓
Three.js
    ↓
Renderização
```

Isso permitirá futuramente:

- Trocar a engine de renderização;
- Criar modo espectador;
- Criar outras interfaces;
- Criar versão mobile;
- Criar API;
- Reaproveitar os saves;
- Criar novas formas de visualização.

---

# 48. Sistema de salvamento

A plataforma deverá possuir um sistema de save da partida.

Somente o Mestre poderá realizar saves manuais.

O save deverá representar uma **fotografia completa da partida naquele momento**.

Não será simplesmente um save de HP ou posição.

O save deverá guardar o estado necessário para reconstruir a sessão.

---

# 49. Save como Snapshot

O conceito será:

```text
💾 Salvar partida
```

O sistema captura o estado atual inteiro:

```text
PARTIDA
│
├── Configuração da campanha
│
├── Mapa
│   ├── terreno
│   ├── paredes
│   ├── construções
│   ├── objetos
│   ├── portas
│   ├── iluminação
│   └── grid
│
├── Jogadores
│   ├── personagem
│   ├── HP
│   ├── posição
│   ├── rotação
│   ├── status
│   ├── modelo 3D
│   └── demais dados
│
├── Inimigos
│   ├── HP
│   ├── posição
│   ├── rotação
│   ├── status
│   └── modelo
│
├── NPCs
│
├── Fog of War
│
├── Iluminação
│
├── Objetos interativos
│
└── Estado da partida
```

O objetivo é que o save funcione como uma **fotografia completa da sessão**.

---

# 50. Saves independentes

Cada save deverá ser independente.

Exemplo:

```text
SAVE #01
23/08/2026 - 21:43
```

A partida continua:

```text
SAVE #02
23/08/2026 - 22:30
```

Depois:

```text
SAVE #03
23/08/2026 - 23:15
```

O SAVE #01 deverá permanecer exatamente como estava.

O Mestre poderá posteriormente carregar o SAVE #01 sem que ele seja alterado pelas mudanças posteriores.

---

# 51. Exemplo de mudança entre saves

No SAVE #01:

```text
🧙 HP: 100

👹 Goblin vivo

🧙 posição: X=10

Porta:
FECHADA
```

Depois da partida:

```text
🧙 HP: 63

👹 Goblin morto

🧙 posição: X=14

Porta:
ABERTA
```

O SAVE #02 armazenará o novo estado.

O SAVE #01 continuará contendo:

```text
HP: 100
Goblin vivo
X=10
Porta fechada
```

---

# 52. MongoDB

MongoDB será utilizado para armazenar as campanhas e snapshots.

Uma estrutura conceitual:

```text
campaigns
│
├── _id
├── name
├── masterId
├── players
└── createdAt
```

E:

```text
saves
│
├── _id
├── campaignId
├── name
├── createdAt
├── createdBy
└── snapshot
```

O `snapshot` poderá conter:

```text
snapshot
├── map
├── entities
├── lights
├── fogOfWar
├── settings
└── gameState
```

---

# 53. Exemplo de entidade salva

Um personagem poderá ser representado no snapshot de maneira semelhante a:

```json
{
  "id": "player-001",
  "type": "player",
  "ownerId": "user-123",

  "position": {
    "x": 12.4,
    "y": 0,
    "z": -8.7
  },

  "rotation": {
    "x": 0,
    "y": 1.57,
    "z": 0
  },

  "scale": {
    "x": 1,
    "y": 1,
    "z": 1
  },

  "hp": {
    "current": 63,
    "max": 100
  },

  "status": [],

  "model": {
    "fileId": "model-82736",
    "format": "glb"
  }
}
```

Isso representa o estado daquele personagem naquele exato momento.

---

# 54. Payload e Save

O save não deverá depender somente do personagem original.

Uma referência poderá ser mantida:

```json
{
  "characterId": "char-001",
  "payloadVersion": 3,

  "gameState": {
    "hp": 63,
    "position": {},
    "status": []
  }
}
```

A ideia é garantir que um save antigo continue representando o estado daquele momento, mesmo que o personagem original seja posteriormente alterado.

O save deverá ser tratado como uma **fotografia imutável daquele momento**.

---

# 55. Modelos 3D e armazenamento

O conteúdo binário do modelo 3D não deverá ser colocado diretamente dentro do documento MongoDB.

O ideal será utilizar armazenamento de arquivos separado.

Conceitualmente:

```text
MongoDB
   │
   └── referência do arquivo
             │
             ▼
        File Storage
```

Por exemplo:

```text
model:
{
    fileId: "model-82736",
    filename: "guerreiro.glb",
    format: "glb"
}
```

O arquivo poderá ser armazenado futuramente em serviços como:

- S3;
- Cloudflare R2;
- Azure Blob;
- Outro object storage.

---

# 56. Save deve armazenar o modelo utilizado

O save deverá saber exatamente qual modelo visual estava associado a cada personagem no momento do salvamento.

Exemplo:

```text
SAVE

Player Diego
├── HP: 63
├── Position: X/Y/Z
├── Rotation
├── Status
└── Model: guerreiro.glb

Player João
├── HP: 82
├── Position
├── Rotation
└── Model: mago.glb

Enemy Goblin
├── HP: 12
├── Position
└── Model: goblin.glb
```

Ao carregar:

```text
LOAD SAVE
    ↓
MongoDB
    ↓
Snapshot
    ↓
Reconstruir Scene
    ↓
Three.js
    ↓
PARTIDA EXATAMENTE COMO ESTAVA
```

---

# 57. Carregar partida

O Mestre poderá acessar seus saves:

```text
MINHAS CAMPANHAS

A Maldição da Floresta

[ CONTINUAR ]
```

E visualizar:

```text
Saves

┌─────────────────────────────────┐
│ Save 03                         │
│ Hoje - 22:14                    │
│ 4 jogadores / 7 inimigos       │
│                                 │
│ [CARREGAR]                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Save 02                         │
│ Hoje - 20:41                    │
│ 4 jogadores / 8 inimigos       │
│                                 │
│ [CARREGAR]                      │
└─────────────────────────────────┘
```

Ao carregar, o sistema deverá:

1. Recuperar o snapshot;
2. Validar os arquivos necessários;
3. Reconstruir as entidades;
4. Restaurar posições;
5. Restaurar rotações;
6. Restaurar escala;
7. Restaurar modelos;
8. Restaurar HP;
9. Restaurar status;
10. Restaurar iluminação;
11. Restaurar Fog of War;
12. Restaurar objetos;
13. Restaurar jogadores;
14. Restaurar demais informações da sessão;
15. Reabrir a sala multiplayer.

---

# 58. Auto Save

Além do save manual, poderá existir um sistema opcional de Auto Save.

O Mestre poderá configurar:

```text
Configuração da campanha

☑ Auto Save

Intervalo:
[ 5 minutos ▼ ]

Manter:
[ 10 saves ]
```

O sistema deverá diferenciar:

```text
💾 Save Manual
```

de:

```text
⚡ Auto Save
```

Mesmo com Auto Save ativado, o controle dos saves manuais continuará sendo exclusivo do Mestre.

O Auto Save será importante para evitar perda de progresso caso:

- O navegador seja fechado;
- A conexão caia;
- O computador apresente algum problema;
- A sessão seja encerrada inesperadamente.

---

# 59. Voltar no tempo

Como cada save será um snapshot independente, será possível futuramente permitir:

```text
SAVE 01
   ↓
SAVE 02
   ↓
SAVE 03
   ↓
SAVE 04
```

Se o Mestre perceber que uma decisão foi ruim:

> "Volta para o SAVE 03."

A plataforma poderá reconstruir exatamente o estado daquele momento.

---

# 60. Arquitetura conceitual completa

A arquitetura geral do projeto poderá ser representada da seguinte forma:

```text
                         RPG TABLETOP
                               │
              ┌────────────────┴────────────────┐
              │                                 │
          FRONTEND                           BACKEND
              │                                 │
      React + TypeScript                   NestJS + WebSocket
              │                                 │
          Three.js                         Game Engine
              │                                 │
       ┌──────┴──────┐                    Session State
       │             │                         │
   Scene Engine    UI                     MongoDB
       │                                      │
       ├── Camera                        ┌────┴────┐
       ├── Renderer                      │         │
       ├── Lighting                   Campaigns  Saves
       ├── Shadows                                  │
       ├── Fog                                      │
       ├── Entities                              Snapshots
       └── Dice                                     │
                                                     │
                                             ┌───────┼───────┐
                                             │       │       │
                                            Map   Entities  Game State
                                             │       │       │
                                          Lights  Players   HP
                                          Objects Enemies   Status
                                          Terrain NPCs      etc.
                                             │
                                             ▼
                                        File Storage
                                             │
                                      GLB / GLTF / OBJ
```

---

# 61. Engine de mapa

O sistema de mapa deverá funcionar como um módulo próprio:

```text
Map Engine
├── Grid
├── Terrain
├── Structures
├── Objects
├── Buildings
├── Doors
├── Collision
├── Lighting
├── Vision
└── Fog of War
```

---

# 62. Character Engine

O sistema de personagens deverá ser independente da renderização:

```text
Character Engine
├── Payload
├── Character Adapter
├── Players
├── NPCs
├── Enemies
├── HP
├── Status
├── Attributes
├── Vision
├── Movement
├── Permissions
└── Ownership
```

---

# 63. Dice Engine

O sistema de dados será outro módulo independente:

```text
Dice Engine
├── D4
├── D6
├── D8
├── D10
├── D12
├── D20
├── D100
├── Custom Dice
├── Physics
├── Roll Results
├── Modifiers
└── Roll History
```

---

# 64. Save Engine

O sistema de saves deverá trabalhar sobre o Game State:

```text
Game State
    ↓
Snapshot
    ↓
MongoDB
```

O Save Engine não deverá depender da estrutura interna da renderização.

---

# 65. Multiplayer Engine

O multiplayer será responsável por sincronizar:

```text
Players
Enemies
NPCs
Objects
Map
Doors
Lights
HP
Status
Positions
Dice
Effects
Game State
```

Utilizando WebSocket para comunicação em tempo real.

---

# 66. Estrutura geral do projeto

Uma estrutura conceitual possível:

```text
RPG TABLETOP
│
├── Authentication
│
├── Campaigns
│
├── Rooms
│
├── Map Editor
│   ├── Grid
│   ├── Terrain
│   ├── Objects
│   ├── Buildings
│   ├── Structures
│   └── Decoration
│
├── Scene Engine
│   ├── Three.js
│   ├── Camera
│   ├── Lighting
│   ├── Shadows
│   └── Rendering
│
├── Characters
│   ├── Players
│   ├── NPCs
│   ├── Enemies
│   └── Bosses
│
├── Payload System
│   ├── Parser
│   ├── Validation
│   └── Character Adapter
│
├── Model System
│   ├── GLB
│   ├── GLTF
│   ├── OBJ
│   └── Future Formats
│
├── Vision
│   ├── Line of Sight
│   ├── Fog of War
│   └── Player Vision
│
├── Combat
│
├── Dice
│   ├── 3D Dice
│   ├── Physics
│   ├── Roll System
│   └── Roll History
│
├── Permissions
│
├── Game State
│
├── Save System
│
└── Multiplayer
    └── WebSocket
```

---

# 67. MVP — primeira versão

Apesar de o projeto possuir muitas possibilidades, não será recomendado desenvolver tudo simultaneamente.

O primeiro MVP deverá ser pequeno.

## Fase 1 — Editor de mapa

Implementar:

```text
Three.js
   ↓
Plano
   ↓
Grid
   ↓
Adicionar parede
   ↓
Adicionar objeto
   ↓
Mover
   ↓
Rotacionar
   ↓
Excluir
```

---

# 68. Fase 2 — Tokens

Adicionar:

```text
👤 Player
👹 Enemy
```

Com:

- Posição;
- Tamanho;
- Nome;
- HP.

---

# 69. Fase 3 — Importação de personagens

Implementar:

```text
Payload
+
GLB/GLTF/OBJ
```

Depois:

```text
Payload
 ↓
Character Adapter
 ↓
Character
 ↓
Modelo
 ↓
Three.js
```

---

# 70. Fase 4 — Persistência

Criar backend e banco.

Entidades iniciais:

```text
Campaign
Map
Entity
Character
Save
```

MongoDB deverá armazenar o estado persistente da campanha e seus snapshots.

---

# 71. Fase 5 — Multiplayer

Adicionar WebSocket.

Fluxo:

```text
Mestre
   │
   ├── move parede
   │
   ▼
SERVER
   │
   ├──────────► Player 1
   │
   └──────────► Player 2
```

---

# 72. Fase 6 — Sistema de permissões

Implementar:

- Mestre;
- Jogador;
- Espectador;
- Owner;
- Controle de entidades;
- Controle de edição;
- Controle de movimentação;
- Controle de visibilidade.

---

# 73. Fase 7 — Visão

Implementar:

```text
Player
 ↓
Vision Radius
 ↓
Walls
 ↓
Line of Sight
 ↓
Fog of War
```

Cada jogador deverá possuir sua própria visão.

---

# 74. Fase 8 — Iluminação

Implementar:

```text
Tocha
Lanterna
Fogueira
Magia
Luz natural
```

com:

- Intensidade;
- Alcance;
- Cor;
- Sombras;
- Bloqueio por paredes;
- Bloqueio por portas;
- Influência na visão.

---

# 75. Fase 9 — Sistema de dados 3D

Implementar:

- D4;
- D6;
- D8;
- D10;
- D12;
- D20;
- D100;
- Física;
- Rolagem multiplayer;
- Modificadores;
- Histórico.

Depois integrar com o payload.

---

# 76. Fase 10 — Save completo

Implementar snapshot completo contendo:

```text
Mapa
Terreno
Estruturas
Objetos
Portas
Luzes
Fog of War
Jogadores
Inimigos
NPCs
Posições
Rotações
Escalas
HP
Status
Modelos
Dados relevantes dos personagens
Estado da partida
Histórico necessário
```

Depois implementar:

- Save manual;
- Load;
- Auto Save;
- Histórico de saves;
- Possibilidade de voltar para um save anterior.

---

# 77. Regra arquitetural fundamental

Uma das decisões mais importantes do projeto será:

> **O Three.js não é o jogo. O Three.js é a representação visual do jogo.**

O verdadeiro estado deverá estar no Game State.

```text
                    GAME STATE
                        │
          ┌─────────────┼─────────────┐
          │             │             │
       Entities        Map          Rules
          │             │             │
          └─────────────┼─────────────┘
                        │
                    Three.js
                        │
                    Visualização
```

Isso permite que:

- Saves sejam confiáveis;
- Multiplayer seja consistente;
- Segurança seja implementada;
- O estado seja reconstruído;
- O Three.js possa ser substituído;
- O projeto possa evoluir sem ficar preso à renderização.

---

# 78. Visão final do produto

O produto final deverá funcionar como uma **mesa virtual de RPG altamente configurável**, onde o Mestre possui controle completo sobre a campanha e os jogadores interagem com seus próprios personagens em tempo real.

O fluxo geral será:

```text
MESTRE CRIA CAMPANHA
        ↓
CRIA MAPA
        ↓
ADICIONA TERRENO
        ↓
ADICIONA CONSTRUÇÕES
        ↓
ADICIONA OBJETOS
        ↓
CONFIGURA ILUMINAÇÃO
        ↓
ADICIONA INIMIGOS
        ↓
JOGADORES ENTRAM NA SALA
        ↓
JOGADORES IMPORTAM PAYLOAD
        ↓
JOGADORES ANEXAM MODELOS 3D
        ↓
PERSONAGENS APARECEM NO MAPA
        ↓
PARTIDA COMEÇA
        ↓
MOVIMENTAÇÃO EM TEMPO REAL
        ↓
VISÃO INDIVIDUAL
        ↓
FOG OF WAR
        ↓
COMBATE
        ↓
DADOS 3D
        ↓
ALTERAÇÃO DE HP/STATUS
        ↓
INTERAÇÃO COM OBJETOS
        ↓
MESTRE CONTROLA A SESSÃO
        ↓
SAVE
        ↓
SNAPSHOT COMPLETO
        ↓
MONGODB
        ↓
CARREGAR FUTURAMENTE
        ↓
PARTIDA RECONSTRUÍDA
```

---

# 79. Conceito central

A plataforma deverá unir cinco grandes pilares:

```text
                 RPG TABLETOP
                      │
       ┌──────────────┼──────────────┐
       │              │              │
     MAPA          PERSONAGENS      DADOS
       │              │              │
       │              │              │
       └──────────────┼──────────────┘
                      │
              MULTIPLAYER
                      │
                      │
                    SAVE
```

Porém, todos esses sistemas deverão compartilhar um único conceito:

```text
                    GAME STATE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
       Map            Entities          Rules
        │                │                │
        │         ┌──────┼──────┐         │
        │         │      │      │         │
      Objects   Players Enemies NPCs     Dice
        │         │      │      │         │
        └─────────┴──────┼──────┴─────────┘
                         │
                     Save/Load
                         │
                      MongoDB
```

# 🎵 Sistema de Áudio e Música

A plataforma deverá possuir um sistema completo de áudio controlado pelo Mestre, permitindo criar uma ambientação sonora dinâmica durante a sessão.

O Mestre deverá possuir **controle total sobre os sons e músicas da partida**, enquanto os jogadores receberão o áudio de acordo com as configurações da sessão e daquilo que estiver acontecendo no mapa.

O sistema deverá suportar:

* Música ambiente;
* Música de combate;
* Música de exploração;
* Música de tensão;
* Música de boss;
* Sons ambientes;
* Sons de objetos;
* Sons de criaturas;
* Efeitos sonoros;
* Sons posicionais 3D;
* Sons de área;
* Sons individuais;
* Ambientes diferentes por região do mapa;
* Controle de volume;
* Fade in/out;
* Loop;
* Transições;
* Play/Pause;
* Controle de reprodução;
* Playlists;
* Biblioteca de áudio;
* Upload de arquivos;
* Áudio privado para jogadores;
* Áudio global da sessão.

---

# 1. Audio Engine

O sistema deverá possuir um módulo independente:

```text
Audio Engine
├── Music
├── Ambient Sounds
├── Sound Effects
├── Positional Audio
├── Playlists
├── Audio Zones
├── Volume Control
├── Fade System
├── Audio Library
└── Permissions
```

O Audio Engine deverá conversar diretamente com o Game State.

```text
GAME STATE
    │
    ├── Map
    ├── Entities
    ├── Lighting
    ├── Vision
    └── Audio
          │
          ▼
      Audio Engine
          │
          ▼
       Players
```

---

# 2. Controle total do Mestre

O Mestre deverá possuir uma interface de controle semelhante a uma mesa de som.

```text
┌─────────────────────────────────────┐
│          🎵 AUDIO MASTER            │
├─────────────────────────────────────┤
│                                     │
│ 🎵 Música                           │
│ [▶] [⏸] [⏹]                        │
│                                     │
│ "Dark Dungeon Theme"                │
│ 🔊 ███████████░░ 80%                │
│                                     │
│ 🎧 Ambiente                         │
│ "Cave Wind"                         │
│ 🔊 ███████░░░░░ 50%                 │
│                                     │
│ ⚔️ Combate                          │
│ "Battle Theme"                      │
│ 🔊 █████████░░ 70%                 │
│                                     │
│ 🔥 Efeitos                          │
│ 🔊 ████████████ 100%                │
│                                     │
└─────────────────────────────────────┘
```

O Mestre poderá controlar individualmente:

* Volume;
* Reprodução;
* Pausa;
* Parada;
* Loop;
* Música atual;
* Playlist;
* Fade;
* Transição;
* Sons ambientais;
* Efeitos.

---

# 3. Música da sessão

O Mestre poderá escolher uma música para toda a mesa.

Exemplo:

```text
🎵 Música atual

The Dark Forest
━━━━━━━━━━━━━━━━━━
02:34 / 05:21

[⏮] [▶] [⏭]

Volume:
████████░░ 80%

☑ Loop
```

Todos os jogadores ouvirão a mesma música sincronizada.

---

# 4. Sincronização multiplayer

A música não deverá ser iniciada independentemente em cada cliente.

O servidor deverá manter o estado:

```json
{
  "trackId": "dark-forest",
  "playing": true,
  "position": 154.32,
  "volume": 0.8
}
```

O servidor poderá informar:

```text
PLAY
TRACK: dark-forest
POSITION: 154.32
```

Os jogadores sincronizam a reprodução localmente.

Isso permite que:

```text
Mestre
  ↓
Play
  ↓
Servidor
  ↓
Todos os jogadores
```

tenham aproximadamente a mesma posição da música.

---

# 5. Biblioteca de áudio

O Mestre terá uma biblioteca:

```text
🎵 AUDIO LIBRARY

Music
├── Exploration
├── Combat
├── Boss
├── Town
├── Dungeon
├── Horror
└── Ambient

SFX
├── Weapons
├── Magic
├── Monsters
├── Doors
├── Environment
└── UI
```

O Mestre poderá fazer upload de seus próprios arquivos.

---

# 6. Upload de áudio

O Mestre poderá adicionar:

```text
[ + ADICIONAR ÁUDIO ]
```

E enviar arquivos como:

```text
.mp3
.ogg
.wav
```

O sistema deverá armazenar os arquivos em um storage apropriado, enquanto o MongoDB guarda os metadados.

```text
MongoDB
│
└── Audio Metadata
      │
      ├── id
      ├── name
      ├── type
      ├── duration
      └── fileId
              │
              ▼
         File Storage
```

---

# 7. Playlists

O Mestre poderá criar playlists.

Exemplo:

```text
🎵 Floresta Sombria

1. Dark Forest
2. Whispering Trees
3. Night Wind
4. Something Is Watching
5. Ancient Ruins
```

Configuração:

```text
☑ Shuffle
☑ Loop Playlist
☑ Crossfade
```

---

# 8. Crossfade

Quando o Mestre mudar de música, o sistema poderá realizar uma transição suave.

Por exemplo:

```text
Música A
███████████
       ↓ fade out

Música B
       ↓ fade in
    ███████████
```

Isso evita cortes bruscos durante a sessão.

---

# 9. Música por situação

O Mestre poderá definir músicas específicas para determinados momentos.

Exemplo:

```text
Exploração
→ Forest Exploration

Combate
→ Battle Theme

Boss
→ Dragon Boss

Vitória
→ Victory Theme

Derrota
→ Defeat Theme
```

---

# 10. Música por região do mapa

Essa parte pode deixar o sistema **muito interessante**.

O Mestre poderá criar regiões de áudio.

Exemplo:

```text
                 FLORESTA
        ┌───────────────────────┐
        │ 🎵 Forest Theme        │
        │                       │
        │       👤              │
        │                       │
        │───────────┐           │
        │           │           │
        │  MASMORRA │           │
        │  🎵 Cave  │           │
        └───────────┴───────────┘
```

Quando o jogador entrar na masmorra:

```text
Forest Theme
      ↓
    Fade Out
      ↓
    Cave Theme
      ↓
    Fade In
```

---

# 11. Áudio posicional 3D

Além de música, o sistema poderá utilizar áudio espacial.

Por exemplo:

```text
🔥 Fogueira
```

A fogueira emite um som.

O jogador próximo:

```text
👤
 ↓
🔊 🔥
```

ouve claramente.

Um jogador distante:

```text
👤 ---------------- 🔥
       🔉
```

ouve o som muito mais baixo.

E um jogador atrás de uma parede poderá ter o som reduzido.

---

# 12. Áudio individual por jogador

Isso combina diretamente com o sistema de visão.

Imagine:

```text
                 🔥
                 │
                 │
        █████████████
        █           █
        █    👤     █
        █           █
        █████████████
```

Um jogador poderá ouvir:

```text
🔥 Fogueira
Volume: 80%
```

Outro, distante:

```text
🔥 Fogueira
Volume: 20%
```

E um terceiro poderá não ouvir.

---

# 13. Sons ambientais

O Mestre poderá colocar fontes sonoras no mapa.

Exemplos:

```text
🌧️ Chuva
🌊 Rio
🌲 Vento
🔥 Fogueira
🐦 Pássaros
🦗 Grilos
💨 Vento forte
🏭 Máquinas
👻 Sussurros
```

Esses sons poderão ser posicionais.

---

# 14. Sons de objetos

Objetos também poderão possuir sons.

Por exemplo:

```text
🚪 Porta
```

Configuração:

```text
Ao abrir:
door_open.mp3

Ao fechar:
door_close.mp3
```

Ou:

```text
🧰 Baú

Ao abrir:
chest_open.mp3
```

---

# 15. Sons de entidades

Personagens e inimigos também poderão possuir sons.

Exemplo:

```text
🐉 Dragão

Idle:
dragon_breath.mp3

Ataque:
dragon_roar.mp3

Dano:
dragon_hurt.mp3

Morte:
dragon_death.mp3
```

O Mestre poderá disparar esses sons manualmente ou o sistema poderá dispará-los através de eventos.

---

# 16. Sistema de eventos de áudio

O Audio Engine deverá poder reagir aos eventos do Game State.

Exemplo:

```text
EVENTO
   ↓
DoorOpened
   ↓
Audio Engine
   ↓
door_open.mp3
```

Outro:

```text
EnemyAttack
   ↓
dragon_roar.mp3
```

Outro:

```text
PlayerEnteredZone
   ↓
Audio Zone
   ↓
Troca de música
```

---

# 17. Controle por jogador

O Mestre poderá definir se determinado áudio é:

### Global

Todos ouvem.

```text
🎵 Música da campanha
```

### Regional

Somente jogadores dentro de determinada região ouvem.

```text
🌊 Rio
```

### Individual

Somente um jogador recebe.

```text
👻 Sussurro destinado ao Player 1
```

Isso abre espaço para mecânicas muito legais.

Por exemplo:

> O Mestre manda um som de sussurro apenas para um jogador.

Os outros jogadores não sabem o que aconteceu.

---

# 18. Áudio secreto

O Mestre poderá selecionar:

```text
👤 Player 1
```

e tocar:

```text
🎵 whisper.mp3
```

Somente aquele jogador ouvirá.

Isso poderá ser usado para:

* Sussurros;
* Vozes;
* Alucinações;
* Informações secretas;
* Eventos;
* Terror;
* Comunicação privada;
* Narrativa.

---

# 19. Controle de volume por categoria

Cada jogador poderá possuir controles locais:

```text
ÁUDIO

🎵 Música
████████░░ 80%

🌲 Ambiente
██████░░░░ 60%

⚔️ Efeitos
██████████ 100%

🎙️ Vozes
██████████ 100%

🎲 Dados
███████░░░ 70%
```

O Mestre define o que será reproduzido.

O jogador controla apenas o **volume local**, não o conteúdo da sessão.

---

# 20. Mestre pode silenciar jogadores

Dependendo do sistema de voz que futuramente possa ser adicionado, o Mestre poderá controlar canais de comunicação.

Por exemplo:

```text
PLAYER 1
🎙️ Voice
🔊 80%

PLAYER 2
🎙️ Voice
🔇 Mutado
```

Isso pode ficar como uma funcionalidade futura.

---

# 21. Integração com o Save

O estado de áudio relevante também poderá ser salvo.

Por exemplo:

```json
{
  "audio": {
    "music": {
      "trackId": "dark-forest",
      "playing": true,
      "position": 154.3,
      "volume": 0.8
    },

    "ambient": [
      {
        "soundId": "wind-forest",
        "volume": 0.5,
        "position": {
          "x": 10,
          "y": 0,
          "z": -5
        }
      }
    ]
  }
}
```

Assim, ao carregar a partida:

```text
LOAD SAVE
    ↓
Game State
    ↓
Audio State
    ↓
Audio Engine
    ↓
Restaurar ambiente
```

---

# 22. Audio Engine dentro da arquitetura

A arquitetura geral passa a ficar:

```text
                         RPG TABLETOP
                               │
              ┌────────────────┼────────────────┐
              │                │                │
             MAP          CHARACTERS           DICE
              │                │                │
              └────────────────┼────────────────┘
                               │
                       ┌───────┴───────┐
                       │               │
                   MULTIPLAYER       AUDIO
                       │               │
                       │        ┌──────┼──────┐
                       │        │      │      │
                       │      Music  Ambient  SFX
                       │        │      │      │
                       │        └──────┼──────┘
                       │               │
                       └───────┬───────┘
                               │
                          GAME STATE
                               │
                               ▼
                            SAVE
                               │
                           MongoDB
```

---

# 23. Novo pilar do projeto

Com isso, o projeto passa a ter **seis grandes pilares**:

```text
                 RPG TABLETOP
                      │
       ┌──────────────┼──────────────┐
       │              │              │
      MAPA       PERSONAGENS       DADOS
       │              │              │
       └──────────────┼──────────────┘
                      │
                ILUMINAÇÃO
                      │
                MULTIPLAYER
                      │
                    ÁUDIO
                      │
                    SAVE
```

E eu faria questão de tratar **Áudio como parte do Game State**, porque isso permite que o Mestre controle a sessão inteira de forma centralizada.

No final, a ideia deixa de ser apenas:

> **"um tabuleiro 3D para RPG"**

e passa a ser algo mais próximo de:

> **"uma mesa virtual de RPG completa, onde mapa, personagens, visão, iluminação, física, dados, áudio e estado da campanha são sincronizados em tempo real e totalmente controláveis pelo Mestre."**

O resultado será uma plataforma em que o Mestre poderá **montar praticamente qualquer cenário**, importar personagens sem precisar cadastrá-los manualmente, adicionar inimigos e objetos, controlar permissões, definir o que cada jogador pode enxergar e fazer, utilizar iluminação dinâmica, realizar rolagens com dados 3D físicos e salvar a partida inteira como uma fotografia do estado atual.

A longo prazo, a mesma arquitetura permitirá evoluir de um **tabuleiro 2D com elementos 3D** para um **ambiente de RPG 3D completo**, mantendo o mesmo Game State, sistema multiplayer, personagens, permissões, saves e lógica de campanha.
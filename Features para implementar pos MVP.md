# Features para Implementar Depois de Codar Todas as Fases e Ter o Código Mais Completo

## 1. Objetivo deste documento

Este documento reúne funcionalidades avançadas que deverão ser consideradas **somente após a conclusão das fases principais de desenvolvimento da VTT** e após o sistema possuir uma base de código estável, funcional e devidamente testada.

Essas funcionalidades não fazem parte do núcleo obrigatório do MVP.

O objetivo é evitar que recursos avançados sejam implementados cedo demais e acabem:

* aumentando desnecessariamente a complexidade;
* atrasando o desenvolvimento;
* criando dependências difíceis de remover;
* dificultando os testes;
* gerando retrabalho;
* desviando o foco das funcionalidades essenciais.

A prioridade inicial deverá ser:

```text
Arquitetura
↓
Backend
↓
Frontend
↓
Three.js
↓
Multiplayer
↓
Game State
↓
Assets
↓
Iluminação
↓
Áudio básico
↓
Save / Load
↓
Teste Final
↓
MVP VALIDADO
```

Somente depois disso deverão ser avaliadas as funcionalidades deste documento.

---

# 2. Critério para iniciar esta etapa

As features deste documento somente deverão começar a ser implementadas quando:

```text
[ ] Todas as fases principais estiverem concluídas
[ ] Testes das fases estiverem aprovados
[ ] Teste final com 1 Mestre + 5 jogadores estiver aprovado
[ ] Save / Load estiver estável
[ ] Multiplayer estiver estável
[ ] Game State estiver estável
[ ] Sistema de assets estiver funcionando
[ ] Sistema de iluminação estiver funcionando
[ ] Sistema de áudio básico estiver funcionando
[ ] Código estiver organizado
[ ] Arquitetura estiver documentada
[ ] Não existirem bugs críticos conhecidos
```

A partir desse ponto, o projeto poderá entrar em uma etapa de **expansão e refinamento**.

---

# 3. Sistema de Mesa de Som do Mestre

## Descrição

Criar uma verdadeira **Mesa de Som do Mestre**, permitindo que o Mestre controle toda a experiência sonora da sessão diretamente pela interface da VTT.

A funcionalidade deverá ser muito mais completa do que simplesmente reproduzir arquivos MP3.

A ideia é criar uma espécie de:

> **Soundboard + Mixer + Sistema de Ambientação + Sistema de Eventos Sonoros**

---

# 4. Mixer de áudio

O Mestre poderá controlar diferentes canais de áudio.

Exemplo:

```text
MÚSICA
AMBIENTE
SFX
CRIATURAS
NATUREZA
COMBATE
VOZ
```

Cada canal deverá possuir controles independentes:

```text
Volume
Mute
Solo
Fade
Loop
Play
Pause
Stop
```

Exemplo:

```text
Música       ███████████████░ 75%
Ambiente     ██████████░░░░░ 50%
SFX          █████████████░░ 65%
Criaturas    ███████░░░░░░░░ 35%
```

---

# 5. Soundboard

Criar uma área com botões rápidos para efeitos sonoros.

Exemplo:

```text
[ ⚔️ Espada ]
[ 🚪 Porta ]
[ 💥 Explosão ]
[ 👹 Rugido ]
[ 🐺 Uivo ]
[ 🔔 Sino ]
[ 🪄 Magia ]
[ 💀 Morte ]
```

O Mestre poderá simplesmente clicar no efeito durante a sessão.

O som deverá ser enviado para os jogadores conforme as regras da partida.

---

# 6. Música contextual

Criar estados musicais para diferentes situações.

Exemplo:

```text
Exploração
Combate
Boss
Tensão
Cidade
Dungeon
Floresta
Vitória
Derrota
```

O Mestre poderá configurar:

```text
Exploração → Forest_01
Combate → Battle_01
Boss → Dragon_Boss
Vitória → Victory
```

Ao iniciar um combate:

```text
Música atual
      ↓
Fade Out
      ↓
Música de combate
      ↓
Fade In
```

---

# 7. Ambientes sonoros

Permitir que o Mestre mantenha vários sons ambientais simultaneamente.

Exemplo:

```text
🌲 Floresta
├── Pássaros
├── Vento
├── Insetos
└── Folhas

🌧️ Chuva
├── Chuva
├── Trovões
└── Vento

🏰 Castelo
├── Ambiente
├── Tochas
└── Eco
```

Cada camada poderá possuir:

* volume;
* loop;
* fade;
* distância;
* prioridade.

---

# 8. Perfis de áudio

Permitir que o Mestre salve configurações completas de áudio.

Exemplo:

## Floresta

```text
Música: 60%
Vento: 30%
Pássaros: 50%
Natureza: 40%
```

## Dungeon

```text
Música: 50%
Vento: 10%
Eco: 60%
Ambiente: 70%
```

## Combate

```text
Música: 80%
Ambiente: 20%
SFX: 90%
Criaturas: 80%
```

O Mestre poderá trocar o perfil com um clique.

---

# 9. Áudio 3D / Spatial Audio

Utilizar o sistema 3D para posicionar sons no espaço.

Exemplo:

```text
                👹
                 │
                 │
                 │
        P1       │       P2
```

Se o monstro emitir um rugido:

```text
P1 → volume alto
P2 → volume menor
```

O volume poderá variar conforme:

* distância;
* posição;
* direção;
* obstáculos;
* regras de áudio.

---

# 10. Sons vinculados a entidades

Uma entidade poderá possuir sons próprios.

Exemplo:

```text
Goblin
├── Idle
├── Attack
├── Hurt
├── Death
└── Roar
```

Quando o Mestre realizar:

```text
Goblin → Attack
```

o sistema poderá reproduzir automaticamente o som associado.

---

# 11. Zonas sonoras

Permitir que o Mestre desenhe regiões no mapa que possuam sons específicos.

Exemplo:

```text
┌───────────────────────────┐
│                           │
│     🌲 FLORESTA           │
│                           │
│    ~~~~~~~~~~~~~          │
│    🌊 RIO                 │
│    ~~~~~~~~~~~~~          │
│                           │
│                🏰         │
│                           │
└───────────────────────────┘
```

Ao entrar na região:

```text
Player
 ↓
Zona sonora
 ↓
Áudio ativado
```

Ao sair:

```text
Player
 ↓
Sai da zona
 ↓
Áudio reduzido/desativado
```

---

# 12. Áudio individual

Permitir que diferentes jogadores escutem sons diferentes.

Exemplo:

```text
P1 → ouve monstro
P2 → não ouve
P3 → ouve parcialmente
P4 → ouve normalmente
P5 → não ouve
```

Isso poderá ser integrado ao sistema de:

* iluminação;
* visão;
* Fog of War;
* distância;
* paredes;
* regiões.

---

# 13. Cenas sonoras

Criar sequências pré-programadas.

Exemplo:

## Entrada na Dungeon

```text
0s
Música atual começa a diminuir

2s
Vento

4s
Porta abrindo

6s
Som de ambiente

10s
Música da Dungeon
```

O Mestre poderá executar a sequência com:

```text
[ ▶ Entrada na Dungeon ]
```

---

# 14. Macros

Criar ações que executam vários eventos simultaneamente.

Exemplo:

## Boss Aparece

```text
Fade da música
↓
Som grave
↓
Iluminação muda
↓
Boss aparece
↓
Rugido
↓
Música de Boss
```

Botão:

```text
[ 👹 BOSS APARECE ]
```

---

# 15. Integração entre áudio e iluminação

Criar eventos combinados.

Exemplo:

```text
Trovão
 ↓
Flash de iluminação
 ↓
Som do trovão
 ↓
Fade
```

Ou:

```text
Boss aparece
 ↓
Luzes ficam vermelhas
 ↓
Som grave
 ↓
Música Boss
```

Isso poderá transformar determinadas cenas em eventos cinematográficos.

---

# 16. Sistema de cenas cinematográficas

Criar um sistema que permita ao Mestre criar sequências envolvendo:

```text
Câmera
Luz
Áudio
Personagens
Inimigos
Objetos
Partículas
Texto
Eventos
```

Exemplo:

```text
CENA: DRAGÃO

1. Câmera olha para a montanha
2. Música diminui
3. Vento aumenta
4. Dragão aparece
5. Rugido
6. Relâmpago
7. Câmera acompanha o dragão
8. Música de Boss inicia
```

---

# 17. Sistema de eventos avançado

Permitir que eventos do jogo acionem automaticamente outras funcionalidades.

Exemplo:

```text
Player entra em região
        ↓
Evento detectado
        ↓
Música muda
        ↓
Luz muda
        ↓
Inimigo aparece
        ↓
Som toca
```

Outro exemplo:

```text
Boss HP < 30%
        ↓
Música muda
        ↓
Iluminação muda
        ↓
Boss entra em segunda fase
```

---

# 18. Sistema de automação do Mestre

Permitir regras como:

```text
SE
Player entrar na sala

ENTÃO
Tocar música X
+ ativar luz Y
+ spawnar inimigo Z
```

Ou:

```text
SE
Boss HP < 50%

ENTÃO
Trocar música
+ aumentar intensidade das luzes
+ executar animação
```

Esse sistema poderá evoluir para um verdadeiro **Event/Trigger System**.

---

# 19. Sistema de voz

Funcionalidade futura para comunicação entre Mestre e jogadores.

Possibilidades:

```text
Mestre
   ↓
Todos os jogadores
```

ou:

```text
Mestre
   ↓
Somente Player 1
```

ou:

```text
Player 1
   ↓
Player 2
```

---

# 20. Proximity Voice

No futuro, o sistema poderá considerar a posição dos personagens.

Exemplo:

```text
P1 ─── P2 ───────────────── P3
```

P1 e P2:

```text
🔊 voz alta
```

P3:

```text
🔉 voz baixa
```

Isso poderá ser combinado com:

* distância;
* paredes;
* zonas;
* visão;
* ambientes.

---

# 21. Sistema avançado de iluminação

Depois da implementação inicial, poderão ser adicionados:

```text
Luzes dinâmicas
Sombras avançadas
Flickering
Tochas
Fogo
Relâmpagos
Luzes coloridas
Luzes vinculadas a objetos
Eventos de iluminação
```

Exemplo:

```text
Tocha
 ↓
Flickering
 ↓
Iluminação dinâmica
```

---

# 22. Sistema de clima

Adicionar eventos climáticos.

Exemplo:

```text
☀️ Sol
🌧️ Chuva
⛈️ Tempestade
❄️ Neve
🌫️ Neblina
💨 Vento
```

O clima poderá afetar:

* iluminação;
* partículas;
* áudio;
* visibilidade;
* atmosfera;
* gameplay.

---

# 23. Sistema de partículas

Adicionar partículas 3D.

Exemplos:

```text
Fogo
Fumaça
Chuva
Neve
Poeira
Faíscas
Magia
Sangue
Folhas
Cinzas
```

Esses efeitos poderão ser controlados pelo Mestre.

---

# 24. Sistema de animações avançado

Permitir que os modelos possuam animações.

Exemplo:

```text
Idle
Walk
Run
Attack
Hit
Death
Cast
Interact
```

O Mestre também poderá executar animações manualmente.

---

# 25. Sistema de biblioteca de assets

Criar uma biblioteca avançada para o Mestre.

Categorias:

```text
Personagens
Inimigos
NPCs
Construções
Casas
Paredes
Portas
Objetos
Vegetação
Decoração
Áudio
Música
Texturas
Mapas
```

Com:

```text
Pesquisa
Filtros
Tags
Favoritos
Preview 3D
Thumbnails
Histórico
```

---

# 26. Preview 3D dos assets

Antes de adicionar um modelo ao mapa, o Mestre poderá visualizá-lo em um pequeno viewer 3D.

Exemplo:

```text
┌───────────────────────┐
│                       │
│       👹              │
│      3D MODEL         │
│                       │
│    ↻ Rotacionar       │
│                       │
└───────────────────────┘
```

---

# 27. Sistema de favoritos

O Mestre poderá marcar assets como favoritos.

Exemplo:

```text
⭐ Meus favoritos

Goblin
Orc
Dragon
House
Wooden Door
Torch
Chest
```

Isso reduzirá o tempo necessário para procurar assets durante a sessão.

---

# 28. Templates de mapas

Permitir que o Mestre salve mapas como templates.

Exemplo:

```text
Template:
Dungeon Medieval

Inclui:
├── Paredes
├── Portas
├── Tochas
├── Iluminação
├── Sons
└── Decoração
```

O Mestre poderá reutilizar o template em outra campanha.

---

# 29. Templates de encontros

Permitir salvar encontros completos.

Exemplo:

```text
ENCONTRO: Emboscada Goblin

Inimigos:
├── 5 Goblins
├── 1 Goblin Archer
└── 1 Goblin Boss

Áudio:
Battle_01

Iluminação:
Dungeon

Trigger:
Player entra na região
```

---

# 30. Sistema de triggers visuais

Permitir que o Mestre crie regiões invisíveis no mapa.

Exemplo:

```text
┌───────────────────────┐
│                       │
│    Área de Trigger    │
│                       │
│          P            │
│                       │
└───────────────────────┘
```

Quando um jogador entrar:

```text
Trigger
 ↓
Evento
```

---

# 31. Sistema de scripting

No futuro poderá existir um sistema de scripting para Mestres avançados.

Exemplo conceitual:

```text
onPlayerEnter("dungeon_room") {
    playMusic("dungeon_boss");
    spawnEnemy("dragon");
    changeLight("red");
}
```

Esse sistema deverá ser implementado somente quando a arquitetura estiver suficientemente madura.

---

# 32. Sistema de ferramentas avançadas para o Mestre

Ferramentas futuras:

```text
Duplicar
Agrupar
Alinhar
Distribuir
Rotacionar
Escalar
Snap
Grid
Copy/Paste
Undo
Redo
Multi-select
```

Essas ferramentas melhorarão significativamente a construção dos mapas.

---

# 33. Histórico de alterações

Criar histórico de alterações da campanha.

Exemplo:

```text
14:32 — Mestre adicionou Goblin
14:34 — Mestre moveu Goblin
14:40 — Player 2 recebeu dano
14:42 — Porta aberta
14:50 — Música alterada
14:57 — Save realizado
```

Isso poderá ajudar na recuperação de erros.

---

# 34. Undo / Redo

Permitir que o Mestre reverta ações.

Exemplo:

```text
Adicionar objeto
     ↓
Mover objeto
     ↓
Excluir objeto
     ↓
UNDO
     ↓
Objeto restaurado
```

---

# 35. Sistema de snapshots

Além do Save normal, permitir snapshots manuais.

Exemplo:

```text
Antes do Boss
Depois do Boss
Final da Dungeon
Final da Sessão
```

O Mestre poderá retornar a um snapshot específico.

---

# 36. Replay da sessão

Funcionalidade experimental para registrar eventos da partida.

O sistema poderia armazenar:

```text
Movimentação
Combate
Eventos
Alterações
Áudio
Spawn
Interações
```

Posteriormente seria possível reproduzir a sequência.

---

# 37. Ferramentas de análise

Adicionar painel para o Mestre visualizar:

```text
FPS dos jogadores
Latência
Conexões
Uso de assets
Eventos
Erros
```

Isso será especialmente útil para diagnóstico.

---

# 38. Otimização automática de assets

Criar ferramentas para otimizar modelos antes de serem utilizados.

Possibilidades:

```text
Compressão
LOD
Redução de textura
Redução de polígonos
Conversão
Geração de thumbnail
```

Essa funcionalidade deverá ser implementada com muito cuidado para não destruir a qualidade dos modelos.

---

# 39. Cache avançado

Implementar cache de assets no cliente.

Fluxo:

```text
Player solicita modelo
        ↓
Está no cache?
     ↙     ↘
   SIM      NÃO
    ↓        ↓
Carregar   Bucket
             ↓
           Cache
```

Isso reduzirá:

* tempo de carregamento;
* tráfego;
* requisições;
* consumo do storage.

---

# 40. Pré-carregamento inteligente

O sistema poderá prever quais assets serão utilizados.

Exemplo:

```text
Player se aproxima da Dungeon
        ↓
Sistema percebe assets próximos
        ↓
Pré-carrega modelos
```

Quando o jogador entrar:

```text
Modelo
↓
já está no cache
↓
carregamento instantâneo
```

---

# 41. Sistema de acessibilidade

Adicionar:

```text
Escala de interface
Contraste
Tamanho de texto
Indicadores visuais
Controle de volume
Legendas
Feedback visual
```

---

# 42. Sistema de atalhos de teclado

Permitir que o Mestre controle rapidamente a sessão.

Exemplo:

```text
F1 → Mesa de Som
F2 → Inimigos
F3 → Players
F4 → Iluminação
F5 → Assets
F6 → Save
F7 → Música
```

Os atalhos deverão ser configuráveis.

---

# 43. Layout personalizável do Mestre

O Mestre poderá organizar sua interface.

Exemplo:

```text
┌──────────────┬─────────────────────────┐
│              │                         │
│ Soundboard   │                         │
│              │        MAPA             │
├──────────────┤                         │
│              │                         │
│ Players      │                         │
│              │                         │
└──────────────┴─────────────────────────┘
```

Painéis poderão ser:

* movidos;
* redimensionados;
* minimizados;
* fechados.

---

# 44. Presets de interface

O Mestre poderá salvar layouts.

Exemplo:

```text
Layout Combate
Layout Exploração
Layout Construção
Layout Boss
```

Cada layout poderá apresentar ferramentas diferentes.

---

# 45. Sistema de módulos/plugins

No futuro, a VTT poderá possuir arquitetura extensível.

Exemplo:

```text
Core VTT
│
├── Combat Plugin
├── Audio Plugin
├── Weather Plugin
├── Dice Plugin
├── Campaign Plugin
└── Custom Plugin
```

Isso permitiria adicionar funcionalidades sem modificar diretamente todo o núcleo.

---

# 46. Marketplace / biblioteca compartilhada

Possibilidade futura de permitir compartilhamento de:

```text
Mapas
Assets
Templates
Encontros
Músicas
Efeitos
Cenários
```

Entre usuários.

Essa funcionalidade somente deverá ser considerada depois que:

* sistema de usuários;
* permissões;
* armazenamento;
* segurança;
* copyright;
* monetização;

estiverem suficientemente maduros.

---

# 47. Sistema de campanhas compartilhadas

Possibilidade de permitir que o Mestre convide outros Mestres para uma campanha.

Exemplo:

```text
Campanha
│
├── Mestre principal
├── Mestre auxiliar
└── Co-Mestre
```

Com diferentes níveis de permissão.

---

# 48. Sistema de permissões avançadas

Criar níveis:

```text
Owner
Master
Co-Master
Moderator
Player
Spectator
```

Cada função possuirá permissões específicas.

---

# 49. Sistema de espectadores

Permitir que pessoas acompanhem uma sessão sem participar diretamente.

Exemplo:

```text
1 Mestre
5 Players
10 espectadores
```

Espectadores poderiam:

```text
Visualizar
Ouvir
Acompanhar
```

sem poder alterar a partida.

---

# 50. Integração com transmissão

Futuramente, criar um modo específico para stream.

Possibilidades:

```text
Modo espectador
Câmera especial
HUD personalizado
Ocultar informações privadas
Overlay
```

Isso permitiria transmitir sessões de RPG.

---

# 51. Sistema de câmera cinematográfica

Permitir câmeras controladas pelo Mestre.

Exemplo:

```text
Câmera livre
Câmera do Mestre
Câmera seguindo personagem
Câmera seguindo inimigo
Câmera cinematográfica
```

---

# 52. Sistema de narrativa

Criar ferramentas para o Mestre controlar elementos narrativos.

Exemplo:

```text
Texto
Diálogo
Imagem
Vídeo
Áudio
Evento
```

Uma cena poderia ser:

```text
NPC fala
↓
Texto aparece
↓
Câmera aproxima
↓
Música muda
↓
Iluminação muda
```

---

# 53. Sistema de diálogos

Permitir criar diálogos estruturados.

Exemplo:

```text
NPC:
"Vocês não deveriam ter vindo aqui."

[Continuar]

NPC:
"O que existe nesta floresta não é humano."
```

---

# 54. Sistema de NPCs avançado

NPCs poderão possuir:

```text
Nome
Modelo
HP
Atributos
Diálogos
Animações
Áudios
Comportamentos
Eventos
```

---

# 55. IA para NPCs e inimigos

Funcionalidade experimental para o futuro.

Possibilidades:

```text
Patrulha
Perseguição
Fuga
Combate
Investigação
Interação
```

Essa funcionalidade deverá ser implementada somente depois que o sistema tradicional de entidades estiver consolidado.

---

# 56. Sistema de dados 3D avançado

Expandir o sistema de dados para suportar:

```text
D4
D6
D8
D10
D12
D20
D100
```

Com:

* física;
* animações;
* sons;
* partículas;
* resultados;
* histórico.

O Mestre poderá controlar os dados e os jogadores poderão realizar rolagens.

---

# 57. Dados físicos sincronizados

Todos os jogadores deverão visualizar a mesma rolagem.

Exemplo:

```text
P1 rola D20
       ↓
Resultado: 18
       ↓
Todos visualizam
```

A física poderá ser executada de maneira controlada para garantir consistência.

---

# 58. Sistema de automação de dados

Permitir macros:

```text
Ataque
1d20 + 5
```

ou:

```text
Dano
2d6 + 3
```

Com integração ao sistema de personagens.

---

# 59. Sistema de logs da sessão

Registrar:

```text
Quem realizou
O que realizou
Quando realizou
Qual entidade foi afetada
Resultado
```

Exemplo:

```text
[20:31] P1 atacou Goblin
[20:31] Goblin recebeu 8 de dano
[20:32] Mestre moveu Goblin
[20:34] P2 abriu porta
[20:35] Música de combate iniciada
```

---

# 60. Sistema de recuperação de sessão

Se o servidor cair:

```text
Servidor
   ↓
Offline
```

Após retornar:

```text
Servidor
   ↓
Recupera último Game State válido
   ↓
Jogadores reconectam
```

Isso deverá ser desenvolvido somente quando o sistema de Save e Game State estiver extremamente estável.

---

# 61. Sistema de autosave

Permitir:

```text
Autosave a cada 5 minutos
```

ou:

```text
Autosave após eventos importantes
```

Exemplo:

```text
Boss derrotado
↓
Autosave
```

---

# 62. Sistema de backups

Criar cópias de segurança de campanhas.

Exemplo:

```text
Campaign Backup
├── 10:00
├── 11:00
├── 12:00
└── 13:00
```

---

# 63. Objetivo das funcionalidades pós-MVP

Todas as funcionalidades deste documento possuem o mesmo objetivo:

> **Transformar a VTT de uma plataforma funcional de RPG em uma ferramenta completa de direção de sessões de RPG online.**

A prioridade deverá permanecer:

```text
Estabilidade
↓
Performance
↓
Usabilidade
↓
Experiência do Mestre
↓
Experiência dos jogadores
↓
Recursos avançados
```

---

# 64. Regra principal

Nenhuma funcionalidade deste documento deverá ser implementada simplesmente porque é interessante.

Antes de iniciar uma nova feature, deverá ser avaliado:

```text
Essa funcionalidade:
│
├── melhora a experiência?
├── é realmente necessária?
├── possui impacto na arquitetura?
├── pode gerar retrabalho?
├── pode afetar performance?
├── pode afetar multiplayer?
├── pode afetar Save/Load?
└── pode ser implementada sem comprometer o núcleo?
```

Somente depois disso deverá ser aprovada.

---

# 65. Prioridade sugerida após o MVP

Após o teste final, a ordem sugerida será:

### Prioridade ALTA

```text
1. Mesa de Som do Mestre
2. Mixer
3. Soundboard
4. Ambientes
5. Áudio 3D
6. Zonas sonoras
7. Biblioteca de assets
8. Undo / Redo
9. Ferramentas avançadas do Mestre
10. Cache de assets
```

### Prioridade MÉDIA

```text
11. Cenas cinematográficas
12. Macros
13. Triggers
14. Automação
15. Clima
16. Partículas
17. Câmeras cinematográficas
18. Templates
19. Encontros
20. Sistema de diálogos
```

### Prioridade BAIXA / EXPERIMENTAL

```text
21. Voz
22. Proximity Voice
23. IA de NPCs
24. Scripting
25. Marketplace
26. Plugins
27. Streaming
28. Replay
29. Sistema social avançado
30. Recursos experimentais
```

---

# 66. Visão futura da plataforma

Após a implementação gradual dessas funcionalidades, a VTT poderá evoluir de:

```text
MAPA + PERSONAGENS
```

para:

```text
                    RPG VTT
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    VISUAL           ÁUDIO           GAMEPLAY
       │               │                │
    Three.js       Soundboard        Combate
    Mapas          Mixer             Dados
    Luz            Música            HP
    Clima          SFX               Status
    Partículas     Spatial Audio     NPCs
       │               │                │
       └───────────────┼────────────────┘
                       │
                 MESTRE CONTROL
                       │
             ┌─────────┴─────────┐
             │                   │
         AUTOMATION           EVENTS
             │                   │
             └─────────┬─────────┘
                       │
                   NARRATIVA
```

O objetivo final é permitir que o Mestre controle praticamente toda a experiência da sessão através de uma única plataforma.

---

# 67. Resultado esperado

Ao final dessa evolução, o Mestre deverá conseguir:

```text
Criar o mapa
↓
Adicionar construções
↓
Adicionar personagens
↓
Adicionar inimigos
↓
Controlar iluminação
↓
Controlar visão
↓
Controlar clima
↓
Controlar música
↓
Controlar sons
↓
Criar eventos
↓
Criar cenas
↓
Controlar combate
↓
Controlar NPCs
↓
Executar macros
↓
Executar cenas cinematográficas
↓
Salvar a partida
↓
Restaurar a partida
```

Enquanto os jogadores poderão:

```text
Entrar na campanha
↓
Receber personagem
↓
Visualizar o cenário
↓
Explorar
↓
Interagir
↓
Combater
↓
Ouvir ambiente
↓
Interagir com eventos
↓
Jogar em tempo real
```

---

# 68. Filosofia da evolução

A VTT deverá ser construída em camadas.

Primeiro:

> **Fazer funcionar.**

Depois:

> **Fazer funcionar de maneira estável.**

Depois:

> **Fazer funcionar de maneira eficiente.**

Depois:

> **Tornar agradável de usar.**

E somente então:

> **Adicionar recursos avançados.**

A implementação das funcionalidades deste documento deverá respeitar essa filosofia para evitar que o projeto se torne excessivamente complexo antes que seu núcleo esteja consolidado.

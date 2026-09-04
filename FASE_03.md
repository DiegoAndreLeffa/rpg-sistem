# Fase 03 — Engine 3D

## Objetivo
Construir a base visual do projeto em 3D, preparando a aplicação para representar o mapa do RPG, objetos, seleção e movimentação no ambiente.

## O que foi implementado

### 1. Scene 3D
Foi criada a cena principal em Three.js com:

- `Scene`
- `PerspectiveCamera`
- `WebGLRenderer`
- iluminação básica
- grid de referência
- chão do mapa

### 2. Camera e navegação
Foi configurado o controle de visualização com:

- OrbitControls
- zoom
- pan
- rotação da câmera

### 3. Objetos interativos
Foram criados objetos 3D representando elementos do cenário, com:

- mesh box
- seleção por clique
- destaque do objeto selecionado
- transformações visuais no objeto

### 4. TransformControls
Foi adicionada a ferramenta de manipulação do objeto selecionado com:

- eixos XYZ
- deslocamento do objeto
- trava da câmera enquanto transforma o objeto
- correção para que clique no eixo não desselecione o objeto

### 5. Responsividade do viewport
Foi implementado resize da cena para que o canvas acompanhe a área do container:

- ajuste do `aspect ratio`
- atualização do renderer
- suporte via `ResizeObserver`
- atualização em resize da janela

### 6. Layout do frontend
Foi montado o layout principal com:

- sidebar lateral de contexto
- painel de visualização 3D
- visual mínimo da interface do mestre

## Correções importantes aplicadas
- desativação do `OrbitControls` enquanto o objeto está sendo transformado
- prevenção de `detach()` quando clicado em um eixo do gizmo
- ajuste do Resize para o container real da viewport

## Validação
Foi validado no frontend:

- build do projeto
- typecheck
- lint
- render do canvas em runtime
- seleção do objeto
- movimentação do objeto por eixos
- funcionamento do resize

## Resultado da fase
A base da engine 3D ficou funcional e pronta para evoluir para a Fase 04, com gerenciamento do estado do jogo e entidades do mapa.

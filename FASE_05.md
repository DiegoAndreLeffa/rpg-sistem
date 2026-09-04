# Fase 05 — Editor de Mapa

## Objetivo
Permitir ao Mestre montar o cenário sem editar código, usando ferramentas visuais no frontend.

## O que foi implementado

### 1. Ferramentas de edição
Foram adicionadas ferramentas reais para:

- Move
- Rotate
- Scale
- Delete
- Duplicate

A seleção ficou por clique no mapa.

### 2. Editor visual de peças
O painel lateral ganhou botões para adicionar peças do mapa:

- Parede
- Casa
- Porta
- Janela
- Torre
- Escada
- Mesa
- Cadeira
- Baú
- Árvore
- Pedra

### 3. Inspector
Foi criado um inspector para editar a entidade selecionada com:

- name
- layer
- position
- rotation
- scale
- properties em JSON

### 4. Undo / Redo
O Game State passou a suportar histórico para desfazer e refazer alterações.

### 4.1 Grid Snap
Foi adicionado um toggle para alinhar as peças ao grid quando o Mestre quiser.

### 4.2 Gizmo menor
O gizmo de transformação foi reduzido para não ocupar demais a tela.

### 5. Layers
As entidades agora podem ser organizadas em layers de mapa como:

- terrain
- buildings
- objects
- players
- enemies
- npcs
- lighting
- audio
- gm

### 6. Medição
Foi implementado modo de medição por clique em duas entidades.

### 7. Rebuild e Reset
A cena pode ser reconstruída a partir do Game State ou resetada para o estado demo.

## Validação
Testado no navegador com:

- criação de peça
- seleção visual
- edição pelo inspector
- salvamento da seleção
- undo
- rebuild/reset

Também foi validado com:

- build do frontend
- typecheck
- lint

## Resultado da fase
A base do editor de mapa ficou funcional e permite ao Mestre montar, editar e revisar o cenário com interface própria.

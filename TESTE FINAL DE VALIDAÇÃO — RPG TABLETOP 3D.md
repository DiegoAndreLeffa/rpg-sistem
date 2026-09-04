# TESTE FINAL DE VALIDAÇÃO — RPG TABLETOP 3D

## 1. Objetivo

O objetivo deste teste é validar o funcionamento completo da plataforma de Virtual Tabletop 3D em uma situação próxima de uma sessão real de RPG.

A validação deverá simular uma partida completa contendo:

* 1 Mestre;
* 5 jogadores;
* 1 campanha;
* 1 mapa;
* múltiplos assets 3D;
* personagens personalizados;
* inimigos;
* iluminação;
* sistema de visão;
* áudio e música;
* movimentação simultânea;
* interação com objetos;
* combate;
* alteração de vida e status;
* comunicação em tempo real;
* Save;
* Load;
* restauração completa da partida.

O teste será considerado aprovado somente quando os 6 usuários conseguirem participar simultaneamente da sessão durante o período definido sem falhas críticas, perda de estado ou necessidade de reinicialização manual da aplicação.

---

# 2. Cenário do teste

A sessão será composta por:

```text
                CAMPANHA
                   │
              ┌────┴────┐
              │         │
            MESTRE    PLAYERS
                       │
          ┌────────────┼────────────┐
          │            │            │
         P1           P2           P3
          │            │            │
         P4           P5            │
```

Total:

```text
6 usuários simultâneos
1 Mestre
5 Jogadores
1 campanha
1 sessão multiplayer
```

Todos deverão estar conectados à mesma partida.

---

# 3. Objetivo mínimo de duração

A sessão utilizada para a validação deverá permanecer ativa por:

> **mínimo de 60 minutos**

Durante esse período, os usuários deverão realizar ações continuamente.

O objetivo é evitar que o sistema seja considerado aprovado apenas porque conseguiu manter seis conexões abertas sem atividade.

---

# 4. Infraestrutura utilizada

O teste deverá utilizar a arquitetura real de produção/MVP.

```text
                         VERCEL
                    ┌─────────────┐
                    │  Frontend   │
                    │ React       │
                    │ Three.js    │
                    └──────┬──────┘
                           │
                        HTTPS/WS
                           │
                    ┌──────▼──────┐
                    │   RAILWAY   │
                    │             │
                    │   NestJS    │
                    │   WebSocket │
                    │ AssetService│
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  MongoDB    │          │   Railway   │
       │    Cloud    │          │    Bucket   │
       │             │          │             │
       │ Game State  │          │ GLB         │
       │ Saves       │          │ GLTF        │
       │ Players     │          │ OBJ         │
       │ Metadata    │          │ Textures    │
       └─────────────┘          │ Audio       │
                                │ Music       │
                                │ SFX         │
                                └─────────────┘
```

O teste deverá ser realizado com os serviços reais utilizados pela aplicação.

---

# 5. Preparação da campanha

Antes do início do teste, o Mestre deverá preparar uma campanha contendo um cenário suficientemente complexo para representar uma sessão real.

## 5.1 Mapa

O mapa deverá possuir:

* plano/mapa 2D ou representação equivalente;
* áreas abertas;
* áreas fechadas;
* paredes;
* portas;
* construções;
* objetos;
* obstáculos;
* áreas com iluminação diferente;
* pelo menos uma área que não seja inicialmente visível pelos jogadores.

---

# 6. Assets 3D

A campanha deverá utilizar múltiplos modelos 3D.

Exemplo mínimo recomendado:

```text
5 personagens dos jogadores
10–30 inimigos
10–20 objetos
10–30 elementos de cenário
```

Os modelos deverão ser carregados a partir do:

> **Railway Storage Bucket**

Nenhum modelo deverá ser armazenado diretamente no MongoDB.

---

# 7. Personagens dos jogadores

Cada um dos cinco jogadores deverá possuir seu próprio personagem.

Cada personagem deverá:

* possuir um modelo 3D;
* possuir seu próprio ID;
* possuir proprietário;
* possuir posição;
* possuir rotação;
* possuir HP;
* possuir atributos;
* possuir status;
* possuir outras informações provenientes do payload.

O personagem deverá ser configurado automaticamente através do payload fornecido pelo sistema.

O jogador não deverá precisar reconstruir manualmente sua ficha dentro da plataforma.

---

# 8. Teste de carregamento dos personagens

Cada jogador deverá entrar na campanha e carregar seu personagem.

Resultado esperado:

```text
P1 → personagem carregado
P2 → personagem carregado
P3 → personagem carregado
P4 → personagem carregado
P5 → personagem carregado
```

Todos os jogadores deverão visualizar:

* seu próprio personagem;
* os personagens dos demais jogadores;
* os elementos do cenário que possuem permissão para visualizar.

### Critério de aprovação

```text
[ ] Todos os 5 personagens carregaram
[ ] Nenhum modelo ficou corrompido
[ ] Nenhum personagem apareceu duplicado
[ ] Todos possuem posição correta
[ ] Todos possuem rotação correta
[ ] Todos possuem asset correto
```

---

# 9. Teste de movimentação simultânea

Os cinco jogadores deverão movimentar seus personagens simultaneamente.

O Mestre também deverá movimentar pelo menos um inimigo durante o teste.

Exemplo:

```text
P1 → movimenta personagem
P2 → movimenta personagem
P3 → movimenta personagem
P4 → movimenta personagem
P5 → movimenta personagem

Mestre → movimenta inimigo
```

As movimentações deverão ser sincronizadas através do sistema multiplayer/WebSocket.

### Critério de aprovação

Todos os participantes deverão visualizar corretamente:

```text
posição
rotação
movimento
estado da entidade
```

Não poderá ocorrer:

```text
❌ teleportação incorreta
❌ duplicação
❌ desaparecimento
❌ estado divergente
❌ movimentação permanentemente atrasada
```

---

# 10. Teste de sincronização

Um jogador deverá executar uma ação enquanto os demais observam.

Exemplos:

```text
P1 movimenta personagem
```

Todos os outros deverão receber a alteração.

Depois:

```text
P2 movimenta personagem
```

Todos deverão receber a alteração.

O procedimento deverá ser repetido com:

* P1;
* P2;
* P3;
* P4;
* P5;
* Mestre.

### Critério de aprovação

O estado apresentado pelos seis clientes deverá permanecer consistente.

---

# 11. Teste de inimigos

O Mestre deverá adicionar e controlar inimigos.

Deverá ser possível:

* adicionar inimigo;
* remover inimigo;
* mover inimigo;
* rotacionar inimigo;
* alterar HP;
* alterar status;
* posicionar inimigo;
* iniciar combate;
* alterar estado do inimigo.

Os jogadores deverão receber essas alterações conforme as permissões da partida.

---

# 12. Teste de iluminação

O sistema deverá possuir iluminação controlada pelo Mestre.

O Mestre deverá:

* adicionar luz;
* remover luz;
* alterar intensidade;
* alterar posição;
* alterar alcance;
* alterar outros parâmetros suportados.

As alterações deverão ser sincronizadas.

---

# 13. Teste de iluminação individual

A iluminação deverá ser calculada de acordo com o ponto de vista de cada jogador.

Exemplo:

```text
              P1
               │
         área iluminada
               │
        ┌──────┴──────┐
        │             │
      parede         porta
        │             │
        └─────────────┘
              │
            P2
```

P1 e P2 poderão possuir condições visuais diferentes.

### Critério de aprovação

O sistema deverá impedir que um jogador receba informações visuais que não deveria possuir de acordo com as regras de visão da partida.

---

# 14. Teste de Fog of War / Visibilidade

O Mestre deverá criar uma área inicialmente desconhecida.

Os jogadores deverão explorar o mapa.

Durante a exploração:

```text
Área desconhecida
        ↓
Jogador aproxima
        ↓
Área revelada
        ↓
Jogador se afasta
        ↓
Sistema mantém o estado conforme as regras definidas
```

### Critério de aprovação

Cada jogador deverá receber somente as informações visuais correspondentes ao seu estado de visão.

---

# 15. Teste de áudio

O Mestre deverá controlar o sistema de áudio.

Deverá ser possível testar:

* música;
* pausa;
* reprodução;
* troca de música;
* volume;
* SFX;
* sons ambientais;
* interrupção de áudio.

Exemplo:

```text
Mestre
   │
   ▼
Inicia música
   │
   ▼
5 jogadores recebem
   │
   ├── P1
   ├── P2
   ├── P3
   ├── P4
   └── P5
```

### Critério de aprovação

Os jogadores deverão receber corretamente os comandos de áudio do Mestre.

---

# 16. Teste de combate

Deverá ser realizada uma pequena sequência de combate.

Exemplo:

```text
Mestre
   │
   ├── Goblin ataca P1
   │
   ▼
P1 perde HP
   │
   ▼
Game State atualizado
   │
   ├── P2 recebe alteração
   ├── P3 recebe alteração
   ├── P4 recebe alteração
   ├── P5 recebe alteração
   └── Mestre recebe alteração
```

O sistema deverá sincronizar:

* ataque;
* dano;
* HP;
* status;
* morte;
* movimentação;
* estado do combate.

---

# 17. Teste de vida/HP

O Mestre deverá alterar o HP de diferentes personagens.

Exemplo:

```text
P1
HP = 100
       ↓
recebe dano
       ↓
HP = 75
```

Todos os participantes autorizados deverão visualizar o novo estado.

O valor deverá permanecer consistente no backend.

---

# 18. Teste de edição pelo Mestre

O Mestre deverá modificar elementos durante a partida.

Deverá testar:

* mover objeto;
* remover objeto;
* adicionar objeto;
* alterar inimigo;
* alterar iluminação;
* alterar áudio;
* alterar elementos do mapa.

Todas as alterações deverão ser sincronizadas.

---

# 19. Teste de edição pelos jogadores

Os jogadores deverão testar as ações permitidas pelo sistema.

Cada jogador deverá tentar:

```text
Adicionar personagem/peça
Mover sua peça
Editar o que possui permissão
Interagir com objetos permitidos
```

Também deverão ser realizados testes de ações proibidas.

Exemplo:

```text
Player tenta alterar inimigo do Mestre
```

Resultado esperado:

```text
ACCESS DENIED
```

---

# 20. Teste de permissões

Deverão ser testadas pelo menos as seguintes situações:

```text
Mestre acessa seus assets
Player acessa seu personagem
Player acessa assets públicos
Player tenta acessar asset privado
Player tenta alterar entidade do Mestre
Player tenta excluir entidade que não possui
```

### Critério de aprovação

Nenhum jogador deverá conseguir executar uma ação não autorizada através da manipulação do frontend ou requisições diretas à API.

---

# 21. Teste de assets

Durante a partida deverão ser carregados assets do Railway Bucket.

Testar:

```text
GLB
GLTF
OBJ
Texturas
Áudio
Música
SFX
```

### Critério de aprovação

Todos os assets deverão:

* carregar corretamente;
* possuir referência correta no MongoDB;
* ser associados à campanha correta;
* respeitar as permissões;
* aparecer corretamente no Three.js.

---

# 22. Teste de Asset Service

O Asset Service deverá ser utilizado para:

```text
Upload
Download/URL
Delete
Metadata
Ownership
Permissions
```

O restante da aplicação não deverá depender diretamente da implementação interna do Railway Bucket.

---

# 23. Teste de Save

Após aproximadamente 30–60 minutos de partida, o Mestre deverá executar o Save.

O sistema deverá salvar o estado completo da partida.

O Save deverá incluir, no mínimo:

```text
Campanha
Mapa
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
Visibilidade
Iluminação
Áudio
Estado do combate
Assets utilizados
Outros dados necessários para reconstrução
```

---

# 24. Teste de Snapshot

O Save deverá funcionar como um snapshot da partida.

Exemplo:

```text
SAVE
  │
  ▼
Estado atual da partida
  │
  ├── Player 1 → posição X
  ├── Player 2 → posição Y
  ├── Player 3 → posição Z
  ├── Player 4 → posição A
  ├── Player 5 → posição B
  ├── Goblin → posição C
  ├── HP
  ├── Status
  ├── Objetos
  ├── Iluminação
  └── Assets
```

O estado deverá ser armazenado no MongoDB.

Os arquivos físicos permanecerão no Railway Bucket.

---

# 25. Teste de Load

Após realizar o Save:

1. todos os usuários deverão sair da partida;
2. a sessão deverá ser encerrada;
3. a campanha deverá ser carregada novamente;
4. os seis usuários deverão entrar novamente.

O sistema deverá reconstruir a partida.

---

# 26. Validação do Load

Após o carregamento, comparar o estado antes e depois do Save.

Deverão permanecer iguais:

```text
Posições
Rotações
HP
Status
Inimigos
Objetos
Mapa
Assets
Visibilidade
Iluminação
Estado da partida
```

### Critério de aprovação

A partida carregada deverá ser equivalente ao momento em que foi salva.

---

# 27. Teste de desconexão

Durante a sessão:

```text
Player 1
   ↓
desconecta
```

Os demais jogadores deverão continuar na partida.

Depois:

```text
Player 1
   ↓
reconecta
```

O sistema deverá restaurar o estado correto do jogador.

O teste deverá ser repetido com pelo menos:

* P1;
* P3;
* P5.

---

# 28. Teste de reconexão

Após a reconexão, o jogador deverá recuperar:

```text
Personagem
Posição
Rotação
HP
Status
Asset
Visibilidade
Estado da partida
```

O jogador não deverá criar uma segunda instância do personagem.

---

# 29. Teste de carga simultânea

Durante o teste final, todos os participantes deverão executar ações simultaneamente.

Exemplo:

```text
Mestre
├── movimenta inimigo
├── altera iluminação
└── controla música

P1
└── movimenta personagem

P2
└── ataca inimigo

P3
└── interage com objeto

P4
└── movimenta personagem

P5
└── explora área
```

Essas ações deverão ocorrer ao mesmo tempo.

---

# 30. Critérios de performance

Durante o teste deverão ser observados:

```text
CPU do Railway
RAM do Railway
Tempo de resposta da API
Latência do WebSocket
Quantidade de conexões
Quantidade de mensagens
Tempo de carregamento dos assets
FPS dos clientes
Uso de memória do navegador
```

O objetivo não é estabelecer números definitivos nesta primeira validação, mas identificar gargalos que comprometam a experiência.

---

# 31. Critérios de estabilidade

Durante os 60 minutos:

```text
[ ] Nenhum crash da API
[ ] Nenhuma queda crítica do WebSocket
[ ] Nenhuma perda de Game State
[ ] Nenhuma corrupção de Save
[ ] Nenhuma duplicação de entidade
[ ] Nenhuma entidade desaparecida sem motivo
[ ] Nenhuma alteração de posição perdida
[ ] Nenhuma falha crítica de carregamento de asset
```

---

# 32. Critérios de experiência

Ao final do teste, os usuários deverão conseguir jogar uma pequena aventura sem precisar interagir com ferramentas de desenvolvimento.

O Mestre deverá conseguir:

```text
Criar/abrir campanha
Carregar mapa
Controlar cenário
Controlar inimigos
Controlar iluminação
Controlar áudio
Gerenciar jogadores
Salvar partida
```

Os jogadores deverão conseguir:

```text
Entrar na campanha
Carregar personagem
Movimentar personagem
Visualizar o cenário
Interagir
Combater
Receber dano
Utilizar seu modelo 3D
Ouvir áudio
Reconectar
```

---

# 33. Checklist geral

## Infraestrutura

```text
[ ] Frontend funcionando na Vercel
[ ] NestJS funcionando no Railway
[ ] WebSocket funcionando
[ ] MongoDB funcionando
[ ] Railway Bucket funcionando
```

## Multiplayer

```text
[ ] 1 Mestre conectado
[ ] 5 jogadores conectados
[ ] 6 usuários simultâneos
[ ] Sincronização funcionando
[ ] Movimentação funcionando
[ ] Reconexão funcionando
```

## 3D

```text
[ ] Modelos carregando
[ ] Personagens carregando
[ ] Inimigos carregando
[ ] Objetos carregando
[ ] Texturas funcionando
[ ] Cenário funcionando
```

## Gameplay

```text
[ ] HP
[ ] Status
[ ] Combate
[ ] Inimigos
[ ] Interações
[ ] Movimentação
```

## Visão

```text
[ ] Iluminação
[ ] Iluminação individual
[ ] Fog of War
[ ] Visibilidade
```

## Áudio

```text
[ ] Música
[ ] SFX
[ ] Ambiente
[ ] Controle do Mestre
```

## Assets

```text
[ ] Upload
[ ] Download
[ ] Permissões
[ ] Ownership
[ ] Metadata
[ ] GLB
[ ] GLTF
[ ] OBJ
[ ] Áudio
```

## Save

```text
[ ] Save pelo Mestre
[ ] Snapshot completo
[ ] Posições preservadas
[ ] HP preservado
[ ] Status preservado
[ ] Assets preservados
[ ] Iluminação preservada
[ ] Estado do mapa preservado
```

## Load

```text
[ ] Campanha carregada
[ ] Assets recuperados
[ ] Personagens restaurados
[ ] Inimigos restaurados
[ ] Posições restauradas
[ ] HP restaurado
[ ] Status restaurado
[ ] Estado visual restaurado
```

---

# 34. Critérios de reprovação automática

O teste será considerado **REPROVADO** caso ocorra qualquer uma das seguintes situações:

```text
❌ Perda definitiva do Game State
❌ Save corrompido
❌ Impossibilidade de carregar o Save
❌ Jogadores recebendo estados permanentemente diferentes
❌ Jogador conseguindo acessar conteúdo proibido
❌ Personagem duplicado
❌ Personagem desaparecendo sem justificativa
❌ Falha generalizada de sincronização
❌ API incapaz de manter os 6 usuários conectados
❌ Necessidade de reiniciar manualmente o servidor durante a sessão
```

Falhas menores de interface ou performance poderão gerar **APROVAÇÃO COM PENDÊNCIAS**, desde que não comprometam a sessão.

---

# 35. Classificação final

O resultado poderá ser:

### 🟢 APROVADO

Todos os requisitos críticos foram atendidos.

A VTT está funcional para uma sessão com:

> **1 Mestre + 5 jogadores simultâneos.**

### 🟡 APROVADO COM PENDÊNCIAS

A sessão funciona, porém existem problemas não críticos que deverão ser corrigidos posteriormente.

### 🔴 REPROVADO

Existe pelo menos uma falha crítica que impede uma sessão completa.

---

# 36. Meta final do MVP

A meta deste teste não é provar que a plataforma suporta centenas ou milhares de usuários.

A meta é provar que a arquitetura é capaz de suportar de maneira confiável uma **mesa virtual de RPG completa**.

O requisito oficial será:

> **1 Mestre + 5 jogadores, totalizando 6 usuários simultâneos, participando de uma sessão de RPG de pelo menos 60 minutos, com cenário 3D, personagens personalizados, inimigos, iluminação individual, visão, áudio, movimentação, combate, sincronização multiplayer e Save/Load funcionando corretamente.**

Se esse cenário funcionar de maneira estável, a primeira versão da arquitetura da VTT será considerada **validada**.

---

# 37. Próxima etapa após a aprovação

Depois da aprovação do teste final, o projeto poderá entrar em uma etapa de:

```text
MVP VALIDADO
     ↓
Otimização
     ↓
Correção de problemas encontrados
     ↓
Testes com mais usuários
     ↓
Escalabilidade
     ↓
Beta fechado
     ↓
Beta público
     ↓
Produção
```

O teste de seis usuários será, portanto, o **marco de validação funcional do MVP**.

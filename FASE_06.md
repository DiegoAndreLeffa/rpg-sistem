# Fase 06 — Assets e Modelos 3D com Cloudinary

## Objetivo
Permitir upload, listagem, associação e remoção de assets/modelos 3D usando armazenamento externo, mantendo a cena sincronizada com o Game State.

## O que foi implementado

### 1. Armazenamento com Cloudinary
O backend passou a enviar os arquivos para o Cloudinary e persistir no banco:

- name
- provider
- publicId
- format
- mimeType
- size
- sourceUrl
- entityIds

O MongoDB mantém apenas referência e metadados do asset (não o arquivo binário).

### 2. API de assets
Foram mantidas as rotas para:

- upload
- listagem
- consulta por id
- remoção

Na remoção, o asset também é excluído do Cloudinary.

O upload passou a suportar envio composto:

- `model` (GLB/GLTF/OBJ)
- `texture` (PNG/JPG/JPEG/WEBP, opcional)
- `mtl` (obrigatório quando o modelo é OBJ)

### 3. Configuração por ambiente
O backend passou a aceitar:

- `CLOUDINARY_URL`
- `CLOUDINARY_FOLDER`

Também foi adicionado suporte a `CORS_ORIGIN` para facilitar o frontend local.

### 3.1 Limite de tamanho para modelos 3D

Foi definido limite de **15 MB** para uploads de GLB/GLTF/OBJ.

Quando o arquivo excede esse limite, o backend responde com:

`Modelo muito grande. O limite atual para este tipo de asset é 15 MB.`

Para upload de OBJ sem MTL, o backend responde:

`Modelos OBJ exigem o arquivo .mtl correspondente.`

### 4. Frontend
O frontend passou a:

- carregar a lista de assets do backend
- fazer upload via API
- exibir provider, formato, tamanho e URL
- permitir associar asset à entidade selecionada
- permitir remover asset

### 5. Cena 3D
A cena foi ajustada para:

- selecionar objetos corretamente mesmo com `Group`/assets carregados
- suportar objetos renderizados a partir de assets
- manter o fluxo de transform controls e inspector estável

## Validação
Testado com:

- build do backend
- build do frontend
- endpoint `/assets` respondendo com CORS
- seleção de objetos na cena funcionando no navegador

## Resultado da fase
A fase 06 ficou concluída com pipeline de assets pronto para usar Cloudinary como armazenamento dos modelos 3D.

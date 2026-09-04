import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDownLeftRight, faBoxOpen, faCopy, faDiceD20, faExpand, faGear, faLocationCrosshairs, faMagnifyingGlass, faRotate, faRulerCombined, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SceneCanvas } from './components/SceneCanvas';
import type { GameAsset, GameEntity, GameState } from './game/GameStateManager';

const PROJECT_NAME = 'RPG Tabletop';
const MASTER_ROLE = 'MASTER';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001';
const DEMO_CAMPAIGN_ID = 'campaign-demo';

function authHeaders(): HeadersInit {
  try {
    const token = (JSON.parse(window.localStorage.getItem('rpg-auth-session') ?? '{}') as { accessToken?: string }).accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

type EditorTool = 'move' | 'rotate' | 'scale' | 'measure';
type MapPreset =
  | 'wall'
  | 'house'
  | 'door'
  | 'window'
  | 'tower'
  | 'stairs'
  | 'table'
  | 'chair'
  | 'chest'
  | 'tree'
  | 'stone';

type SelectedEntitySnapshot = {
  id: string;
  kind: GameEntity['kind'];
  name: string;
  layer: GameEntity['layer'];
  assetId?: string | null;
  character?: GameEntity['character'];
  position: GameEntity['position'];
  rotation: GameEntity['rotation'];
  scale: GameEntity['scale'];
  properties: Record<string, unknown>;
};

type EditorStateDetail = {
  action: string;
  state: GameState;
  selectedEntity: SelectedEntitySnapshot | null;
  tool: EditorTool;
  measurement: { firstId: string; secondId?: string; distance?: number } | null;
  canUndo: boolean;
  canRedo: boolean;
  gridSnapEnabled: boolean;
};

type AssetSnapshot = GameAsset;

type UploadBundle = {
  model?: File;
  texture?: File;
  mtl?: File;
};

type CharacterKind = 'PLAYER' | 'ENEMY' | 'NPC';

type CharacterPayload = {
  name: string;
  ownerUserId: string;
  kind: CharacterKind;
  level: number;
  maxHp: number;
  currentHp?: number;
  visibility?: 'public' | 'owner' | 'gm';
  archetype?: string;
  metadata?: Record<string, unknown>;
  status?: string[];
};

type CharacterMutationResponse = {
  character?: GameEntity;
  asset?: GameAsset;
  state: GameState;
};

type InspectorDraft = {
  name: string;
  layer: string;
  position: { x: string; y: string; z: string };
  rotation: { x: string; y: string; z: string };
  scale: { x: string; y: string; z: string };
  properties: string;
};

const initialDraft = (): InspectorDraft => ({
  name: '',
  layer: 'objects',
  position: { x: '0', y: '0', z: '0' },
  rotation: { x: '0', y: '0', z: '0' },
  scale: { x: '1', y: '1', z: '1' },
  properties: '{}'
});

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createCharacterPayloadTemplate(): CharacterPayload {
  return {
    name: 'Novo Personagem',
    ownerUserId: 'player-demo',
    kind: 'PLAYER',
    level: 1,
    maxHp: 20,
    currentHp: 20,
    visibility: 'owner',
    archetype: 'Guerreiro',
    metadata: {
      race: 'Humano',
      class: 'Fighter'
    },
    status: []
  };
}

export function App(): ReactElement {
  const [lastAction, setLastAction] = useState('Aguardando ações de teste.');
  const [entityCount, setEntityCount] = useState(0);
  const [snapshot, setSnapshot] = useState('Clique em um botão para gerar o estado.');
  const [currentState, setCurrentState] = useState<EditorStateDetail['state'] | null>(null);
  const [tool, setTool] = useState<EditorTool>('move');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [gridSnapEnabled, setGridSnapEnabled] = useState(false);
  const [measurement, setMeasurement] = useState<string>('Sem medição.');
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntitySnapshot | null>(null);
  const [assets, setAssets] = useState<AssetSnapshot[]>([]);
  const [draft, setDraft] = useState<InspectorDraft>(initialDraft);
  const [draftError, setDraftError] = useState('');
  const [assetUploadError, setAssetUploadError] = useState('');
  const [assetUploadMessage, setAssetUploadMessage] = useState('');
  const [terrainTextureUrl, setTerrainTextureUrl] = useState('');
  const [statePersistenceMessage, setStatePersistenceMessage] = useState('');
  const [statePersistenceError, setStatePersistenceError] = useState('');
  const [characterPayloadText, setCharacterPayloadText] = useState(
    JSON.stringify(createCharacterPayloadTemplate(), null, 2)
  );
  const [characterModelAssetId, setCharacterModelAssetId] = useState('');
  const [characterHpValue, setCharacterHpValue] = useState('');
  const [characterStatusValue, setCharacterStatusValue] = useState('');
  const [characterMessage, setCharacterMessage] = useState('');
  const [characterError, setCharacterError] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const syncAssetsFromBackend = async () => {
      const response = await fetch(`${API_BASE_URL}/assets?campaignId=${DEMO_CAMPAIGN_ID}`, { headers: authHeaders() });

      if (!response.ok) {
        throw new Error('Failed to load assets from backend.');
      }

      const backendAssets = (await response.json()) as AssetSnapshot[];
      dispatchCommand({ type: 'rpg-editor-sync-assets', assets: backendAssets });
    };

    void syncAssetsFromBackend().catch((error) => {
      console.error('Unable to load assets from backend.', error);
    });

    const handleStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<EditorStateDetail>;
      const nextState = customEvent.detail?.state;

      if (!nextState) {
        return;
      }

      setLastAction(customEvent.detail.action);
      setCurrentState(nextState);
      setEntityCount(nextState.entities.length);
      setSnapshot(JSON.stringify(nextState, null, 2));
      setTool(customEvent.detail.tool);
      setCanUndo(customEvent.detail.canUndo);
      setCanRedo(customEvent.detail.canRedo);
      setGridSnapEnabled(customEvent.detail.gridSnapEnabled);
      setAssets(customEvent.detail.state.assets);
      setSelectedEntity(customEvent.detail.selectedEntity);
      setTerrainTextureUrl(customEvent.detail.state.map.terrainTextureUrl ?? '');

      if (customEvent.detail.measurement?.distance !== undefined) {
        setMeasurement(`Distância: ${customEvent.detail.measurement.distance.toFixed(2)}m`);
      } else if (customEvent.detail.measurement?.firstId) {
        setMeasurement('Selecione o segundo ponto para medir.');
      } else {
        setMeasurement('Sem medição.');
      }
    };

    window.addEventListener('rpg-state-changed', handleStateChange);

    return () => {
      window.removeEventListener('rpg-state-changed', handleStateChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName;

      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        dispatchCommand({ type: 'rpg-editor-undo' });
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        dispatchCommand({ type: 'rpg-editor-redo' });
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        dispatchCommand({ type: 'rpg-editor-duplicate-selected' });
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        dispatchCommand({ type: 'rpg-editor-delete-selected' });
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'w':
          dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'move' });
          break;
        case 'e':
          dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'rotate' });
          break;
        case 'r':
          dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'scale' });
          break;
        case 'm':
          dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'measure' });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!selectedEntity) {
      setDraft(initialDraft());
      return;
    }

    setDraft({
      name: selectedEntity.name,
      layer: selectedEntity.layer,
      position: {
        x: String(selectedEntity.position.x),
        y: String(selectedEntity.position.y),
        z: String(selectedEntity.position.z)
      },
      rotation: {
        x: String(selectedEntity.rotation.x),
        y: String(selectedEntity.rotation.y),
        z: String(selectedEntity.rotation.z)
      },
      scale: {
        x: String(selectedEntity.scale.x),
        y: String(selectedEntity.scale.y),
        z: String(selectedEntity.scale.z)
      },
      properties: JSON.stringify(selectedEntity.properties, null, 2)
    });
  }, [selectedEntity]);

  useEffect(() => {
    if (!selectedEntity?.character) {
      setCharacterHpValue('');
      setCharacterStatusValue('');
      return;
    }

    setCharacterHpValue(String(selectedEntity.character.hp.current));
  }, [selectedEntity]);

  const dispatchCommand = (detail: Record<string, unknown>) => {
    window.dispatchEvent(new CustomEvent('rpg-editor-command', { detail }));
  };

  const toolButtons = useMemo(
    () => [
      { key: 'move', label: 'Move' },
      { key: 'rotate', label: 'Rotate' },
      { key: 'scale', label: 'Scale' },
      { key: 'measure', label: 'Measure' }
    ],
    []
  );

  const presetButtons: Array<{ key: MapPreset; label: string }> = [
    { key: 'wall', label: 'Parede' },
    { key: 'house', label: 'Casa' },
    { key: 'door', label: 'Porta' },
    { key: 'window', label: 'Janela' },
    { key: 'tower', label: 'Torre' },
    { key: 'stairs', label: 'Escada' },
    { key: 'table', label: 'Mesa' },
    { key: 'chair', label: 'Cadeira' },
    { key: 'chest', label: 'Baú' },
    { key: 'tree', label: 'Árvore' },
    { key: 'stone', label: 'Pedra' }
  ];

  const characterAssets = useMemo(
    () => assets.filter((asset) => asset.format === 'GLB' || asset.format === 'GLTF' || asset.format === 'OBJ'),
    [assets]
  );

  const selectedCharacterEntity = useMemo(() => {
    if (!selectedEntity) {
      return null;
    }

    if (!selectedEntity.character) {
      return null;
    }

    if (selectedEntity.kind !== 'PLAYER' && selectedEntity.kind !== 'ENEMY' && selectedEntity.kind !== 'NPC') {
      return null;
    }

    return selectedEntity;
  }, [selectedEntity]);

  const saveInspector = () => {
    if (!selectedEntity) {
      return;
    }

    let properties: Record<string, unknown> = {};

    try {
      const parsed = JSON.parse(draft.properties);
      properties = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      setDraftError('');
    } catch {
      setDraftError('Properties precisa ser um JSON válido.');
      return;
    }

    dispatchCommand({
      type: 'rpg-editor-update-selected',
      patch: {
        name: draft.name,
        layer: draft.layer as GameEntity['layer'],
        position: {
          x: parseNumber(draft.position.x, selectedEntity.position.x),
          y: parseNumber(draft.position.y, selectedEntity.position.y),
          z: parseNumber(draft.position.z, selectedEntity.position.z)
        },
        rotation: {
          x: parseNumber(draft.rotation.x, selectedEntity.rotation.x),
          y: parseNumber(draft.rotation.y, selectedEntity.rotation.y),
          z: parseNumber(draft.rotation.z, selectedEntity.rotation.z)
        },
        scale: {
          x: parseNumber(draft.scale.x, selectedEntity.scale.x),
          y: parseNumber(draft.scale.y, selectedEntity.scale.y),
          z: parseNumber(draft.scale.z, selectedEntity.scale.z)
        },
        properties
      }
    });
  };

  const buildUploadBundle = (files: FileList): UploadBundle => {
    const bundle: UploadBundle = {};

    for (const file of Array.from(files)) {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (!extension) {
        continue;
      }

      if (extension === 'glb' || extension === 'gltf' || extension === 'obj') {
        bundle.model = file;
      } else if (extension === 'mtl') {
        bundle.mtl = file;
      } else if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'webp') {
        bundle.texture = file;
      }
    }

    return bundle;
  };

  const handleAssetUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setAssetUploadError('');
    setAssetUploadMessage('');
    const bundle = buildUploadBundle(files);
    const extension = bundle.model?.name.split('.').pop()?.toLowerCase();

    if (!bundle.model && !bundle.mtl && !bundle.texture) {
      setAssetUploadError('Nenhum arquivo compatível detectado. Use .glb/.gltf/.obj, .mtl e textura .png/.jpg/.jpeg/.webp.');
      event.target.value = '';
      return;
    }

    if (!bundle.model) {
      setAssetUploadError('Selecione um arquivo de modelo (.glb, .gltf ou .obj).');
      event.target.value = '';
      return;
    }

    if (extension === 'obj' && !bundle.mtl) {
      setAssetUploadError('Para arquivos .obj, o arquivo .mtl é obrigatório.');
      event.target.value = '';
      return;
    }

    const upload = async () => {
      setAssetUploadMessage('Enviando asset para o backend...');
      const modelFile = bundle.model;
      if (!modelFile) {
        throw new Error('Selecione um arquivo de modelo (.glb, .gltf ou .obj).');
      }
      const formData = new FormData();
      formData.append('campaignId', DEMO_CAMPAIGN_ID);
      formData.append('uploadedByUserId', 'master-demo');
      formData.append('model', modelFile);

      if (bundle.texture) {
        formData.append('texture', bundle.texture);
      }

      if (bundle.mtl) {
        formData.append('mtl', bundle.mtl);
      }

      const response = await fetch(`${API_BASE_URL}/assets/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? 'Asset upload failed.');
      }

      const createdAsset = (await response.json()) as AssetSnapshot;
      const { id, entityIds, createdAt, updatedAt, ...asset } = createdAsset;
      dispatchCommand({ type: 'rpg-editor-upload-asset', asset });

      const refreshResponse = await fetch(`${API_BASE_URL}/assets?campaignId=${DEMO_CAMPAIGN_ID}`, { headers: authHeaders() });
      if (!refreshResponse.ok) {
        throw new Error('Asset enviado, mas falhou ao sincronizar a lista de assets.');
      }
      const backendAssets = (await refreshResponse.json()) as AssetSnapshot[];
      dispatchCommand({ type: 'rpg-editor-sync-assets', assets: backendAssets });
      setAssetUploadMessage('Asset enviado com sucesso. Agora selecione uma entidade e use "Assign to selection".');
    };

    void upload().catch((error) => {
      console.error('Failed to upload asset to Cloudinary.', error);
      setAssetUploadError(error instanceof Error ? error.message : 'Falha ao enviar asset.');
      setAssetUploadMessage('');
    });

    event.target.value = '';
  };

  const handleAssignAsset = (assetId: string) => {
    if (!selectedEntity) {
      return;
    }

    dispatchCommand({ type: 'rpg-editor-assign-asset', entityId: selectedEntity.id, assetId });
  };

  const handleDeleteAsset = async (assetId: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!response.ok) {
      throw new Error('Asset deletion failed.');
    }

    dispatchCommand({ type: 'rpg-editor-delete-asset', assetId });
  };

  const applyTerrainTexture = (nextUrl: string | null) => {
    dispatchCommand({ type: 'rpg-editor-set-terrain-texture', textureUrl: nextUrl });
  };

  const saveCampaignState = async () => {
    setStatePersistenceError('');
    setStatePersistenceMessage('');

    const stateBody = currentState;

    if (!stateBody) {
      setStatePersistenceError('Estado atual inválido para salvar.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ state: stateBody })
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao salvar estado da campanha.');
    }

    setStatePersistenceMessage('Estado da campanha salvo no backend.');
  };

  const loadCampaignState = async () => {
    setStatePersistenceError('');
    setStatePersistenceMessage('');

    const response = await fetch(`${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/state`, { headers: authHeaders() });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao carregar estado da campanha.');
    }

    const state = await response.json();
    window.dispatchEvent(new CustomEvent('rpg-scene-rebuild', { detail: { state } }));
    setStatePersistenceMessage('Estado da campanha carregado do backend.');
  };

  const applyServerState = (state: EditorStateDetail['state'], message: string) => {
    window.dispatchEvent(new CustomEvent('rpg-scene-rebuild', { detail: { state } }));
    setCharacterMessage(message);
    setCharacterError('');
  };

  const createCharacterFromPayload = async () => {
    setCharacterError('');
    setCharacterMessage('');

    if (!characterModelAssetId) {
      setCharacterError('Selecione o asset 3D para o personagem.');
      return;
    }

    let payload: CharacterPayload;
    try {
      payload = JSON.parse(characterPayloadText) as CharacterPayload;
    } catch {
      setCharacterError('Payload de personagem inválido. Revise o JSON.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({
        assetId: characterModelAssetId,
        payload
      })
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao criar personagem por payload.');
    }

    const data = (await response.json()) as CharacterMutationResponse;
    applyServerState(data.state, 'Personagem criado automaticamente via payload.');
  };

  const createCharacterFromPayloadAndFiles = async (files: FileList) => {
    setCharacterError('');
    setCharacterMessage('');

    let payload: CharacterPayload;
    try {
      payload = JSON.parse(characterPayloadText) as CharacterPayload;
    } catch {
      setCharacterError('Payload de personagem inválido. Revise o JSON.');
      return;
    }

    const bundle = buildUploadBundle(files);
    const extension = bundle.model?.name.split('.').pop()?.toLowerCase();

    if (!bundle.model) {
      setCharacterError('Selecione um arquivo de modelo (.glb, .gltf ou .obj).');
      return;
    }

    if (extension === 'obj' && !bundle.mtl) {
      setCharacterError('Para arquivos .obj, o arquivo .mtl é obrigatório.');
      return;
    }

    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    formData.append('uploadedByUserId', payload.ownerUserId);
    formData.append('model', bundle.model);

    if (bundle.texture) {
      formData.append('texture', bundle.texture);
    }

    if (bundle.mtl) {
      formData.append('mtl', bundle.mtl);
    }

    const response = await fetch(`${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/characters/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao criar personagem com payload + upload.');
    }

    const data = (await response.json()) as CharacterMutationResponse;
    applyServerState(data.state, 'Personagem criado em uma etapa (payload + modelo).');
    if (data.asset) {
      setCharacterModelAssetId(data.asset.id);
    }
  };

  const updateSelectedCharacterModel = async () => {
    if (!selectedCharacterEntity) {
      setCharacterError('Selecione um personagem para trocar o modelo.');
      return;
    }

    if (!characterModelAssetId) {
      setCharacterError('Selecione o asset 3D para troca de modelo.');
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/characters/${selectedCharacterEntity.id}/model`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          assetId: characterModelAssetId
        })
      }
    );

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao trocar modelo do personagem.');
    }

    const data = (await response.json()) as CharacterMutationResponse;
    applyServerState(data.state, 'Modelo do personagem atualizado sem perder dados da ficha.');
  };

  const updateSelectedCharacterHp = async () => {
    if (!selectedCharacterEntity || !selectedCharacterEntity.character) {
      setCharacterError('Selecione um personagem para alterar HP.');
      return;
    }

    const nextHp = Number(characterHpValue);
    if (!Number.isFinite(nextHp) || nextHp < 0) {
      setCharacterError('HP deve ser um número maior ou igual a 0.');
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/characters/${selectedCharacterEntity.id}/hp`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          currentHp: nextHp
        })
      }
    );

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao atualizar HP do personagem.');
    }

    const data = (await response.json()) as CharacterMutationResponse;
    applyServerState(data.state, 'HP do personagem atualizado.');
  };

  const applySelectedCharacterStatus = async () => {
    if (!selectedCharacterEntity) {
      setCharacterError('Selecione um personagem para aplicar status.');
      return;
    }

    const status = characterStatusValue.trim();
    if (!status) {
      setCharacterError('Informe um status válido.');
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/characters/${selectedCharacterEntity.id}/status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          status
        })
      }
    );

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? 'Falha ao aplicar status no personagem.');
    }

    const data = (await response.json()) as CharacterMutationResponse;
    setCharacterStatusValue('');
    applyServerState(data.state, 'Status aplicado ao personagem.');
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar game-iconbar ${isPanelOpen ? 'expanded' : ''}`}>
        <nav className="icon-rail" aria-label="Ferramentas do mestre">
          <button type="button" className={tool === 'move' ? 'active' : ''} title="Mover (W)" aria-label="Mover" onClick={() => dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'move' })}><FontAwesomeIcon icon={faArrowsUpDownLeftRight} /></button>
          <button type="button" className={tool === 'rotate' ? 'active' : ''} title="Rotacionar (E)" aria-label="Rotacionar" onClick={() => dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'rotate' })}><FontAwesomeIcon icon={faRotate} /></button>
          <button type="button" className={tool === 'scale' ? 'active' : ''} title="Escalar (R)" aria-label="Escalar" onClick={() => dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'scale' })}><FontAwesomeIcon icon={faExpand} /></button>
          <button type="button" className={tool === 'measure' ? 'active' : ''} title="Medir (M)" aria-label="Medir" onClick={() => dispatchCommand({ type: 'rpg-editor-set-tool', tool: 'measure' })}><FontAwesomeIcon icon={faRulerCombined} /></button>
          <span className="rail-divider" />
          <button type="button" title="Adicionar objeto" aria-label="Adicionar objeto" onClick={() => dispatchCommand({ type: 'rpg-editor-add-entity', preset: 'table' })}><FontAwesomeIcon icon={faBoxOpen} /></button>
          <button type="button" title="Duplicar seleção" aria-label="Duplicar seleção" onClick={() => dispatchCommand({ type: 'rpg-editor-duplicate-selected' })}><FontAwesomeIcon icon={faCopy} /></button>
          <button type="button" title="Excluir seleção" aria-label="Excluir seleção" onClick={() => dispatchCommand({ type: 'rpg-editor-delete-selected' })}><FontAwesomeIcon icon={faTrash} /></button>
          <span className="rail-divider" />
          <button type="button" title="Centralizar seleção" aria-label="Centralizar seleção"><FontAwesomeIcon icon={faLocationCrosshairs} /></button>
          <button type="button" title="Dados" aria-label="Dados"><FontAwesomeIcon icon={faDiceD20} /></button>
          <button type="button" title="Opções avançadas" aria-label="Opções avançadas" className="rail-settings" onClick={() => setIsPanelOpen((open) => !open)}><FontAwesomeIcon icon={isPanelOpen ? faMagnifyingGlass : faGear} /></button>
        </nav>
        <p className="eyebrow">Fase 07</p>
        <h1>{PROJECT_NAME}</h1>
        <p className="lead">Editor com pipeline de personagens por payload + modelo 3D.</p>
        <ul>
          <li>Role base: {MASTER_ROLE}</li>
          <li>Ferramentas: move, rotate, scale, delete, duplicate</li>
          <li>Personagem automático: payload + modelo</li>
          <li>Troca de modelo mantendo ficha, HP e status</li>
        </ul>

        <p className="debug-hint">
          Clique para selecionar. W Move, E Rotate, R Scale, M Measure. Delete remove, Ctrl+D duplica, Ctrl+Z/Y undo/redo.
        </p>

        <section className="debug-panel">
          <h2>Ferramentas</h2>
          <p className="debug-text">Atalho padrão: W = Move</p>
          <div className="tool-grid">
            {toolButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                className={`action-button ${tool === button.key ? 'active' : ''}`}
                onClick={() => dispatchCommand({ type: 'rpg-editor-set-tool', tool: button.key as EditorTool })}
              >
                {button.label}
              </button>
            ))}
          </div>
          <div className="action-row">
            <button type="button" className="action-button" onClick={() => dispatchCommand({ type: 'rpg-editor-delete-selected' })}>
              Delete
            </button>
            <button type="button" className="action-button" onClick={() => dispatchCommand({ type: 'rpg-editor-duplicate-selected' })}>
              Duplicate
            </button>
            <button type="button" className="action-button" disabled={!canUndo} onClick={() => dispatchCommand({ type: 'rpg-editor-undo' })}>
              Undo
            </button>
            <button type="button" className="action-button" disabled={!canRedo} onClick={() => dispatchCommand({ type: 'rpg-editor-redo' })}>
              Redo
            </button>
            <button
              type="button"
              className={`action-button ${gridSnapEnabled ? 'active' : ''}`}
              onClick={() =>
                dispatchCommand({
                  type: 'rpg-editor-set-grid-snap',
                  enabled: !gridSnapEnabled
                })
              }
            >
              Grid Snap {gridSnapEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </section>

        <section className="debug-panel">
          <h2>Adicionar peças</h2>
          <label className="field">
            <span>Upload modelo + textura (+ MTL para OBJ)</span>
            <input type="file" accept=".glb,.gltf,.obj,.png,.jpg,.jpeg,.webp,.mtl" multiple onChange={handleAssetUpload} />
          </label>
          {assetUploadMessage ? <p className="debug-text">{assetUploadMessage}</p> : null}
          {assetUploadError ? <p className="error-text">{assetUploadError}</p> : null}
          <div className="tool-grid map-grid">
            {presetButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                className="action-button"
                onClick={() => dispatchCommand({ type: 'rpg-editor-add-entity', preset: button.key })}
              >
                {button.label}
              </button>
            ))}
          </div>
          <div className="action-row">
            <button type="button" className="action-button" onClick={() => dispatchCommand({ type: 'rpg-editor-rebuild' })}>
              Rebuild
            </button>
            <button type="button" className="action-button" onClick={() => dispatchCommand({ type: 'rpg-editor-reset' })}>
              Reset
            </button>
          </div>
        </section>

        <section className="debug-panel">
          <h2>Assets</h2>
          {assets.length === 0 ? <p className="debug-hint">Nenhum asset carregado ainda.</p> : null}
          <div className="asset-list">
            {assets.map((asset) => (
              <article key={asset.id} className="asset-card">
                <strong>{asset.name}</strong>
                <span>{asset.provider}</span>
                <span>{asset.format}</span>
                <span>{(asset.size / 1024).toFixed(1)} KB</span>
                <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
                  Open on Cloudinary
                </a>
                {asset.textureSourceUrl ? (
                  <a href={asset.textureSourceUrl} target="_blank" rel="noreferrer">
                    Texture
                  </a>
                ) : null}
                {asset.mtlSourceUrl ? (
                  <a href={asset.mtlSourceUrl} target="_blank" rel="noreferrer">
                    MTL
                  </a>
                ) : null}
                <div className="action-row">
                  <button type="button" className="action-button" onClick={() => handleAssignAsset(asset.id)}>
                    Assign to selection
                  </button>
                  {asset.textureSourceUrl ? (
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => {
                        setTerrainTextureUrl(asset.textureSourceUrl ?? '');
                        applyTerrainTexture(asset.textureSourceUrl ?? null);
                      }}
                    >
                      Use texture on terrain
                    </button>
                  ) : null}
                  <button type="button" className="action-button" onClick={() => void handleDeleteAsset(asset.id)}>
                    Delete asset
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="debug-panel">
          <h2>Personagens (Fase 07)</h2>
          <label className="field">
            <span>Entrada rápida do jogador (payload + upload 3D)</span>
            <input
              type="file"
              accept=".glb,.gltf,.obj,.png,.jpg,.jpeg,.webp,.mtl"
              multiple
              onChange={(event) => {
                const files = event.target.files;
                if (!files || files.length === 0) {
                  return;
                }

                void createCharacterFromPayloadAndFiles(files).catch((error) => {
                  setCharacterError(error instanceof Error ? error.message : 'Falha na entrada rápida do personagem.');
                });

                event.target.value = '';
              }}
            />
          </label>
          <label className="field">
            <span>Modelo 3D do personagem</span>
            <select value={characterModelAssetId} onChange={(event) => setCharacterModelAssetId(event.target.value)}>
              <option value="">Selecione um asset 3D</option>
              {characterAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.format})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Payload do personagem (JSON)</span>
            <textarea rows={10} value={characterPayloadText} onChange={(event) => setCharacterPayloadText(event.target.value)} />
          </label>
          <button
            type="button"
            className="action-button"
            onClick={() => {
              void createCharacterFromPayload().catch((error) => {
                setCharacterError(error instanceof Error ? error.message : 'Falha ao criar personagem.');
              });
            }}
          >
            Criar personagem automático
          </button>

          {selectedCharacterEntity ? (
            <>
              <p className="debug-text">Selecionado: {selectedCharacterEntity.name}</p>
              <p className="debug-text">Owner: {selectedCharacterEntity.character?.ownerUserId ?? 'n/a'}</p>
              <p className="debug-text">HP: {selectedCharacterEntity.character?.hp.current ?? '-'} / {selectedCharacterEntity.character?.hp.max ?? '-'}</p>
              <p className="debug-text">Status: {(selectedCharacterEntity.character?.status ?? []).join(', ') || 'nenhum'}</p>
              <div className="action-row">
                <button
                  type="button"
                  className="action-button"
                  onClick={() => {
                    void updateSelectedCharacterModel().catch((error) => {
                      setCharacterError(error instanceof Error ? error.message : 'Falha ao trocar modelo.');
                    });
                  }}
                >
                  Trocar modelo
                </button>
              </div>
              <div className="action-row">
                <label className="field compact">
                  <span>HP atual</span>
                  <input value={characterHpValue} onChange={(event) => setCharacterHpValue(event.target.value)} />
                </label>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => {
                    void updateSelectedCharacterHp().catch((error) => {
                      setCharacterError(error instanceof Error ? error.message : 'Falha ao atualizar HP.');
                    });
                  }}
                >
                  Atualizar HP
                </button>
              </div>
              <div className="action-row">
                <label className="field compact">
                  <span>Aplicar status</span>
                  <input value={characterStatusValue} onChange={(event) => setCharacterStatusValue(event.target.value)} />
                </label>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => {
                    void applySelectedCharacterStatus().catch((error) => {
                      setCharacterError(error instanceof Error ? error.message : 'Falha ao aplicar status.');
                    });
                  }}
                >
                  Aplicar status
                </button>
              </div>
            </>
          ) : (
            <p className="debug-hint">Selecione uma entidade de personagem (PLAYER/ENEMY/NPC) para editar HP, status e modelo.</p>
          )}
          {characterMessage ? <p className="debug-text">{characterMessage}</p> : null}
          {characterError ? <p className="error-text">{characterError}</p> : null}
        </section>

        <section className="debug-panel">
          <h2>Inspector</h2>
          {selectedEntity ? (
            <>
              <p className="debug-text">
                Asset: {selectedEntity.assetId ?? 'none'}
              </p>
              <label className="field">
                <span>Name</span>
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              </label>

              <label className="field">
                <span>Layer</span>
                <select value={draft.layer} onChange={(event) => setDraft({ ...draft, layer: event.target.value })}>
                  <option value="terrain">terrain</option>
                  <option value="buildings">buildings</option>
                  <option value="objects">objects</option>
                  <option value="players">players</option>
                  <option value="enemies">enemies</option>
                  <option value="npcs">npcs</option>
                  <option value="lighting">lighting</option>
                  <option value="audio">audio</option>
                  <option value="gm">gm</option>
                </select>
              </label>

              <div className="field-group">
                <span>Position</span>
                <div className="numeric-grid">
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <label key={`pos-${axis}`} className="field compact">
                      <span>{axis.toUpperCase()}</span>
                      <input
                        value={draft.position[axis]}
                        onChange={(event) => setDraft({ ...draft, position: { ...draft.position, [axis]: event.target.value } })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <span>Rotation</span>
                <div className="numeric-grid">
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <label key={`rot-${axis}`} className="field compact">
                      <span>{axis.toUpperCase()}</span>
                      <input
                        value={draft.rotation[axis]}
                        onChange={(event) => setDraft({ ...draft, rotation: { ...draft.rotation, [axis]: event.target.value } })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <span>Scale</span>
                <div className="numeric-grid">
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <label key={`scale-${axis}`} className="field compact">
                      <span>{axis.toUpperCase()}</span>
                      <input
                        value={draft.scale[axis]}
                        onChange={(event) => setDraft({ ...draft, scale: { ...draft.scale, [axis]: event.target.value } })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <label className="field">
                <span>Properties (JSON)</span>
                <textarea rows={6} value={draft.properties} onChange={(event) => setDraft({ ...draft, properties: event.target.value })} />
              </label>

              {draftError ? <p className="error-text">{draftError}</p> : null}

              <button type="button" className="action-button" onClick={saveInspector}>
                Save selection
              </button>
            </>
          ) : (
            <p className="debug-hint">Selecione uma peça no mapa para editar no inspector.</p>
          )}
        </section>

        <section className="debug-panel">
          <h2>Terreno e Persistência</h2>
          <label className="field">
            <span>URL da textura do terreno</span>
            <input
              value={terrainTextureUrl}
              placeholder="https://..."
              onChange={(event) => setTerrainTextureUrl(event.target.value)}
            />
          </label>
          <div className="action-row">
            <button
              type="button"
              className="action-button"
              onClick={() => applyTerrainTexture(terrainTextureUrl.trim() ? terrainTextureUrl.trim() : null)}
            >
              Aplicar textura
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => {
                setTerrainTextureUrl('');
                applyTerrainTexture(null);
              }}
            >
              Limpar textura
            </button>
          </div>
          <div className="action-row">
            <button
              type="button"
              className="action-button"
              onClick={() => {
                void saveCampaignState().catch((error) => {
                  setStatePersistenceError(error instanceof Error ? error.message : 'Falha ao salvar estado.');
                });
              }}
            >
              Save no backend
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => {
                void loadCampaignState().catch((error) => {
                  setStatePersistenceError(error instanceof Error ? error.message : 'Falha ao carregar estado.');
                });
              }}
            >
              Load do backend
            </button>
          </div>
          {statePersistenceMessage ? <p className="debug-text">{statePersistenceMessage}</p> : null}
          {statePersistenceError ? <p className="error-text">{statePersistenceError}</p> : null}
        </section>

        <section className="debug-panel">
          <h2>Status</h2>
          <p className="debug-text">Última ação: {lastAction}</p>
          <p className="debug-text">Entidades no estado: {entityCount}</p>
          <p className="debug-text">{measurement}</p>
        </section>

        <section className="state-panel">
          <h2>Snapshot atual</h2>
          <pre>{snapshot}</pre>
        </section>
      </aside>

      <section className="viewport-panel">
        <SceneCanvas />
      </section>
    </main>
  );
}

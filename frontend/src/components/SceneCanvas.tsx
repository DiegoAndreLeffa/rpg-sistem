import { useEffect, useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  GameStateManager,
  type GameAsset,
  type GameEntity,
  type GameState
} from '../game/GameStateManager';

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

type EditorAction =
  | { type: 'rpg-editor-set-tool'; tool: EditorTool }
  | { type: 'rpg-editor-set-grid-snap'; enabled: boolean }
  | { type: 'rpg-editor-set-terrain-texture'; textureUrl: string | null }
  | { type: 'rpg-editor-sync-assets'; assets: GameAsset[] }
  | { type: 'rpg-editor-add-entity'; preset: MapPreset }
  | { type: 'rpg-editor-upload-asset'; asset: Omit<GameAsset, 'id' | 'entityIds' | 'createdAt' | 'updatedAt'> }
  | { type: 'rpg-editor-assign-asset'; entityId: string; assetId: string }
  | { type: 'rpg-editor-delete-asset'; assetId: string }
  | { type: 'rpg-editor-update-selected'; patch: Partial<GameEntity> }
  | { type: 'rpg-editor-delete-selected' }
  | { type: 'rpg-editor-duplicate-selected' }
  | { type: 'rpg-editor-undo' }
  | { type: 'rpg-editor-redo' }
  | { type: 'rpg-editor-reset' }
  | { type: 'rpg-editor-rebuild' };

type SceneCanvasMode = 'master' | 'player';

type MeasurementState = {
  firstId: string;
  secondId?: string;
  distance?: number;
};

type SelectionSnapshot = {
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

type EditorStateEvent = {
  action: string;
  state: GameState;
  selectedEntity: SelectionSnapshot | null;
  tool: EditorTool;
  gridSnapEnabled: boolean;
  measurement: MeasurementState | null;
  canUndo: boolean;
  canRedo: boolean;
};

const selectableObjects: THREE.Object3D[] = [];

function createDefaultState(): GameStateManager {
  const manager = new GameStateManager({
    campaignId: 'campaign-demo',
    map: {
      id: 'map-demo',
      name: 'Sala de Jogo',
      width: 20,
      height: 20
    },
    settings: {
      mode: 'editor',
      layer: 'objects'
    },
    entities: []
  });

  manager.createEntity('BUILDING', 'Parede', { x: -4, y: 0.75, z: -1 }, {
    layer: 'terrain',
    scale: { x: 2.5, y: 1.5, z: 0.3 },
    properties: { preset: 'wall' }
  });

  manager.createEntity('BUILDING', 'Casa', { x: -1, y: 0.7, z: 2 }, {
    layer: 'buildings',
    scale: { x: 2.2, y: 1.4, z: 2.2 },
    properties: { preset: 'house' }
  });

  manager.createEntity('OBJECT', 'Mesa', { x: 3, y: 0.45, z: -1 }, {
    layer: 'objects',
    scale: { x: 1.3, y: 0.8, z: 1 },
    properties: { preset: 'table' }
  });

  manager.createEntity('OBJECT', 'Baú', { x: 1, y: 0.4, z: 3 }, {
    layer: 'objects',
    scale: { x: 1, y: 0.8, z: 0.8 },
    properties: { preset: 'chest' }
  });

  return manager;
}

function getPresetConfig(preset: MapPreset): {
  kind: GameEntity['kind'];
  layer: GameEntity['layer'];
  name: string;
  scale: GameEntity['scale'];
  properties: Record<string, unknown>;
  color: number;
} {
  switch (preset) {
    case 'wall':
      return { kind: 'BUILDING', layer: 'terrain', name: 'Parede', scale: { x: 2.5, y: 1.5, z: 0.3 }, properties: { preset }, color: 0x8b5cf6 };
    case 'house':
      return { kind: 'BUILDING', layer: 'buildings', name: 'Casa', scale: { x: 2.4, y: 1.6, z: 2.4 }, properties: { preset }, color: 0xf97316 };
    case 'door':
      return { kind: 'BUILDING', layer: 'buildings', name: 'Porta', scale: { x: 0.9, y: 1.8, z: 0.2 }, properties: { preset }, color: 0x92400e };
    case 'window':
      return { kind: 'BUILDING', layer: 'buildings', name: 'Janela', scale: { x: 1.2, y: 1, z: 0.15 }, properties: { preset }, color: 0x38bdf8 };
    case 'tower':
      return { kind: 'BUILDING', layer: 'buildings', name: 'Torre', scale: { x: 1.2, y: 3, z: 1.2 }, properties: { preset }, color: 0x64748b };
    case 'stairs':
      return { kind: 'BUILDING', layer: 'buildings', name: 'Escada', scale: { x: 2, y: 1, z: 2 }, properties: { preset }, color: 0x6b7280 };
    case 'table':
      return { kind: 'OBJECT', layer: 'objects', name: 'Mesa', scale: { x: 1.4, y: 0.8, z: 1 }, properties: { preset }, color: 0x60a5fa };
    case 'chair':
      return { kind: 'OBJECT', layer: 'objects', name: 'Cadeira', scale: { x: 0.7, y: 1, z: 0.7 }, properties: { preset }, color: 0x22c55e };
    case 'chest':
      return { kind: 'OBJECT', layer: 'objects', name: 'Baú', scale: { x: 1, y: 0.8, z: 0.8 }, properties: { preset }, color: 0xf59e0b };
    case 'tree':
      return { kind: 'OBJECT', layer: 'terrain', name: 'Árvore', scale: { x: 1, y: 2.2, z: 1 }, properties: { preset }, color: 0x16a34a };
    case 'stone':
      return { kind: 'OBJECT', layer: 'terrain', name: 'Pedra', scale: { x: 0.9, y: 0.7, z: 0.9 }, properties: { preset }, color: 0x94a3b8 };
  }
}

function getEntityColor(entity: GameEntity): number {
  const preset = typeof entity.properties?.preset === 'string' ? entity.properties.preset : undefined;

  if (preset === 'wall') return 0x8b5cf6;
  if (preset === 'house') return 0xf97316;
  if (preset === 'door') return 0x92400e;
  if (preset === 'window') return 0x38bdf8;
  if (preset === 'tower') return 0x64748b;
  if (preset === 'stairs') return 0x6b7280;
  if (preset === 'table') return 0x60a5fa;
  if (preset === 'chair') return 0x22c55e;
  if (preset === 'chest') return 0xf59e0b;
  if (preset === 'tree') return 0x16a34a;
  if (preset === 'stone') return 0x94a3b8;

  if (entity.kind === 'PLAYER') return 0x22c55e;
  if (entity.kind === 'ENEMY') return 0xef4444;
  if (entity.kind === 'NPC') return 0xf59e0b;
  if (entity.kind === 'BUILDING') return 0xf97316;

  return 0x60a5fa;
}

function getGeometryForEntity(entity: GameEntity): THREE.BufferGeometry {
  const preset = typeof entity.properties?.preset === 'string' ? entity.properties.preset : undefined;

  switch (preset) {
    case 'wall':
      return new THREE.BoxGeometry(2.5, 1.5, 0.3);
    case 'house':
      return new THREE.BoxGeometry(2.4, 1.6, 2.4);
    case 'door':
      return new THREE.BoxGeometry(0.9, 1.8, 0.2);
    case 'window':
      return new THREE.BoxGeometry(1.2, 1, 0.15);
    case 'tower':
      return new THREE.CylinderGeometry(0.6, 0.8, 3, 8);
    case 'stairs':
      return new THREE.BoxGeometry(2, 1, 2);
    case 'table':
      return new THREE.BoxGeometry(1.4, 0.8, 1);
    case 'chair':
      return new THREE.BoxGeometry(0.7, 1, 0.7);
    case 'chest':
      return new THREE.BoxGeometry(1, 0.8, 0.8);
    case 'tree':
      return new THREE.ConeGeometry(0.8, 2.2, 6);
    case 'stone':
      return new THREE.DodecahedronGeometry(0.7);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function buildSelectionSnapshot(entity: GameEntity): SelectionSnapshot {
  return {
    id: entity.id,
    kind: entity.kind,
    name: entity.name,
    layer: entity.layer,
    ...(entity.assetId !== undefined ? { assetId: entity.assetId } : {}),
    ...(entity.character ? { character: structuredClone(entity.character) } : {}),
    position: { ...entity.position },
    rotation: { ...entity.rotation },
    scale: { ...entity.scale },
    properties: { ...(entity.properties ?? {}) }
  };
}

function calculateDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return a.distanceTo(b);
}

function snapToGrid(value: number): number {
  return Math.round(value);
}

function snapVectorToGrid(vector: { x: number; y: number; z: number }) {
  return {
    x: snapToGrid(vector.x),
    y: snapToGrid(vector.y),
    z: snapToGrid(vector.z)
  };
}

export function SceneCanvas({ mode = 'master' }: { mode?: SceneCanvasMode }): ReactElement {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mountNode = mountRef.current;

    if (!mountNode) {
      return undefined;
    }

    const readOnly = mode === 'player';
    let stateManager = createDefaultState();
    let activeTool: EditorTool = readOnly ? 'measure' : 'move';
    let gridSnapEnabled = false;
    let selectedEntityId: string | null = null;
    let measurement: MeasurementState | null = null;
    let selectedObject: THREE.Object3D | null = null;
    let measurementLine: THREE.Line | null = null;
    const entityMeshes = new Map<string, THREE.Object3D>();
    const assetCache = new Map<string, THREE.Object3D>();
    const gltfLoader = new GLTFLoader();
    const mtlLoader = new MTLLoader();
    gltfLoader.setCrossOrigin('anonymous');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);

    const camera = new THREE.PerspectiveCamera(45, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
    camera.position.set(8, 7, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.shadowMap.enabled = true;
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.target.set(0, 1, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const grid = new THREE.GridHelper(20, 20, 0x4ade80, 0x334155);
    grid.position.y = 0;
    scene.add(grid);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.9,
        metalness: 0.15
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const groundMaterial = ground.material as THREE.MeshStandardMaterial;
    const textureLoader = new THREE.TextureLoader();
    let terrainTexture: THREE.Texture | null = null;

    const clearTerrainTexture = () => {
      if (terrainTexture) {
        terrainTexture.dispose();
        terrainTexture = null;
      }

      groundMaterial.map = null;
      groundMaterial.needsUpdate = true;
    };

    const applyTerrainTexture = (textureUrl: string | null | undefined) => {
      if (!textureUrl) {
        clearTerrainTexture();
        return;
      }

      textureLoader.load(
        textureUrl,
        (loadedTexture) => {
          clearTerrainTexture();
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          loadedTexture.repeat.set(8, 8);
          terrainTexture = loadedTexture;
          groundMaterial.map = loadedTexture;
          groundMaterial.needsUpdate = true;
        },
        undefined,
        () => {
          clearTerrainTexture();
        }
      );
    };

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate');
    transformControls.size = 0.4;
    transformControls.showY = true;
    transformControls.addEventListener('mouseDown', () => {
      controls.enabled = false;
    });
    transformControls.addEventListener('mouseUp', () => {
      controls.enabled = true;
    });
    scene.add(transformControls.getHelper());

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const emitEditorState = (action: string) => {
      const selectedEntity = selectedEntityId ? stateManager.getEntity(selectedEntityId) : undefined;
      const detail: EditorStateEvent = {
        action,
        state: stateManager.snapshot(),
        selectedEntity: selectedEntity ? buildSelectionSnapshot(selectedEntity) : null,
        tool: activeTool,
        gridSnapEnabled,
        measurement: measurement ? { ...measurement } : null,
        canUndo: stateManager.canUndo(),
        canRedo: stateManager.canRedo()
      };

      window.dispatchEvent(new CustomEvent('rpg-state-changed', { detail }));
    };

    const highlightObject = (object: THREE.Object3D | null, highlighted: boolean) => {
      if (!object) {
        return;
      }

      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        const materials = Array.isArray(child.material) ? child.material : [child.material];

        for (const material of materials) {
          if ('emissive' in material) {
            material.emissive = material.emissive ?? new THREE.Color(0x000000);
            material.emissive.setHex(highlighted ? 0x1d4ed8 : 0x000000);
          }
        }
      });
    };

    const disposeObject = (object: THREE.Object3D) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const material = child.material;

          if (Array.isArray(material)) {
            for (const item of material) {
              item.dispose();
            }
          } else {
            material.dispose();
          }
        }
      });
    };

    const clearMeasurementLine = () => {
      if (!measurementLine) {
        return;
      }

      scene.remove(measurementLine);
      measurementLine.geometry.dispose();
      (measurementLine.material as THREE.Material).dispose();
      measurementLine = null;
    };

    const updateMeasurementLine = () => {
      clearMeasurementLine();

      if (!measurement || !measurement.secondId) {
        emitEditorState('measure-update');
        return;
      }

      const first = stateManager.getEntity(measurement.firstId);
      const second = stateManager.getEntity(measurement.secondId);

      if (!first || !second) {
        emitEditorState('measure-update');
        return;
      }

      const points = [
        new THREE.Vector3(first.position.x, first.position.y + 0.5, first.position.z),
        new THREE.Vector3(second.position.x, second.position.y + 0.5, second.position.z)
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x93c5fd });
      measurementLine = new THREE.Line(geometry, material);
      scene.add(measurementLine);
      const firstPoint = points[0]!;
      const secondPoint = points[1]!;
      measurement.distance = calculateDistance(firstPoint, secondPoint);
      emitEditorState('measure-update');
    };

    const syncTransformControls = () => {
      if (readOnly) {
        transformControls.detach();
        controls.enabled = true;
        transformControls.translationSnap = null;
        return;
      }

      if (!selectedObject) {
        transformControls.detach();
        controls.enabled = true;
        transformControls.translationSnap = null;
        return;
      }

      if (activeTool === 'measure') {
        transformControls.detach();
        controls.enabled = true;
        transformControls.translationSnap = null;
        return;
      }

      transformControls.setMode(activeTool === 'move' ? 'translate' : activeTool === 'rotate' ? 'rotate' : 'scale');
      transformControls.translationSnap = gridSnapEnabled && activeTool === 'move' ? 1 : null;
      transformControls.attach(selectedObject);
      controls.enabled = false;
    };

    const clearSelection = (emit = true) => {
      if (selectedObject) {
        highlightObject(selectedObject, false);
      }

      selectedEntityId = null;
      selectedObject = null;
      syncTransformControls();

      if (emit) {
        emitEditorState('selection-cleared');
      }
    };

    const setSelection = (object: THREE.Object3D | null) => {
      if (selectedObject && selectedObject !== object) {
        highlightObject(selectedObject, false);
      }

      selectedObject = object;
      selectedEntityId = object ? (object.userData.entityId as string | undefined) ?? null : null;

      if (selectedObject) {
        highlightObject(selectedObject, true);
      }

      syncTransformControls();
      emitEditorState(object ? 'selection-changed' : 'selection-cleared');
    };

    const rebuildSceneFromGameState = (action = 'rebuild') => {
      clearMeasurementLine();

      if (selectedObject) {
        highlightObject(selectedObject, false);
      }

      selectedObject = null;
      selectedEntityId = null;
      measurement = null;
      applyTerrainTexture(stateManager.getMap().terrainTextureUrl ?? null);

      for (const object of entityMeshes.values()) {
        scene.remove(object);
        disposeObject(object);
      }

      entityMeshes.clear();
      selectableObjects.length = 0;

      for (const entity of stateManager.listEntities()) {
        const object = buildObjectFromEntity(entity);
        entityMeshes.set(entity.id, object);
      }

      syncTransformControls();
      emitEditorState(action);
    };

    function buildObjectFromEntity(entity: GameEntity): THREE.Object3D {
      const wrapper = new THREE.Group();
      wrapper.userData.entityId = entity.id;
      wrapper.userData.entityKind = entity.kind;
      wrapper.userData.assetId = entity.assetId ?? null;
      wrapper.position.set(entity.position.x, entity.position.y, entity.position.z);
      wrapper.rotation.set(entity.rotation.x, entity.rotation.y, entity.rotation.z);
      wrapper.scale.set(entity.scale.x, entity.scale.y, entity.scale.z);
      scene.add(wrapper);
      selectableObjects.push(wrapper);

      void buildRenderableForEntity(entity).then((content) => {
        wrapper.clear();
        wrapper.add(content);
      });

      return wrapper;
    }

    async function buildRenderableForEntity(entity: GameEntity): Promise<THREE.Object3D> {
      if (!entity.assetId) {
        const mesh = new THREE.Mesh(
          getGeometryForEntity(entity),
          new THREE.MeshStandardMaterial({
            color: getEntityColor(entity),
            metalness: 0.15,
            roughness: 0.7
          })
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      }

      const asset = stateManager.getAsset(entity.assetId);

      if (!asset) {
        return new THREE.Group();
      }

      const cached = assetCache.get(asset.id);

      if (cached) {
        return cached.clone(true);
      }

      if (asset.format === 'GLTF' || asset.format === 'GLB') {
        const loaded = await gltfLoader.loadAsync(asset.sourceUrl);
        loaded.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        assetCache.set(asset.id, loaded.scene.clone(true));
        return loaded.scene;
      }

      if (asset.format === 'OBJ') {
        const objLoader = new OBJLoader();
        objLoader.setCrossOrigin('anonymous');

        if (asset.mtlSourceUrl) {
          const mtlResponse = await fetch(asset.mtlSourceUrl);
          if (!mtlResponse.ok) {
            throw new Error('Unable to load MTL file for OBJ model.');
          }

          const mtlText = await mtlResponse.text();
          const mtlContent = asset.textureSourceUrl
            ? mtlText.replace(/map_Kd\s+[^\r\n]+/g, `map_Kd ${asset.textureSourceUrl}`)
            : mtlText;

          const mtlBlobUrl = URL.createObjectURL(new Blob([mtlContent], { type: 'text/plain' }));
          const materials = await mtlLoader.loadAsync(mtlBlobUrl);
          URL.revokeObjectURL(mtlBlobUrl);
          materials.preload();
          objLoader.setMaterials(materials);
        }

        const loaded = await new Promise<THREE.Object3D>((resolve, reject) => {
          objLoader.load(
            asset.sourceUrl,
            (obj) => resolve(obj),
            undefined,
            (error) => reject(error)
          );
        });

        loaded.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        assetCache.set(asset.id, loaded.clone(true));
        return loaded;
      }

      return new THREE.Group();
    }

    const addPresetEntity = (preset: MapPreset) => {
      if (readOnly) {
        return;
      }

      const config = getPresetConfig(preset);
      const spawnIndex = stateManager.listEntities().length;
      const basePosition = {
        x: (spawnIndex % 4) * 2 - 3,
        y: config.layer === 'terrain' ? 0.4 : 0.5,
        z: Math.floor(spawnIndex / 4) * 2 - 2
      };
      const position = gridSnapEnabled ? snapVectorToGrid(basePosition) : basePosition;

      const entity = stateManager.createEntity(config.kind, config.name, position, {
        layer: config.layer,
        scale: config.scale,
        properties: config.properties
      });

      const object = buildObjectFromEntity(entity);
      entityMeshes.set(entity.id, object);
      setSelection(object);
      emitEditorState('add-entity');
    };

    const updateSelectedEntity = (patch: Partial<GameEntity>) => {
      if (readOnly) {
        return;
      }

      if (!selectedEntityId) {
        return;
      }

      const updatePatch: Partial<Pick<GameEntity, 'name' | 'position' | 'rotation' | 'scale' | 'layer' | 'properties'>> = {};

      if (patch.name !== undefined) {
        updatePatch.name = patch.name;
      }

      if (patch.layer !== undefined) {
        updatePatch.layer = patch.layer;
      }

      if (patch.position !== undefined) {
        updatePatch.position = gridSnapEnabled ? snapVectorToGrid(patch.position) : patch.position;
      }

      if (patch.rotation !== undefined) {
        updatePatch.rotation = patch.rotation;
      }

      if (patch.scale !== undefined) {
        updatePatch.scale = patch.scale;
      }

      if (patch.properties !== undefined) {
        updatePatch.properties = patch.properties;
      }

      const updated = stateManager.updateEntity(selectedEntityId, updatePatch);

      if (!updated) {
        return;
      }

      const mesh = entityMeshes.get(updated.id);

      if (mesh) {
        mesh.position.set(updated.position.x, updated.position.y, updated.position.z);
        mesh.rotation.set(updated.rotation.x, updated.rotation.y, updated.rotation.z);
        mesh.scale.set(updated.scale.x, updated.scale.y, updated.scale.z);
      }

      emitEditorState('update-entity');
    };

    const deleteSelectedEntity = () => {
      if (readOnly) {
        return;
      }

      if (!selectedEntityId) {
        return;
      }

      const mesh = entityMeshes.get(selectedEntityId);

      if (mesh) {
        scene.remove(mesh);
        disposeObject(mesh);
        entityMeshes.delete(selectedEntityId);
        const index = selectableObjects.indexOf(mesh);

        if (index >= 0) {
          selectableObjects.splice(index, 1);
        }
      }

      stateManager.deleteEntity(selectedEntityId);
      clearSelection(false);
      emitEditorState('delete-entity');
    };

    const duplicateSelectedEntity = () => {
      if (readOnly) {
        return;
      }

      if (!selectedEntityId) {
        return;
      }

      const duplicated = stateManager.duplicateEntity(selectedEntityId);

      if (!duplicated) {
        return;
      }

      const mesh = buildObjectFromEntity(duplicated);
      entityMeshes.set(duplicated.id, mesh);
      setSelection(mesh);
      emitEditorState('duplicate-entity');
    };

    const undo = () => {
      const nextState = stateManager.undo();

      if (!nextState) {
        return;
      }

      rebuildSceneFromGameState('undo');
    };

    const redo = () => {
      const nextState = stateManager.redo();

      if (!nextState) {
        return;
      }

      rebuildSceneFromGameState('redo');
    };

    const resetState = () => {
      stateManager = createDefaultState();
      measurement = null;
      rebuildSceneFromGameState('reset-state');
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!readOnly && transformControls.object !== undefined && transformControls.axis !== null) {
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(selectableObjects, true);
      const hit = intersects[0];

      if (!hit) {
        clearSelection();
        return;
      }

      let object: THREE.Object3D | null = hit.object;

      while (object && !object.userData.entityId) {
        object = object.parent as THREE.Object3D | null;
      }

      const entityId = object?.userData.entityId as string | undefined;

      if (!entityId) {
        return;
      }

      const entity = stateManager.getEntity(entityId);

      if (!entity) {
        return;
      }

      if (activeTool === 'measure') {
        if (!measurement || measurement.secondId) {
          measurement = { firstId: entity.id };
          emitEditorState('measure-start');
          return;
        }

        measurement.secondId = entity.id;
        updateMeasurementLine();
        return;
      }

      setSelection(object ?? null);
    };

    const setTool = (tool: EditorTool) => {
      activeTool = tool;
      syncTransformControls();
      emitEditorState('tool-changed');
    };

    const onStateCommand = (event: Event) => {
      const customEvent = event as CustomEvent<EditorAction>;
      const commandType = customEvent.detail?.type;

      if (
        readOnly &&
        commandType !== 'rpg-editor-sync-assets' &&
        commandType !== 'rpg-editor-rebuild' &&
        commandType !== 'rpg-editor-set-terrain-texture'
      ) {
        return;
      }

      switch (commandType) {
        case 'rpg-editor-set-tool':
          setTool(customEvent.detail.tool);
          break;
        case 'rpg-editor-set-grid-snap':
          gridSnapEnabled = customEvent.detail.enabled;
          syncTransformControls();
          emitEditorState('grid-snap-changed');
          break;
        case 'rpg-editor-set-terrain-texture':
          stateManager.updateMap({ terrainTextureUrl: customEvent.detail.textureUrl });
          applyTerrainTexture(customEvent.detail.textureUrl);
          emitEditorState('terrain-texture-changed');
          break;
        case 'rpg-editor-add-entity':
          addPresetEntity(customEvent.detail.preset);
          break;
        case 'rpg-editor-update-selected':
          updateSelectedEntity(customEvent.detail.patch);
          break;
        case 'rpg-editor-sync-assets':
          stateManager.rebuildFromState({
            ...stateManager.getState(),
            assets: customEvent.detail.assets
          });
          assetCache.clear();
          rebuildSceneFromGameState('sync-assets');
          break;
        case 'rpg-editor-upload-asset':
          stateManager.createAsset(customEvent.detail.asset);
          rebuildSceneFromGameState('upload-asset');
          break;
        case 'rpg-editor-assign-asset':
          stateManager.assignAssetToEntity(customEvent.detail.entityId, customEvent.detail.assetId);
          rebuildSceneFromGameState('assign-asset');
          break;
        case 'rpg-editor-delete-asset':
          stateManager.deleteAsset(customEvent.detail.assetId);
          assetCache.clear();
          rebuildSceneFromGameState('delete-asset');
          break;
        case 'rpg-editor-delete-selected':
          deleteSelectedEntity();
          break;
        case 'rpg-editor-duplicate-selected':
          duplicateSelectedEntity();
          break;
        case 'rpg-editor-undo':
          undo();
          break;
        case 'rpg-editor-redo':
          redo();
          break;
        case 'rpg-editor-reset':
          resetState();
          break;
        case 'rpg-editor-rebuild':
          rebuildSceneFromGameState('rebuild');
          break;
      }
    };

    transformControls.addEventListener('objectChange', () => {
      if (readOnly) {
        return;
      }

      if (!selectedEntityId || !selectedObject) {
        return;
      }

      if (gridSnapEnabled && activeTool === 'move') {
        selectedObject.position.set(
          snapToGrid(selectedObject.position.x),
          snapToGrid(selectedObject.position.y),
          snapToGrid(selectedObject.position.z)
        );
      }

      stateManager.updateEntity(selectedEntityId, {
        position: {
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z
        },
        rotation: {
          x: selectedObject.rotation.x,
          y: selectedObject.rotation.y,
          z: selectedObject.rotation.z
        },
        scale: {
          x: selectedObject.scale.x,
          y: selectedObject.scale.y,
          z: selectedObject.scale.z
        }
      });

      emitEditorState('transform');
    });

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('rpg-editor-command', onStateCommand);

    const resizeRenderer = () => {
      const { clientWidth, clientHeight } = mountNode;

      if (clientWidth === 0 || clientHeight === 0) {
        return;
      }

      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    resizeRenderer();

    const handleResize = () => resizeRenderer();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      resizeRenderer();
    });
    resizeObserver.observe(mountNode);

    let animationFrame = 0;

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    animate();

    const syncSelectionFromState = () => {
      const entity = selectedEntityId ? stateManager.getEntity(selectedEntityId) : undefined;
      emitEditorState(entity ? 'selection-sync' : 'state-sync');
    };

    const rebuildFromSnapshot = (event: Event) => {
      const customEvent = event as CustomEvent<{ state?: GameState }>;
      const nextState = customEvent.detail?.state;

      if (nextState) {
        const snapshotState = nextState as Partial<GameState>;
        stateManager.rebuildFromState({
          ...snapshotState,
          assets: Array.isArray(snapshotState.assets) ? snapshotState.assets : stateManager.getState().assets
        } as GameState);
      }

      rebuildSceneFromGameState('rebuild');
      syncSelectionFromState();
    };

    window.addEventListener('rpg-scene-rebuild', rebuildFromSnapshot);
    window.requestAnimationFrame(() => {
      rebuildSceneFromGameState('initial-load');
    });

    return () => {
      if (transformControls.object !== undefined) {
        transformControls.detach();
      }

      clearMeasurementLine();
      clearTerrainTexture();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('rpg-scene-rebuild', rebuildFromSnapshot);
      window.removeEventListener('rpg-editor-command', onStateCommand);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      mountNode.removeChild(renderer.domElement);
      renderer.dispose();
      transformControls.dispose();
      selectableObjects.length = 0;
      entityMeshes.clear();
    };
  }, [mode]);

  return <div ref={mountRef} className="scene-canvas" aria-label="3D map preview" />;
}

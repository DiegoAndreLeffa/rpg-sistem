import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { io, type Socket } from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faCrown, faFloppyDisk, faMap, faScrewdriverWrench, faUsers } from '@fortawesome/free-solid-svg-icons';
import { App as MasterVttScreen } from './App';
import { SceneCanvas } from './components/SceneCanvas';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001';
const DEMO_CAMPAIGN_ID = 'campaign-demo';
const AUTH_STORAGE_KEY = 'rpg-auth-session';
const GameEvents = {
  PresenceSync: 'PRESENCE_SYNC',
  MapUpdated: 'MAP_UPDATED',
  StateSync: 'STATE_SYNC'
} as const;

type UserRole = 'MASTER' | 'PLAYER' | 'SPECTATOR';
const UserRole = {
  Master: 'MASTER' as UserRole,
  Player: 'PLAYER' as UserRole,
  Spectator: 'SPECTATOR' as UserRole
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

type PresenceItem = {
  socketId: string;
  userId: string;
  role: UserRole;
  connectedAt: string;
};

type LoginFormState = {
  email: string;
  password: string;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type RealtimeEntitySnapshot = {
  assetId?: string | null;
};

type RealtimeGameStateSnapshot = {
  entities?: RealtimeEntitySnapshot[];
};

type SceneStateChangeEvent = {
  action?: string;
  state?: unknown;
};

const MASTER_MUTATION_ACTIONS = new Set([
  'add-entity',
  'update-entity',
  'delete-entity',
  'duplicate-entity',
  'transform',
  'undo',
  'redo',
  'reset',
  'terrain-texture-changed',
  'assign-asset',
  'delete-asset'
]);

function readStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.accessToken || !parsed.user?.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function navigate(path: string): void {
  if (window.location.pathname === path) {
    return;
  }

  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function useRealtimeCampaign(session: AuthSession | null) {
  const [presence, setPresence] = useState<PresenceItem[]>([]);
  const [connected, setConnected] = useState(false);
  const knownAssetIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!session) {
      setPresence([]);
      setConnected(false);
      knownAssetIdsRef.current = new Set();
      return;
    }

    let active = true;
    let socket: Socket | null = null;

    const syncAssetsFromBackend = async () => {
      const assetsResponse = await fetch(`${API_BASE_URL}/assets?campaignId=${DEMO_CAMPAIGN_ID}`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      if (!assetsResponse.ok) {
        return false;
      }

      const assets = (await assetsResponse.json()) as Array<{ id?: string }>;
      const nextKnownAssets = new Set<string>();
      for (const asset of assets) {
        if (asset.id) {
          nextKnownAssets.add(asset.id);
        }
      }
      knownAssetIdsRef.current = nextKnownAssets;
      window.dispatchEvent(new CustomEvent('rpg-editor-command', { detail: { type: 'rpg-editor-sync-assets', assets } }));
      return true;
    };

    const hasUnknownAssetInState = (state: unknown) => {
      const snapshot = state as RealtimeGameStateSnapshot | null;
      if (!snapshot?.entities || !Array.isArray(snapshot.entities)) {
        return false;
      }

      for (const entity of snapshot.entities) {
        if (entity.assetId && !knownAssetIdsRef.current.has(entity.assetId)) {
          return true;
        }
      }

      return false;
    };

    const loadInitialState = async () => {
      const stateResponse = await fetch(`${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/state`, { headers: { Authorization: `Bearer ${session.accessToken}` } });

      if (!active) {
        return;
      }

      if (stateResponse.ok) {
        const state = await stateResponse.json();
        window.dispatchEvent(new CustomEvent('rpg-scene-rebuild', { detail: { state } }));
      }

      await syncAssetsFromBackend();
    };

    void loadInitialState().catch((error) => {
      console.error('Failed to load campaign snapshot.', error);
    });

    socket = io(`${API_BASE_URL}/game`, {
      transports: ['websocket', 'polling'],
      auth: { token: session.accessToken }
    });

    socket.on('connect', () => {
      setConnected(true);
      socket?.emit('join_campaign', {
        campaignId: DEMO_CAMPAIGN_ID
      });
      socket?.emit('request_presence', { campaignId: DEMO_CAMPAIGN_ID });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on(GameEvents.PresenceSync, (payload: { campaignId?: string; players?: PresenceItem[] }) => {
      if (payload?.campaignId !== DEMO_CAMPAIGN_ID) {
        return;
      }

      setPresence(payload.players ?? []);
    });

    socket.on(GameEvents.MapUpdated, (payload: { campaignId?: string; state?: unknown }) => {
      if (payload?.campaignId !== DEMO_CAMPAIGN_ID || !payload.state) {
        return;
      }

      window.dispatchEvent(new CustomEvent('rpg-scene-rebuild', { detail: { state: payload.state } }));
      if (hasUnknownAssetInState(payload.state)) {
        void syncAssetsFromBackend();
      }
    });

    socket.on(GameEvents.StateSync, (payload: { campaignId?: string; state?: unknown }) => {
      if (payload?.campaignId !== DEMO_CAMPAIGN_ID || !payload.state) {
        return;
      }

      window.dispatchEvent(new CustomEvent('rpg-scene-rebuild', { detail: { state: payload.state } }));
      if (hasUnknownAssetInState(payload.state)) {
        void syncAssetsFromBackend();
      }
    });

    return () => {
      active = false;

      if (socket) {
        socket.emit('leave_campaign', {
          campaignId: DEMO_CAMPAIGN_ID
        });
        socket.disconnect();
      }
    };
  }, [session]);

  return { connected, presence };
}

function HomePage(): ReactElement {
  return (
    <main className="landing-shell">
      <nav className="landing-nav"><span className="brand-mark">✦</span><strong>RPG TABLETOP</strong><button type="button" className="text-button" onClick={() => navigate('/register')}>Criar conta</button></nav>
      <section className="hero-copy">
        <p className="eyebrow">Uma mesa. Mundos infinitos.</p>
        <h1>Sua próxima aventura começa aqui.</h1>
        <p>Prepare cenários, reúna sua mesa e jogue RPG em um espaço 3D compartilhado.</p>
      </section>
      <section className="role-choice" aria-label="Escolha seu papel">
        <article className="role-card master-role"><span className="role-icon">♜</span><p className="eyebrow">Criar e conduzir</p><h2>Sou Mestre</h2><p>Monte campanhas, prepare mapas e conduza cada encontro.</p><button type="button" className="primary-button" onClick={() => navigate('/login/master')}>Entrar como Mestre →</button></article>
        <article className="role-card player-role"><span className="role-icon">⚔</span><p className="eyebrow">Jogar e explorar</p><h2>Sou Jogador</h2><p>Entre em uma sala, importe seu personagem e comece a aventura.</p><button type="button" className="secondary-button" onClick={() => navigate('/login/player')}>Entrar como Jogador →</button></article>
      </section>
    </main>
  );
}

function FlowHeader({ user, label, onLogout }: { user: AuthUser; label: string; onLogout: () => Promise<void> }): ReactElement {
  return <header className="flow-header"><button type="button" className="brand-button" onClick={() => navigate('/')}>✦ RPG TABLETOP</button><span className="flow-label">{label}</span><div className="user-chip"><span>{user.name}</span><small>{user.role}</small></div><button type="button" className="text-button" onClick={() => void onLogout()}>Sair</button></header>;
}

function MasterDashboard({ user, onLogout }: { user: AuthUser; onLogout: () => Promise<void> }): ReactElement {
  return <main className="flow-shell"><FlowHeader user={user} label="DASHBOARD DO MESTRE" onLogout={onLogout} /><section className="dashboard-hero"><p className="eyebrow">Central de comando</p><h1>Bom te ver, {user.name.split(' ')[0]}.</h1><p>Escolha uma campanha para preparar a próxima sessão.</p><button type="button" className="primary-button" onClick={() => navigate('/master/setup')}>+ Nova campanha</button></section><section className="campaign-grid"><article className="campaign-card featured"><span>EM PREPARAÇÃO</span><h2>Campanha Demo</h2><p>Mapa: Sala de Jogo · 0 jogadores conectados</p><div><button type="button" className="secondary-button" onClick={() => navigate('/master/setup')}>Preparar mapa</button><button type="button" className="text-button" onClick={() => navigate('/master/game')}>Abrir mesa →</button></div></article><article className="campaign-card empty"><span className="role-icon">+</span><h2>Nova história</h2><p>Crie uma campanha e convide sua mesa.</p><button type="button" className="text-button" onClick={() => navigate('/master/setup')}>Criar campanha →</button></article></section></main>;
}

function MasterSetup({ user, onLogout }: { user: AuthUser; onLogout: () => Promise<void> }): ReactElement {
  return <main className="flow-shell"><FlowHeader user={user} label="CAMPAIGN SETUP · MAP PREPARATION" onLogout={onLogout} /><section className="setup-layout"><aside className="stepper"><strong>Preparação</strong><span className="step active">01 · Campanha</span><span className="step active">02 · Mapa</span><span className="step">03 · Sala e convites</span></aside><section className="setup-card"><p className="eyebrow">Campanha Demo</p><h1>Prepare o palco.</h1><p>Abra o editor para montar cenário, entidades, luzes e visão antes de chamar os jogadores.</p><div className="setup-checklist"><span>✓ Definir terreno e grid</span><span>✓ Posicionar objetos e inimigos</span><span>○ Configurar visão e fog</span><span>○ Convidar jogadores</span></div><button type="button" className="primary-button" onClick={() => navigate('/master/game')}>Abrir preparação do mapa →</button></section></section></main>;
}

function PlayerJoin({ user, onLogout }: { user: AuthUser; onLogout: () => Promise<void> }): ReactElement {
  const [code, setCode] = useState('');
  return <main className="flow-shell"><FlowHeader user={user} label="JOIN ROOM" onLogout={onLogout} /><section className="join-card"><span className="role-icon">⚔</span><p className="eyebrow">Entrada de aventureiro</p><h1>Entre na mesa.</h1><p>Peça ao Mestre o código da sala para localizar sua campanha.</p><label className="field"><span>Código da sala</span><input value={code} placeholder="EX: TAVERNA-7F2" onChange={(event) => setCode(event.target.value.toUpperCase())} /></label><button type="button" className="primary-button" onClick={() => navigate('/player/lobby')}>Encontrar sala →</button><button type="button" className="text-button" onClick={() => navigate('/player/lobby')}>Usar Campanha Demo</button></section></main>;
}

function PlayerLobby({ user, presence, onLogout }: { user: AuthUser; presence: PresenceItem[]; onLogout: () => Promise<void> }): ReactElement {
  return <main className="flow-shell"><FlowHeader user={user} label="LOBBY" onLogout={onLogout} /><section className="lobby-layout"><div><p className="eyebrow">Sala encontrada</p><h1>Campanha Demo</h1><p>A mesa está sendo preparada. Você poderá entrar quando estiver pronto.</p><button type="button" className="primary-button" onClick={() => navigate('/player/import')}>Preparar personagem →</button></div><aside className="lobby-roster"><strong>Na sala · {presence.length}</strong><p><i className="online-dot" /> Mestre aguardando</p><p className="muted">Seu personagem ainda não foi importado.</p></aside></section></main>;
}

function PlayerImport({ user, onLogout }: { user: AuthUser; onLogout: () => Promise<void> }): ReactElement {
  return <main className="flow-shell"><FlowHeader user={user} label="CHARACTER IMPORT" onLogout={onLogout} /><section className="import-layout"><div><p className="eyebrow">Passo final</p><h1>Traga seu personagem.</h1><p>Envie o payload da ficha e o modelo 3D. O Mestre poderá revisar sua entrada antes da sessão.</p><div className="upload-placeholder">↑<br /><strong>Solte seu modelo aqui</strong><small>GLB, GLTF ou OBJ · até 15 MB</small></div></div><aside className="character-preview"><span className="role-icon">♙</span><strong>Personagem pronto?</strong><p>Você poderá concluir a importação no painel da mesa.</p><button type="button" className="primary-button" onClick={() => navigate('/player/game')}>Entrar no jogo →</button></aside></section></main>;
}

function LoginPage({
  role,
  onSubmit,
  error
}: {
  role: UserRole.Master | UserRole.Player;
  onSubmit: (form: LoginFormState) => Promise<void>;
  error: string;
}): ReactElement {
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const title = role === UserRole.Master ? 'Login de Mestre' : 'Login de Player';

  return (
    <main className="entry-shell">
      <form
        className="entry-card"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(form);
        }}
      >
        <h1>{title}</h1>
        <label className="field">
          <span>Email</span>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="field">
          <span>Senha</span>
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="entry-actions">
          <button type="submit" className="action-button">
            Entrar
          </button>
          <button type="button" className="action-button" onClick={() => navigate('/')}>
            Voltar
          </button>
        </div>
      </form>
    </main>
  );
}

function RegisterPage({
  onSubmit,
  error
}: {
  onSubmit: (form: RegisterFormState) => Promise<void>;
  error: string;
}): ReactElement {
  const [form, setForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    role: UserRole.Player
  });

  return (
    <main className="entry-shell">
      <form
        className="entry-card"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(form);
        }}
      >
        <h1>Registrar conta</h1>
        <label className="field">
          <span>Nome</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="field">
          <span>Email</span>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="field">
          <span>Senha</span>
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        <label className="field">
          <span>Tipo de conta</span>
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
            <option value={UserRole.Player}>Player</option>
            <option value={UserRole.Master}>Mestre</option>
          </select>
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="entry-actions">
          <button type="submit" className="action-button">
            Criar conta
          </button>
          <button type="button" className="action-button" onClick={() => navigate('/')}>
            Voltar
          </button>
        </div>
      </form>
    </main>
  );
}

function PlayerVttScreen({
  user,
  connected,
  presence,
  onLogout
}: {
  user: AuthUser;
  connected: boolean;
  presence: PresenceItem[];
  onLogout: () => Promise<void>;
}): ReactElement {
  return (
    <main className="player-shell">
      <header className="game-topbar" aria-label="Controles da partida"><button type="button" className="icon-button active" title="Mapa" aria-label="Mapa">⌖</button><button type="button" className="icon-button" title="Visão do personagem" aria-label="Visão do personagem">◉</button><button type="button" className="icon-button" title="Lista de jogadores" aria-label={`Jogadores conectados: ${presence.length}`}>♟<small>{presence.length}</small></button><span className="connection-icon" title={connected ? 'Conectado' : 'Reconectando'}><i className="online-dot" /></span><button type="button" className="icon-button danger" title="Sair da mesa" aria-label="Sair da mesa" onClick={() => void onLogout()}>↪</button></header>
      <section className="viewport-panel">
        <SceneCanvas mode="player" />
        <div className="vision-badge">◉ Visão do personagem</div>
      </section>
      <aside className="player-panel"><section className="character-sheet"><p className="eyebrow">SEU PERSONAGEM</p><h2>{user.name}</h2><div className="hp-bar"><span style={{ width: '76%' }} /></div><strong>38 <small>/ 50 HP</small></strong></section><section><p className="eyebrow">AÇÕES</p><div className="quick-actions"><button>⚔ Atacar</button><button>✦ Ação</button><button>⌁ Interagir</button><button>◉ Visão</button></div></section><button type="button" className="dice-button">🎲 Rolar dado <b>d20</b></button></aside>
    </main>
  );
}

function MasterShell({
  user,
  connected,
  presence,
  onLogout
}: {
  user: AuthUser;
  connected: boolean;
  presence: PresenceItem[];
  onLogout: () => Promise<void>;
}): ReactElement {
  return (
    <div className="master-shell">
      <header className="master-topbar" aria-label="Controles do mestre">
        <button type="button" className="icon-button brand-icon" title="Campanha Demo" aria-label="Campanha Demo"><FontAwesomeIcon icon={faCrown} /></button>
        <button type="button" className="icon-button active" title="Mapa" aria-label="Mapa"><FontAwesomeIcon icon={faMap} /></button>
        <button type="button" className="icon-button" title="Ferramentas" aria-label="Ferramentas"><FontAwesomeIcon icon={faScrewdriverWrench} /></button>
        <button type="button" className="icon-button" title="Participantes" aria-label={`Participantes: ${presence.length}`}><FontAwesomeIcon icon={faUsers} /><small>{presence.length}</small></button>
        <button type="button" className="icon-button" title="Salvar campanha" aria-label="Salvar campanha"><FontAwesomeIcon icon={faFloppyDisk} /></button>
        <span className="connection-icon" title={connected ? 'Conectado' : 'Offline'}><i className="online-dot" /></span>
        <button type="button" className="icon-button danger" title="Sair da mesa" aria-label="Sair da mesa" onClick={() => void onLogout()}><FontAwesomeIcon icon={faArrowRightFromBracket} /></button>
      </header>
      <MasterVttScreen />
    </div>
  );
}

export function RootApp(): ReactElement {
  const [path, setPath] = useState(window.location.pathname);
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [authError, setAuthError] = useState('');
  const syncDebounceRef = useRef<number | null>(null);
  const lastSyncedStateRef = useRef('');

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
      setAuthError('');
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const { connected, presence } = useRealtimeCampaign(path.endsWith('/game') || path.startsWith('/vtt/') ? session : null);

  useEffect(() => {
    if ((path !== '/vtt/master' && path !== '/master/game') || session?.user.role !== UserRole.Master) {
      return;
    }

    const clearPendingSync = () => {
      if (syncDebounceRef.current !== null) {
        window.clearTimeout(syncDebounceRef.current);
        syncDebounceRef.current = null;
      }
    };

    const syncState = async (state: unknown) => {
      const serialized = JSON.stringify(state);
      if (serialized === lastSyncedStateRef.current) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
        },
        body: JSON.stringify({ state })
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message ?? 'Falha ao sincronizar estado da campanha.');
      }

      lastSyncedStateRef.current = serialized;
    };

    const onStateChanged = (event: Event) => {
      const customEvent = event as CustomEvent<SceneStateChangeEvent>;
      const action = customEvent.detail?.action;
      const state = customEvent.detail?.state;

      if (!action || !state || !MASTER_MUTATION_ACTIONS.has(action)) {
        return;
      }

      clearPendingSync();
      syncDebounceRef.current = window.setTimeout(() => {
        void syncState(state).catch((error) => {
          console.error('Failed to sync state to backend.', error);
        });
      }, 180);
    };

    window.addEventListener('rpg-state-changed', onStateChanged);

    return () => {
      clearPendingSync();
      window.removeEventListener('rpg-state-changed', onStateChanged);
    };
  }, [path, session]);

  const saveSession = (nextSession: AuthSession) => {
    setSession(nextSession);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  };

  const logout = async () => {
    const token = session?.accessToken;
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => undefined);
    }

    setSession(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    navigate('/');
  };

  const register = async (form: RegisterFormState) => {
    setAuthError('');
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const payload = (await response.json().catch(() => null)) as AuthSession | { message?: string } | null;
    if (!response.ok || !payload || !('accessToken' in payload)) {
      setAuthError(typeof payload?.message === 'string' ? payload.message : 'Falha ao registrar.');
      return;
    }

    saveSession(payload);
    navigate(payload.user.role === UserRole.Master ? '/master/dashboard' : '/player/join');
  };

  const login = async (role: UserRole.Master | UserRole.Player, form: LoginFormState) => {
    setAuthError('');
    const endpoint = role === UserRole.Master ? '/auth/login/master' : '/auth/login/player';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const payload = (await response.json().catch(() => null)) as AuthSession | { message?: string } | null;
    if (!response.ok || !payload || !('accessToken' in payload)) {
      setAuthError(typeof payload?.message === 'string' ? payload.message : 'Falha ao autenticar.');
      return;
    }

    saveSession(payload);
    navigate(role === UserRole.Master ? '/master/dashboard' : '/player/join');
  };

  const content = useMemo(() => {
    if (path === '/') {
      return <HomePage />;
    }

    if (path === '/register') {
      return <RegisterPage onSubmit={register} error={authError} />;
    }

    if (path === '/login/master') {
      return <LoginPage role={UserRole.Master} onSubmit={(form) => login(UserRole.Master, form)} error={authError} />;
    }

    if (path === '/login/player') {
      return <LoginPage role={UserRole.Player} onSubmit={(form) => login(UserRole.Player, form)} error={authError} />;
    }

    if (path === '/master/dashboard' && session?.user.role === UserRole.Master) return <MasterDashboard user={session.user} onLogout={logout} />;
    if (path === '/master/setup' && session?.user.role === UserRole.Master) return <MasterSetup user={session.user} onLogout={logout} />;
    if (path === '/player/join' && session) return <PlayerJoin user={session.user} onLogout={logout} />;
    if (path === '/player/lobby' && session) return <PlayerLobby user={session.user} presence={presence} onLogout={logout} />;
    if (path === '/player/import' && session) return <PlayerImport user={session.user} onLogout={logout} />;
    if (path === '/master/game' && session?.user.role === UserRole.Master) return <MasterShell user={session.user} connected={connected} presence={presence} onLogout={logout} />;
    if (path === '/player/game' && session) return <PlayerVttScreen user={session.user} connected={connected} presence={presence} onLogout={logout} />;

    if (path === '/vtt/master') {
      if (!session) {
        navigate('/login/master');
        return null;
      }

      if (session.user.role !== UserRole.Master) {
        return (
          <main className="entry-shell">
            <section className="entry-card">
              <h1>Acesso negado</h1>
              <p>Somente contas Mestre podem abrir essa tela.</p>
              <button type="button" className="action-button" onClick={() => navigate('/vtt/player')}>
                Ir para tela de player
              </button>
            </section>
          </main>
        );
      }

      return <MasterShell user={session.user} connected={connected} presence={presence} onLogout={logout} />;
    }

    if (path === '/vtt/player') {
      if (!session) {
        navigate('/login/player');
        return null;
      }

      return <PlayerVttScreen user={session.user} connected={connected} presence={presence} onLogout={logout} />;
    }

    return (
      <main className="entry-shell">
        <section className="entry-card">
          <h1>Página não encontrada</h1>
          <button type="button" className="action-button" onClick={() => navigate('/')}>
            Voltar para Home
          </button>
        </section>
      </main>
    );
  }, [authError, connected, path, presence, session]);

  return content;
}

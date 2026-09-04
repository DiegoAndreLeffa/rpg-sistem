import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { DEFAULT_WS_NAMESPACE, GameEvents } from '@rpg/shared';
import type { Server, Socket } from 'socket.io';
import type { GameState } from '@rpg/shared';
import { JwtService } from '@nestjs/jwt';
import { CampaignAccessService, type CampaignRole } from '../common/campaign-access/campaign-access.service';

type JoinCampaignPayload = {
  campaignId: string;
};

type SocketUser = { id: string; role: CampaignRole };

type PresenceItem = {
  socketId: string;
  userId: string;
  role: 'MASTER' | 'PLAYER' | 'SPECTATOR';
  connectedAt: string;
};

@WebSocketGateway({
  namespace: DEFAULT_WS_NAMESPACE,
  cors: {
    origin: '*'
  }
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;
  private readonly campaignPresence = new Map<string, Map<string, PresenceItem>>();
  private readonly joinedCampaignsBySocket = new Map<string, Set<string>>();
  private readonly latestStateByCampaign = new Map<string, GameState>();

  constructor(private readonly campaignAccess: CampaignAccessService, private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token ?? client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
    try {
      const payload = this.jwtService.verify<{ sub: string; role: CampaignRole }>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret-change-me'
      });
      client.data.user = { id: payload.sub, role: payload.role } satisfies SocketUser;
    } catch {
      client.disconnect(true);
      return;
    }
    client.emit('connected', {
      socketId: client.id,
      namespace: DEFAULT_WS_NAMESPACE
    });
  }

  handleDisconnect(client: Socket): void {
    const joinedCampaigns = this.joinedCampaignsBySocket.get(client.id);
    if (!joinedCampaigns) {
      client.emit('disconnected', { socketId: client.id });
      return;
    }

    for (const campaignId of joinedCampaigns) {
      this.removePresence(campaignId, client.id);
      this.server.to(campaignId).emit(GameEvents.PlayerLeft, {
        campaignId,
        userId: this.userFor(client)?.id ?? 'unknown',
        socketId: client.id
      });
      this.emitPresenceSync(campaignId);
    }

    this.joinedCampaignsBySocket.delete(client.id);
    client.emit('disconnected', { socketId: client.id });
  }

  @SubscribeMessage('join_campaign')
  async onJoinCampaign(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinCampaignPayload) {
    if (!payload?.campaignId) {
      return { ok: false, message: 'campaignId is required.' };
    }

    const user = this.userFor(client);
    if (!user) return { ok: false, message: 'Authentication required.' };
    const role = await this.campaignAccess.requireAccess(payload.campaignId, user.id);
    await client.join(payload.campaignId);
    const socketCampaigns = this.joinedCampaignsBySocket.get(client.id) ?? new Set<string>();
    socketCampaigns.add(payload.campaignId);
    this.joinedCampaignsBySocket.set(client.id, socketCampaigns);

    this.addPresence(payload.campaignId, {
      socketId: client.id,
      userId: user.id,
      role,
      connectedAt: new Date().toISOString()
    });

    this.server.to(payload.campaignId).emit(GameEvents.PlayerJoined, {
      campaignId: payload.campaignId,
      userId: user.id,
      socketId: client.id
    });
    this.emitPresenceSync(payload.campaignId);

    const latestState = this.latestStateByCampaign.get(payload.campaignId);
    if (latestState) {
      client.emit(GameEvents.StateSync, {
        campaignId: payload.campaignId,
        state: this.filterStateForRole(latestState, role, user.id)
      });
    }

    return { ok: true, campaignId: payload.campaignId };
  }

  @SubscribeMessage('leave_campaign')
  async onLeaveCampaign(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinCampaignPayload) {
    if (!payload?.campaignId) {
      return { ok: false, message: 'campaignId is required.' };
    }

    const user = this.userFor(client);
    if (!user || !this.joinedCampaignsBySocket.get(client.id)?.has(payload.campaignId)) {
      return { ok: false, message: 'Campaign was not joined.' };
    }
    await client.leave(payload.campaignId);
    this.removePresence(payload.campaignId, client.id);
    const socketCampaigns = this.joinedCampaignsBySocket.get(client.id);
    if (socketCampaigns) {
      socketCampaigns.delete(payload.campaignId);
      if (socketCampaigns.size === 0) {
        this.joinedCampaignsBySocket.delete(client.id);
      } else {
        this.joinedCampaignsBySocket.set(client.id, socketCampaigns);
      }
    }

    this.server.to(payload.campaignId).emit(GameEvents.PlayerLeft, {
      campaignId: payload.campaignId,
      userId: user.id,
      socketId: client.id
    });
    this.emitPresenceSync(payload.campaignId);

    return { ok: true, campaignId: payload.campaignId };
  }

  @SubscribeMessage('request_presence')
  onRequestPresence(@ConnectedSocket() client: Socket, @MessageBody() payload: { campaignId?: string }) {
    if (!payload?.campaignId) {
      return { ok: false, message: 'campaignId is required.' };
    }

    if (!this.joinedCampaignsBySocket.get(client.id)?.has(payload.campaignId)) return { ok: false, message: 'Campaign was not joined.' };
    const presence = this.listPresence(payload.campaignId);
    client.emit(GameEvents.PresenceSync, {
      campaignId: payload.campaignId,
      players: presence
    });

    return { ok: true, players: presence };
  }

  async broadcastGameStateUpdated(campaignId: string, state: GameState): Promise<void> {
    this.latestStateByCampaign.set(campaignId, state);
    const sockets = await this.server.in(campaignId).fetchSockets();
    for (const socket of sockets) {
      const presence = this.campaignPresence.get(campaignId)?.get(socket.id);
      if (!presence) continue;
      socket.emit(GameEvents.MapUpdated, { campaignId, state: this.filterStateForRole(state, presence.role, presence.userId) });
    }
  }

  private addPresence(campaignId: string, item: PresenceItem): void {
    const current = this.campaignPresence.get(campaignId) ?? new Map<string, PresenceItem>();
    current.set(item.socketId, item);
    this.campaignPresence.set(campaignId, current);
  }

  private removePresence(campaignId: string, socketId: string): void {
    const current = this.campaignPresence.get(campaignId);
    if (!current) {
      return;
    }

    current.delete(socketId);
    if (current.size === 0) {
      this.campaignPresence.delete(campaignId);
      return;
    }

    this.campaignPresence.set(campaignId, current);
  }

  private listPresence(campaignId: string): PresenceItem[] {
    const current = this.campaignPresence.get(campaignId);
    if (!current) {
      return [];
    }

    return Array.from(current.values());
  }

  private emitPresenceSync(campaignId: string): void {
    this.server.to(campaignId).emit(GameEvents.PresenceSync, {
      campaignId,
      players: this.listPresence(campaignId)
    });
  }

  private userFor(client: Socket): SocketUser | null {
    const user = client.data.user as SocketUser | undefined;
    return user?.id ? user : null;
  }

  private filterStateForRole(state: GameState, role: CampaignRole, userId: string): GameState {
    if (role === 'MASTER') return state;
    const entities = state.entities.filter((entity) => entity.layer !== 'gm' && entity.character?.visibility !== 'gm' && (entity.character?.visibility !== 'owner' || entity.character.ownerUserId === userId));
    const ids = new Set(entities.map((entity) => entity.id));
    return { ...state, entities, lights: state.lights.filter((light) => ids.has(light.entityId)) };
  }
}

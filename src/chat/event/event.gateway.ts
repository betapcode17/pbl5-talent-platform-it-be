/* event.gateway.ts */

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from 'src/websocket/websocket.middleware.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@WebSocketGateway({ namespace: 'events' })
export class EventGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    client.use(
      SocketAuthMiddleware(this.jwtService, this.configService) as any,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @SubscribeMessage('message')
  sendChat(chat: ChatResponseI) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.server.emit('newChat', chat);
  }
}

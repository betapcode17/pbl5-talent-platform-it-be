import { Module } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { EventGateway } from './event/event.gateway.js';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret:
        process.env.ACCESS_TOKEN_SECRET ||
        'default-secret-key-change-in-production',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ChatService, EventGateway],
  controllers: [ChatController],
})
export class ChatModule {}

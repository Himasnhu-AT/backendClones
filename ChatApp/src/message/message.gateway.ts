import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('createMessage')
  /**
   * Creates a new message.
   *
   * @param createMessageDto - The data for creating the message.
   * @returns The created message.
   */
  async create(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);
    this.server.emit('message', message);
    return message;
  }

  @SubscribeMessage('findAllMessage')
  /**
   * Retrieves all messages.
   * @returns {Promise<Message[]>} A promise that resolves to an array of messages.
   */
  findAll() {
    return this.messageService.findAll();
  }

  @SubscribeMessage('join')
  /**
   * Joins a room with the specified name.
   *
   * @param name - The name of the room to join.
   * @param client - The connected socket client.
   * @returns A promise that resolves to the identification result.
   */
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.messageService.identify(name, client.id);
  }

  @SubscribeMessage('typing')
  /**
   * Handles the typing event.
   *
   * @param isTyping - A boolean indicating whether the user is typing or not.
   * @param client - The connected socket client.
   */
  typing(
    @MessageBody('isTyping') isTypeing: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = this.messageService.getClientByName(client.id);
    client.broadcast.emit('typing', { name, isTypeing });
  }
}

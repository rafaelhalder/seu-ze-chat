import type { Message } from "@/domain/entities/Message";
import type { IMessageRepository } from "@/domain/interfaces/IMessageRepository";
import { prisma } from "@/infrastructure/database/prisma/prisma";

export class MessageRepository implements IMessageRepository {
  async save(message: Message): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          id: message.id,
          remoteJid: message.remoteJid,
          conversation: message.content,
          dateTime: message.timestamp,
          eventType: message.type,
          fromMe: message.fromMe,
          messageType: message.type,
          pushName: message.pushName || '',
          answered: false,
          createdAt: new Date(),
        }
      });
      console.log(`Mensagem salva com sucesso: ${message.id}`);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      throw new Error('Falha ao salvar mensagem no banco de dados');
    }
  }
}
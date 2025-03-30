import {Message, MessageType} from '../../domain/entities/Message';
import {prisma} from '../../infrastructure/database/prisma/prisma';
import { MessageSenderService } from './MessageSenderService';

export class MessageHandlerService {
  constructor(private messageSender: MessageSenderService) {}

  async handlerMessage(message:Message): Promise<void>{
    try{
      console.log('Mensagem recebida:', message);

      await this.saveMessage(message);
      if(this.shouldRespond(message)){
        const response = await this.generateResponse(message);
        await this.sendResponse(message.remoteJid, response);
      }

    }catch(error){
      console.error('Erro ao processar mensagem:', error);
    }
  }

  private async saveMessage(message: Message): Promise<void> {
    console.log(`Salvando mensagem ${message.id} no banco de dados`);
    await prisma.message.create({
      data: {
        id: message.id,
        remoteJid: message.remoteJid,
        conversation: message.content,
        dateTime: message.timestamp,
        eventType: message.type,
        fromMe: message.fromMe,
        messageType: message.type,
        pushName: message.pushName,
        answered: false,
        createdAt: new Date(),
      }
    });
  }

  private shouldRespond(message: Message): boolean {
    if(message.fromMe){
      return false; // Não responder mensagens enviadas pelo bot
    }

    if(message.remoteJid.includes('@g.us')){
      return false; // Não responder mensagens de grupos
    }
    return true; // Responder mensagens individuais
  }

  private async generateResponse(message: Message): Promise<string> {
    // Aqui você implementa sua lógica de chatbot/resposta
    // Pode ser desde regras simples até integração com uma API
    
    switch (message.type) {
      case MessageType.TEXT:
        // Lógica para tratar mensagens de texto
        if (message.content.toLowerCase().includes('olá') || 
            message.content.toLowerCase().includes('oi')) {
          return `Olá ${message.pushName || ''}! Como posso ajudar?`;
        }
        break;
        
      case MessageType.AUDIO:
        // Resposta para mensagens de áudio
        return "Recebi seu áudio, mas ainda não consigo processá-lo.";
        
      case MessageType.STICKER:
        // Resposta para stickers
        return "Obrigado pelo sticker! 😊";
        
      default:
        // Resposta padrão
        return "Recebi sua mensagem. Em breve responderemos.";
    }
    
    // Resposta padrão se nenhuma condição for atendida
    return "Agradecemos seu contato! Como podemos ajudar?";
  }

  private async sendResponse(to: string, message: string): Promise<void> {
    console.log(`Enviando resposta para ${to}: ${message}`);
    await this.messageSender.sendMessage(to, message);
  }
}
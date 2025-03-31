// import {type Message, MessageType} from '../../domain/entities/Message';
// import {prisma} from '../../infrastructure/database/prisma/prisma';
// import type { MessageSenderService } from '../../infrastructure/services/MessageSenderService';
// import { OpenAIService } from '../../infrastructure/ai/OpenAIService';
// import { ConversationMemoryService } from './ConversationMemoryService';
// import type { IMessageRepository } from '@/domain/interfaces/IMessageRepository';

// export class MessageHandlerService {
//   private openAIService: OpenAIService;
//   private memoryService: ConversationMemoryService;
//   constructor(private messageSender: MessageSenderService,
//   private messageRepository: IMessageRepository
//   ) {}

//   async handlerMessage(message: Message): Promise<void>{
//     try{
//       console.log('Mensagem recebida:', message);

//       await this.saveMessage(message);
      
//       // Processar análise de sentimento e extração de informações
//       if (message.type === MessageType.TEXT) {
//         this.processMessageInformation(message);
//       }
      
//       if(this.shouldRespond(message)){
//         const response = await this.generateResponse(message);
//         await this.sendResponse(message.remoteJid, response);
//       }

//     }catch(error){
//       console.error('Erro ao processar mensagem:', error);
//     }
//   }

//   private async saveMessage(message: Message): Promise<void> {
//     console.log(`Salvando mensagem ${message.id} no banco de dados`);
//     await prisma.message.create({
//       data: {
//         id: message.id,
//         remoteJid: message.remoteJid,
//         conversation: message.content,
//         dateTime: message.timestamp,
//         eventType: message.type,
//         fromMe: message.fromMe,
//         messageType: message.type,
//         pushName: message.pushName,
//         answered: false,
//         createdAt: new Date(),
//       }
//     });
//   }

//   private shouldRespond(message: Message): boolean {
//     if(message.fromMe){
//       return false; // Não responder mensagens enviadas pelo bot
//     }

//     if(message.remoteJid.includes('@g.us')){
//       return false; // Não responder mensagens de grupos
//     }
//     return true; // Responder mensagens individuais
//   }

//   private async processMessageInformation(message: Message): Promise<void> {
//     try {
//       // Executar em paralelo para melhor performance
//       const [sentiment, keyInformation] = await Promise.all([
//         this.openAIService.analyzeSentiment(message.content),
//         this.openAIService.extractKeyInformation(message.content)
//       ]);
      
//       console.log(`Sentimento detectado: ${sentiment}`);
//       console.log('Informações extraídas:', keyInformation);
      
//       // Salvar informações extraídas
//       if (Object.keys(keyInformation).length > 0) {
//         await this.memoryService.saveKeyInformation(message.remoteJid, keyInformation);
//       }
      
//       // Salvar sentimento
//       await this.memoryService.saveSentiment(message.remoteJid, sentiment);
      
//     } catch (error) {
//       console.error('Erro ao processar informações da mensagem:', error);
//     }
//   }

//   private async generateResponse(message: Message): Promise<string> {
//     try {
//       // Para mensagens de texto, usar o serviço de IA
//       if (message.type === MessageType.TEXT) {
//         // Recuperar informações do usuário para contextualização
//         const userInfo = await this.memoryService.getUserInformation(message.remoteJid);
        
//         // Gerar resposta com IA, considerando histórico e informações do usuário
//         return await this.openAIService.generateResponse(
//           message.remoteJid,
//           message.pushName || 'Cliente',
//           message.content
//         );
//       }
      
//       // Para outros tipos de mensagem, manter o comportamento existente
//       switch (message.type) {
//         case MessageType.AUDIO:
//           return "Recebi seu áudio, mas ainda não consigo processá-lo.";
          
//         case MessageType.STICKER:
//           return "Obrigado pelo sticker! 😊";
          
//         default:
//           return "Recebi sua mensagem. Como posso ajudar?";
//       }
//     } catch (error) {
//       console.error('Erro ao gerar resposta:', error);
//       return "Desculpe, estou com dificuldades para responder no momento. Por favor, tente novamente mais tarde.";
//     }
//   }

//   private async sendResponse(to: string, message: string): Promise<void> {
//     console.log(`Enviando resposta para ${to}: ${message}`);
//     await this.messageSender.sendMessage(to, message);
//   }
// }
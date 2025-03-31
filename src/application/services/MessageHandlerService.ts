import { Message, MessageType } from "@/domain/entities/Message";
import type { IMessageRepository } from "@/domain/interfaces/IMessageRepository";
import type { IMessageHandler } from "@/domain/interfaces/IMessageHandler";

export class MessageHandlerService implements IMessageHandler {
  constructor(
    private messageRepository: IMessageRepository
  ) {}

  async handleMessage(message: Message): Promise<void> {
    try {
      console.log("Mensagem recebida:", message);
      
      // Salvar a mensagem no repositório
      await this.messageRepository.save(message);
      
      // Verificar se é mensagem de texto
      if (message.type === MessageType.TEXT) {
        await this.processMessageInformation(message);
      }
      
      // Verificar se deve responder
      if (this.shouldRespond(message)) {
        const response = await this.generateResponse(message);
        await this.sendResponse(message.remoteJid, response);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    }
  }

  /**
   * Processa informações da mensagem (versão temporária)
   */
  private async processMessageInformation(message: Message): Promise<void> {
    console.log("Processando informações da mensagem (será implementado no futuro)");
    // Implementação futura: análise de sentimento e extração de informações
  }

  /**
   * Determina se deve responder a mensagem
   */
  private shouldRespond(message: Message): boolean {
    // Não responder mensagens enviadas pelo próprio bot
    if (message.fromMe) {
      return false;
    }

    // Não responder mensagens de grupos
    if (message.remoteJid.includes('@g.us')) {
      return false;
    }
    
    return true; // Responder mensagens individuais
  }

  /**
   * Gera uma resposta para a mensagem (versão temporária)
   */
  private async generateResponse(message: Message): Promise<string> {
    console.log("Gerando resposta (será implementado no futuro)");
    
    // Resposta padrão temporária
    return "Olá! Recebi sua mensagem. Em breve estarei configurado para responder adequadamente.";
  }

  /**
   * Envia a resposta (versão temporária)
   */
  private async sendResponse(to: string, message: string): Promise<void> {
    console.log(`Simulando envio de resposta para ${to}: ${message}`);
    // Implementação futura: usar serviço de envio de mensagens
  }
}
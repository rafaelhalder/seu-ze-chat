import type { IWebSocketClient } from '@/domain/interfaces/IWebSocketClient';
import type { IMessageSender } from '@/domain/interfaces/IMessageSender';
import type { IMessageHandler } from '@/domain/interfaces/IMessageHandler';
import { Message, MessageType } from '@/domain/entities/Message';
import type { IWebSocketService } from '@/domain/interfaces/IWebSocketService';

export class WebSocketClientService implements IWebSocketService {
  constructor(
    private client: IWebSocketClient,
    private messageSender: IMessageSender,
    private messageHandler: IMessageHandler
  ) {}
  
  public initialize(): void {
    this.client.connect();
    this.setupEventListeners();
  }
  
  public closeConnection(): void {
    this.client.disconnect();
  }
  
  public isConnected(): boolean {
    return this.client.isConnected();
  }
  
  /**
   * Envia mensagem via WebSocket
   */
  public sendMessage(event: string, data: any): void {
    this.client.emit(event, data);
  }
  
  /**
   * Configura os listeners de eventos
   */
  private setupEventListeners(): void {
    // Event listeners para eventos do sistema
    this.client.on('qr', (qrData) => {
      console.log('QR Code recebido:', qrData);
    });
    
    this.client.on('connection-status', (status) => {
      console.log('Status da conexão WhatsApp:', status);
    });

    // Listener para mensagens - este é o mais importante
    this.client.on('message', (evolutionData) => {
      console.log('Nova mensagem:', evolutionData);
      
      // Converter dados brutos para objeto Message
      const message = this.convertToMessageEntity(evolutionData);
      
      // Se a conversão foi bem-sucedida, passar para o handler
      if (message) {
        this.messageHandler.handleMessage(message);
      }
    });
    
    // Também podemos ouvir o evento messages.upsert diretamente
    this.client.on('messages.upsert', (evolutionData) => {
      console.log('Evento messages.upsert recebido');
      
      // Converter e processar da mesma forma
      const message = this.convertToMessageEntity(evolutionData);
      if (message) {
        this.messageHandler.handleMessage(message);
      }
    });
  }
  
  /**
   * Converte dados brutos da Evolution API para nossa entidade Message
   */
  private convertToMessageEntity(evolutionData: any): Message | null {
    try {
      // Verificar se a estrutura básica existe
      if (!evolutionData || !evolutionData.data || !evolutionData.data.key) {
        console.warn('Estrutura de mensagem inválida');
        return null;
      }
      
      const { data } = evolutionData;
      let messageType = MessageType.UNKNOWN;
      let content = '';
      
      // Determinar tipo de mensagem e extrair conteúdo
      if (data.messageType === 'conversation' && data.message?.conversation) {
        messageType = MessageType.TEXT;
        content = data.message.conversation;
      } 
      else if (data.messageType === 'stickerMessage' && data.message?.stickerMessage) {
        messageType = MessageType.STICKER;
        content = 'Sticker';
      }
      else if (data.messageType === 'audioMessage' && data.message?.audioMessage) {
        messageType = MessageType.AUDIO;
        content = 'Mensagem de áudio recebida';
      }
      else if (data.message?.imageMessage) {
        messageType = MessageType.IMAGE;
        content = data.message.imageMessage.caption || 'Imagem recebida';
      }
      else if (data.message?.videoMessage) {
        messageType = MessageType.VIDEO;
        content = data.message.videoMessage.caption || 'Vídeo recebido';
      }
      else if (data.message?.documentMessage) {
        messageType = MessageType.DOCUMENT;
        content = data.message.documentMessage.fileName || 'Documento recebido';
      }
      
      // Criar e retornar entidade Message
      return new Message({
        id: data.key.id,
        remoteJid: data.key.remoteJid,
        fromMe: data.key.fromMe,
        pushName: data.pushName,
        timestamp: new Date(data.messageTimestamp * 1000),
        type: messageType,
        content: content,
        rawData: data // Guardar dados brutos para referência futura
      });
      
    } catch (error) {
      console.error('Erro ao converter mensagem:', error);
      return null;
    }
  }
}
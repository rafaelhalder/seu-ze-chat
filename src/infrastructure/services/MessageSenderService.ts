import axios from "axios";
import { WebSocketClient } from "@/infrastructure/websocket/WebSocketClient";
import { env } from "@/env";
import type { IMessageSender } from "@/domain/interfaces/ImessageSender";
export class MessageSenderService implements IMessageSender{
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly instance: string;
  private webSocketClient?: WebSocketClient;

  constructor(apiBaseUrl: string, apiKey: string, instance: string, webSocketClient?: WebSocketClient) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    this.instance = instance;
  }

  public async sendMessage(phoneNumber: string, message: string): Promise<void>{
    try{
      const formattedPhone = phoneNumber.includes('@')? phoneNumber.split('@')[0]: phoneNumber;
      const response = await axios.post(env.URL_SEND_MESSAGE_WHATSAPP, {
        number: formattedPhone,
        text: message
      },{
        headers:{
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        }
      })
      return response.data;
    }catch(error){
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  /**
   * Enviar mensagem via WebSocket (fallback ou uso alternativo)
   */
  public sendMessageViaWebSocket(event: string, data: any): void {
    if (!this.webSocketClient) {
      console.warn('Cliente WebSocket não disponível para envio');
      return;
    }
    
    this.webSocketClient.emit(event, data);
  }

  /**
   * Enviar arquivo/mídia
   */
  public async sendMedia(phoneNumber: string, url: string, caption?: string, fileName?: string): Promise<any> {
    try {
      const formattedPhone = phoneNumber.includes('@') 
        ? phoneNumber.split('@')[0] 
        : phoneNumber;
      
      const endpoint = `${this.apiBaseUrl}/message/sendMedia/${this.instance}`;
      
      const response = await axios.post(endpoint, {
        number: formattedPhone,
        mediaUrl: url,
        caption: caption || '',
        fileName: fileName || 'file'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      throw error;
    }
  }
}
export interface IMessageSender {
  sendMessage(phoneNumber: string, message: string): Promise<any>;
  sendMedia(phoneNumber: string, mediaUrl: string, caption?: string): Promise<any>;
}
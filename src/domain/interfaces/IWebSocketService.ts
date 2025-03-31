export interface IWebSocketService {
  initialize(): void;
  closeConnection(): void;
  isConnected(): boolean;
  sendMessage(event: string, data: any): void;
}
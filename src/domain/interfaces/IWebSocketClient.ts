export interface IWebSocketClient{
  connect(): void;
  disconnect(): void;
  isConnected(): boolean;
  on(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
}
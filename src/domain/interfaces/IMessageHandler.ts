export interface IMessageHandler {
  handleMessage(message: any): Promise<void>;
}
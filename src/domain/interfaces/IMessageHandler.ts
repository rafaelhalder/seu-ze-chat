import type { Message } from "../entities/Message";

export interface IMessageHandler {
  handleMessage(message: Message): Promise<void>;
}
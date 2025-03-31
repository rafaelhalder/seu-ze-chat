import { MessageRepository } from "@/infrastructure/repositories/MessageRepository";
import { MessageHandlerService } from "@/application/services/MessageHandlerService";

// Instanciar o repositório
const messageRepository = new MessageRepository();

// Instanciar o serviço com a dependência
export const messageHandlerService = new MessageHandlerService(
  messageRepository
);
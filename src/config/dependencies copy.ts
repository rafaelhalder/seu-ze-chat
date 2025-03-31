// import { MessageRepository } from '../infrastructure/repositories/MessageRepository';
// import { OpenAIService } from '../infrastructure/ai/OpenAIService';
// import { MessageSenderService } from '../infrastructure/services/MessageSenderService';
// import { ConversationMemoryService } from '../application/services/ConversationMemoryService';
// import { MessageHandlerService } from '../application/services/MessageHandlerService';
// import { env } from '../env';

// // Instanciar repositórios
// const messageRepository = new MessageRepository();

// // Instanciar serviços de infraestrutura
// const openAIService = new OpenAIService();
// const messageSenderService = new MessageSenderService(
//   env.EVOLUTION_URL_WITH_INSTANCE,
//   env.APIKEY,
//   env.INSTANCE
// );
// const memoryService = new ConversationMemoryService();

// // Instanciar serviços de aplicação com suas dependências
// export const messageHandlerService = new MessageHandlerService(
//   messageSenderService,
//   openAIService,
//   memoryService,
//   messageRepository
// );
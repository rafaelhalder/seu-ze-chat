import { prisma } from '@/infrastructure/database/prisma/prisma';

export class ConversationMemoryService {
  /**
   * Salva uma informação importante extraída da conversa
   */
  public async saveKeyInformation(userId: string, information: Record<string, any>): Promise<void> {
    try {
      // Verificar se o usuário já existe
      let user = await prisma.user.findFirst({
        where: {
          phoneNumber: userId
        }
      });
      
      // Se não existe, criar
      if (!user) {
        user = await prisma.user.create({
          data: {
            phoneNumber: userId,
            // Outros campos necessários
          }
        });
      }
      
      // Para cada informação extraída, atualizar ou criar
      for (const [key, value] of Object.entries(information)) {
        // Implementar lógica para salvar diferentes tipos de informação
        // Este é um exemplo simples - ajuste conforme seu schema
        await prisma.userMetadata.upsert({
          where: {
            userId_key: {
              userId: user.id,
              key: key
            }
          },
          update: {
            value: String(value)
          },
          create: {
            userId: user.id,
            key: key,
            value: String(value)
          }
        });
      }
    } catch (error) {
      console.error('Erro ao salvar informações da conversa:', error);
    }
  }
  
  /**
   * Salva o sentimento analisado
   */
  public async saveSentiment(userId: string, sentiment: number): Promise<void> {
    try {
      // Verificar se o usuário já existe
      let user = await prisma.user.findFirst({
        where: {
          phoneNumber: userId
        }
      });
      
      if (!user) return;
      
      // Salvar sentimento
      await prisma.userSentiment.create({
        data: {
          userId: user.id,
          date: new Date(),
          sentiment: sentiment
        }
      });
    } catch (error) {
      console.error('Erro ao salvar sentimento:', error);
    }
  }
  
  /**
   * Recupera informações importantes de um usuário
   */
  public async getUserInformation(userId: string): Promise<Record<string, string>> {
    try {
      // Buscar usuário
      const user = await prisma.user.findFirst({
        where: {
          phoneNumber: userId
        },
        include: {
          metadata: true
        }
      });
      
      if (!user) return {};
      
      // Transformar em objeto simples
      const information: Record<string, string> = {};
      
      if (user.metadata) {
        user.metadata.forEach(meta => {
          information[meta.key] = meta.value;
        });
      }
      
      return information;
    } catch (error) {
      console.error('Erro ao recuperar informações do usuário:', error);
      return {};
    }
  }
}
import { generateText } from "ai";
import { openai } from "@/application/clients/openai";
import { prisma } from '../database/prisma/prisma';

export class OpenAIService {

  /**
   * Gera uma resposta baseada na conversa histórica e mensagem atual
   */
  public async generateResponse(remoteJid: string, userName: string, currentMessage: string): Promise<string> {
    try {
      // Recuperar histórico recente da conversa
      const conversationHistory = await this.getConversationHistory(remoteJid);

      // Preparar o prompt para o modelo
      const prompt = this.buildPrompt(userName, conversationHistory, currentMessage);

      // Chamar a API da OpenAI
      const response = await generateText({
        model: openai,
        messages: prompt,
        maxTokens: 300,
        temperature: 0.7,
        maxSteps: 5,
        system: `Você é uma pessoa cuidadosa e atenciosa chamada João. Seu tom é caloroso e acolhedor,
        como um amigo que sempre se importa. Mantenha suas palavras humanizadas querendo puxar assunto.
        não seja tão direto mas tambem não seja tão enrolado.
        Se não souber algo, apenas diga que não tem essa informação. Nunca se esqueça de ser autêntico, sempre mostrando um interesse genuíno pelas necessidades dos outros.
        Sempre escreva suas respostas em formato markdown, sem usar código de formatação (\`\`\`)`.trim()
      })

      return response.text || "Desculpe, não consegui entender sua mensagem. Poderia reformular?";

    } catch (error) {
      console.error('Erro ao gerar resposta com OpenAI:', error);
      return "Estou com dificuldades técnicas no momento, por favor tente novamente mais tarde.";
    }
  }

  /**
   * Recupera o histórico de conversa do banco de dados
   */
  private async getConversationHistory(remoteJid: string): Promise<Array<{ content: string, fromMe: boolean }>> {
    // Recuperar últimas 10 mensagens dessa conversa
    const messages = await prisma.message.findMany({
      where: {
        remoteJid: remoteJid,
      },
      orderBy: {
        dateTime: 'desc',
      },
      take: 10,
    });

    // Inverter para ordem cronológica
    return messages
      .reverse()
      .map(msg => ({
        content: msg.conversation || '',
        fromMe: msg.fromMe
      }));
  }

  /**
   * Constrói o prompt para o modelo de IA
   */
  private buildPrompt(userName: string, history: Array<{ content: string, fromMe: boolean }>, currentMessage: string): any[] {
    const messages: any[] = [];

    // Adicionar histórico de conversa ao prompt
    history.forEach(msg => {
      if (msg.fromMe) {
        messages.push({ role: "assistant", content: msg.content });
      } else {
        messages.push({ role: "user", content: `${userName}: ${msg.content}` });
      }
    });

    // Adicionar mensagem atual
    messages.push({ role: "user", content: `${userName}: ${currentMessage}` });

    return messages;
  }

  /**
   * Analisa o sentimento da mensagem
   */
  public async analyzeSentiment(message: string): Promise<number> {
    try {

      // Chamar a API da OpenAI
      const response = await generateText({
        model: openai,
        messages: [
          {
            role: "system",
            content: `Avalie o sentimento da seguinte mensagem em uma escala de -1 a 1,
                  onde -1 é extremamente negativo, 0 é neutro, e 1 é extremamente positivo.
                  Retorne APENAS o número, sem texto adicional.`
          },
          { role: "user", content: message }
        ],
        maxTokens: 300,
        temperature: 0.7,
        maxSteps: 5,
      })


      const sentimentScore = parseFloat(response.text || "0");
      return isNaN(sentimentScore) ? 0 : sentimentScore;

    } catch (error) {
      console.error('Erro ao analisar sentimento:', error);
      return 0; // Neutro em caso de erro
    }
  }

  /**
   * Extrai informações importantes da mensagem
   */
  public async extractKeyInformation(message: string): Promise<Record<string, any>> {
    try {

      // Chamar a API da OpenAI
      const response = await generateText({
        model: openai,
        messages: [
          {
            role: "system",
            content: `Extraia informações importantes da seguinte mensagem, como:
                        - Datas (aniversários, casamentos, eventos)
                        - Nomes de pessoas mencionadas
                        - Preferências pessoais
                        - Locais importantes
                        
                        Se não houver informações relevantes, retorne um objeto JSON vazio {}.
                        Caso contrário, retorne um objeto JSON com as informações encontradas.
                        Exemplo: {"aniversario": "15/05", "nome_conjuge": "Maria"}`
          },
          { role: "user", content: message }
        ],
        maxTokens: 300,
        temperature: 0.3,
        maxSteps: 5,
      })

      const content = response.text || "{}";
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error('Erro ao parsear resposta JSON:', e);
        return {};
      }

    } catch (error) {
      console.error('Erro ao extrair informações:', error);
      return {};
    }
  }
}

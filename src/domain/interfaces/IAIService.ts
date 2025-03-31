export interface IAIService {
  analyzeSentimental(content: string): Promise<number>;
  extractKeyInformation(content: string): Promise <Record<string, any>>
  generateResponse(remoteJid: string,userName:string, content: string): Promise<string>;
}
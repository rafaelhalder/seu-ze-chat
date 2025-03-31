export interface IMemoryService {
  saveKeyInformation(userId: string, information: Record<string, any>): Promise<void>;
  saveSentiment(userId: string, sentiment: number): Promise<void>;
  getUserInformation(userId: string): Promise<Record<string, any>>;
}
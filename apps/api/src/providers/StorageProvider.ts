export interface StorageProvider {
  save(buffer: Buffer, filename: string): Promise<string>;
  getUrl(filename: string): string;
  delete(filename: string): Promise<void>;
}

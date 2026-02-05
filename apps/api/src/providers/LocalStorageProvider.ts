import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './StorageProvider';

export class LocalStorageProvider implements StorageProvider {
  private outputDir: string;
  private baseUrl: string;

  constructor(outputDir: string = '/tmp/rapper-toon-outputs', baseUrl: string = '/outputs') {
    this.outputDir = outputDir;
    this.baseUrl = baseUrl;
  }

  async init(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async save(buffer: Buffer, filename: string): Promise<string> {
    const filepath = path.join(this.outputDir, filename);
    await fs.writeFile(filepath, buffer);
    return filename;
  }

  getUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    const filepath = path.join(this.outputDir, filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.outputDir, filename);
  }
}

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './StorageProvider';

export class S3StorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor(config: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    region?: string;
  }) {
    this.bucket = config.bucket;
    this.endpoint = config.endpoint;

    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region || 'us-east-1',
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey
      }
    });
  }

  async save(buffer: Buffer, filename: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: buffer,
      ContentType: this.getContentType(filename)
    });

    await this.s3Client.send(command);
    return filename;
  }

  getUrl(filename: string): string {
    // Return public URL or presigned URL
    return `${this.endpoint}/${this.bucket}/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filename
    });

    await this.s3Client.send(command);
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig, ConfigKey } from '../entities/app-config.entity';
import * as crypto from 'crypto';

@Injectable()
export class ConfigService {
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

  constructor(
    @InjectRepository(AppConfig)
    private configRepository: Repository<AppConfig>,
  ) {}

  async getConfig(key: ConfigKey): Promise<string | null> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) return null;
    
    if (config.isEncrypted) {
      return this.decrypt(config.value);
    }
    return config.value;
  }

  async setConfig(key: ConfigKey, value: string, description?: string, encrypt: boolean = false): Promise<AppConfig> {
    let finalValue = value;
    if (encrypt) {
      finalValue = this.encrypt(value);
    }

    let existingConfig = await this.configRepository.findOne({ where: { key } });
    
    if (existingConfig) {
      existingConfig.value = finalValue;
      existingConfig.isEncrypted = encrypt;
      if (description) existingConfig.description = description;
      return this.configRepository.save(existingConfig);
    }

    // Create new config
    const config = this.configRepository.create({
      key,
      value: finalValue,
      description,
      isEncrypted: encrypt,
    });
    return this.configRepository.save(config);
  }

  async getAllConfigs(): Promise<AppConfig[]> {
    return this.configRepository.find({ order: { key: 'ASC' } });
  }

  async deleteConfig(key: ConfigKey): Promise<void> {
    await this.configRepository.delete({ key });
  }


  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig, ConfigKey } from '../entities/app-config.entity';
import { EmailConfig, EmailConfigKey } from '../entities/email-config.entity';
import * as crypto from 'crypto';

@Injectable()
export class ConfigService {
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

  constructor(
    @InjectRepository(AppConfig)
    private configRepository: Repository<AppConfig>,
    @InjectRepository(EmailConfig)
    private emailConfigRepository: Repository<EmailConfig>,
  ) {}

  async getConfig(key: ConfigKey | EmailConfigKey): Promise<string | null> {
    // Try AppConfig first
    let config = await this.configRepository.findOne({ where: { key: key as ConfigKey } });
    
    // If not found in AppConfig, try EmailConfig
    if (!config) {
      const emailConfig = await this.emailConfigRepository.findOne({ where: { key: key as EmailConfigKey } });
      if (!emailConfig) return null;
      
      if (emailConfig.isEncrypted) {
        return this.decrypt(emailConfig.value);
      }
      return emailConfig.value;
    }

    if (config.isEncrypted) {
      return this.decrypt(config.value);
    }
    return config.value;
  }

  async setConfig(key: ConfigKey | EmailConfigKey, value: string, description?: string, encrypt: boolean = false): Promise<AppConfig | EmailConfig> {
    let finalValue = value;
    if (encrypt) {
      finalValue = this.encrypt(value);
    }

    // Try AppConfig first
    let existingConfig = await this.configRepository.findOne({ where: { key: key as ConfigKey } });
    
    if (existingConfig) {
      existingConfig.value = finalValue;
      existingConfig.isEncrypted = encrypt;
      if (description) existingConfig.description = description;
      return this.configRepository.save(existingConfig);
    }

    // Try EmailConfig
    let existingEmailConfig = await this.emailConfigRepository.findOne({ where: { key: key as EmailConfigKey } });
    
    if (existingEmailConfig) {
      existingEmailConfig.value = finalValue;
      existingEmailConfig.isEncrypted = encrypt;
      if (description) existingEmailConfig.description = description;
      return this.emailConfigRepository.save(existingEmailConfig);
    }

    // Create new config - determine which repository to use based on key type
    if (Object.values(ConfigKey).includes(key as ConfigKey)) {
      const config = this.configRepository.create({
        key: key as ConfigKey,
        value: finalValue,
        description,
        isEncrypted: encrypt,
      });
      return this.configRepository.save(config);
    } else {
      const emailConfig = this.emailConfigRepository.create({
        key: key as EmailConfigKey,
        value: finalValue,
        description,
        isEncrypted: encrypt,
      });
      return this.emailConfigRepository.save(emailConfig);
    }
  }

  async getAllConfigs(): Promise<AppConfig[]> {
    return this.configRepository.find({ order: { key: 'ASC' } });
  }

  async deleteConfig(key: ConfigKey | EmailConfigKey): Promise<void> {
    // Try to delete from AppConfig first
    const appResult = await this.configRepository.delete({ key: key as ConfigKey });
    
    // If not found in AppConfig, try EmailConfig
    if (appResult.affected === 0) {
      await this.emailConfigRepository.delete({ key: key as EmailConfigKey });
    }
  }

  // Stripe-specific methods
  async getStripeConfig(): Promise<{
    secretKey?: string;
    publishableKey?: string;
    webhookSecret?: string;
    currency?: string;
    mode?: string;
    accountId?: string;
  }> {
    const [
      secretKey,
      publishableKey,
      webhookSecret,
      currency,
      mode,
      accountId,
    ] = await Promise.all([
      this.getConfig(ConfigKey.STRIPE_SECRET_KEY),
      this.getConfig(ConfigKey.STRIPE_PUBLISHABLE_KEY),
      this.getConfig(ConfigKey.STRIPE_WEBHOOK_SECRET),
      this.getConfig(ConfigKey.STRIPE_CURRENCY),
      this.getConfig(ConfigKey.STRIPE_MODE),
      this.getConfig(ConfigKey.STRIPE_ACCOUNT_ID),
    ]);

    return {
      secretKey: secretKey || undefined,
      publishableKey: publishableKey || undefined,
      webhookSecret: webhookSecret || undefined,
      currency: currency || 'usd',
      mode: mode || 'test',
      accountId: accountId || undefined,
    };
  }

  async setStripeConfig(config: {
    secretKey?: string;
    publishableKey?: string;
    webhookSecret?: string;
    currency?: string;
    mode?: string;
    accountId?: string;
  }): Promise<void> {
    const promises: Promise<AppConfig | EmailConfig>[] = [];

    if (config.secretKey) {
      promises.push(this.setConfig(ConfigKey.STRIPE_SECRET_KEY, config.secretKey, 'Stripe Secret Key', true));
    }
    if (config.publishableKey) {
      promises.push(this.setConfig(ConfigKey.STRIPE_PUBLISHABLE_KEY, config.publishableKey, 'Stripe Publishable Key'));
    }
    if (config.webhookSecret) {
      promises.push(this.setConfig(ConfigKey.STRIPE_WEBHOOK_SECRET, config.webhookSecret, 'Stripe Webhook Secret', true));
    }
    if (config.currency) {
      promises.push(this.setConfig(ConfigKey.STRIPE_CURRENCY, config.currency, 'Stripe Currency'));
    }
    if (config.mode) {
      promises.push(this.setConfig(ConfigKey.STRIPE_MODE, config.mode, 'Stripe Mode (test/live)'));
    }
    if (config.accountId) {
      promises.push(this.setConfig(ConfigKey.STRIPE_ACCOUNT_ID, config.accountId, 'Stripe Account ID'));
    }

    await Promise.all(promises);
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

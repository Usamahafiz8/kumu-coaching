import { BadRequestException } from '@nestjs/common';

export class ValidationUtil {
  /**
   * Validate UUID format
   */
  static validateUUID(id: string, fieldName: string = 'ID'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format`);
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): void {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('Invalid phone number format');
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate string length
   */
  static validateStringLength(value: string, fieldName: string, minLength: number, maxLength: number): void {
    if (value.length < minLength) {
      throw new BadRequestException(`${fieldName} must be at least ${minLength} characters long`);
    }
    
    if (value.length > maxLength) {
      throw new BadRequestException(`${fieldName} must not exceed ${maxLength} characters`);
    }
  }

  /**
   * Validate numeric range
   */
  static validateNumericRange(value: number, fieldName: string, min: number, max: number): void {
    if (value < min) {
      throw new BadRequestException(`${fieldName} must be at least ${min}`);
    }
    
    if (value > max) {
      throw new BadRequestException(`${fieldName} must not exceed ${max}`);
    }
  }

  /**
   * Validate enum value
   */
  static validateEnumValue(value: any, fieldName: string, allowedValues: any[]): void {
    if (!allowedValues.includes(value)) {
      throw new BadRequestException(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate and sanitize object
   */
  static validateAndSanitizeObject<T>(data: any, validationRules: {
    [K in keyof T]?: {
      required?: boolean;
      type?: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'phone';
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      enum?: any[];
      sanitize?: boolean;
    };
  }): T {
    const result: any = {};

    for (const [field, rules] of Object.entries(validationRules)) {
      const rule = rules as {
        required?: boolean;
        type?: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'phone';
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        enum?: any[];
        sanitize?: boolean;
      };
      const value = data[field];

      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        throw new BadRequestException(`${field} is required`);
      }

      // Skip validation if value is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      let processedValue = value;

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new BadRequestException(`${field} must be a string`);
            }
            if (rule.sanitize) {
              processedValue = this.sanitizeString(value);
            }
            break;
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              throw new BadRequestException(`${field} must be a number`);
            }
            processedValue = Number(value);
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new BadRequestException(`${field} must be a boolean`);
            }
            break;
          case 'email':
            this.validateEmail(value);
            break;
          case 'uuid':
            this.validateUUID(value, field);
            break;
          case 'phone':
            this.validatePhoneNumber(value);
            break;
        }
      }

      // Length validation for strings
      if (rule.type === 'string' && typeof processedValue === 'string') {
        if (rule.minLength !== undefined) {
          this.validateStringLength(processedValue, field, rule.minLength, rule.maxLength || Infinity);
        } else if (rule.maxLength !== undefined) {
          this.validateStringLength(processedValue, field, 0, rule.maxLength);
        }
      }

      // Numeric range validation
      if (rule.type === 'number' && typeof processedValue === 'number') {
        if (rule.min !== undefined || rule.max !== undefined) {
          this.validateNumericRange(processedValue, field, rule.min || -Infinity, rule.max || Infinity);
        }
      }

      // Enum validation
      if (rule.enum) {
        this.validateEnumValue(processedValue, field, rule.enum);
      }

      result[field] = processedValue;
    }

    return result as T;
  }
}

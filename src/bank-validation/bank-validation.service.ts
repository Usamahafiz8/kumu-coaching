import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BankValidationService {
  constructor(private configService: ConfigService) {}

  /**
   * Validates US routing number using the ABA routing number algorithm
   */
  validateRoutingNumber(routingNumber: string): boolean {
    if (!/^\d{9}$/.test(routingNumber)) {
      return false;
    }

    // ABA routing number validation algorithm
    const digits = routingNumber.split('').map(Number);
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * weights[i];
    }
    
    return sum % 10 === 0;
  }

  /**
   * Validates account number format
   */
  validateAccountNumber(accountNumber: string): boolean {
    // Account numbers are typically 4-17 digits
    return /^\d{4,17}$/.test(accountNumber);
  }

  /**
   * Validates bank name against known US banks
   */
  validateBankName(bankName: string): boolean {
    const validBanks = [
      'chase', 'bank of america', 'wells fargo', 'citibank', 'us bank',
      'pnc', 'capital one', 'td bank', 'regions', 'suntrust',
      'huntington', 'keybank', 'comerica', 'm&t bank', 'bb&t',
      'first national', 'citizens bank', 'bmo harris', 'union bank',
      'bank of the west', 'first republic', 'east west bank'
    ];
    
    return validBanks.some(bank => 
      bankName.toLowerCase().includes(bank)
    );
  }

  /**
   * Validates account holder name format
   */
  validateAccountHolderName(name: string): boolean {
    const nameParts = name.trim().split(' ');
    return nameParts.length >= 2 && 
           nameParts.every(part => part.length >= 2) &&
           /^[a-zA-Z\s]+$/.test(name);
  }

  /**
   * Performs micro-deposit verification (for production use)
   * This would integrate with a service like Plaid or Yodlee
   */
  async verifyAccountOwnership(
    routingNumber: string,
    accountNumber: string,
    accountHolderName: string
  ): Promise<{ isValid: boolean; verificationId?: string }> {
    // In production, this would:
    // 1. Use Plaid API to verify account ownership
    // 2. Send micro-deposits for verification
    // 3. Return verification ID for tracking
    
    // For now, return mock verification
    return {
      isValid: true,
      verificationId: `verify_${Date.now()}`
    };
  }

  /**
   * Validates complete bank account information
   */
  validateBankAccount(bankData: {
    routingNumber: string;
    accountNumber: string;
    bankName: string;
    accountHolderName: string;
    accountType: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.validateRoutingNumber(bankData.routingNumber)) {
      errors.push('Invalid routing number');
    }

    if (!this.validateAccountNumber(bankData.accountNumber)) {
      errors.push('Invalid account number');
    }

    if (!this.validateBankName(bankData.bankName)) {
      errors.push('Invalid bank name');
    }

    if (!this.validateAccountHolderName(bankData.accountHolderName)) {
      errors.push('Invalid account holder name');
    }

    if (!['checking', 'savings'].includes(bankData.accountType)) {
      errors.push('Invalid account type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InfluencerService } from '../influencer/influencer.service';
import { ValidatePromoCodeDto } from '../admin/dto/validate-promo-code.dto';

@ApiTags('Promo Codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly influencerService: InfluencerService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promo code (Public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Promo code validation result',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid promo code',
  })
  async validatePromoCode(@Body() validatePromoCodeDto: ValidatePromoCodeDto) {
    return this.influencerService.validatePromoCode(validatePromoCodeDto);
  }
}

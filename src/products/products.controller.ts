import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @ApiOperation({ summary: 'Get subscription product' })
  @ApiResponse({ status: 200, description: 'Subscription product retrieved successfully' })
  @Get()
  getSubscriptionProduct() {
    return this.productsService.getSubscriptionProduct();
  }
}

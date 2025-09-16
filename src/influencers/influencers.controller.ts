import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InfluencersService } from './influencers.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Influencers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new influencer' })
  @ApiResponse({ status: 201, description: 'Influencer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createInfluencerDto: CreateInfluencerDto) {
    return this.influencersService.create(createInfluencerDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all influencers with pagination' })
  @ApiResponse({ status: 200, description: 'Influencers retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.influencersService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get influencer by ID' })
  @ApiResponse({ status: 200, description: 'Influencer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  async findOne(@Param('id') id: string) {
    return this.influencersService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get influencer statistics' })
  @ApiResponse({ status: 200, description: 'Influencer stats retrieved successfully' })
  async getStats(@Param('id') id: string) {
    return this.influencersService.getInfluencerStats(id);
  }

  @Get(':id/commissions')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get influencer commissions' })
  @ApiResponse({ status: 200, description: 'Commissions retrieved successfully' })
  async getCommissions(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.influencersService.getCommissions(id, page, limit);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update influencer' })
  @ApiResponse({ status: 200, description: 'Influencer updated successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  async update(
    @Param('id') id: string,
    @Body() updateInfluencerDto: UpdateInfluencerDto,
  ) {
    return this.influencersService.update(id, updateInfluencerDto);
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Approve influencer' })
  @ApiResponse({ status: 200, description: 'Influencer approved successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  async approveInfluencer(@Param('id') id: string, @Request() req) {
    return this.influencersService.approveInfluencer(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete influencer' })
  @ApiResponse({ status: 200, description: 'Influencer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  async remove(@Param('id') id: string) {
    await this.influencersService.remove(id);
    return { message: 'Influencer deleted successfully' };
  }
}

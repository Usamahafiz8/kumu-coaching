import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto, UserResponseDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.findById(id);
    
    Object.assign(user, updateProfileDto);
    const updatedUser = await this.userRepository.save(user);
    
    const { password, ...userResponse } = updatedUser;
    return userResponse as UserResponseDto;
  }

  async getUserProfile(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    const { password, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }
}

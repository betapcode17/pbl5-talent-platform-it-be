import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CloudinaryService } from '../upload/cloudinary.service.js';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}
  async getMe(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        gender: true,
        phone: true,
        user_image: true,
        registration_date: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
  async update(userId: number, dto: UpdateUserDto): Promise<any> {
    if (dto.email) {
      const existed = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existed && existed.user_id !== userId) {
        throw new ConflictException('Email đã tồn tại');
      }
    }
    await this.prisma.user.update({
      where: { user_id: userId },
      data: dto,
    });
  }
  async activateUser(userId: number) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: { is_active: true },
    });
  }
  async deactivateUser(id: number) {
    await this.prisma.token.deleteMany({
      where: { user_id: id },
    });

    return this.prisma.user.update({
      where: { user_id: id },
      data: { is_active: false },
    });
  }
  async getUsers(page = 1, limit = 10, role?: string) {
    // Import UserRole enum from Prisma client
    // and cast role to UserRole if provided
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const where = role ? { role: role as any } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }
  async uploadAvatar(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    // Upload cloudinary
    const { url } = await this.cloudinary.uploadAvatar(file);

    // Update DB
    await this.prisma.user.update({
      where: { user_id: userId },
      data: { user_image: url },
    });

    return {
      avatarUrl: url,
    };
  }
}

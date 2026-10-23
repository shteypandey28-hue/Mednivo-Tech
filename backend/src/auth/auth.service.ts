import { Injectable, ConflictException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { pick } from '../common/tenant';
import { generateJoinCode } from '../clinic/join-code';

const PROFILE_FIELDS = [
  'name', 'role', 'isOnboarded', 'phone', 'avatar', 'specialty', 'qualification',
  'registrationNumber', 'signature', 'consultationFee', 'bio',
] as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Every sign-up gets its own clinic; staff join an existing one with its join code.
    const clinic = await this.createClinicFor(dto.name);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        role: dto.role || 'DOCTOR',
        specialty: dto.specialty,
        qualification: dto.qualification,
        registrationNumber: dto.registrationNumber,
        clinicId: clinic.id,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        clinicId: user.clinicId,
        specialty: user.specialty,
        qualification: user.qualification,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        clinic: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        clinicId: user.clinicId,
        specialty: user.specialty,
        qualification: user.qualification,
        registrationNumber: user.registrationNumber,
        consultationFee: user.consultationFee,
        signature: user.signature,
        clinic: user.clinic,
      },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        clinic: {
          include: { clinicSettings: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, resetToken, resetTokenExpiry, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const updateData = pick(data, PROFILE_FIELDS);

    // Role is chosen during onboarding, while the user is alone in their own clinic.
    // Once they share a clinic, changing role would let staff grant themselves doctor access.
    if (updateData.role) {
      const me = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, clinicId: true } });
      if (me && me.role !== updateData.role) {
        const others = me.clinicId
          ? await this.prisma.user.count({ where: { clinicId: me.clinicId, id: { not: userId }, isActive: true } })
          : 0;
        if (others > 0) throw new ForbiddenException('Role can only be changed by the clinic owner');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        clinic: true,
      },
    });

    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...profile } = user;
    return profile;
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete the user to preserve foreign key constraints (like past medical records, prescriptions, etc.)
    // We anonymize the email so the user can re-register with the same email later if they want.
    const deletedEmail = `deleted_${Date.now()}_${user.email}`;
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: deletedEmail,
        name: 'Deleted User',
      }
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link will be sent.' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // TODO: email the reset link. The token must never be returned in the response,
    // otherwise anyone who knows an email address can take over that account.
    return { message: 'If the email exists, a reset link will be sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const { email, firstName, lastName } = req.user;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        clinic: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    if (!user) {
      // Create user if they don't exist
      const passwordHash = await bcrypt.hash(uuidv4(), 12); // random password
      
      const clinic = await this.createClinicFor(`${firstName} ${lastName}`);

      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name: `${firstName} ${lastName}`,
          role: 'DOCTOR',
          clinicId: clinic.id,
        },
        include: {
          clinic: {
            select: { id: true, name: true, logo: true },
          },
        },
      });
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
      },
      ...tokens,
    };
  }

  private createClinicFor(ownerName: string) {
    return this.prisma.clinic.create({
      data: {
        name: ownerName ? `${ownerName}'s Clinic` : 'My Clinic',
        joinCode: generateJoinCode(),
        clinicSettings: { create: {} },
      },
    });
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
}

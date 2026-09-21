import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    create(createUserDto: CreateUserDto) {
        const { password, ...rest } = createUserDto;
        return this.prisma.user.create({
            data: {
                ...rest,
                passwordHash: password,
            },
        });
    }

    findAll() {
        return this.prisma.user.findMany();
    }

    findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    update(id: string, updateUserDto: UpdateUserDto) {
        const { password, ...rest } = updateUserDto as any;
        const data: any = { ...rest };
        if (password) data.passwordHash = password;
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    remove(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}

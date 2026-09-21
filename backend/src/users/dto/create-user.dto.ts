export class CreateUserDto {
    email: string;
    name: string;
    password: string; // In real app, hash this!
    role?: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  try {
    const result = await authService.login({ email: 'reception@clinic.com', password: 'password123' });
    console.log('Login successful', result.user.email);
  } catch (error) {
    console.error('Login failed:', error);
  }
  await app.close();
}
bootstrap();

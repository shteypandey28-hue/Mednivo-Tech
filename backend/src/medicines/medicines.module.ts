import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DrugsetuService } from './drugsetu.service';

@Module({
  imports: [PrismaModule],
  controllers: [MedicinesController],
  providers: [MedicinesService, DrugsetuService],
})
export class MedicinesModule { }

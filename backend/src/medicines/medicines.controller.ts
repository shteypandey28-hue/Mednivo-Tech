import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('medicines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  // Autocomplete: GET /medicines?q=dolo&limit=20 → MedicineResult[]
  @Get()
  search(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.medicinesService.search(q ?? '', Number(limit) || 20);
  }

  // Directory: GET /medicines/directory?q=&form=Tablet&page=1&limit=24
  @Get('directory')
  directory(
    @Query('q') q?: string,
    @Query('form') form?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.medicinesService.directory({ q, form, page: Number(page), limit: Number(limit) });
  }

  @Get('forms')
  forms() {
    return this.medicinesService.forms();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  // The catalogue is shared by every clinic, so only platform admins may change it.
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    return this.medicinesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }
}

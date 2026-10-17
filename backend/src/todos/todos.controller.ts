import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe, Query } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkStatusDto, IdsDto } from './dto/ids.dto.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  // GET /todos?status=DONE&q=milk
  @Get()
  findAll(@Query('status') status?: string, @Query('q') q?: string) {
    return this.todosService.findAll(status, q);
  }

  // The fixed routes must come before ':id', or ':id' would match "bulk" and "order".
  @Patch('bulk')
  @HttpCode(204)
  bulkStatus(@Body() { ids, status }: BulkStatusDto) {
    return this.todosService.bulkStatus(ids, status);
  }

  @Delete('bulk')
  @HttpCode(204)
  bulkRemove(@Body() { ids }: IdsDto) {
    return this.todosService.remove(ids);
  }

  @Patch('order')
  @HttpCode(204)
  reorder(@Body() { ids }: IdsDto) {
    return this.todosService.reorder(ids);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.todosService.remove(+id);
  }
}

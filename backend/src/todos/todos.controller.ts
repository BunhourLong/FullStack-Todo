import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe, Query } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkStatusDto, IdsDto } from './dto/ids.dto.js';
import { type AuthUser, CurrentUser, Roles } from '../auth/auth.decorators.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(user.id, createTodoDto);
  }

  // GET /todos?status=DONE&q=milk
  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('status') status?: string, @Query('q') q?: string) {
    return this.todosService.findAll(user.id, status, q);
  }

  // The fixed routes must come before ':id', or ':id' would match "bulk" and "order".
  @Patch('bulk')
  @HttpCode(204)
  bulkStatus(@CurrentUser() user: AuthUser, @Body() { ids, status }: BulkStatusDto) {
    return this.todosService.bulkStatus(user.id, ids, status);
  }

  @Delete('bulk')
  @HttpCode(204)
  bulkRemove(@CurrentUser() user: AuthUser, @Body() { ids }: IdsDto) {
    return this.todosService.remove(user.id, ids);
  }

  @Patch('order')
  @HttpCode(204)
  reorder(@CurrentUser() user: AuthUser, @Body() { ids }: IdsDto) {
    return this.todosService.reorder(user.id, ids);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: string) {
    return this.todosService.findOne(user.id, +id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(user.id, +id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: string) {
    return this.todosService.remove(user.id, [+id]);
  }
}

@Roles('admin')
@Controller('admin/todos')
export class AdminTodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll() {
    return this.todosService.findEveryones();
  }
}

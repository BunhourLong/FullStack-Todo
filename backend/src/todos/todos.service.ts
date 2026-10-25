import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity.js';
import { ILike, In, Repository } from 'typeorm';

// Every method takes ownerId and filters by it, so a user only ever sees and changes their own todos.
@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo : Repository<Todo>
  ){}

  // New todos go to the top of the list.
  async create(ownerId: number, createTodoDto: CreateTodoDto) {
    const top = (await this.repo.minimum('position', { ownerId })) ?? 1
    return this.repo.save(this.repo.create({ ...createTodoDto, position: top - 1, ownerId }))
  }

  findAll(ownerId: number, status?: string, q?: string) {
    return this.repo.find({
      where: {
        ownerId,
        ...(status && { status }),
        ...(q && { title: ILike(`%${q}%`) }),
      },
      order: { position: "ASC" },
    })
  }

  // Admin only: every user's todos, including old ones with no owner.
  findEveryones() {
    return this.repo.find({ order: { id: "ASC" } })
  }

  // Someone else's todo is a 404, so ids don't reveal which todos exist.
  async findOne(ownerId: number, id: number) {
    const todo = await this.repo.findOneBy({ id, ownerId })
    if (!todo) throw new NotFoundException()
    return todo
  }

  async update(ownerId: number, id: number, updateTodoDto: UpdateTodoDto) {
    const result = await this.repo.update({ id, ownerId }, updateTodoDto)
    if (!result.affected) throw new NotFoundException()
    return result
  }

  async bulkStatus(ownerId: number, ids: number[], status: string) {
    await this.repo.update({ id: In(ids), ownerId }, { status })
  }

  // ids are the todos in their new order. They swap the positions they already
  // hold, so reordering a filtered list leaves the hidden todos where they were.
  async reorder(ownerId: number, ids: number[]) {
    const todos = await this.repo.findBy({ id: In(ids), ownerId })
    const found = ids.filter((id) => todos.some((t) => t.id === id))
    const slots = todos.map((t) => t.position).sort((a, b) => a - b)
    await this.repo.manager.transaction((m) =>
      Promise.all(found.map((id, i) => m.update(Todo, id, { position: slots[i] }))),
    )
  }

  async remove(ownerId: number, ids: number[]) {
    await this.repo.delete({ id: In(ids), ownerId })
  }
}

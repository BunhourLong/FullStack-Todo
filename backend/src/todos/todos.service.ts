import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity.js';
import { ILike, In, Repository } from 'typeorm';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo : Repository<Todo>
  ){}

  // New todos go to the top of the list.
  async create(createTodoDto: CreateTodoDto) {
    const top = (await this.repo.minimum('position')) ?? 1
    return this.repo.save(this.repo.create({ ...createTodoDto, position: top - 1 }))
  }

  findAll(status?: string, q?: string) {
    return this.repo.find({
      where: {
        ...(status && { status }),
        ...(q && { title: ILike(`%${q}%`) }),
      },
      order: { position: "ASC" },
    })
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return this.repo.update(id,updateTodoDto)
  }

  async bulkStatus(ids: number[], status: string) {
    await this.repo.update({ id: In(ids) }, { status })
  }

  // ids are the todos in their new order. They swap the positions they already
  // hold, so reordering a filtered list leaves the hidden todos where they were.
  async reorder(ids: number[]) {
    const todos = await this.repo.findBy({ id: In(ids) })
    const found = ids.filter((id) => todos.some((t) => t.id === id))
    const slots = todos.map((t) => t.position).sort((a, b) => a - b)
    await this.repo.manager.transaction((m) =>
      Promise.all(found.map((id, i) => m.update(Todo, id, { position: slots[i] }))),
    )
  }

  async remove(ids: number | number[]) {
    await this.repo.delete(ids)
  }
}

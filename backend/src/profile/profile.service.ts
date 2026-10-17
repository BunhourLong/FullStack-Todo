import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>
  ){}
  
  findAll() {
    return this.repo.find({order: {username: "ASC"}})
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return this.repo.update(id,updateProfileDto)
  }

}

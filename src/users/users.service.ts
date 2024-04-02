import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) {}

  getHashPassword = (password: string) => {
    var salt = genSaltSync(10);
    var hash = hashSync(password, salt);

    return hash;
  };

  async create(createUserDto: CreateUserDto) {
    // async create(email: string, password: string, name: string) {
    const passwordHashed = this.getHashPassword(createUserDto.password);

    let user = await this.userModel.create({
      email: createUserDto.email,
      password: passwordHashed,
      name: createUserDto.name,
    });

    return user;
  }

  findAll() {
    return 'All users';
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'User not found';
    return this.userModel
      .findById(id)
      .then((user) => user)
      .catch((err) => err.message);
  }

  async findOneByUsername(username: string) {
    return await this.userModel
      .findOne({
        email: username,
      })
      .then((user) => user)
      .catch((err) => err.message);
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      {
        _id: updateUserDto._id,
      },
      { ...updateUserDto },
    );
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'User not found';
    return this.userModel.softDelete({
      _id: id
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }
}

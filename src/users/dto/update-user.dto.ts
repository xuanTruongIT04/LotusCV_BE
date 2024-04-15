import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDefined, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
  _id: mongoose.Schema.Types.ObjectId;

  name: string;
}

export class UpdateUserDto {
  @IsNotEmpty({ message: 'ID is not blank' })
  _id: string;

  @IsNotEmpty({ message: 'Name is not blank' })
  name: string;

  @IsNotEmpty({ message: 'Email is not blank' })
  @IsEmail({}, { message: 'Email is incorrect format' })
  email: string;

  @IsNotEmpty({ message: 'Password is not blank' })
  password: string;

  @IsNotEmpty({ message: 'Address is not blank' })
  address: string;

  @IsNotEmpty({ message: 'Age is not blank' })
  age: number;

  @IsNotEmpty({ message: 'Gender is not blank' })
  gender: string;

  role: mongoose.Schema.Types.ObjectId;

  company: Company;
}
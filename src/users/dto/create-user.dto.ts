import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateUserDto {
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

  @IsNotEmpty({ message: 'Role is not blank' })
  @IsMongoId({ message: 'Role must be a valid object id' })
  role: mongoose.Schema.Types.ObjectId;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
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
}

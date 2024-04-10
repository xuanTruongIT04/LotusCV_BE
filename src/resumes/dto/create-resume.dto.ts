import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({
    message: 'Email is not blank',
  })
  @IsEmail(
    {},
    {
      message: 'Email is incorrect format',
    },
  )
  email: string;

  @IsNotEmpty({
    message: 'User is not blank',
  })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'Url is not blank',
  })
  url: string;

  @IsNotEmpty({
    message: 'Status is not blank',
  })
  status: string;

  @IsNotEmpty({
    message: 'Company is not blank',
  })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'Job is not blank',
  })
  jobId: mongoose.Schema.Types.ObjectId;

  // @IsNotEmpty({
  //   message: 'History id is not blank',
  // })
  // @IsArray({ message: 'History is array' })
  // @IsObject({ each: true, message: 'History item is object' })
  // history: [Object];
}

export class CreateUserCVDto {
  @IsNotEmpty({
    message: 'Url is not blank',
  })
  url: string;

  @IsNotEmpty({
    message: 'Company is not blank',
  })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'Job is not blank',
  })
  jobId: mongoose.Schema.Types.ObjectId;
}

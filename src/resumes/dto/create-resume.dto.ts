import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Email is not blank' })
  @IsEmail({}, { message: 'Email is incorrect format' })
  email: string;

  @IsNotEmpty({ message: 'User is not blank' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Url is not blank' })
  url: string;

  @IsNotEmpty({ message: 'Status is not blank' })
  status: string;

  @IsNotEmpty({ message: 'Company is not blank' })
  @IsMongoId({ message: 'Company must be a valid object id' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Job is not blank' })
  @IsMongoId({ message: 'Job must be a valid object id' })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCVDto {
  @IsNotEmpty({
    message: 'Url is not blank',
  })
  url: string;

  @IsNotEmpty({
    message: 'Company is not blank',
  })
  @IsMongoId({ message: 'Company must be a valid object id' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'Job is not blank',
  })
  @IsMongoId({ message: 'Job must be a valid object id' })
  jobId: mongoose.Schema.Types.ObjectId;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import {
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class UpdateBy {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  @IsEmail()
  updatedAt: Date;
}

class History {
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  updatedAt: Date;

  @IsNotEmpty({ message: 'Updated by is not blank' })
  @ValidateNested()
  @Type(() => History)
  updatedBy: UpdateBy;
}

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @IsDefined()
  @IsNotEmpty({ message: 'History is not blank' })
  @IsArray({ message: 'History must be array type' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}

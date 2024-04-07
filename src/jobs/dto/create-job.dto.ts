import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateJobDto {
  @IsNotEmpty({ message: 'Name is not blank' })
  name: string;

  @IsArray({ message: 'Skills is array' })
  @IsString({ each: true, message: 'Each item is string' })
  @IsNotEmpty({ message: 'Skills is not blank' })
  skills: string[];

  location: string;

  @IsNotEmpty({ message: 'Salary is not blank' })
  salary: number;

  @IsNotEmpty({ message: 'Quantity is not blank' })
  quantity: number;

  @IsNotEmpty({ message: 'Level is not blank' })
  level: string;

  description: string;

  @IsNotEmpty({ message: 'Start date is not blank' })
  @Transform( ({ value }) => new Date(value))
  @IsDate({ message: 'Start date have type of date' })
  startDate: Date;

  @IsNotEmpty({ message: 'End date is not blank' })
  @Transform( ({ value }) => new Date(value))
  @IsDate({ message: 'End date have type of date' })
  endDate: Date;

  @IsNotEmpty({ message: 'Is active is not blank' })
  isActive: Boolean;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

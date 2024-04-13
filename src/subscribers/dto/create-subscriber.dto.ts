import {
    IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Name is not blank' })
  name: string;

  @IsNotEmpty({ message: 'Email is not blank' })
  @IsEmail({}, { message: 'Email is incorrect format' })
  email: string;

  @IsNotEmpty({ message: 'Skills is not blank' })
  @IsArray({ message: 'Skills is array' })
  @IsString({ each: true, message: 'Each item is string' })
  skills: string[];
}
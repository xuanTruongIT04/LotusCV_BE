import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({
    message: 'Name is not blank',
  })
  name: string;

  description: string;

  isActive: boolean;

  @IsArray({ message: 'Permissions is array' })
  @IsMongoId({ each: true, message: 'Each item is object id' })
  @IsNotEmpty({ message: 'Permissions is not blank' })
  permissions: mongoose.Schema.Types.ObjectId[];
}

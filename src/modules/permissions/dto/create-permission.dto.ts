import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Name is not blank' })
  name: string;

  @IsNotEmpty({ message: 'API path is not blank' })
  apiPath: string;

  @IsNotEmpty({ message: 'Method is not blank' })
  method: string;

  @IsNotEmpty({ message: 'Module is not blank' })
  module: string;
}

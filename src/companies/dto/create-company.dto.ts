import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({
    message: 'Name is not blank',
  })
  name: string;

  @IsNotEmpty({
    message: 'Address is not blank',
  })
  address: string;

  @IsNotEmpty({
    message: 'Description is not blank',
  })
  description: string;
}

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({
    message: 'Email is not blank',
  })
  @IsEmail({}, {
    message: 'Email is incorrect format',
  })
  email: string;

  @IsNotEmpty({
    message: 'Password is not blank',
  })
  password: string;

  name: string;

  address: string;
}

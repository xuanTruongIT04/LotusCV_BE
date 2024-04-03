import { IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
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
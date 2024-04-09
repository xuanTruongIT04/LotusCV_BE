import { IsNotEmpty } from 'class-validator';

export class UpdateCompanyDto {
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

  @IsNotEmpty({
    message: 'Logo is not blank',
  })
  logo: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  address: string;
  company: Object;
  refreshToken: string;
  role: {
    _id: string;
    name: string;
  };
  permissions: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
}

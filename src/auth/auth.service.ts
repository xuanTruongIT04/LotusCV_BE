import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

interface IResponseMessage<T> {
  user: T;
}
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<IResponseMessage<IUser>> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValidPassword = await this.usersService.isValidPassword(
        pass,
        user.password,
      );

      if (isValidPassword) return user;
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'Token login',
      iss: 'From server',
      user: {
        _id,
        name,
        email,
        role,
      },
    };

    const refreshToken = this.createRefreshToken(payload);

    // Update user with refresh token
    await this.usersService.updateUserToken(refreshToken, _id);

    // Add refresh token to cookies
    response.cookie('refresh_token', refreshToken, {
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      httpOnly: true
    });

    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
    };
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  createRefreshToken = (payload: any) => {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
  };
}

import { BadRequestException, Injectable } from '@nestjs/common';
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
  ): Promise<any> {
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
      _id,
      name,
      email,
      role,
    };

    const refreshToken = this.createRefreshToken(payload);

    // Update user with refresh token
    await this.usersService.updateUserToken(_id, refreshToken);

    // Clear refresh token
    this.clearCookies(response, 'refresh_token');

    // Add refresh token to cookies
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
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

  handleNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let user = await this.usersService.findUserByToken(refreshToken);

      if (!user) {
        throw new BadRequestException(
          'Refresh token invalid, please login again 2!',
        );
      }

      const { _id, name, email, role } = user;
      const payloadToken = {
        sub: 'Token refresh',
        iss: 'From server',
        _id,
        name,
        email,
        role,
      };

      const refreshTokenNew = this.createRefreshToken(payloadToken);

      // Update user with refresh token
      await this.usersService.updateUserToken(
        payloadToken._id.toString(),
        refreshTokenNew,
      );

      // Add refresh token to cookies
      response.cookie('refresh_token', refreshTokenNew, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      });

      return {
        access_token: this.jwtService.sign(payloadToken),
        _id,
        name,
        email,
        role,
      };
    } catch (err) {
      throw new BadRequestException(
        'Refresh token invalid, please login again 3!',
      );
    }
  };

  async handleLogout(user: IUser, response: Response) {
    const { _id } = user;

    // Update user with refresh token
    await this.usersService.updateUserToken(_id, null);

    // Clear refresh token
    this.clearCookies(response, 'refresh_token');

    return 'ok';
  }

  clearCookies = (response: Response, nameCookie) => {
    // Clear cookies
    return response.clearCookie(nameCookie);
  };
}

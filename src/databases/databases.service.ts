import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Permission,
  PermissionDocument,
} from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './init-data';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      const countPermission = await this.permissionModel.count({});
      const countRole = await this.roleModel.count({});
      const countUser = await this.userModel.count({});
    
      if (countPermission === 0) {
        // Bulk create
        await this.permissionModel.insertMany(INIT_PERMISSIONS);
      }

      if (countRole === 0) {
        const listPermissions = await this.permissionModel
          .find({})
          .select('_id');
  
        await this.roleModel.insertMany([
          {
            name: ADMIN_ROLE,
            desciprtion: 'Admin has full permissions!',
            isActive: true,
            permissions: listPermissions,
          },
          {
            name: USER_ROLE,
            desciprtion: 'User has some permissions',
            isActive: true,
            permissions: [],
          },
        ]);
      }

      if (countUser === 0) {
        const listRoles = await this.roleModel.find({});

        const roleAdmin = listRoles.find((role) => role.name === ADMIN_ROLE);
        const roleUser = listRoles.find((role) => role.name === USER_ROLE);

        await this.userModel.insertMany([
          {
            name: 'Nguyen Xuan Truong',
            email: 'xuantruong@yopmail.com',
            password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
            age: 25, 
            gender: 'male',
            address: 'Viet Name',
            role: roleAdmin._id,
            company: {
              _id: '66078c26e0459c2d488dc4d4',
              name: 'Nguyen Xuan Truong',
            },
          },
          {
            name: 'Nguyen Xuan An',
            email: 'xuanan@yopmail.com',
            password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
            age: 25,
            gender: 'male',
            address: 'Viet Name',
            role: roleAdmin._id,
            company: {
              _id: '66078c26e0459c2d488dc4d4',
              name: 'Nguyen Xuan Truong',
            },
          },
          {
            name: 'Nguyen Xuan Dung',
            email: 'xuandung@yopmail.com',
            password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
            age: 25,
            gender: 'male',
            address: 'Viet Name',
            role: roleUser._id,
            company: {
              _id: '66078c26e0459c2d488dc4d4',
              name: 'Nguyen Xuan Truong',
            },
          },
        ]);
      }

      if (countPermission > 0 && countRole > 0 && countUser > 0) {
        this.logger.log('ALREADY INIT SAMPLE DATA...');
      }
    } 
  }
}

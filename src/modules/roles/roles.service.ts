import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ConfigService } from '@nestjs/config';
import { RoleSystem } from 'src/enums/role.enum';
import { PermissionDocument } from '../permissions/schemas/permission.schema';
import { IUser } from '../users/user.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<PermissionDocument>,
    private configService: ConfigService,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    try {
      const { name } = createRoleDto;
      const isExisted = await this.checkExistedByName(name);

      if (isExisted)
        throw new BadRequestException(`Role name ${name} is existed`);

      const inforRole = {
        ...createRoleDto,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      };

      const roleNew = await this.roleModel.create(inforRole);

      return {
        _id: roleNew._id,
        createdAt: roleNew.createdAt,
      };
    } catch (err) {
      return err.message;
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(_id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('Role is invalid');

    try {
      const role = (await this.roleModel.findById(_id)).populate({
        path: 'permissions',
        select: {
          _id: 1,
          apiPath: 1,
          name: 1,
          method: 1,
          module: 1,
        },
      });
      return role;
    } catch (err) {
      return err.message;
    }
  }

  async update(_id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id))
        throw new BadRequestException('Role not found');

      const inforUpdate = {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      };

      return await this.roleModel.updateOne({ _id }, inforUpdate);
    } catch (err) {
      return err.message;
    }
  }

  async remove(_id: string, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id))
        throw new BadRequestException('Role is invalid');

      const foundRole = await this.roleModel.findById(_id);
      
      if (foundRole.name === RoleSystem.ADMIN_ROLE) {
        throw new BadRequestException('Can not remove role admin');
      }

      await this.roleModel.updateOne(
        { _id },
        {
          deletedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      );

      return this.roleModel.softDelete({ _id });
    } catch (err) {
      return err.message;
    }
  }

  async checkExistedByName(name: string) {
    if (isEmpty(name)) throw new BadRequestException('Role name is not blank');

    const isExisted = await this.roleModel.findOne({
      name,
    });

    if (isExisted) return true;
    return false;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(inforPermission: CreatePermissionDto, user: IUser) {
    try {
      const { apiPath, method } = inforPermission;
      const isCheckExisted = await this.checkExisted(apiPath, method);

      if (isCheckExisted)
        throw new BadRequestException(
          `Permission has apiPath = ${apiPath} and method = ${method} existsed, please enter API with another information`,
        );

      const userNew = await this.permissionModel.create({
        ...inforPermission,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      });

      return {
        _id: userNew._id,
        createdAt: userNew.createdAt,
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

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
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
      throw new BadRequestException('Permission not found');

    try {
      const permisson = await this.permissionModel.findById(_id);
      return permisson;
    } catch (err) {
      return err.message;
    }
  }

  async update(
    _id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    try {
      const inforUpdate = {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      };

      return this.permissionModel.updateOne({ _id }, inforUpdate);
    } catch (err) {
      return err.message;
    }
  }

  async remove(_id: string, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id))
        throw new BadRequestException('Permission not found');

      await this.permissionModel.updateOne(
        { _id },
        {
          deletedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      );

      return this.permissionModel.softDelete({ _id });
    } catch (err) {
      return err.message;
    }
  }

  async checkExisted(apiPath: string, method: string) {
    if (isEmpty(apiPath) || isEmpty(method)) throw new BadRequestException("Api path or method is not blank");

    const isExists = await this.permissionModel.findOne({
      apiPath,
      method,
    });

    if (isExists) return true;
    return false;
  }
}

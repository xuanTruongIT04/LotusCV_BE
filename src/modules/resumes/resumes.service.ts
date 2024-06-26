import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from '../users/user.interface';
import { Status } from 'src/constants/status';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { RoleSystem } from 'src/enums/role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
    private userService: UsersService
  ) {}

  async create(resumeInfo: CreateUserCVDto, user: IUser) {
    const { _id, email } = user;

    const status = Status.RESUMES.PENDING;

    const newCV = {
      ...resumeInfo,
      userId: _id,
      email,
      status,
      createdBy: {
        _id,
        email,
      },
      history: [
        {
          status,
          updatedAt: new Date(),
          updatedBy: {
            _id,
            email,
          },
        },
      ],
    };

    const newUser = await this.resumeModel.create({ ...newCV });

    return {
      _id: newUser._id,
      createdAt: newUser.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string, user) {
    let { filter } = aqp(qs);
    const { sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;

    if (user.role.name === RoleSystem.HR_ROLE) {
      let userDetail = await this.userService.findOne(user._id);

      filter.companyId = userDetail.company._id
    }

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
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
      throw new BadRequestException('Resume not found');

    try {
      const company = await this.resumeModel.findById(_id);
      return company;
    } catch (err) {
      return err.message;
    }
  }

  async getCVByUser(user: IUser) {
    try {
      const company = await this.resumeModel
        .find({
          userId: user._id,
        })
        .sort('-createdAt')
        .populate([
          {
            path: 'companyId',
            select: { name: 1 },
          },
          {
            path: 'jobId',
            select: { name: 1 },
          },
        ]);
      return company;
    } catch (err) {
      return err.message;
    }
  }

  async update(_id: string, status: string, user: IUser) {
    try {
      const inforUpdate = {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      };

      let isUpdated = await this.resumeModel.updateOne(
        { _id },
        { ...inforUpdate },
      );

      return isUpdated;
    } catch (err) {
      return err.message;
    }
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('Resume not found');

    let isUpdated = await this.resumeModel.updateOne(
      {
        _id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    if (!isUpdated)
      throw new NotImplementedException('Can not update a resume');

    return this.resumeModel.softDelete({ _id });
  }
}

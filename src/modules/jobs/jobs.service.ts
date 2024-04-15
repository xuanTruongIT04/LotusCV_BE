import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from '../users/user.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';
import { RoleSystem } from 'src/enums/role.enum';
const dayjs = require('dayjs');

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
    private usersService: UsersService,
  ) {}

  async create(jobInformation: CreateJobDto, user: IUser) {
    let {
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = jobInformation;

    if (!dayjs(startDate).isBefore(dayjs(endDate))) {
      throw new BadRequestException('Start date must before the end date!');
    }

    const jobNew = await this.jobModel.create({
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    if (!jobNew) {
      throw new InternalServerErrorException(
        'Has an error when creating a new job!',
      );
    }

    return {
      _id: jobNew._id,
      createdAt: jobNew.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    let { filter } = aqp(qs);
    const { sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (user.role.name === RoleSystem.HR_ROLE) {
      const userDetail = await this.usersService.findOne(user._id);
      
      filter = {
        ...filter,
        'company._id': userDetail.company._id,
      };
    }

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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
    if (!mongoose.Types.ObjectId.isValid(_id)) return 'Job not found';
    try {
      const job = this.jobModel.findById(_id);
      return job;
    } catch (err) {
      return err.message;
    }
  }

  async update(id: string, jobInformation: UpdateJobDto, user: IUser) {
    let {
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = jobInformation;

    if (!dayjs(startDate).isBefore(dayjs(endDate))) {
      throw new BadRequestException('Start date must before the end date!');
    }

    let isUpdatedJob = await this.jobModel.updateOne(
      { _id: id },
      {
        name,
        skills,
        company,
        location,
        salary,
        quantity,
        level,
        description,
        startDate,
        endDate,
        isActive,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    if (!isUpdatedJob) {
      throw new InternalServerErrorException(
        'Has an error when updating the job!',
      );
    }

    return isUpdatedJob;
  }

  async remove(_id: string, user: IUser) {
    const isUpdatedJob = await this.jobModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    if (!isUpdatedJob) {
      throw new InternalServerErrorException(
        'Has an error when deleting the job',
      );
    }

    return this.jobModel.softDelete({ _id });
  }
}

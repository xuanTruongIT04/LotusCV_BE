import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/user.interface';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}

  async create(inforSubscriber: CreateSubscriberDto, user: IUser) {
    try {
      const { email } = inforSubscriber;
      let existsEmail = await await this.subscriberModel.findOne({ email });

      if (existsEmail)
        throw new BadRequestException(
          `The email ${email} exists, please choose another email`,
        );

      const newSubscriber = await this.subscriberModel.create({
        ...inforSubscriber,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      });

      return {
        _id: newSubscriber._id,
        name: newSubscriber.name,
      };
    } catch (err) {
      return err.message;
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;

    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel
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

  findOne(_id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id))
        throw new BadRequestException('Invalid subscriber id');

      return this.subscriberModel.findById(_id);
    } catch (err) {
      return err.message;
    }
  }

  async update(_id: string, inforSubscriber: UpdateSubscriberDto, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id))
        throw new BadRequestException('Invalid subscriber id');

      const { email } = inforSubscriber;
      let existsEmail = await this.subscriberModel.findOne({ email });

      if (existsEmail)
        throw new BadRequestException(
          `The email ${email} exists, please choose another email`,
        );

      return await this.subscriberModel.updateOne(
        { _id },
        {
          ...inforSubscriber,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      );
    } catch (err) {
      return err.message;
    }
  }

  async remove(_id: string, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id))
        throw new BadRequestException('Invalid subscriber id');

      await this.subscriberModel.updateOne(
        { _id },
        {
          deletedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      );

      return this.subscriberModel.softDelete({ _id });
    } catch (err) {
      return err.message;
    }
  }
}

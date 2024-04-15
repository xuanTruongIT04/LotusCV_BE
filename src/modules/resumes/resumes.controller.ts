import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from '../users/user.interface';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage('Create a new resume')
  create(@Body() createUserCVDto: CreateUserCVDto, @User() user: IUser) {
    return this.resumesService.create(createUserCVDto, user);
  }

  @Get()
  @ResponseMessage('Fetch list resumes with paginate')
  @SkipCheckPermission()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs, user);
  }

  @Get(':id')
  @ResponseMessage('Fetch a resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Post('by-user')
  @ResponseMessage('Get resume by user')
  getCVByUser(@User() user: IUser) {
    return this.resumesService.getCVByUser(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume by id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}

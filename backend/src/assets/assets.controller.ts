import {
  ArgumentsHost,
  BadRequestException,
  Body,
  Catch,
  Controller,
  Delete,
  ExceptionFilter,
  Get,
  HttpStatus,
  Inject,
  Param,
  PayloadTooLargeException,
  Post,
  Query,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage, MulterError } from 'multer';
import { MAX_MODEL_SIZE_BYTES, MODEL_FILE_TOO_LARGE_MESSAGE } from './assets.constants';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CampaignAccessService } from '../common/campaign-access/campaign-access.service';

@Catch(MulterError, PayloadTooLargeException)
class AssetUploadExceptionFilter implements ExceptionFilter<MulterError | PayloadTooLargeException> {
  catch(exception: MulterError | PayloadTooLargeException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof PayloadTooLargeException) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: MODEL_FILE_TOO_LARGE_MESSAGE,
        error: 'Bad Request'
      });
      return;
    }

    if (exception.code === 'LIMIT_FILE_SIZE') {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: MODEL_FILE_TOO_LARGE_MESSAGE,
        error: 'Bad Request'
      });
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request'
    });
  }
}

@Controller('assets')
export class AssetsController {
  constructor(
    @Inject(AssetsService) private readonly assetsService: AssetsService,
    @Inject(CampaignAccessService) private readonly campaignAccess: CampaignAccessService
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseFilters(AssetUploadExceptionFilter)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'model', maxCount: 1 },
      { name: 'texture', maxCount: 1 },
      { name: 'mtl', maxCount: 1 }
    ], {
      storage: memoryStorage(),
      limits: { fileSize: MAX_MODEL_SIZE_BYTES }
    })
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { campaignId?: string; uploadedByUserId?: string; retainWithoutEntity?: string },
    @UploadedFiles()
    files: { model?: Express.Multer.File[]; texture?: Express.Multer.File[]; mtl?: Express.Multer.File[] }
  ) {
    return this.uploadForUser(user, body, files);
  }

  private async uploadForUser(
    user: AuthenticatedUser,
    body: { campaignId?: string; uploadedByUserId?: string; retainWithoutEntity?: string },
    files: { model?: Express.Multer.File[]; texture?: Express.Multer.File[]; mtl?: Express.Multer.File[] }
  ) {
    if (!body.campaignId) throw new BadRequestException('campaignId is required.');
    await this.campaignAccess.requireMaster(body.campaignId, user.id);
    return this.assetsService.createFromFiles({
      campaignId: body.campaignId,
      uploadedByUserId: user.id,
      retainWithoutEntity: body.retainWithoutEntity === 'true',
      model: files.model?.[0],
      texture: files.texture?.[0],
      mtl: files.mtl?.[0]
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query('campaignId') campaignId?: string) {
    if (!campaignId) throw new BadRequestException('campaignId is required.');
    await this.campaignAccess.requireAccess(campaignId, user.id);
    return this.assetsService.listAll(campaignId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const asset = await this.assetsService.findById(id);
    await this.campaignAccess.requireAccess(asset.campaignId, user.id);
    return asset;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const asset = await this.assetsService.findById(id);
    await this.campaignAccess.requireMaster(asset.campaignId, user.id);
    return this.assetsService.remove(id);
  }
}

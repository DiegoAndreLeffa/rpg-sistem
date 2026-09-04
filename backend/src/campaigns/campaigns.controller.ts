import {
  ArgumentsHost,
  Body,
  Catch,
  Controller,
  Delete,
  ExceptionFilter,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  PayloadTooLargeException,
  Post,
  Put,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage, MulterError } from 'multer';
import { MAX_MODEL_SIZE_BYTES, MODEL_FILE_TOO_LARGE_MESSAGE } from '../assets/assets.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';
import { ApplyCharacterStatusDto } from './dto/apply-character-status.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { SaveCampaignStateDto } from './dto/save-campaign-state.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { UpdateCharacterHpDto } from './dto/update-character-hp.dto';
import { UpdateCharacterModelDto } from './dto/update-character-model.dto';
import { SetCampaignMemberDto } from './dto/set-campaign-member.dto';

@Catch(MulterError, PayloadTooLargeException)
class CharacterUploadExceptionFilter implements ExceptionFilter<MulterError | PayloadTooLargeException> {
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

@Controller('campaigns')
export class CampaignsController {
  constructor(@Inject(CampaignsService) private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.campaignsService.findAllByOwner(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.campaignsService.findOneForOwner(user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto
  ) {
    return this.campaignsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.campaignsService.remove(user.id, id);
  }

  @Get(':id/state')
  @UseGuards(JwtAuthGuard)
  getState(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.campaignsService.getState(id, user.id);
  }

  @Put(':id/state')
  @UseGuards(JwtAuthGuard)
  saveState(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: SaveCampaignStateDto) {
    return this.campaignsService.saveState(id, user.id, dto);
  }

  @Get(':id/characters')
  @UseGuards(JwtAuthGuard)
  listCharacters(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.campaignsService.listCharacters(id, user.id);
  }

  @Post(':id/characters')
  @UseGuards(JwtAuthGuard)
  createCharacter(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CreateCharacterDto) {
    return this.campaignsService.createCharacter(id, user.id, dto);
  }

  @Post(':id/characters/upload')
  @UseGuards(JwtAuthGuard)
  @UseFilters(CharacterUploadExceptionFilter)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'model', maxCount: 1 },
        { name: 'texture', maxCount: 1 },
        { name: 'mtl', maxCount: 1 }
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: MAX_MODEL_SIZE_BYTES }
      }
    )
  )
  createCharacterFromUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { payload?: string; uploadedByUserId?: string; retainWithoutEntity?: string },
    @UploadedFiles()
    files: { model?: Express.Multer.File[]; texture?: Express.Multer.File[]; mtl?: Express.Multer.File[] }
  ) {
    return this.campaignsService.createCharacterFromUpload(id, user.id, body, files);
  }

  @Patch(':id/characters/:characterId/model')
  @UseGuards(JwtAuthGuard)
  updateCharacterModel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('characterId') characterId: string,
    @Body() dto: UpdateCharacterModelDto
  ) {
    return this.campaignsService.updateCharacterModel(id, user.id, characterId, dto);
  }

  @Patch(':id/characters/:characterId/hp')
  @UseGuards(JwtAuthGuard)
  updateCharacterHp(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('characterId') characterId: string,
    @Body() dto: UpdateCharacterHpDto
  ) {
    return this.campaignsService.updateCharacterHp(id, user.id, characterId, dto);
  }

  @Post(':id/characters/:characterId/status')
  @UseGuards(JwtAuthGuard)
  applyCharacterStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('characterId') characterId: string,
    @Body() dto: ApplyCharacterStatusDto
  ) {
    return this.campaignsService.applyCharacterStatus(id, user.id, characterId, dto);
  }

  @Put(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  setMember(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Param('userId') userId: string, @Body() dto: SetCampaignMemberDto) {
    return this.campaignsService.setMember(id, user.id, userId, dto.role);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  removeMember(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Param('userId') userId: string) {
    return this.campaignsService.removeMember(id, user.id, userId);
  }
}

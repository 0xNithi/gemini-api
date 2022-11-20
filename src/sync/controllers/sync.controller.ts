import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common'

import { SyncCreateDTO, SyncUpdateDTO } from '../dto/sync.dto'
import { SyncService } from '../services/sync.service'

@Controller('sync')
export class SyncController {
  private logger = new Logger(SyncController.name)

  constructor(private readonly syncService: SyncService) {}

  @Post('/')
  async createSync(@Body() body: SyncCreateDTO, @Res() res) {
    try {
      const data = await this.syncService.create(body)
      return res.status(HttpStatus.OK).json({ data })
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Patch('/:protocol')
  async updateSync(@Param() param, @Body() body: SyncUpdateDTO, @Res() res) {
    try {
      const { protocol } = param

      const data = await this.syncService.updateByProtocol(protocol, body)
      return res.status(HttpStatus.OK).json({ data: body })
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}

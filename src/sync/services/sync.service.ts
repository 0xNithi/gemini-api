import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Sync } from 'src/entity/sync.entity'

import { SyncCreateDTO, SyncUpdateDTO } from '../dto/sync.dto'

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)

  constructor(
    @InjectRepository(Sync)
    private readonly syncRepository: Repository<Sync>,
  ) {}

  async create(payload: SyncCreateDTO): Promise<Sync> {
    try {
      const sync = this.syncRepository.create(payload)
      return this.syncRepository.save(sync)
    } catch (error) {
      throw error
    }
  }

  async update(id: string, data: SyncUpdateDTO) {
    const sync = await this.syncRepository.findOne({ where: { id } })
    if (!sync) {
      throw Error('Sync : Not Found')
    }

    return this.syncRepository.update(id, data)
  }

  async updateByProtocol(protocol: string, data: SyncUpdateDTO) {
    const sync = await this.syncRepository.findOne({ where: { protocol } })
    if (!sync) {
      throw Error('Sync : Not Found')
    }

    return this.syncRepository.update(sync.id, data)
  }

  async findSyncByProtocol(protocol: string): Promise<Sync> {
    const sync = await this.syncRepository.findOne({ where: { protocol } })

    return sync
  }
}

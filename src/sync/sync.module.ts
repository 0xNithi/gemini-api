import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  AaveV2Borrow,
  AaveV2Deposit,
  AaveV2Repay,
  AaveV2Withdraw,
} from 'src/entity/aaveV2.entity'
import { LidoSubmission } from 'src/entity/lido.entity'

import { Sync } from 'src/entity/sync.entity'
import { Token } from 'src/entity/token.entity'
import { UniswapV3Deposit, UniswapV3Swap } from 'src/entity/uniswapV3.entity'
import { TokenService } from 'src/token/services/token.service'

import { SyncController } from './controllers/sync.controller'
import { AaveV2Service } from './services/aaveV2.service'
import { CronService } from './services/cron.service'
import { LidoService } from './services/lido.service'
import { SyncService } from './services/sync.service'
import { UniswapV3Service } from './services/uniswapV3.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Sync,
      Token,
      UniswapV3Swap,
      UniswapV3Deposit,
      LidoSubmission,
      AaveV2Deposit,
      AaveV2Withdraw,
      AaveV2Borrow,
      AaveV2Repay,
    ]),
  ],
  controllers: [SyncController],
  providers: [
    CronService,
    SyncService,
    TokenService,
    UniswapV3Service,
    LidoService,
    AaveV2Service,
  ],
  exports: [SyncService, UniswapV3Service],
})
export class SyncModule {}

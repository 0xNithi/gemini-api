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
import { UniswapV3Deposit, UniswapV3Swap } from 'src/entity/uniswapV3.entity'
import { AaveV2Service } from 'src/sync/services/aaveV2.service'
import { LidoService } from 'src/sync/services/lido.service'
import { UniswapV3Service } from 'src/sync/services/uniswapV3.service'

import { EventController } from './controllers/event.controller'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      UniswapV3Swap,
      UniswapV3Deposit,
      LidoSubmission,
      AaveV2Deposit,
      AaveV2Withdraw,
      AaveV2Borrow,
      AaveV2Repay,
    ]),
  ],
  controllers: [EventController],
  providers: [UniswapV3Service, LidoService, AaveV2Service],
  exports: [UniswapV3Service],
})
export class EventModule {}

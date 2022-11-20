import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RateLimit } from 'async-sema'
import { lastValueFrom } from 'rxjs'

import { LidoService } from 'src/sync/services/lido.service'
import { SyncService } from 'src/sync/services/sync.service'
import { UniswapV3Service } from 'src/sync/services/uniswapV3.service'
import {
  UniswapV3DepositCreateDTO,
  UniswapV3SwapCreateDTO,
} from 'src/sync/dto/uniswapV3.dto'
import { TokenCreateDTO } from 'src/token/dto/token.dto'
import { TokenService } from 'src/token/services/token.service'
import { LidoSubmissionCreateDTO } from '../dto/lido.dto'
import { AaveV2Service } from './aaveV2.service'
import {
  AaveV2BorrowCreateDTO,
  AaveV2DepositCreateDTO,
  AaveV2RepayCreateDTO,
  AaveV2WithdrawCreateDTO,
} from '../dto/aaveV2.dto'

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name)

  constructor(
    private readonly syncService: SyncService,
    private readonly tokenSerive: TokenService,
    private readonly uniswapV3Serive: UniswapV3Service,
    private readonly lidoService: LidoService,
    private readonly aaveV2Service: AaveV2Service,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCronUniswapV3() {
    const uniswapV3 = await this.syncService.findSyncByProtocol('uniswap-v3')

    if (uniswapV3 === null || uniswapV3.syncing === true) {
      return
    }

    const syncBlock = uniswapV3.blockNumber
    const currentBlock: number = await lastValueFrom(
      this.uniswapV3Serive.getCurrentBlock(),
    )

    let queryLength: number
    let perQuery = 5
    const diff = currentBlock - syncBlock

    if (diff === 0) {
      return
    }

    try {
      await this.syncService.update(uniswapV3.id, { syncing: true })
    } catch (error) {
      return this.logger.error(error)
    }

    if (diff > 1000) {
      queryLength = 1000
    } else if (diff > 100) {
      queryLength = 100
    } else if (diff > 10) {
      queryLength = 10
    } else {
      queryLength = 1
      perQuery = 1
    }

    this.logger.log(
      `Query Uniswap V3 at block ${syncBlock + 1} to block ${
        syncBlock + queryLength
      }`,
    )

    const limit = RateLimit(2)

    for (let i = 0; i < queryLength / perQuery; i++) {
      try {
        const block = syncBlock + 1 + i * perQuery
        const blockNumberIn = Array.from(Array(perQuery))
          .map((_, i) => `"${block + i}"`)
          .join(',')

        await limit()

        const { deposits, swaps } = await lastValueFrom(
          this.uniswapV3Serive.getEvents(blockNumberIn),
        )

        const tokens: TokenCreateDTO[] = []
        const depositsEvent: UniswapV3DepositCreateDTO[] = []
        const swapsEvent: UniswapV3SwapCreateDTO[] = []

        for (const deposit of deposits) {
          tokens.push({
            id: deposit.inputTokens[0].id,
            name: deposit.inputTokens[0].name,
            symbol: deposit.inputTokens[0].symbol,
            decimals: deposit.inputTokens[0].decimals,
          })
          tokens.push({
            id: deposit.inputTokens[1].id,
            name: deposit.inputTokens[1].name,
            symbol: deposit.inputTokens[1].symbol,
            decimals: deposit.inputTokens[1].decimals,
          })

          depositsEvent.push({
            id: `${deposit.hash}-${deposit.logIndex}`,
            hash: deposit.hash,
            blockNumber: deposit.blockNumber,
            timestamp: new Date(Number(deposit.timestamp) * 1000),
            amount0: deposit.inputTokenAmounts[0],
            amount1: deposit.inputTokenAmounts[1],
            token0Id: deposit.inputTokens[0].id,
            token1Id: deposit.inputTokens[1].id,
            from: deposit.from,
            to: deposit.to,
          })
        }

        for (const swap of swaps) {
          tokens.push({
            id: swap.tokenIn.id,
            name: swap.tokenIn.name,
            symbol: swap.tokenIn.symbol,
            decimals: swap.tokenIn.decimals,
          })
          tokens.push({
            id: swap.tokenOut.id,
            name: swap.tokenOut.name,
            symbol: swap.tokenOut.symbol,
            decimals: swap.tokenOut.decimals,
          })

          swapsEvent.push({
            id: `${swap.hash}-${swap.logIndex}`,
            hash: swap.hash,
            blockNumber: swap.blockNumber,
            timestamp: new Date(Number(swap.timestamp) * 1000),
            amountIn: swap.amountIn,
            amountOut: swap.amountOut,
            tokenInId: swap.tokenIn.id,
            tokenOutId: swap.tokenOut.id,
            from: swap.from,
            to: swap.to,
          })
        }

        const uniqueTokens = [
          ...new Map(tokens.map((item) => [item['id'], item])).values(),
        ]

        await this.tokenSerive.insertIfNotExist(uniqueTokens)

        await this.uniswapV3Serive.insertDepositIfNotExist(depositsEvent)
        await this.uniswapV3Serive.insertSwapIfNotExist(swapsEvent)
      } catch (error) {
        this.logger.error(error)
      }
    }

    try {
      await this.syncService.update(uniswapV3.id, {
        blockNumber: syncBlock + queryLength,
        syncing: false,
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCronLido() {
    const lido = await this.syncService.findSyncByProtocol('lido')

    if (lido === null || lido.syncing === true) {
      return
    }

    const syncBlock = lido.blockNumber
    const currentBlock: number = await lastValueFrom(
      this.lidoService.getCurrentBlock(),
    )

    let queryLength: number
    let perQuery = 5
    const diff = currentBlock - syncBlock

    if (diff === 0) {
      return
    }

    try {
      await this.syncService.update(lido.id, { syncing: true })
    } catch (error) {
      return this.logger.error(error)
    }

    if (diff > 1000) {
      queryLength = 1000
    } else if (diff > 100) {
      queryLength = 100
    } else if (diff > 10) {
      queryLength = 10
    } else {
      queryLength = 1
      perQuery = 1
    }

    this.logger.log(
      `Query Lido at block ${syncBlock + 1} to block ${syncBlock + queryLength}`,
    )

    const limit = RateLimit(2)

    for (let i = 0; i < queryLength / perQuery; i++) {
      try {
        const block = syncBlock + 1 + i * perQuery
        const blockNumberIn = Array.from(Array(perQuery))
          .map((_, i) => `"${block + i}"`)
          .join(',')

        await limit()

        const { lidoSubmissions } = await lastValueFrom(
          this.lidoService.getEvents(blockNumberIn),
        )

        const submissionsEvent: LidoSubmissionCreateDTO[] = []

        for (const lidoSubmission of lidoSubmissions) {
          submissionsEvent.push({
            id: `${lidoSubmission.transactionHash}-${lidoSubmission.logIndex}`,
            hash: lidoSubmission.transactionHash,
            blockNumber: lidoSubmission.block,
            timestamp: new Date(Number(lidoSubmission.blockTime) * 1000),
            amount: lidoSubmission.amount,
            from: lidoSubmission.sender,
          })
        }

        await this.lidoService.insertSubmissionIfNotExist(submissionsEvent)
      } catch (error) {
        this.logger.error(error)
      }
    }

    try {
      await this.syncService.update(lido.id, {
        blockNumber: syncBlock + queryLength,
        syncing: false,
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCronAaveV2() {
    const aaveV2 = await this.syncService.findSyncByProtocol('aave-v2')

    if (aaveV2 === null || aaveV2.syncing === true) {
      return
    }

    const syncBlock = aaveV2.blockNumber
    const currentBlock: number = await lastValueFrom(
      this.aaveV2Service.getCurrentBlock(),
    )

    let queryLength: number
    let perQuery = 5
    const diff = currentBlock - syncBlock

    if (diff === 0) {
      return
    }

    try {
      await this.syncService.update(aaveV2.id, { syncing: true })
    } catch (error) {
      return this.logger.error(error)
    }

    if (diff > 1000) {
      queryLength = 1000
    } else if (diff > 100) {
      queryLength = 100
    } else if (diff > 10) {
      queryLength = 10
    } else {
      queryLength = 1
      perQuery = 1
    }

    this.logger.log(
      `Query Aave V2 at block ${syncBlock + 1} to block ${syncBlock + queryLength}`,
    )

    const limit = RateLimit(2)

    for (let i = 0; i < queryLength / perQuery; i++) {
      try {
        const block = syncBlock + 1 + i * perQuery
        const blockNumberIn = Array.from(Array(perQuery))
          .map((_, i) => `"${block + i}"`)
          .join(',')

        await limit()

        const { deposits, withdraws, borrows, repays } = await lastValueFrom(
          this.aaveV2Service.getEvents(blockNumberIn),
        )

        const tokens: TokenCreateDTO[] = []
        const depositsEvent: AaveV2DepositCreateDTO[] = []
        const withdrawsEvent: AaveV2WithdrawCreateDTO[] = []
        const borrowsEvent: AaveV2BorrowCreateDTO[] = []
        const repaysEvent: AaveV2RepayCreateDTO[] = []

        for (const deposit of deposits) {
          tokens.push({
            id: deposit.asset.id,
            name: deposit.asset.name,
            symbol: deposit.asset.symbol,
            decimals: deposit.asset.decimals,
          })

          depositsEvent.push({
            id: `${deposit.hash}-${deposit.logIndex}`,
            hash: deposit.hash,
            blockNumber: deposit.blockNumber,
            timestamp: new Date(Number(deposit.timestamp) * 1000),
            amount: deposit.amount,
            tokenId: deposit.asset.id,
            from: deposit.account.id,
          })
        }

        for (const withdraw of withdraws) {
          tokens.push({
            id: withdraw.asset.id,
            name: withdraw.asset.name,
            symbol: withdraw.asset.symbol,
            decimals: withdraw.asset.decimals,
          })

          withdrawsEvent.push({
            id: `${withdraw.hash}-${withdraw.logIndex}`,
            hash: withdraw.hash,
            blockNumber: withdraw.blockNumber,
            timestamp: new Date(Number(withdraw.timestamp) * 1000),
            amount: withdraw.amount,
            tokenId: withdraw.asset.id,
            from: withdraw.account.id,
          })
        }

        for (const borrow of borrows) {
          tokens.push({
            id: borrow.asset.id,
            name: borrow.asset.name,
            symbol: borrow.asset.symbol,
            decimals: borrow.asset.decimals,
          })

          borrowsEvent.push({
            id: `${borrow.hash}-${borrow.logIndex}`,
            hash: borrow.hash,
            blockNumber: borrow.blockNumber,
            timestamp: new Date(Number(borrow.timestamp) * 1000),
            amount: borrow.amount,
            tokenId: borrow.asset.id,
            from: borrow.account.id,
          })
        }

        for (const repay of repays) {
          tokens.push({
            id: repay.asset.id,
            name: repay.asset.name,
            symbol: repay.asset.symbol,
            decimals: repay.asset.decimals,
          })

          repaysEvent.push({
            id: `${repay.hash}-${repay.logIndex}`,
            hash: repay.hash,
            blockNumber: repay.blockNumber,
            timestamp: new Date(Number(repay.timestamp) * 1000),
            amount: repay.amount,
            tokenId: repay.asset.id,
            from: repay.account.id,
          })
        }

        const uniqueTokens = [
          ...new Map(tokens.map((item) => [item['id'], item])).values(),
        ]

        await this.tokenSerive.insertIfNotExist(uniqueTokens)

        await this.aaveV2Service.insertDepositIfNotExist(depositsEvent)
        await this.aaveV2Service.insertWithdrawIfNotExist(withdrawsEvent)
        await this.aaveV2Service.insertBorrowIfNotExist(borrowsEvent)
        await this.aaveV2Service.insertRepayIfNotExist(repaysEvent)
      } catch (error) {
        this.logger.error(error)
      }
    }

    try {
      await this.syncService.update(aaveV2.id, {
        blockNumber: syncBlock + queryLength,
        syncing: false,
      })
    } catch (error) {
      this.logger.error(error)
    }
  }
}

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { map, retry } from 'rxjs'
import { Between, In, InsertResult, Repository } from 'typeorm'

import { UniswapV3Deposit, UniswapV3Swap } from 'src/entity/uniswapV3.entity'

import {
  UniswapV3DepositCreateDTO,
  UniswapV3EventGetDTO,
  UniswapV3SwapCreateDTO,
} from '../dto/uniswapV3.dto'

@Injectable()
export class UniswapV3Service {
  private readonly logger = new Logger(UniswapV3Service.name)

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UniswapV3Swap)
    private readonly swapRepository: Repository<UniswapV3Swap>,
    @InjectRepository(UniswapV3Deposit)
    private readonly depositRepository: Repository<UniswapV3Deposit>,
  ) {}

  getCurrentBlock() {
    try {
      return this.httpService
        .post(
          'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum',
          {
            query: `
            query Meta {
              _meta {
                block {
                  number
                }
              }
            }
          `,
          },
        )
        .pipe(
          map((res) => res.data.data),
          map((data) => data._meta),
          map((meta) => meta.block),
          map((block) => block.number),
          retry(3),
        )
    } catch (error) {
      this.logger.error(error)
    }
  }

  getEvents(blockNumberIn: string) {
    try {
      return this.httpService
        .post<{ data: { deposits: any; swaps: any } }>(
          'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum',
          {
            query: `
              query Events {
                deposits(
                  where: {blockNumber_in: [${blockNumberIn}]}
                ) {
                  blockNumber
                  from
                  hash
                  inputTokenAmounts
                  timestamp
                  to
                  inputTokens {
                    decimals
                    id
                    symbol
                    name
                  }
                  logIndex
                }
                swaps(
                  where: {blockNumber_in: [${blockNumberIn}]}
                ) {
                  amountIn
                  amountOut
                  tokenIn {
                    name
                    symbol
                    decimals
                    id
                  }
                  tokenOut {
                    name
                    symbol
                    decimals
                    id
                  }
                  timestamp
                  blockNumber
                  from
                  to
                  hash
                  logIndex
                }
              }
            `,
          },
        )
        .pipe(
          map((res) => res.data.data),
          retry(3),
        )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async getDeposits(payload: UniswapV3EventGetDTO) {
    try {
      const { start, end, addresses } = payload

      const size = 10000
      const results = []

      if (addresses) {
        for (let i = 0; i < addresses.length; i += size) {
          const where = [
            {
              timestamp: Between(start, end),
              ...(addresses && { from: In(addresses.slice(i, i + size)) }),
            },
            {
              timestamp: Between(start, end),
              ...(addresses && { to: In(addresses.slice(i, i + size)) }),
            },
          ]

          const deposits = await this.depositRepository.find({
            select: ['from', 'to'],
            where,
          })

          for (const deposit of deposits) {
            results.push(deposit)
          }
        }
      } else {
        const where = [
          {
            timestamp: Between(start, end),
          },
        ]

        const deposits = await this.depositRepository.find({
          select: ['from', 'to'],
          where,
        })

        for (const deposit of deposits) {
          results.push(deposit)
        }
      }

      return Array.from(
        new Set(
          results.reduce((prev, curr) => {
            prev.push(curr.from)
            prev.push(curr.to)

            return prev
          }, []),
        ),
      )
    } catch (error) {
      throw error
    }
  }

  async insertDepositIfNotExist(
    payload: UniswapV3DepositCreateDTO | UniswapV3DepositCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const deposits = this.depositRepository
        .createQueryBuilder()
        .insert()
        .into(UniswapV3Deposit)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return deposits
    } catch (error) {
      throw error
    }
  }

  async getSwaps(payload: UniswapV3EventGetDTO) {
    try {
      const { start, end, addresses } = payload

      const results = []

      if (addresses) {
        const size = 10000

        for (let i = 0; i < addresses.length; i += size) {
          const where = [
            {
              timestamp: Between(start, end),
              ...(addresses && { from: In(addresses.slice(i, i + size)) }),
            },
            {
              timestamp: Between(start, end),
              ...(addresses && { to: In(addresses.slice(i, i + size)) }),
            },
          ]

          const swaps = await this.swapRepository.find({
            select: ['from', 'to'],
            where,
          })

          for (const swap of swaps) {
            results.push(swap)
          }
        }
      } else {
        const where = [
          {
            timestamp: Between(start, end),
          },
        ]

        const swaps = await this.swapRepository.find({
          select: ['from', 'to'],
          where,
        })

        for (const swap of swaps) {
          results.push(swap)
        }
      }

      return Array.from(
        new Set(
          results.reduce((prev, curr) => {
            prev.push(curr.from)
            prev.push(curr.to)

            return prev
          }, []),
        ),
      )
    } catch (error) {
      throw error
    }
  }

  async insertSwapIfNotExist(
    payload: UniswapV3SwapCreateDTO | UniswapV3SwapCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const swaps = this.swapRepository
        .createQueryBuilder()
        .insert()
        .into(UniswapV3Swap)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return swaps
    } catch (error) {
      throw error
    }
  }
}

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { map, retry } from 'rxjs'
import { Between, In, InsertResult, Repository } from 'typeorm'

import {
  AaveV2Borrow,
  AaveV2Deposit,
  AaveV2Repay,
  AaveV2Withdraw,
} from 'src/entity/aaveV2.entity'

import {
  AaveV2BorrowCreateDTO,
  AaveV2DepositCreateDTO,
  AaveV2EventGetDTO,
  AaveV2RepayCreateDTO,
  AaveV2WithdrawCreateDTO,
} from '../dto/aaveV2.dto'

@Injectable()
export class AaveV2Service {
  private readonly logger = new Logger(AaveV2Service.name)

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(AaveV2Deposit)
    private readonly depositRepository: Repository<AaveV2Deposit>,
    @InjectRepository(AaveV2Withdraw)
    private readonly withdrawRepository: Repository<AaveV2Withdraw>,
    @InjectRepository(AaveV2Borrow)
    private readonly borrowRepository: Repository<AaveV2Borrow>,
    @InjectRepository(AaveV2Repay)
    private readonly repayRepository: Repository<AaveV2Repay>,
  ) {}

  getCurrentBlock() {
    try {
      return this.httpService
        .post('https://api.thegraph.com/subgraphs/name/messari/aave-v2-ethereum', {
          query: `
            query Meta {
              _meta {
                block {
                  number
                }
              }
            }
          `,
        })
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
        .post<{
          data: { deposits: any; withdraws: any; borrows: any; repays: any }
        }>('https://api.thegraph.com/subgraphs/name/messari/aave-v2-ethereum', {
          query: `
              query Events {
                deposits(
                  where: {blockNumber_in: [${blockNumberIn}]}
                ) {
                  amount
                  blockNumber
                  logIndex
                  timestamp
                  asset {
                    decimals
                    id
                    name
                    symbol
                  }
                  account {
                    id
                  }
                  hash
                }
                withdraws(
                  where: {blockNumber_in: [${blockNumberIn}]}
                ) {
                  amount
                  blockNumber
                  logIndex
                  timestamp
                  asset {
                    decimals
                    id
                    name
                    symbol
                  }
                  account {
                    id
                  }
                  hash
                }
                borrows(
                  where: {blockNumber_in: [${blockNumberIn}]}
                ) {
                  amount
                  blockNumber
                  logIndex
                  timestamp
                  asset {
                    decimals
                    id
                    name
                    symbol
                  }
                  account {
                    id
                  }
                  hash
                }
                repays(
                  where: {blockNumber_in: [${blockNumberIn}]}
                ) {
                  amount
                  blockNumber
                  logIndex
                  timestamp
                  asset {
                    decimals
                    id
                    name
                    symbol
                  }
                  account {
                    id
                  }
                  hash
                }
              }
            `,
        })
        .pipe(
          map((res) => res.data.data),
          retry(3),
        )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async getDeposits(payload: AaveV2EventGetDTO) {
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
          ]

          const deposits = await this.depositRepository.find({
            select: ['from'],
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
          select: ['from'],
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

            return prev
          }, []),
        ),
      )
    } catch (error) {
      throw error
    }
  }

  async insertDepositIfNotExist(
    payload: AaveV2DepositCreateDTO | AaveV2DepositCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const deposits = this.depositRepository
        .createQueryBuilder()
        .insert()
        .into(AaveV2Deposit)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return deposits
    } catch (error) {
      throw error
    }
  }

  async getWithdraws(payload: AaveV2EventGetDTO) {
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
          ]

          const withdraws = await this.withdrawRepository.find({
            select: ['from'],
            where,
          })

          for (const withdraw of withdraws) {
            results.push(withdraw)
          }
        }
      } else {
        const where = [
          {
            timestamp: Between(start, end),
          },
        ]

        const withdraws = await this.withdrawRepository.find({
          select: ['from'],
          where,
        })

        for (const withdraw of withdraws) {
          results.push(withdraw)
        }
      }

      return Array.from(
        new Set(
          results.reduce((prev, curr) => {
            prev.push(curr.from)

            return prev
          }, []),
        ),
      )
    } catch (error) {
      throw error
    }
  }

  async insertWithdrawIfNotExist(
    payload: AaveV2WithdrawCreateDTO | AaveV2WithdrawCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const withdraws = this.withdrawRepository
        .createQueryBuilder()
        .insert()
        .into(AaveV2Withdraw)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return withdraws
    } catch (error) {
      throw error
    }
  }

  async getBorrows(payload: AaveV2EventGetDTO) {
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
          ]

          const borrows = await this.borrowRepository.find({
            select: ['from'],
            where,
          })

          for (const borrow of borrows) {
            results.push(borrow)
          }
        }
      } else {
        const where = [
          {
            timestamp: Between(start, end),
          },
        ]

        const borrows = await this.borrowRepository.find({
          select: ['from'],
          where,
        })

        for (const borrow of borrows) {
          results.push(borrow)
        }
      }

      return Array.from(
        new Set(
          results.reduce((prev, curr) => {
            prev.push(curr.from)

            return prev
          }, []),
        ),
      )
    } catch (error) {
      throw error
    }
  }

  async insertBorrowIfNotExist(
    payload: AaveV2BorrowCreateDTO | AaveV2BorrowCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const borrows = this.borrowRepository
        .createQueryBuilder()
        .insert()
        .into(AaveV2Borrow)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return borrows
    } catch (error) {
      throw error
    }
  }

  async getRepays(payload: AaveV2EventGetDTO) {
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
          ]

          const repays = await this.repayRepository.find({
            select: ['from'],
            where,
          })

          for (const repay of repays) {
            results.push(repay)
          }
        }
      } else {
        const where = [
          {
            timestamp: Between(start, end),
          },
        ]

        const repays = await this.repayRepository.find({
          select: ['from'],
          where,
        })

        for (const repay of repays) {
          results.push(repay)
        }
      }

      return Array.from(
        new Set(
          results.reduce((prev, curr) => {
            prev.push(curr.from)

            return prev
          }, []),
        ),
      )
    } catch (error) {
      throw error
    }
  }

  async insertRepayIfNotExist(
    payload: AaveV2RepayCreateDTO | AaveV2RepayCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const repays = this.repayRepository
        .createQueryBuilder()
        .insert()
        .into(AaveV2Repay)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return repays
    } catch (error) {
      throw error
    }
  }
}

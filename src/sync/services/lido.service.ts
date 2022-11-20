import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { map, retry } from 'rxjs'
import { Between, In, InsertResult, Repository } from 'typeorm'

import { LidoSubmission } from 'src/entity/lido.entity'

import { LidoEventGetDTO, LidoSubmissionCreateDTO } from '../dto/lido.dto'

@Injectable()
export class LidoService {
  private readonly logger = new Logger(LidoService.name)

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(LidoSubmission)
    private readonly submissionRepository: Repository<LidoSubmission>,
  ) {}

  getCurrentBlock() {
    try {
      return this.httpService
        .post('https://api.thegraph.com/subgraphs/name/lidofinance/lido', {
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
        .post<{ data: { lidoSubmissions: any } }>(
          'https://api.thegraph.com/subgraphs/name/lidofinance/lido',
          {
            query: `
              query Events {
                lidoSubmissions(
                  where: {block_in: [${blockNumberIn}]}
                ) {
                  amount
                  block
                  blockTime
                  sender
                  logIndex
                  transactionHash
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

  async getSubmission(payload: LidoEventGetDTO) {
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

          const submissions = await this.submissionRepository.find({
            select: ['from'],
            where,
          })

          for (const submission of submissions) {
            results.push(submission)
          }
        }
      } else {
        const where = [
          {
            timestamp: Between(start, end),
          },
        ]

        const deposits = await this.submissionRepository.find({
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

  async insertSubmissionIfNotExist(
    payload: LidoSubmissionCreateDTO | LidoSubmissionCreateDTO[],
  ): Promise<InsertResult> {
    try {
      const submissions = this.submissionRepository
        .createQueryBuilder()
        .insert()
        .into(LidoSubmission)
        .values(payload)
        .returning('id')
        .orIgnore()
        .execute()

      return submissions
    } catch (error) {
      throw error
    }
  }
}

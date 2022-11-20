import { Body, Controller, HttpStatus, Logger, Post, Res } from '@nestjs/common'
import { AaveV2Service } from 'src/sync/services/aaveV2.service'
import { LidoService } from 'src/sync/services/lido.service'
import { UniswapV3Service } from 'src/sync/services/uniswapV3.service'

import { EventGetDTO } from '../dto/event.dto'

@Controller('event')
export class EventController {
  private logger = new Logger(EventController.name)

  constructor(
    private readonly uniswapV3Service: UniswapV3Service,
    private readonly lidoService: LidoService,
    private readonly aaveV2Service: AaveV2Service,
  ) {}

  @Post('/')
  async getEvent(@Body() body: EventGetDTO, @Res() res) {
    try {
      const { events, start, end } = body

      const data = []
      let addresses = undefined

      for await (const event of events) {
        if (event.protocol === 'uniswap-v3') {
          if (event.eventName === 'deposit') {
            addresses = await this.uniswapV3Service.getDeposits({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          } else if (event.eventName === 'swap') {
            addresses = await this.uniswapV3Service.getSwaps({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          }
        } else if (event.protocol === 'lido') {
          if (event.eventName === 'submission') {
            addresses = await this.lidoService.getSubmission({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          }
        } else if (event.protocol === 'aave-v2') {
          if (event.eventName === 'deposit') {
            addresses = await this.aaveV2Service.getDeposits({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          } else if (event.eventName === 'withdraw') {
            addresses = await this.aaveV2Service.getWithdraws({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          } else if (event.eventName === 'borrow') {
            addresses = await this.aaveV2Service.getBorrows({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          } else if (event.eventName === 'repay') {
            addresses = await this.aaveV2Service.getRepays({
              addresses,
              start: new Date(Number(start)),
              end: new Date(Number(end)),
            })
            data.push(addresses.length)
          }
        }
      }

      return res.status(HttpStatus.OK).json({ data })
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}

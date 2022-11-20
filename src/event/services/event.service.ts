import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name)
}

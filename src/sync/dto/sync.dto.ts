import { IsBoolean, IsNumber, IsString } from 'class-validator'

export class SyncCreateDTO {
  @IsString()
  protocol: string

  @IsNumber()
  blockNumber: number
}

export class SyncUpdateDTO {
  @IsNumber()
  blockNumber?: number

  @IsBoolean()
  syncing?: boolean
}

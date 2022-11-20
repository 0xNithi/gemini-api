import { Type } from 'class-transformer'
import { IsArray, IsDate, IsNumber, IsString, ValidateNested } from 'class-validator'

export class AaveV2EventGetDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  addresses?: string[]

  @IsDate()
  start: Date

  @IsString()
  end: Date
}

export class AaveV2DepositCreateDTO {
  @IsString()
  id: string

  @IsString()
  hash: string

  @IsNumber()
  blockNumber: number

  @IsDate()
  timestamp: Date

  @IsString()
  amount: string

  @IsString()
  tokenId: string

  @IsString()
  from: string
}

export class AaveV2WithdrawCreateDTO {
  @IsString()
  id: string

  @IsString()
  hash: string

  @IsNumber()
  blockNumber: number

  @IsDate()
  timestamp: Date

  @IsString()
  amount: string

  @IsString()
  tokenId: string

  @IsString()
  from: string
}

export class AaveV2BorrowCreateDTO {
  @IsString()
  id: string

  @IsString()
  hash: string

  @IsNumber()
  blockNumber: number

  @IsDate()
  timestamp: Date

  @IsString()
  amount: string

  @IsString()
  tokenId: string

  @IsString()
  from: string
}

export class AaveV2RepayCreateDTO {
  @IsString()
  id: string

  @IsString()
  hash: string

  @IsNumber()
  blockNumber: number

  @IsDate()
  timestamp: Date

  @IsString()
  amount: string

  @IsString()
  tokenId: string

  @IsString()
  from: string
}

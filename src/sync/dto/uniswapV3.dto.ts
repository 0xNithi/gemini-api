import { Type } from 'class-transformer'
import { IsArray, IsDate, IsNumber, IsString, ValidateNested } from 'class-validator'

export class UniswapV3EventGetDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  addresses?: string[]

  @IsDate()
  start: Date

  @IsString()
  end: Date
}

export class UniswapV3DepositCreateDTO {
  @IsString()
  id: string

  @IsString()
  hash: string

  @IsNumber()
  blockNumber: number

  @IsDate()
  timestamp: Date

  @IsString()
  amount0: string

  @IsString()
  amount1: string

  @IsString()
  token0Id: string

  @IsString()
  token1Id: string

  @IsString()
  from: string

  @IsString()
  to: string
}

export class UniswapV3SwapCreateDTO {
  @IsString()
  id: string

  @IsString()
  hash: string

  @IsNumber()
  blockNumber: number

  @IsDate()
  timestamp: Date

  @IsString()
  amountIn: string

  @IsString()
  amountOut: string

  @IsString()
  tokenInId: string

  @IsString()
  tokenOutId: string

  @IsString()
  from: string

  @IsString()
  to: string
}

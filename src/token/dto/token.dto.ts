import { IsNumber, IsString } from 'class-validator'

export class TokenCreateDTO {
  @IsString()
  id: string

  @IsString()
  name: string

  @IsString()
  symbol: string

  @IsNumber()
  decimals: number
}

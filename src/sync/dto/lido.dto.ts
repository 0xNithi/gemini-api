import { Type } from 'class-transformer'
import { IsArray, IsDate, IsNumber, IsString, ValidateNested } from 'class-validator'

export class LidoEventGetDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  addresses?: string[]

  @IsDate()
  start: Date

  @IsString()
  end: Date
}

export class LidoSubmissionCreateDTO {
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
  from: string
}

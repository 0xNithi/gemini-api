import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class Event {
  @IsString()
  protocol: string

  @IsString()
  eventName: string
}

export class EventGetDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Event)
  events: Event[]

  @IsNumber()
  start: number

  @IsNumber()
  end: number
}

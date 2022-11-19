import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Token {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  symbol: string

  @Column()
  decimals: number
}

import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm'
import { UniswapV3Swap } from './uniswapV3.entity'

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

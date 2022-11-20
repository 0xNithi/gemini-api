import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Token } from './token.entity'

@Entity()
export class UniswapV3Swap {
  @PrimaryColumn()
  id: string

  @Column()
  hash: string

  @Column()
  blockNumber: number

  @Column({ type: 'timestamp' })
  timestamp: Date

  @Column()
  amountIn: string

  @Column()
  amountOut: string

  @Column()
  tokenInId: string

  @Column()
  tokenOutId: string

  @Column()
  from: string

  @Column()
  to: string

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  tokenIn: Token

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  tokenOut: Token
}

@Entity()
export class UniswapV3Deposit {
  @PrimaryColumn()
  id: string

  @Column()
  hash: string

  @Column()
  blockNumber: number

  @Column({ type: 'timestamp' })
  timestamp: Date

  @Column()
  amount0: string

  @Column()
  amount1: string

  @Column()
  token0Id: string

  @Column()
  token1Id: string

  @Column()
  from: string

  @Column()
  to: string

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  token0: Token

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  token1: Token
}

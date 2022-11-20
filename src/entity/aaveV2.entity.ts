import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Token } from './token.entity'

@Entity()
export class AaveV2Deposit {
  @PrimaryColumn()
  id: string

  @Column()
  hash: string

  @Column()
  blockNumber: number

  @Column({ type: 'timestamp' })
  timestamp: Date

  @Column()
  amount: string

  @Column()
  tokenId: string

  @Column()
  from: string

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  token: Token
}

@Entity()
export class AaveV2Withdraw {
  @PrimaryColumn()
  id: string

  @Column()
  hash: string

  @Column()
  blockNumber: number

  @Column({ type: 'timestamp' })
  timestamp: Date

  @Column()
  amount: string

  @Column()
  tokenId: string

  @Column()
  from: string

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  token: Token
}

@Entity()
export class AaveV2Borrow {
  @PrimaryColumn()
  id: string

  @Column()
  hash: string

  @Column()
  blockNumber: number

  @Column({ type: 'timestamp' })
  timestamp: Date

  @Column()
  amount: string

  @Column()
  tokenId: string

  @Column()
  from: string

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  token: Token
}

@Entity()
export class AaveV2Repay {
  @PrimaryColumn()
  id: string

  @Column()
  hash: string

  @Column()
  blockNumber: number

  @Column({ type: 'timestamp' })
  timestamp: Date

  @Column()
  amount: string

  @Column()
  tokenId: string

  @Column()
  from: string

  @ManyToOne(() => Token)
  @JoinColumn({ referencedColumnName: 'id' })
  token: Token
}

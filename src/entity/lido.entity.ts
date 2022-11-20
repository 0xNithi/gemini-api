import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class LidoSubmission {
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
  from: string
}

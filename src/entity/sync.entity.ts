import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Sync {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  protocol: string

  @Column()
  blockNumber: number

  @Column({ default: false })
  syncing: boolean
}

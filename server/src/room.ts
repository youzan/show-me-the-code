import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', {
    default: '',
    nullable: false,
  })
  content!: string;

  @Column('varchar', {
    default: 'javascript',
    nullable: false,
  })
  language!: string;

  @Column('timestamp', {
    nullable: true,
  })
  expires!: Date | null;

  @CreateDateColumn()
  createdAt!: string;

  @UpdateDateColumn()
  updatedAt!: string;
}

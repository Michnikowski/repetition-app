import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WordFunction } from './word-function.entity';

@Entity()
export class Definition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  definement: string;

  @ManyToOne(() => WordFunction, (wordFunction) => wordFunction.definitions, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  wordFunction: WordFunction;
}

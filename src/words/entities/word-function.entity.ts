import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Definition } from './definition.entity';
import { Example } from './example.entity';
import { Word } from './word.entity';

@Entity()
export class WordFunction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  function: string;

  @ManyToOne(() => Word, (word) => word.wordFunctions, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  word: Word;

  @OneToMany(() => Definition, (definition) => definition.wordFunction)
  @JoinColumn()
  definitions: Definition[];

  @OneToMany(() => Example, (example) => example.wordFunction)
  @JoinColumn()
  examples: Example[];
}

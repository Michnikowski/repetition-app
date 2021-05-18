import { WordRootInterface } from 'src/interfaces/word-root';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from '../../words/entities/word.entity';

@Entity()
@Index(['name', 'meaning'], { unique: true })
export class WordRoot extends BaseEntity implements WordRootInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  meaning: string;

  @ManyToMany(() => Word, (word) => word.wordRoots, {
    cascade: true,
  })
  words: Word[];
}

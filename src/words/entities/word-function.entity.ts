import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Definition } from "./definition.entity";
import { Example } from "./example.entity";
import { Word } from "./word.entity";


@Entity()
export class WordFunction extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wordFunction: string;

  @ManyToOne(() => Word, word => word.wordFunctions)
  word: Word;

  @OneToMany(() => Definition, definition => definition.wordFunction)
  definitions: Definition[];

  @OneToMany(() => Example, example => example.wordFunction)
  examples: Example[];
}

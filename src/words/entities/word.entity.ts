import { WordInterface } from "src/interfaces/word";
import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { WordFunction } from "./word-function.entity";
import { WordRoot } from "../../roots/entities/word-root.entity";
import { UserWord } from "./user-word.entity";
import { Log } from "src/users/entities/log.entity";

@Entity()
export class Word extends BaseEntity implements WordInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Column()
  definition: string;

  @Column()
  membean: boolean;

  @Column({
    type: "text",
    nullable: true,
  })
  audioUrl: string;

  @Column({
    nullable: true,
  })
  phoneticNotation: string;

  @ManyToMany(() => WordRoot, wordRoot => wordRoot.words)
  @JoinTable()
  wordRoots: WordRoot[];

  @OneToMany(() => WordFunction, wordFunction => wordFunction.word)
  @JoinColumn()
  wordFunctions: WordFunction[];

  @OneToMany(() => UserWord, userWord => userWord.word)
  @JoinColumn()
  userWords: UserWord[];

  @OneToMany(() => Log, log => log.word)
  @JoinColumn()
  logs: Log[];

}

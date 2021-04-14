import { WordInterface } from "src/interfaces/word";
import { User } from "src/users/entities/user.entity";
import { BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { WordFunction } from "./word-function.entity";
import { WordRoot } from "./word-root.entity";

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
  inlist: boolean;

  @Column({
    type: "text",
    nullable: true,
  })
  audio: string;

  @Column({
    nullable: true,
  })
  phoneticsText: string;

  @ManyToMany(() => WordRoot, wordRoot => wordRoot.words)
  @JoinTable()
  wordRoots: WordRoot[];

  @ManyToMany(() => User, user => user.words)
  @JoinTable()
  users: User[];

  @OneToMany(() => WordFunction, wordFunction => wordFunction.word)
  wordFunctions: WordFunction[];
}

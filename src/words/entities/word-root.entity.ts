import { WordRootInterface } from "src/interfaces/word-root";
import { BaseEntity, Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberRootWord } from "./member-root-word.entity";

@Entity()
@Index(["name", "meaning"], { unique: true })
export class WordRoot extends BaseEntity implements WordRootInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  meaning: string;

  @ManyToMany(() => MemberRootWord, memberRootWord => memberRootWord.wordRoots, {
    cascade: true,
  })
  memberRootWords: MemberRootWord[];
}

import { MemberRootWordInterface } from "src/interfaces/member-root-word";
import { User } from "src/users/entities/user.entity";
import { BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SpeechPart } from "./speech-part.entity";
import { WordRoot } from "./word-root.entity";

@Entity()
export class MemberRootWord extends BaseEntity implements MemberRootWordInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Column()
  definition: string;

  @Column()
  inlist: boolean;

  @ManyToMany(() => WordRoot, wordRoot => wordRoot.memberRootWords)
  @JoinTable()
  wordRoots: WordRoot[];

  @ManyToMany(() => User, user => user.memberRootWords)
  @JoinTable()
  users: User[];

  @OneToMany(() => SpeechPart, speechPart => speechPart.memberRootWord)
  speechParts: SpeechPart[];
}

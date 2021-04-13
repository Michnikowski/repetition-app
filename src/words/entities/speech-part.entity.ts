import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Definition } from "./definition.entity";
import { Example } from "./example.entity";
import { MemberRootWord } from "./member-root-word.entity";


@Entity()
export class SpeechPart extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  partOfSpeach: string;

  @ManyToOne(() => MemberRootWord, memberRootWord => memberRootWord.speechParts)
  memberRootWord: MemberRootWord;

  @OneToMany(() => Definition, definition => definition.speechPart)
  definitions: Definition[];

  @OneToMany(() => Example, example => example.speechPart)
  examples: Example[];
}

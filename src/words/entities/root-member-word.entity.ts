import { RootMemberWordInterface } from "src/interfaces/root-member-word";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RootWord } from "./root-word.entity";

@Entity()
export class RootMemberWord extends BaseEntity implements RootMemberWordInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  definition: string;

  @Column()
  type: string;

  @ManyToOne(() => RootWord, rootWord => rootWord.rootMemberWords)
  rootWord: RootWord;
}

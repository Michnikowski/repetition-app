import { RootMemberWordInterface } from "src/interfaces/root-member-word";
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RootWord } from "./root-word.entity";

@Entity()
@Index(["name", "rootWord"], { unique: true })
export class RootMemberWord extends BaseEntity implements RootMemberWordInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Column()
  definition: string;

  @Column()
  inlist: boolean;

  @ManyToOne(() => RootWord, rootWord => rootWord.rootMemberWords)
  rootWord: RootWord;
}

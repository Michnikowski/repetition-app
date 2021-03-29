import { RootWordInterface } from "src/interfaces/root-word";
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RootMemberWord } from "./root-member-word.entity";

@Entity()
@Index(["name", "meaning"], { unique: true })
export class RootWord extends BaseEntity implements RootWordInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  meaning: string;

  @OneToMany(() => RootMemberWord, rootMemberWord => rootMemberWord.rootWord, {
    cascade: true,
  })
  rootMemberWords: RootMemberWord[];
}

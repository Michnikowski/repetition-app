import { RootWordInterface } from "src/interfaces/root-word";
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RootMemberWord } from "./root-member-word.entity";

@Entity()
export class RootWord extends BaseEntity implements RootWordInterface {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    unique: true,
  })
  name: string;

  @Column()
  meaning: string;

  @OneToMany(() => RootMemberWord, rootMemberWord => rootMemberWord.rootWord, {
    cascade: true,
  })
  rootMemberWords: RootMemberWord[];
}
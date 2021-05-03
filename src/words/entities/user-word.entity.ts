import { User } from "src/users/entities/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Word } from "./word.entity";

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

@Entity()
@Unique(["word", "user"])
export class UserWord extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
  type: "enum",
  enum: Status,
  default: Status.ACTIVE
  })
  wordStatus: Status

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  lastUpdatedDate: Date;

  @ManyToOne(() => Word, word => word.userWords, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  word: Word;

  @ManyToOne(() => User, user => user.userWords, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

}

import { User } from "src/users/entities/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Word } from "./word.entity";

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export enum RepetitionTime {
  IMMEDIATELLY = 0,
  TOMORROW = 1,
  IN_THREE_DAYS = 3,
  IN_SEVEN_DAYS = 7,
  IN_FOURTEEN_DAYS = 14,
  IN_SIXTY_DAYS = 60
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
    type: "enum",
    enum: RepetitionTime,
    default: RepetitionTime.IMMEDIATELLY
  })
  wordLevel: RepetitionTime

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  lastUpdatedDate: Date;

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  repetitionDate: Date;

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

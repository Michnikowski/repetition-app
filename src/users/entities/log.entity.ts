import { Word } from "src/words/entities/word.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

export enum RepetitionTime {
  IMMEDIATELLY = 0,
  TOMORROW = 1,
  IN_THREE_DAYS = 3,
  IN_SEVEN_DAYS = 7,
  IN_FOURTEEN_DAYS = 14,
  IN_SIXTY_DAYS = 60
}

export enum ActionType {
  ADDITION_BY_USER = 'addition by user',
  ADDITION_BY_RANDOM = 'addition by random',
  DELETION = 'deletion',
  LEVEL_UP = 'level up',
  LEVEL_DOWN = 'level down',
  LEVEL_NO_CHANGE = 'level no change',
  CHANGE_STATUS_ACTIVE = 'change status to active',
  CHANGE_STATUS_INACTIVE = 'change status to inactive'
}
@Entity()
export class Log extends BaseEntity{

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  actionDate: Date;

  @Column({
    type: "enum",
    enum: ActionType
  })
  actionType: ActionType

  @Column({
    type: "enum",
    enum: RepetitionTime
  })
  repetitionTime: RepetitionTime

  @ManyToOne(() => User, user => user.logs, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Word, word => word.logs, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  word: Word;

}

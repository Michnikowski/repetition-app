import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WordFunction } from "./word-function.entity";

@Entity()
export class Example extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: "text",
  })
  usage: string;

  @ManyToOne(() => WordFunction, wordFunction => wordFunction.examples, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  wordFunction: WordFunction;
}

import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { WordFunction } from "./word-function.entity";

@Entity()
export class Definition extends BaseEntity {

  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: "text",
  })
  definition: string;

  @ManyToOne(() => WordFunction, wordFunction => wordFunction.definitions)
  wordFunction: WordFunction;
}

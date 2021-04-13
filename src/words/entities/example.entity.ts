import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SpeechPart } from "./speech-part.entity";

@Entity()
export class Example extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: "text",
  })
  example: string;

  @ManyToOne(() => SpeechPart, speechPart => speechPart.examples)
  speechPart: SpeechPart;
}

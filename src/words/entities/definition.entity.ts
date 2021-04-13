import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { SpeechPart } from "./speech-part.entity";


@Entity()
export class Definition extends BaseEntity {

  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: "text",
  })
  definition: string;

  @ManyToOne(() => SpeechPart, speechPart => speechPart.definitions)
  speechPart: SpeechPart;
}

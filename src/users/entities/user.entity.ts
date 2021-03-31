import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

@Entity()
export class User extends BaseEntity{

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole

  @Column({
    nullable: false,
    length: 100,
  })
  firstName: string;

  @Column({
    nullable: false,
    length: 100,
  })
  lastName: string;

  @Index()
  @Column({
    nullable: false,
    length: 255,
  })
  email: string;

  @Column({
    default: false,
  })
  isActive: boolean;

  @Column()
  pwdHash: string;

  @Column({
    nullable: true,
    default: null,
  })
  currentTokenId: string | null;
}

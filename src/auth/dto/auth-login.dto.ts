import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthLoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    pwd: string;
}

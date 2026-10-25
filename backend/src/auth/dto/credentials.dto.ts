import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class LoginDto {
    @IsEmail()
    @MaxLength(200)
    email: string
    @IsString() @IsNotEmpty()
    @MaxLength(128)
    password: string
}

// Length rules only on signup, so a short wrong password at login is a 401, not a 400.
export class SignupDto extends LoginDto {
    @MinLength(8)
    declare password: string
}

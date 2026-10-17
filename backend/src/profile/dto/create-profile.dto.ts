import { IsEmail, IsString, MaxLength } from "class-validator"

export class CreateProfileDto {
    @IsString() 
    @MaxLength(200)
    username: string
    @IsString() 
    @MaxLength(200)
    displayName: string
    @IsEmail() 
    email: string
}

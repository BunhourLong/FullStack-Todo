import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export const STATUSES = ["TODO" , "IN PROGRESS" , "DONE"]

export class CreateTodoDto {
    @IsString() @IsNotEmpty()
    @MaxLength(200)
    title: string
    @IsOptional()
    @IsIn(STATUSES)
    status?: string
    @IsOptional()
    @IsBoolean()
    starred?: boolean
}

import { ArrayNotEmpty, IsArray, IsIn, IsInt } from "class-validator"
import { STATUSES } from "./create-todo.dto.js"

export class IdsDto {
    @IsArray() @ArrayNotEmpty()
    @IsInt({ each: true })
    ids: number[]
}

export class BulkStatusDto extends IdsDto {
    @IsIn(STATUSES)
    status: string
}

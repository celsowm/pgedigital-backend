import { Dto, Field, t } from "adorn-api";

/**
 * Generic option DTO with id and nome
 * Used for dropdowns/selects across the application
 */
@Dto({ description: "Option with id and nome." })
export class IdNomeOptionDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

/**
 * Creates a typed array schema for options list
 */
export function createOptionsArraySchema<T extends new () => object>(
  optionDto: T,
  description: string
) {
  return t.array(t.ref(optionDto), { description });
}

/**
 * Factory to create named option DTOs for OpenAPI documentation
 */
export function createOptionDto(name: string, description: string) {
  @Dto({ name, description })
  class OptionDto {
    @Field(t.integer())
    id!: number;

    @Field(t.string({ minLength: 1 }))
    nome!: string;
  }
  return OptionDto;
}

/**
 * Type for option DTOs (id + nome)
 */
export interface OptionDtoType {
  id: number;
  nome: string;
}

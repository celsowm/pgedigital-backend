import { Dto, Field, t } from "adorn-api";

/**
 * Base DTO for the most common "resumo" pattern: id + nome
 * Used across the entire application for relationship summaries
 */
@Dto({ description: "Base resumo with id and nome." })
export class IdNomeResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

/**
 * Factory function to create named resumo DTOs with id+nome structure
 * Each call creates a unique class with its own OpenAPI schema name
 */
export function createIdNomeResumoDto(
  name: string,
  description: string
): typeof IdNomeResumoDto {
  @Dto({ name, description })
  class DynamicResumoDto {
    @Field(t.integer())
    id!: number;

    @Field(t.string({ minLength: 1 }))
    nome!: string;
  }
  return DynamicResumoDto;
}

/**
 * Factory for resumo with id + nome + optional especializada reference
 */
export function createResumoWithEspecializadaDto(
  name: string,
  description: string,
  especializadaDto: typeof IdNomeResumoDto
) {
  @Dto({ name, description })
  class ResumoWithEspecializadaDto {
    @Field(t.integer())
    id!: number;

    @Field(t.string({ minLength: 1 }))
    nome!: string;

    @Field(t.optional(t.ref(especializadaDto)))
    especializada?: InstanceType<typeof especializadaDto>;
  }
  return ResumoWithEspecializadaDto;
}

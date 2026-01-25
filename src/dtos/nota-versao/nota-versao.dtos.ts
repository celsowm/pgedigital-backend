import { createMetalCrudDtoClasses } from "adorn-api";
import { NotaVersao } from "../../entities/NotaVersao";

const notaVersaoCrud = createMetalCrudDtoClasses(NotaVersao, {
  response: { description: "Nota versao retornada pela API." },
  mutationExclude: ["id", "data_exclusao", "data_inativacao"]
});

export const {
  response: NotaVersaoDto,
  create: CreateNotaVersaoDto,
  replace: ReplaceNotaVersaoDto,
  update: UpdateNotaVersaoDto,
  params: NotaVersaoParamsDto
} = notaVersaoCrud;

export type NotaVersaoDto = Omit<NotaVersao, "data"> & { data: string };

type NotaVersaoMutationDto = Omit<
  NotaVersaoDto,
  "id" | "data_exclusao" | "data_inativacao"
>;

export type CreateNotaVersaoDto = NotaVersaoMutationDto;
export type ReplaceNotaVersaoDto = NotaVersaoMutationDto;
export type UpdateNotaVersaoDto = Partial<NotaVersaoMutationDto>;

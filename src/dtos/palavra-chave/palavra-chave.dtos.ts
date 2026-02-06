import {
    createMetalCrudDtoClasses,
    createPagedResponseDtoClass,
    t
} from "adorn-api";
import { PalavraChave } from "../../entities/PalavraChave";
import {
    createCrudErrors,
    createPagedFilterSortingQueryDtoClass,
    type SortingQueryParams,
    type CreateDto,
    type UpdateDto
} from "../common";

const palavraChaveCrud = createMetalCrudDtoClasses(PalavraChave, {
    response: { description: "Palavra-chave retornada pela API." },
    mutationExclude: ["id"]
});

export const {
    response: PalavraChaveDto,
    create: CreatePalavraChaveDto,
    replace: ReplacePalavraChaveDto,
    update: UpdatePalavraChaveDto,
    params: PalavraChaveParamsDto
} = palavraChaveCrud;

export type PalavraChaveDto = PalavraChave;

type PalavraChaveMutationDto = CreateDto<PalavraChaveDto>;
export type CreatePalavraChaveDto = PalavraChaveMutationDto;
export type ReplacePalavraChaveDto = PalavraChaveMutationDto;
export type UpdatePalavraChaveDto = UpdateDto<PalavraChaveDto>;
export type PalavraChaveParamsDto = InstanceType<typeof PalavraChaveParamsDto>;

export const PalavraChaveQueryDtoClass = createPagedFilterSortingQueryDtoClass({
    name: "PalavraChaveQueryDto",
    sortableColumns: ["id", "palavra", "obrigatoriedade"],
    filters: {
        palavraContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
        obrigatoriedade: { schema: t.boolean(), operator: "equals" }
    }
});

export interface PalavraChaveQueryDto extends SortingQueryParams {
    page?: number;
    pageSize?: number;
    palavraContains?: string;
    obrigatoriedade?: boolean;
}

export const PalavraChavePagedResponseDto = createPagedResponseDtoClass({
    name: "PalavraChavePagedResponseDto",
    itemDto: PalavraChaveDto,
    description: "Paged palavra-chave list response."
});

export const PalavraChaveErrors = createCrudErrors("palavra-chave");

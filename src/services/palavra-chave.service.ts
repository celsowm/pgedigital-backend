import { PalavraChave } from "../entities/PalavraChave";
import type {
    CreatePalavraChaveDto,
    PalavraChaveDto,
    PalavraChaveQueryDto,
    ReplacePalavraChaveDto,
    UpdatePalavraChaveDto
} from "../dtos/palavra-chave/palavra-chave.dtos";
import {
    PalavraChaveRepository,
    PALAVRA_CHAVE_FILTER_MAPPINGS
} from "../repositories/palavra-chave.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "palavra", "obrigatoriedade"] as const;

export class PalavraChaveService extends BaseService<
    PalavraChave,
    PalavraChaveQueryDto,
    PalavraChaveDto,
    CreatePalavraChaveDto,
    ReplacePalavraChaveDto,
    UpdatePalavraChaveDto
> {
    protected readonly repository: PalavraChaveRepository;
    protected readonly listConfig: ListConfig<PalavraChave> = {
        filterMappings: PALAVRA_CHAVE_FILTER_MAPPINGS,
        sortableColumns: [...SORTABLE_COLUMNS],
        defaultSortBy: "id",
        defaultSortOrder: "ASC"
    };
    protected readonly entityName = "palavra-chave";

    constructor(repository?: PalavraChaveRepository) {
        super();
        this.repository = repository ?? new PalavraChaveRepository();
    }
}

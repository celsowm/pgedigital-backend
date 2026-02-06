import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
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

export class PalavraChaveService extends BaseService<PalavraChave, PalavraChaveQueryDto> {
    protected readonly repository: PalavraChaveRepository;
    protected readonly listConfig: ListConfig<PalavraChave> = {
        filterMappings: PALAVRA_CHAVE_FILTER_MAPPINGS,
        sortableColumns: [...SORTABLE_COLUMNS],
        defaultSortBy: "id",
        defaultSortOrder: "ASC"
    };
    private readonly entityName = "palavra-chave";

    constructor(repository?: PalavraChaveRepository) {
        super();
        this.repository = repository ?? new PalavraChaveRepository();
    }

    async getOne(id: number): Promise<PalavraChaveDto> {
        return withSession(async (session) => {
            const entity = await this.repository.findById(session, id);
            if (!entity) {
                throw new HttpError(404, `${this.entityName} not found.`);
            }
            return entity as PalavraChaveDto;
        });
    }

    async create(input: CreatePalavraChaveDto): Promise<PalavraChaveDto> {
        return withSession(async (session) => {
            const entity = new PalavraChave();
            applyInput(entity, input as Partial<PalavraChave>, { partial: false });
            await session.persist(entity);
            await session.commit();
            return entity as PalavraChaveDto;
        });
    }

    async replace(id: number, input: ReplacePalavraChaveDto): Promise<PalavraChaveDto> {
        return withSession(async (session) => {
            const entity = await this.repository.findById(session, id);
            if (!entity) {
                throw new HttpError(404, `${this.entityName} not found.`);
            }
            applyInput(entity, input as Partial<PalavraChave>, { partial: false });
            await session.commit();

            const reloaded = await this.repository.findById(session, id);
            if (!reloaded) {
                throw new HttpError(404, `${this.entityName} not found.`);
            }
            return reloaded as PalavraChaveDto;
        });
    }

    async update(id: number, input: UpdatePalavraChaveDto): Promise<PalavraChaveDto> {
        return withSession(async (session) => {
            const entity = await this.repository.findById(session, id);
            if (!entity) {
                throw new HttpError(404, `${this.entityName} not found.`);
            }
            applyInput(entity, input as Partial<PalavraChave>, { partial: true });
            await session.commit();

            const reloaded = await this.repository.findById(session, id);
            if (!reloaded) {
                throw new HttpError(404, `${this.entityName} not found.`);
            }
            return reloaded as PalavraChaveDto;
        });
    }

    async remove(id: number): Promise<void> {
        return withSession(async (session) => {
            const entity = await this.repository.findById(session, id);
            if (!entity) {
                throw new HttpError(404, `${this.entityName} not found.`);
            }
            await session.remove(entity);
            await session.commit();
        });
    }
}

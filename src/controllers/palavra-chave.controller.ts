import {
    Body,
    Controller,
    Delete,
    Get,
    Params,
    Patch,
    Post,
    Put,
    Query,
    Returns,
    parseIdOrThrow,
    type RequestContext
} from "adorn-api";
import {
    CreatePalavraChaveDto,
    ReplacePalavraChaveDto,
    PalavraChaveDto,
    PalavraChaveErrors,
    PalavraChavePagedResponseDto,
    PalavraChaveParamsDto,
    PalavraChaveQueryDto,
    PalavraChaveQueryDtoClass,
    UpdatePalavraChaveDto
} from "../dtos/palavra-chave/palavra-chave.dtos";
import { PalavraChaveService } from "../services/palavra-chave.service";

@Controller("/palavra-chave")
export class PalavraChaveController {
    private readonly service = new PalavraChaveService();

    @Get("/")
    @Query(PalavraChaveQueryDtoClass)
    @Returns(PalavraChavePagedResponseDto)
    async list(ctx: RequestContext<unknown, PalavraChaveQueryDto>): Promise<unknown> {
        return this.service.list(ctx.query ?? {});
    }

    @Get("/:id")
    @Params(PalavraChaveParamsDto)
    @Returns(PalavraChaveDto)
    @PalavraChaveErrors
    async getOne(
        ctx: RequestContext<unknown, undefined, PalavraChaveParamsDto>
    ): Promise<PalavraChaveDto> {
        const id = parseIdOrThrow(ctx.params.id, "palavra-chave");
        return this.service.getOne(id);
    }

    @Post("/")
    @Body(CreatePalavraChaveDto)
    @Returns({ status: 201, schema: PalavraChaveDto })
    async create(ctx: RequestContext<CreatePalavraChaveDto>): Promise<PalavraChaveDto> {
        return this.service.create(ctx.body as CreatePalavraChaveDto);
    }

    @Put("/:id")
    @Params(PalavraChaveParamsDto)
    @Body(ReplacePalavraChaveDto)
    @Returns(PalavraChaveDto)
    @PalavraChaveErrors
    async replace(
        ctx: RequestContext<ReplacePalavraChaveDto, undefined, PalavraChaveParamsDto>
    ): Promise<PalavraChaveDto> {
        const id = parseIdOrThrow(ctx.params.id, "palavra-chave");
        return this.service.replace(id, ctx.body as ReplacePalavraChaveDto);
    }

    @Patch("/:id")
    @Params(PalavraChaveParamsDto)
    @Body(UpdatePalavraChaveDto)
    @Returns(PalavraChaveDto)
    @PalavraChaveErrors
    async update(
        ctx: RequestContext<UpdatePalavraChaveDto, undefined, PalavraChaveParamsDto>
    ): Promise<PalavraChaveDto> {
        const id = parseIdOrThrow(ctx.params.id, "palavra-chave");
        return this.service.update(id, ctx.body as UpdatePalavraChaveDto);
    }

    @Delete("/:id")
    @Params(PalavraChaveParamsDto)
    @Returns({ status: 204 })
    @PalavraChaveErrors
    async remove(ctx: RequestContext<unknown, undefined, PalavraChaveParamsDto>): Promise<void> {
        const id = parseIdOrThrow(ctx.params.id, "palavra-chave");
        await this.service.remove(id);
    }
}

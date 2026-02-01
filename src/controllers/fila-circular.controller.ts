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
  applyInput,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import { entityRef } from "metal-orm";
import { withSession } from "../db/mssql";
import { FilaCircular } from "../entities/FilaCircular";
import {
  FilaCircularDto,
  CreateFilaCircularDto,
  ReplaceFilaCircularDto,
  UpdateFilaCircularDto,
  FilaCircularParamsDto,
  FilaCircularPagedResponseDto,
  FilaCircularQueryDto,
  FilaCircularQueryDtoClass,
  FilaCircularErrors,
  FilaCircularOptionsDto,
  FilaCircularOptionDto
} from "../dtos/fila-circular/fila-circular.dtos";
import { BaseController } from "../utils/base-controller";

const FilaCircularRef = entityRef(FilaCircular);

type FilaCircularFilterFields = never;

const FILA_CIRCULAR_FILTER_MAPPINGS = {} satisfies Record<string, { field: FilaCircularFilterFields; operator: "equals" | "contains" }>;

@Controller("/fila-circular")
export class FilaCircularController extends BaseController<FilaCircular, FilaCircularFilterFields> {
  get entityClass() {
    return FilaCircular;
  }

  get entityRef(): any {
    return FilaCircularRef;
  }

  get filterMappings(): Record<string, { field: FilaCircularFilterFields; operator: "equals" | "contains" }> {
    return FILA_CIRCULAR_FILTER_MAPPINGS;
  }

  get entityName() {
    return "fila circular";
  }

  protected get optionsLabelField(): string {
    return "ultimo_elemento";
  }

  @Get("/")
  @Query(FilaCircularQueryDtoClass)
  @Returns(FilaCircularPagedResponseDto)
  async list(ctx: RequestContext<unknown, FilaCircularQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(FilaCircularQueryDtoClass)
  @Returns(FilaCircularOptionsDto)
  async listOptions(ctx: RequestContext<unknown, FilaCircularQueryDto>): Promise<FilaCircularOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(FilaCircularParamsDto)
  @Returns(FilaCircularDto)
  @FilaCircularErrors
  async getOne(ctx: RequestContext<unknown, undefined, FilaCircularParamsDto>): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "fila circular");
      const filaCircular = await super.getEntityOrThrow(session, id);
      return filaCircular as FilaCircularDto;
    });
  }

  @Post("/")
  @Body(CreateFilaCircularDto)
  @Returns({ status: 201, schema: FilaCircularDto })
  async create(ctx: RequestContext<CreateFilaCircularDto>): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = new FilaCircular();
      applyInput(filaCircular, ctx.body as Partial<FilaCircular>, { partial: false });
      await session.persist(filaCircular);
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  @Put("/:id")
  @Params(FilaCircularParamsDto)
  @Body(ReplaceFilaCircularDto)
  @Returns(FilaCircularDto)
  @FilaCircularErrors
  async replace(
    ctx: RequestContext<ReplaceFilaCircularDto, undefined, FilaCircularParamsDto>
  ): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "fila circular");
      const filaCircular = await super.getEntityOrThrow(session, id);
      applyInput(filaCircular, ctx.body as Partial<FilaCircular>, { partial: false });
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  @Patch("/:id")
  @Params(FilaCircularParamsDto)
  @Body(UpdateFilaCircularDto)
  @Returns(FilaCircularDto)
  @FilaCircularErrors
  async update(
    ctx: RequestContext<UpdateFilaCircularDto, undefined, FilaCircularParamsDto>
  ): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "fila circular");
      const filaCircular = await super.getEntityOrThrow(session, id);
      applyInput(filaCircular, ctx.body as Partial<FilaCircular>, { partial: true });
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  @Delete("/:id")
  @Params(FilaCircularParamsDto)
  @Returns({ status: 204 })
  @FilaCircularErrors
  async remove(ctx: RequestContext<unknown, undefined, FilaCircularParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "fila circular");
      await super.delete(session, id);
    });
  }
}

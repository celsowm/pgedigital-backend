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
import { ExitoSucumbencia } from "../entities/ExitoSucumbencia";
import {
  ExitoSucumbenciaDto,
  CreateExitoSucumbenciaDto,
  ReplaceExitoSucumbenciaDto,
  UpdateExitoSucumbenciaDto,
  ExitoSucumbenciaParamsDto,
  ExitoSucumbenciaPagedResponseDto,
  ExitoSucumbenciaQueryDto,
  ExitoSucumbenciaQueryDtoClass,
  ExitoSucumbenciaErrors,
  ExitoSucumbenciaOptionsDto,
  ExitoSucumbenciaOptionDto
} from "../dtos/exito-sucumbencia/exito-sucumbencia.dtos";
import { BaseController } from "../utils/base-controller";

const ExitoSucumbenciaRef = entityRef(ExitoSucumbencia);

type ExitoSucumbenciaFilterFields = "nome";

const EXITO_SUCUMBENCIA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ExitoSucumbenciaFilterFields; operator: "equals" | "contains" }>;

@Controller("/exito-sucumbencia")
export class ExitoSucumbenciaController extends BaseController<ExitoSucumbencia, ExitoSucumbenciaFilterFields> {
  get entityClass() {
    return ExitoSucumbencia;
  }

  get entityRef(): any {
    return ExitoSucumbenciaRef;
  }

  get filterMappings(): Record<string, { field: ExitoSucumbenciaFilterFields; operator: "equals" | "contains" }> {
    return EXITO_SUCUMBENCIA_FILTER_MAPPINGS;
  }

  get entityName() {
    return "êxito de sucumbência";
  }

  @Get("/")
  @Query(ExitoSucumbenciaQueryDtoClass)
  @Returns(ExitoSucumbenciaPagedResponseDto)
  async list(ctx: RequestContext<unknown, ExitoSucumbenciaQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(ExitoSucumbenciaQueryDtoClass)
  @Returns(ExitoSucumbenciaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, ExitoSucumbenciaQueryDto>): Promise<ExitoSucumbenciaOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Returns(ExitoSucumbenciaDto)
  @ExitoSucumbenciaErrors
  async getOne(ctx: RequestContext<unknown, undefined, ExitoSucumbenciaParamsDto>): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
      const exitoSucumbencia = await super.getEntityOrThrow(session, id);
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  @Post("/")
  @Body(CreateExitoSucumbenciaDto)
  @Returns({ status: 201, schema: ExitoSucumbenciaDto })
  async create(ctx: RequestContext<CreateExitoSucumbenciaDto>): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const exitoSucumbencia = new ExitoSucumbencia();
      applyInput(exitoSucumbencia, ctx.body as Partial<ExitoSucumbencia>, { partial: false });
      await session.persist(exitoSucumbencia);
      await session.commit();
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  @Put("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Body(ReplaceExitoSucumbenciaDto)
  @Returns(ExitoSucumbenciaDto)
  @ExitoSucumbenciaErrors
  async replace(
    ctx: RequestContext<ReplaceExitoSucumbenciaDto, undefined, ExitoSucumbenciaParamsDto>
  ): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
      const exitoSucumbencia = await super.getEntityOrThrow(session, id);
      applyInput(exitoSucumbencia, ctx.body as Partial<ExitoSucumbencia>, { partial: false });
      await session.commit();
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  @Patch("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Body(UpdateExitoSucumbenciaDto)
  @Returns(ExitoSucumbenciaDto)
  @ExitoSucumbenciaErrors
  async update(
    ctx: RequestContext<UpdateExitoSucumbenciaDto, undefined, ExitoSucumbenciaParamsDto>
  ): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
      const exitoSucumbencia = await super.getEntityOrThrow(session, id);
      applyInput(exitoSucumbencia, ctx.body as Partial<ExitoSucumbencia>, { partial: true });
      await session.commit();
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  @Delete("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Returns({ status: 204 })
  @ExitoSucumbenciaErrors
  async remove(ctx: RequestContext<unknown, undefined, ExitoSucumbenciaParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
      await super.delete(session, id);
    });
  }
}

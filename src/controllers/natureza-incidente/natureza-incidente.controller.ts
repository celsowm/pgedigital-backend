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
import { withSession } from "../../db/mssql";
import { NaturezaIncidente } from "../../entities/NaturezaIncidente";
import {
  NaturezaIncidenteDto,
  CreateNaturezaIncidenteDto,
  ReplaceNaturezaIncidenteDto,
  UpdateNaturezaIncidenteDto,
  NaturezaIncidenteParamsDto,
  NaturezaIncidentePagedResponseDto,
  NaturezaIncidenteQueryDto,
  NaturezaIncidenteQueryDtoClass,
  NaturezaIncidenteErrors,
  NaturezaIncidenteOptionsDto,
  NaturezaIncidenteOptionDto
} from "../../dtos/natureza-incidente/natureza-incidente.dtos";
import { BaseController } from "../../utils/base-controller";

const NaturezaIncidenteRef = entityRef(NaturezaIncidente);

type NaturezaIncidenteFilterFields = "nome";

const NATUREZA_INCIDENTE_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: NaturezaIncidenteFilterFields; operator: "equals" | "contains" }>;

@Controller("/natureza-incidente")
export class NaturezaIncidenteController extends BaseController<NaturezaIncidente, NaturezaIncidenteFilterFields> {
  get entityClass() {
    return NaturezaIncidente;
  }

  get entityRef(): any {
    return NaturezaIncidenteRef;
  }

  get filterMappings(): Record<string, { field: NaturezaIncidenteFilterFields; operator: "equals" | "contains" }> {
    return NATUREZA_INCIDENTE_FILTER_MAPPINGS;
  }

  get entityName() {
    return "natureza incidente";
  }

  @Get("/")
  @Query(NaturezaIncidenteQueryDtoClass)
  @Returns(NaturezaIncidentePagedResponseDto)
  async list(ctx: RequestContext<unknown, NaturezaIncidenteQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(NaturezaIncidenteQueryDtoClass)
  @Returns(NaturezaIncidenteOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, NaturezaIncidenteQueryDto>
  ): Promise<NaturezaIncidenteOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Returns(NaturezaIncidenteDto)
  @NaturezaIncidenteErrors
  async getOne(ctx: RequestContext<unknown, undefined, NaturezaIncidenteParamsDto>): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
      const naturezaIncidente = await super.getEntityOrThrow(session, id);
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  @Post("/")
  @Body(CreateNaturezaIncidenteDto)
  @Returns({ status: 201, schema: NaturezaIncidenteDto })
  async create(ctx: RequestContext<CreateNaturezaIncidenteDto>): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const naturezaIncidente = new NaturezaIncidente();
      applyInput(naturezaIncidente, ctx.body as Partial<NaturezaIncidente>, { partial: false });
      await session.persist(naturezaIncidente);
      await session.commit();
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  @Put("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Body(ReplaceNaturezaIncidenteDto)
  @Returns(NaturezaIncidenteDto)
  @NaturezaIncidenteErrors
  async replace(
    ctx: RequestContext<ReplaceNaturezaIncidenteDto, undefined, NaturezaIncidenteParamsDto>
  ): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
      const naturezaIncidente = await super.getEntityOrThrow(session, id);
      applyInput(naturezaIncidente, ctx.body as Partial<NaturezaIncidente>, { partial: false });
      await session.commit();
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  @Patch("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Body(UpdateNaturezaIncidenteDto)
  @Returns(NaturezaIncidenteDto)
  @NaturezaIncidenteErrors
  async update(
    ctx: RequestContext<UpdateNaturezaIncidenteDto, undefined, NaturezaIncidenteParamsDto>
  ): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
      const naturezaIncidente = await super.getEntityOrThrow(session, id);
      applyInput(naturezaIncidente, ctx.body as Partial<NaturezaIncidente>, { partial: true });
      await session.commit();
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  @Delete("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Returns({ status: 204 })
  @NaturezaIncidenteErrors
  async remove(ctx: RequestContext<unknown, undefined, NaturezaIncidenteParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
      await super.delete(session, id);
    });
  }
}

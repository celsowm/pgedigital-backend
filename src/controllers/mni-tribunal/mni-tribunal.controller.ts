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
import { MniTribunal } from "../../entities/MniTribunal";
import {
  MniTribunalDto,
  CreateMniTribunalDto,
  ReplaceMniTribunalDto,
  UpdateMniTribunalDto,
  MniTribunalParamsDto,
  MniTribunalPagedResponseDto,
  MniTribunalQueryDto,
  MniTribunalQueryDtoClass,
  MniTribunalErrors,
  MniTribunalOptionsDto,
  MniTribunalOptionDto
} from "../../dtos/mni-tribunal/mni-tribunal.dtos";
import { BaseController } from "../../utils/base-controller";

const MniTribunalRef = entityRef(MniTribunal);

type MniTribunalFilterFields = "sigla" | "descricao" | "identificador_cnj";

const MNI_TRIBUNAL_FILTER_MAPPINGS = {
  descricaoContains: { field: "descricao", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" },
  identificadorCnjEquals: { field: "identificador_cnj", operator: "equals" }
} satisfies Record<string, { field: MniTribunalFilterFields; operator: "equals" | "contains" }>;

@Controller("/mni-tribunal")
export class MniTribunalController extends BaseController<MniTribunal, MniTribunalFilterFields> {
  get entityClass() {
    return MniTribunal;
  }

  get entityRef(): any {
    return MniTribunalRef;
  }

  get filterMappings(): Record<string, { field: MniTribunalFilterFields; operator: "equals" | "contains" }> {
    return MNI_TRIBUNAL_FILTER_MAPPINGS;
  }

  get entityName() {
    return "MNI Tribunal";
  }

  protected get optionsLabelField(): string {
    return "descricao";
  }

  @Get("/")
  @Query(MniTribunalQueryDtoClass)
  @Returns(MniTribunalPagedResponseDto)
  async list(ctx: RequestContext<unknown, MniTribunalQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(MniTribunalQueryDtoClass)
  @Returns(MniTribunalOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, MniTribunalQueryDto>
  ): Promise<MniTribunalOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(MniTribunalParamsDto)
  @Returns(MniTribunalDto)
  @MniTribunalErrors
  async getOne(ctx: RequestContext<unknown, undefined, MniTribunalParamsDto>): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
      const mniTribunal = await super.getEntityOrThrow(session, id);
      return mniTribunal as MniTribunalDto;
    });
  }

  @Post("/")
  @Body(CreateMniTribunalDto)
  @Returns({ status: 201, schema: MniTribunalDto })
  async create(ctx: RequestContext<CreateMniTribunalDto>): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const mniTribunal = new MniTribunal();
      applyInput(mniTribunal, ctx.body as Partial<MniTribunal>, { partial: false });
      await session.persist(mniTribunal);
      await session.commit();
      return mniTribunal as MniTribunalDto;
    });
  }

  @Put("/:id")
  @Params(MniTribunalParamsDto)
  @Body(ReplaceMniTribunalDto)
  @Returns(MniTribunalDto)
  @MniTribunalErrors
  async replace(
    ctx: RequestContext<ReplaceMniTribunalDto, undefined, MniTribunalParamsDto>
  ): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
      const mniTribunal = await super.getEntityOrThrow(session, id);
      applyInput(mniTribunal, ctx.body as Partial<MniTribunal>, { partial: false });
      await session.commit();
      return mniTribunal as MniTribunalDto;
    });
  }

  @Patch("/:id")
  @Params(MniTribunalParamsDto)
  @Body(UpdateMniTribunalDto)
  @Returns(MniTribunalDto)
  @MniTribunalErrors
  async update(
    ctx: RequestContext<UpdateMniTribunalDto, undefined, MniTribunalParamsDto>
  ): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
      const mniTribunal = await super.getEntityOrThrow(session, id);
      applyInput(mniTribunal, ctx.body as Partial<MniTribunal>, { partial: true });
      await session.commit();
      return mniTribunal as MniTribunalDto;
    });
  }

  @Delete("/:id")
  @Params(MniTribunalParamsDto)
  @Returns({ status: 204 })
  @MniTribunalErrors
  async remove(ctx: RequestContext<unknown, undefined, MniTribunalParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
      await super.delete(session, id);
    });
  }
}

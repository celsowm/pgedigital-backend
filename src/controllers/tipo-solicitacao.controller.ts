import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import { entityRef } from "metal-orm";
import { TipoSolicitacao } from "../entities/TipoSolicitacao";
import {
  TipoSolicitacaoOptionDto,
  TipoSolicitacaoOptionsDto,
  TipoSolicitacaoPagedResponseDto,
  TipoSolicitacaoQueryDto,
  TipoSolicitacaoQueryDtoClass
} from "../dtos/tipo-solicitacao/tipo-solicitacao.dtos";
import { BaseController } from "../utils/base-controller";

const TipoSolicitacaoRef = entityRef(TipoSolicitacao);

type TipoSolicitacaoFilterFields = "nome" | "solicitacao_externa";

const TIPO_SOLICITACAO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  solicitacaoExterna: { field: "solicitacao_externa", operator: "equals" }
} satisfies Record<string, { field: TipoSolicitacaoFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-solicitacao")
export class TipoSolicitacaoController extends BaseController<TipoSolicitacao, TipoSolicitacaoFilterFields> {
  get entityClass() {
    return TipoSolicitacao;
  }

  get entityRef(): any {
    return TipoSolicitacaoRef;
  }

  get filterMappings(): Record<string, { field: TipoSolicitacaoFilterFields; operator: "equals" | "contains" }> {
    return TIPO_SOLICITACAO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo solicitacao";
  }

  @Get("/")
  @Query(TipoSolicitacaoQueryDtoClass)
  @Returns(TipoSolicitacaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoSolicitacaoQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(TipoSolicitacaoQueryDtoClass)
  @Returns(TipoSolicitacaoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TipoSolicitacaoQueryDto>): Promise<TipoSolicitacaoOptionDto[]> {
    return super.listOptions(ctx);
  }
}

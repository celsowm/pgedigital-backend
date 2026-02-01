import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import {
  TipoSolicitacaoOptionDto,
  TipoSolicitacaoOptionsDto,
  TipoSolicitacaoPagedResponseDto,
  TipoSolicitacaoQueryDto,
  TipoSolicitacaoQueryDtoClass
} from "../dtos/tipo-solicitacao/tipo-solicitacao.dtos";
import { TipoSolicitacaoService } from "../services/tipo-solicitacao.service";

@Controller("/tipo-solicitacao")
export class TipoSolicitacaoController {
  private readonly service = new TipoSolicitacaoService();

  @Get("/")
  @Query(TipoSolicitacaoQueryDtoClass)
  @Returns(TipoSolicitacaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoSolicitacaoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(TipoSolicitacaoQueryDtoClass)
  @Returns(TipoSolicitacaoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TipoSolicitacaoQueryDto>): Promise<TipoSolicitacaoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}

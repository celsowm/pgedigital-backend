import { Controller, Get, Returns, type RequestContext } from "adorn-api";
import {
  TipoMigracaoAcervoOptionsDto,
  TipoMigracaoAcervoOptionDto
} from "../dtos/tipo-migracao-acervo/tipo-migracao-acervo.dtos";
import { TipoMigracaoAcervoService } from "../services/tipo-migracao-acervo.service";

@Controller("/tipo-migracao-acervo")
export class TipoMigracaoAcervoController {
  private readonly service = new TipoMigracaoAcervoService();

  @Get("/options")
  @Returns(TipoMigracaoAcervoOptionsDto)
  async listOptions(_ctx: RequestContext): Promise<TipoMigracaoAcervoOptionDto[]> {
    return this.service.listOptions();
  }
}

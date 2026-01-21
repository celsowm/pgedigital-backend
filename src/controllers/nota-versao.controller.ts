import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Params,
  Query,
  Returns,
  parsePagination,
  type RequestContext,
} from 'adorn-api';
import { toPagedResponse } from 'metal-orm';
import { NotaVersaoService } from '../services/nota-versao.service';
import {
  NotaVersaoDto,
  CreateNotaVersaoDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto,
  NotaVersaoParamsDto,
  NotaVersaoFilterDtoClass,
  NotaVersaoPagedResponseDto,
  NotaVersaoErrors,
  type NotaVersaoFilterDto,
} from '../dtos/nota-versao';

@Controller('/nota-versoes')
export class NotaVersaoController {
  constructor(private readonly service: NotaVersaoService) {}

  @Get('/')
  @Query(NotaVersaoFilterDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async findAll(ctx: RequestContext<unknown, NotaVersaoFilterDto>) {
    const filters: any = {};
    
    if (ctx.query?.dataEquals !== undefined) filters.dataEquals = new Date(ctx.query.dataEquals);
    if (ctx.query?.dataGte !== undefined) filters.dataGte = new Date(ctx.query.dataGte);
    if (ctx.query?.dataLte !== undefined) filters.dataLte = new Date(ctx.query.dataLte);
    if (ctx.query?.sprintEquals !== undefined) filters.sprintEquals = ctx.query.sprintEquals;
    if (ctx.query?.sprintGte !== undefined) filters.sprintGte = ctx.query.sprintGte;
    if (ctx.query?.sprintLte !== undefined) filters.sprintLte = ctx.query.sprintLte;
    if (ctx.query?.ativoEquals !== undefined) filters.ativoEquals = ctx.query.ativoEquals;
    if (ctx.query?.mensagemContains !== undefined) filters.mensagemContains = ctx.query.mensagemContains;
    
    filters.sortBy = (ctx.query as any).sortBy;
    filters.sortOrder = (ctx.query as any).sortOrder || 'ASC';
    filters.includeDeleted = (ctx.query as any).includeDeleted === 'true';

    const { page, pageSize } = parsePagination(ctx.query as any);

    const result = await this.service.findAll(filters, { page, pageSize });
    
    return toPagedResponse({
      items: result.items,
      totalItems: result.total,
      page,
      pageSize,
    });
  }

  @Get('/:id')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async findById(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    const includeDeleted = (ctx.query as any).includeDeleted === 'true';
    
    const notaVersao = await this.service.findById(id, includeDeleted);
    
    if (!notaVersao) {
      throw new Error('Nota versão not found');
    }
    
    return notaVersao;
  }

  @Post('/')
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: RequestContext<CreateNotaVersaoDto>) {
    const notaVersao = await this.service.create(ctx.body);
    return notaVersao;
  }

  @Put('/:id')
  @Params(NotaVersaoParamsDto)
  @Body(ReplaceNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async replace(ctx: RequestContext<ReplaceNotaVersaoDto, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    return await this.service.replace(id, ctx.body);
  }

  @Patch('/:id')
  @Params(NotaVersaoParamsDto)
  @Body(UpdateNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async update(ctx: RequestContext<UpdateNotaVersaoDto, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    return await this.service.update(id, ctx.body);
  }

  @Delete('/:id')
  @Params(NotaVersaoParamsDto)
  @Returns({ status: 204 })
  @NotaVersaoErrors
  async softDelete(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    await this.service.softDelete(id);
  }

  @Post('/:id/inactivate')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async softInactivate(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    await this.service.softInactivate(id);
    const notaVersao = await this.service.findById(id, true);
    return notaVersao;
  }

  @Post('/:id/restore')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async restore(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    return await this.service.restore(id);
  }

  @Delete('/:id/hard')
  @Params(NotaVersaoParamsDto)
  @Returns({ status: 204 })
  @NotaVersaoErrors
  async hardDelete(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = parseInt(ctx.params.id as string);
    await this.service.hardDelete(id);
  }
}

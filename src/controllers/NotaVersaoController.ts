import { Controller, Get, Post, Put } from "adorn-api";
import type { NotaVersao } from "../db/entities/NotaVersao.js";
import { withSession } from "../db/orm.js";
import * as NotaVersaoService from "../services/NotaVersaoService.js";
import type { PaginatedResult } from "metal-orm";

type NotaVersaoQuery = {
  ativo?: boolean;
  sprint?: number;
  page?: number;
  pageSize?: number;
};

@Controller("/nota-versao")
export class NotaVersaoController {
  @Get("/")
  async list(query?: NotaVersaoQuery): Promise<PaginatedResult<NotaVersao>> {
    const { page, pageSize, ...filters } = query || {};
    const pagination = { page, pageSize };
    return withSession(session => NotaVersaoService.listPaged(session, filters, pagination));
  }

  @Get("/:id")
  async getById(id: number): Promise<NotaVersao | null> {
    return withSession(session => NotaVersaoService.getById(session, id));
  }

  @Post("/")
  async create(body: NotaVersaoService.NotaVersaoCreateInput): Promise<NotaVersao> {
    return withSession(session => NotaVersaoService.create(session, body));
  }

  @Put("/:id")
  async update(
    id: number,
    body: NotaVersaoService.NotaVersaoUpdateInput,
  ): Promise<NotaVersao | null> {
    return withSession(session => NotaVersaoService.update(session, id, body));
  }
}

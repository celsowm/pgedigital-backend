import { Controller, Get, Post, Put } from "adorn-api";
import { withSession } from "../../db/orm.js";
import * as NotaVersaoService from "../../services/nota-versao/NotaVersaoService.js";

type NotaVersaoQuery = {
  ativo?: boolean;
  sprint?: number;
};

@Controller("/nota-versao")
export class NotaVersaoController {
  @Get("/")
  async list(query?: NotaVersaoQuery) {
    return withSession(session => NotaVersaoService.list(session, query));
  }

  @Get("/:id")
  async getById(id: number) {
    return withSession(session => NotaVersaoService.getById(session, id));
  }

  @Post("/")
  async create(body: NotaVersaoService.NotaVersaoCreateInput) {
    return withSession(session => NotaVersaoService.create(session, body));
  }

  @Put("/:id")
  async update(id: number, body: NotaVersaoService.NotaVersaoUpdateInput) {
    return withSession(session => NotaVersaoService.update(session, id, body));
  }
}

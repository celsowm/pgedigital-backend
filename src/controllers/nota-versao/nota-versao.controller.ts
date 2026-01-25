import {
  Body,
  Controller,
  Delete,
  Get,
  HttpError,
  Params,
  Patch,
  Post,
  Put,
  Returns,
  t
} from "adorn-api";
import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { withMssqlSession } from "../../db/mssql";
import { NotaVersao } from "../../entities/NotaVersao";
import {
  CreateNotaVersaoDto,
  NotaVersaoDto,
  NotaVersaoParamsDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto
} from "../../dtos/nota-versao/nota-versao.dtos";

const notaVersaoRef = entityRef(NotaVersao);

type MssqlSession = OrmSession;

function requireNotaVersaoId(value: unknown): number {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, "Invalid nota versao id.");
  }
  return id;
}

function parseDateInput(value: unknown, fieldName: string): Date {
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value;
    }
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  throw new HttpError(400, `Invalid ${fieldName}.`);
}

function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function serializeNotaVersao(nota: NotaVersao): NotaVersaoDto {
  return {
    ...nota,
    data: formatDateOnly(nota.data)
  };
}

async function getNotaVersaoOrThrow(session: MssqlSession, id: number): Promise<NotaVersao> {
  const nota = await session.find(NotaVersao, id);
  if (!nota) {
    throw new HttpError(404, "Nota versao not found.");
  }
  return nota;
}

@Controller({ path: "/nota-versao", tags: ["Nota versao"] })
export class NotaVersaoController {
  @Get("/")
  @Returns(t.array(t.ref(NotaVersaoDto)))
  async list() {
    return withMssqlSession(async session => {
      const notas = await selectFromEntity(NotaVersao)
        .orderBy(notaVersaoRef.id, "ASC")
        .execute(session);
      return notas.map(serializeNotaVersao);
    });
  }

  @Get("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  async getOne(ctx: { params: Record<string, unknown> }) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withMssqlSession(async session => {
      const nota = await getNotaVersaoOrThrow(session, id);
      return serializeNotaVersao(nota);
    });
  }

  @Post("/")
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: { body: CreateNotaVersaoDto }) {
    return withMssqlSession(async session => {
      const nota = new NotaVersao();
      nota.data = parseDateInput(ctx.body.data, "data");
      nota.sprint = ctx.body.sprint;
      nota.ativo = ctx.body.ativo;
      nota.mensagem = ctx.body.mensagem;
      await session.persist(nota);
      await session.commit();
      return serializeNotaVersao(nota);
    });
  }

  @Put("/:id")
  @Params(NotaVersaoParamsDto)
  @Body(ReplaceNotaVersaoDto)
  @Returns(NotaVersaoDto)
  async replace(ctx: { body: ReplaceNotaVersaoDto; params: Record<string, unknown> }) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withMssqlSession(async session => {
      const nota = await getNotaVersaoOrThrow(session, id);
      nota.data = parseDateInput(ctx.body.data, "data");
      nota.sprint = ctx.body.sprint;
      nota.ativo = ctx.body.ativo;
      nota.mensagem = ctx.body.mensagem;
      await session.commit();
      return serializeNotaVersao(nota);
    });
  }

  @Patch("/:id")
  @Params(NotaVersaoParamsDto)
  @Body(UpdateNotaVersaoDto)
  @Returns(NotaVersaoDto)
  async update(ctx: { body: UpdateNotaVersaoDto; params: Record<string, unknown> }) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withMssqlSession(async session => {
      const nota = await getNotaVersaoOrThrow(session, id);
      if (ctx.body.data !== undefined) {
        nota.data = parseDateInput(ctx.body.data, "data");
      }
      if (ctx.body.sprint !== undefined) {
        nota.sprint = ctx.body.sprint;
      }
      if (ctx.body.ativo !== undefined) {
        nota.ativo = ctx.body.ativo;
      }
      if (ctx.body.mensagem !== undefined) {
        nota.mensagem = ctx.body.mensagem;
      }
      await session.commit();
      return serializeNotaVersao(nota);
    });
  }

  @Delete("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns({ status: 204 })
  async remove(ctx: { params: Record<string, unknown> }) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withMssqlSession(async session => {
      const nota = await getNotaVersaoOrThrow(session, id);
      await session.remove(nota);
      await session.commit();
    });
  }
}

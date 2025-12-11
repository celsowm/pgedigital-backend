import { OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  listNotaVersaoEntities,
  findNotaVersaoById,
  createNotaVersaoRecord,
  NotaVersaoCreatePayload,
} from '../repositories/nota-versao-repository.js';
import { BadRequestError, NotFoundError } from '../errors/http-error.js';

const MAX_MESSAGE_LENGTH = 255;

export interface NotaVersaoCreateInput {
  data: string;
  sprint: number;
  mensagem: string;
  ativo?: boolean;
}

export interface NotaVersaoUpdateInput {
  data?: string;
  sprint?: number;
  mensagem?: string;
  ativo?: boolean;
}

export interface NotaVersaoListQuery {
  sprint?: number;
  ativo?: boolean;
  includeInactive?: boolean;
}

export interface NotaVersaoResponse {
  id: number;
  data: string;
  sprint: number;
  ativo: boolean;
  mensagem: string;
  data_exclusao?: string;
  data_inativacao?: string;
}

const toResponse = (entity: NotaVersao): NotaVersaoResponse => ({
  id: entity.id,
  data: entity.data.toISOString(),
  sprint: entity.sprint,
  ativo: entity.ativo,
  mensagem: entity.mensagem,
  data_exclusao: entity.data_exclusao?.toISOString(),
  data_inativacao: entity.data_inativacao?.toISOString(),
});

const parseDate = (value: string, field: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError(`${field} must be a valid ISO date`);
  }
  return parsed;
};

const sanitizeMensagem = (value: string) => value.trim();

const validateMensagem = (mensagem: string) => {
  if (!mensagem) {
    throw new BadRequestError('Mensagem is required');
  }

  if (mensagem.length > MAX_MESSAGE_LENGTH) {
    throw new BadRequestError(`Mensagem cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
  }
};

const ensureSprintNumber = (sprint: number) => {
  if (!Number.isFinite(sprint) || sprint <= 0) {
    throw new BadRequestError('Sprint must be a positive number');
  }
};

export async function listNotaVersao(
  session: OrmSession,
  query?: NotaVersaoListQuery,
): Promise<NotaVersaoResponse[]> {
  const rows = await listNotaVersaoEntities(session, {
    sprint: query?.sprint,
    ativo: query?.ativo,
    includeDeleted: query?.includeInactive,
  });

  return rows.map(toResponse);
}

export async function getNotaVersao(
  session: OrmSession,
  id: number,
): Promise<NotaVersaoResponse> {
  const entity = await findNotaVersaoById(session, id);
  if (!entity) {
    throw new NotFoundError(`NotaVersao ${id} not found`);
  }

  return toResponse(entity);
}

export async function createNotaVersao(
  session: OrmSession,
  input: NotaVersaoCreateInput,
): Promise<NotaVersaoResponse> {
  const mensagem = sanitizeMensagem(input.mensagem);
  validateMensagem(mensagem);
  ensureSprintNumber(input.sprint);
  const data = parseDate(input.data, 'data');

  const shouldActivate = input.ativo ?? true;
  if (shouldActivate) {
    const activeForSprint = await listNotaVersaoEntities(session, {
      sprint: input.sprint,
      ativo: true,
      includeDeleted: true,
    });
    const now = new Date();
    activeForSprint.forEach((entity) => {
      if (entity.ativo) {
        entity.ativo = false;
        entity.data_inativacao = now;
      }
    });
  }

  const entity = createNotaVersaoRecord(session, {
    data,
    sprint: input.sprint,
    mensagem,
    ativo: shouldActivate,
  } satisfies NotaVersaoCreatePayload);

  await session.commit();
  return toResponse(entity);
}

export async function updateNotaVersao(
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
): Promise<NotaVersaoResponse> {
  const entity = await findNotaVersaoById(session, id);
  if (!entity) {
    throw new NotFoundError(`NotaVersao ${id} not found`);
  }

  if (input.mensagem !== undefined) {
    const mensagem = sanitizeMensagem(input.mensagem);
    validateMensagem(mensagem);
    entity.mensagem = mensagem;
  }

  let targetSprint = entity.sprint;
  if (input.sprint !== undefined) {
    ensureSprintNumber(input.sprint);
    targetSprint = input.sprint;
    entity.sprint = targetSprint;
  }

  if (input.data !== undefined) {
    entity.data = parseDate(input.data, 'data');
  }

  const intendedActive = input.ativo ?? entity.ativo;
  if (intendedActive && !entity.ativo) {
    const activeForSprint = await listNotaVersaoEntities(session, {
      sprint: targetSprint,
      ativo: true,
      includeDeleted: true,
    });
    const now = new Date();
    activeForSprint.forEach((item) => {
      if (item.id !== entity.id && item.ativo) {
        item.ativo = false;
        item.data_inativacao = now;
      }
    });
  }

  entity.ativo = intendedActive;
  if (!intendedActive && !entity.data_inativacao) {
    entity.data_inativacao = new Date();
  }

  await session.commit();
  return toResponse(entity);
}

export async function deleteNotaVersao(
  session: OrmSession,
  id: number,
): Promise<void> {
  const entity = await findNotaVersaoById(session, id);
  if (!entity) {
    throw new NotFoundError(`NotaVersao ${id} not found`);
  }

  entity.ativo = false;
  const now = new Date();
  entity.data_exclusao = now;
  entity.data_inativacao ??= now;

  await session.commit();
}

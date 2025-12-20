import { BadRequestError } from '../errors/http-error.js';
import type {
  EspecializadaCreateInput,
  EspecializadaUpdateInput,
} from '../types/especializada-types.js';

const MAX_NOME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_SIGLA_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeText(value: string): string {
  return value.trim();
}

function validateNome(value: string): void {
  if (value.length === 0) {
    throw new BadRequestError('Nome is required');
  }

  if (value.length > MAX_NOME_LENGTH) {
    throw new BadRequestError(`Nome cannot exceed ${MAX_NOME_LENGTH} characters`);
  }
}

function assertBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new BadRequestError(`${field} must be a boolean`);
  }
  return value;
}

function assertPositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }
  return value;
}

function assertNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new BadRequestError(`${field} must be a non-negative integer`);
  }
  return value;
}

function normalizeOptionalPositiveInteger(
  value: number | undefined,
  field: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  return assertPositiveInteger(value, field);
}

function normalizeOptionalNonNegativeInteger(
  value: number | undefined,
  field: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  return assertNonNegativeInteger(value, field);
}

function normalizeOptionalEmail(email: string | undefined): string | undefined {
  if (email === undefined) {
    return undefined;
  }

  const normalized = email.trim();
  if (normalized.length === 0) {
    throw new BadRequestError('Email cannot be empty');
  }

  if (normalized.length > MAX_EMAIL_LENGTH) {
    throw new BadRequestError(`Email cannot exceed ${MAX_EMAIL_LENGTH} characters`);
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new BadRequestError('Email must be a valid address');
  }

  return normalized;
}

function normalizeOptionalSigla(sigla: string | undefined): string | undefined {
  if (sigla === undefined) {
    return undefined;
  }

  const normalized = sigla.trim();
  if (normalized.length === 0) {
    throw new BadRequestError('Sigla cannot be empty');
  }

  if (normalized.length > MAX_SIGLA_LENGTH) {
    throw new BadRequestError(`Sigla cannot exceed ${MAX_SIGLA_LENGTH} characters`);
  }

  return normalized.toUpperCase();
}

export function validateEspecializadaCreateInput(
  input: EspecializadaCreateInput,
) {
  const nome = sanitizeText(input.nome);
  validateNome(nome);

  return {
    responsavel_id: assertPositiveInteger(input.responsavel_id, 'responsavel_id'),
    nome,
    usa_pge_digital: assertBoolean(input.usa_pge_digital, 'usa_pge_digital'),
    codigo_ad: assertPositiveInteger(input.codigo_ad, 'codigo_ad'),
    usa_plantao_audiencia: assertBoolean(input.usa_plantao_audiencia, 'usa_plantao_audiencia'),
    equipe_triagem_id: normalizeOptionalPositiveInteger(input.equipe_triagem_id, 'equipe_triagem_id'),
    tipo_divisao_carga_trabalho_id: normalizeOptionalPositiveInteger(
      input.tipo_divisao_carga_trabalho_id,
      'tipo_divisao_carga_trabalho_id',
    ),
    tipo_localidade_especializada_id: normalizeOptionalPositiveInteger(
      input.tipo_localidade_especializada_id,
      'tipo_localidade_especializada_id',
    ),
    email: normalizeOptionalEmail(input.email),
    restricao_ponto_focal: input.restricao_ponto_focal ?? false,
    sigla: normalizeOptionalSigla(input.sigla),
    tipo_especializada_id: normalizeOptionalPositiveInteger(
      input.tipo_especializada_id,
      'tipo_especializada_id',
    ),
    especializada_triagem: input.especializada_triagem ?? false,
    caixa_entrada_max: normalizeOptionalNonNegativeInteger(
      input.caixa_entrada_max,
      'caixa_entrada_max',
    ),
  };
}

type EspecializadaCreateValidated = ReturnType<typeof validateEspecializadaCreateInput>;

export function validateEspecializadaUpdateInput(
  input: EspecializadaUpdateInput,
): Partial<EspecializadaCreateValidated> {
  const result: Partial<EspecializadaCreateValidated> = {};

  if (input.responsavel_id !== undefined) {
    result.responsavel_id = assertPositiveInteger(input.responsavel_id, 'responsavel_id');
  }

  if (input.nome !== undefined) {
    const nome = sanitizeText(input.nome);
    validateNome(nome);
    result.nome = nome;
  }

  if (input.usa_pge_digital !== undefined) {
    result.usa_pge_digital = assertBoolean(input.usa_pge_digital, 'usa_pge_digital');
  }

  if (input.codigo_ad !== undefined) {
    result.codigo_ad = assertPositiveInteger(input.codigo_ad, 'codigo_ad');
  }

  if (input.usa_plantao_audiencia !== undefined) {
    result.usa_plantao_audiencia = assertBoolean(input.usa_plantao_audiencia, 'usa_plantao_audiencia');
  }

  if (input.equipe_triagem_id !== undefined) {
    result.equipe_triagem_id = normalizeOptionalPositiveInteger(
      input.equipe_triagem_id,
      'equipe_triagem_id',
    );
  }

  if (input.tipo_divisao_carga_trabalho_id !== undefined) {
    result.tipo_divisao_carga_trabalho_id = normalizeOptionalPositiveInteger(
      input.tipo_divisao_carga_trabalho_id,
      'tipo_divisao_carga_trabalho_id',
    );
  }

  if (input.tipo_localidade_especializada_id !== undefined) {
    result.tipo_localidade_especializada_id = normalizeOptionalPositiveInteger(
      input.tipo_localidade_especializada_id,
      'tipo_localidade_especializada_id',
    );
  }

  if (input.email !== undefined) {
    result.email = normalizeOptionalEmail(input.email);
  }

  if (input.restricao_ponto_focal !== undefined) {
    result.restricao_ponto_focal = assertBoolean(
      input.restricao_ponto_focal,
      'restricao_ponto_focal',
    );
  }

  if (input.sigla !== undefined) {
    result.sigla = normalizeOptionalSigla(input.sigla);
  }

  if (input.tipo_especializada_id !== undefined) {
    result.tipo_especializada_id = normalizeOptionalPositiveInteger(
      input.tipo_especializada_id,
      'tipo_especializada_id',
    );
  }

  if (input.especializada_triagem !== undefined) {
    result.especializada_triagem = assertBoolean(input.especializada_triagem, 'especializada_triagem');
  }

  if (input.caixa_entrada_max !== undefined) {
    result.caixa_entrada_max = normalizeOptionalNonNegativeInteger(
      input.caixa_entrada_max,
      'caixa_entrada_max',
    );
  }

  return result;
}

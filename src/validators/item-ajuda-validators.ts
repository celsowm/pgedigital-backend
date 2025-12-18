/**
 * Validation utilities for ItemAjuda.
 *
 * Centralizes validation logic that can be reused across services.
 */
import { BadRequestError } from '../errors/http-error.js';

export const MAX_IDENTIFICADOR_LENGTH = 150;

export function sanitizeIdentificador(value: string): string {
  return value.trim();
}

export function validateIdentificador(identificador: string): void {
  if (!identificador) {
    throw new BadRequestError('Identificador is required');
  }

  if (identificador.length > MAX_IDENTIFICADOR_LENGTH) {
    throw new BadRequestError(
      `Identificador cannot exceed ${MAX_IDENTIFICADOR_LENGTH} characters`,
    );
  }
}

export function validateHtml(html: string): void {
  if (!html || html.trim().length === 0) {
    throw new BadRequestError('Html is required');
  }
}

export function validateItemAjudaCreateInput(input: {
  identificador: string;
  html: string;
}): {
  identificador: string;
  html: string;
} {
  const identificador = sanitizeIdentificador(input.identificador);
  validateIdentificador(identificador);
  validateHtml(input.html);

  return {
    identificador,
    html: input.html,
  };
}

export function validateItemAjudaUpdateInput(input: {
  identificador?: string;
  html?: string;
}): {
  identificador?: string;
  html?: string;
} {
  const result: { identificador?: string; html?: string } = {};

  if (input.identificador !== undefined) {
    result.identificador = sanitizeIdentificador(input.identificador);
    validateIdentificador(result.identificador);
  }

  if (input.html !== undefined) {
    validateHtml(input.html);
    result.html = input.html;
  }

  return result;
}


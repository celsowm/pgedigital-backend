/**
 * Validation utilities for NotaVersao.
 *
 * Centralizes all validation logic that can be reused across services.
 */
import { BadRequestError } from '../errors/http-error.js';

export const MAX_MESSAGE_LENGTH = 255;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Parses a date string and validates it's a valid ISO date.
 * @throws BadRequestError if the date is invalid
 */
export function parseDate(value: string, field: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestError(`${field} must be a valid ISO date`);
    }
    return parsed;
}

/**
 * Sanitizes the mensagem field by trimming whitespace.
 */
export function sanitizeMensagem(value: string): string {
    return value.trim();
}

/**
 * Validates the mensagem field.
 * @throws BadRequestError if mensagem is empty or exceeds max length
 */
export function validateMensagem(mensagem: string): void {
    if (!mensagem) {
        throw new BadRequestError('Mensagem is required');
    }

    if (mensagem.length > MAX_MESSAGE_LENGTH) {
        throw new BadRequestError(`Mensagem cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
    }
}

/**
 * Validates that sprint is a positive number.
 * @throws BadRequestError if sprint is not a positive finite number
 */
export function validateSprintNumber(sprint: number): void {
    if (!Number.isFinite(sprint) || sprint <= 0) {
        throw new BadRequestError('Sprint must be a positive number');
    }
}

/**
 * Normalizes and validates the page parameter.
 * @throws BadRequestError if page is not a positive integer
 */
export function normalizePage(page?: number): number {
    if (page === undefined) {
        return 1;
    }

    if (!Number.isInteger(page) || page <= 0) {
        throw new BadRequestError('page must be a positive integer');
    }

    return page;
}

/**
 * Normalizes and validates the pageSize parameter.
 * @throws BadRequestError if pageSize is invalid
 */
export function normalizePageSize(pageSize?: number): number {
    if (pageSize === undefined) {
        return DEFAULT_PAGE_SIZE;
    }

    if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new BadRequestError('pageSize must be a positive integer');
    }

    if (pageSize > MAX_PAGE_SIZE) {
        throw new BadRequestError(`pageSize cannot exceed ${MAX_PAGE_SIZE}`);
    }

    return pageSize;
}

/**
 * Validates and sanitizes NotaVersao create input.
 * Returns the validated/transformed values.
 */
export function validateNotaVersaoCreateInput(input: {
    data: string;
    sprint: number;
    mensagem: string;
    ativo?: boolean;
}): {
    data: Date;
    sprint: number;
    mensagem: string;
    ativo: boolean;
} {
    const mensagem = sanitizeMensagem(input.mensagem);
    validateMensagem(mensagem);
    validateSprintNumber(input.sprint);
    const data = parseDate(input.data, 'data');

    return {
        data,
        sprint: input.sprint,
        mensagem,
        ativo: input.ativo ?? true,
    };
}

/**
 * Validates and sanitizes NotaVersao update input.
 * Returns only the validated/transformed values that were provided.
 */
export function validateNotaVersaoUpdateInput(input: {
    data?: string;
    sprint?: number;
    mensagem?: string;
    ativo?: boolean;
}): {
    data?: Date;
    sprint?: number;
    mensagem?: string;
    ativo?: boolean;
} {
    const result: {
        data?: Date;
        sprint?: number;
        mensagem?: string;
        ativo?: boolean;
    } = {};

    if (input.mensagem !== undefined) {
        result.mensagem = sanitizeMensagem(input.mensagem);
        validateMensagem(result.mensagem);
    }

    if (input.sprint !== undefined) {
        validateSprintNumber(input.sprint);
        result.sprint = input.sprint;
    }

    if (input.data !== undefined) {
        result.data = parseDate(input.data, 'data');
    }

    if (input.ativo !== undefined) {
        result.ativo = input.ativo;
    }

    return result;
}

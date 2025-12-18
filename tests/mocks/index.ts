/**
 * Test mock factories for creating properly typed mock objects.
 *
 * Provides factories to create mock sessions and entities with
 * realistic behavior instead of empty objects.
 */
import type { OrmSession } from 'metal-orm';
import type { NotaVersao } from '../../src/entities/index.js';

/**
 * Creates a mock OrmSession for testing.
 * Provides stub implementations for core session methods.
 */
export function createMockSession(overrides?: Partial<OrmSession>): OrmSession {
    return {
        saveGraph: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    } as unknown as OrmSession;
}

/**
 * Creates a mock NotaVersao entity for testing.
 */
export function createMockNotaVersao(
    overrides?: Partial<NotaVersao>,
): NotaVersao {
    const now = new Date();
    return {
        id: Math.floor(Math.random() * 1000) + 1,
        data: now,
        sprint: 1,
        ativo: true,
        mensagem: 'Test message',
        data_exclusao: undefined,
        data_inativacao: undefined,
        ...overrides,
    } as NotaVersao;
}

/**
 * Creates an array of mock NotaVersao entities.
 */
export function createMockNotaVersaoList(
    count: number,
    baseOverrides?: Partial<NotaVersao>,
): NotaVersao[] {
    return Array.from({ length: count }, (_, i) =>
        createMockNotaVersao({
            id: i + 1,
            sprint: Math.floor(i / 2) + 1,
            ...baseOverrides,
        }),
    );
}

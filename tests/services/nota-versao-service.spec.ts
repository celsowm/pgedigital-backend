import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { OrmSession } from 'metal-orm';
import type { NotaVersao } from '../../src/entities/index.js';
import * as repository from '../../src/repositories/nota-versao-repository.js';
import { BadRequestError } from '../../src/errors/http-error.js';
import { createNotaVersao } from '../../src/services/nota-versao-service.js';

const createSession = (): OrmSession =>
  ({
    commit: vi.fn().mockResolvedValue(undefined),
  } as unknown as OrmSession);

describe('nota-versao service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects oversized mensagem values', async () => {
    const session = createSession();
    await expect(
      createNotaVersao(session, {
        data: '2025-01-01T00:00:00.000Z',
        sprint: 1,
        mensagem: 'x'.repeat(300),
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('deactivates other active versions before creating a new one', async () => {
    const session = createSession();
    const existing = {
      id: 1,
      data: new Date(),
      sprint: 42,
      ativo: true,
      mensagem: 'old note',
      data_inativacao: undefined,
    } as unknown as NotaVersao;
    const listSpy = vi
      .spyOn(repository, 'listNotaVersaoEntities')
      .mockResolvedValue([existing]);
    const createSpy = vi
      .spyOn(repository, 'createNotaVersaoRecord')
      .mockImplementation(() =>
        ({
          id: 2,
          data: new Date(),
          sprint: 42,
          ativo: true,
          mensagem: 'new message',
        } as unknown as NotaVersao),
      );

    const result = await createNotaVersao(session, {
      data: '2025-01-15T00:00:00.000Z',
      sprint: 42,
      mensagem: 'new message',
    });

    expect(existing.ativo).toBe(false);
    expect(existing.data_inativacao).toBeInstanceOf(Date);
    expect(listSpy).toHaveBeenCalledWith(
      session,
      expect.objectContaining({ sprint: 42 }),
    );
    expect(createSpy).toHaveBeenCalled();
    expect(session.commit).toHaveBeenCalled();
    expect(result.mensagem).toBe('new message');
  });
});

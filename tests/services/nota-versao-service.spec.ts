import type { NotaVersao } from '../../src/entities/index.js';
import * as repository from '../../src/repositories/nota-versao-repository.js';
import { BadRequestError } from '../../src/errors/http-error.js';
import { createNotaVersao, listNotaVersao } from '../../src/services/nota-versao-service.js';
import { createMockSession, createMockNotaVersao } from '../mocks/index.js';

describe('nota-versao service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects oversized mensagem values', async () => {
    const session = createMockSession();
    await expect(
      createNotaVersao(session, {
        data: '2025-01-01T00:00:00.000Z',
        sprint: 1,
        mensagem: 'x'.repeat(300),
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('deactivates other active versions before creating a new one', async () => {
    const session = createMockSession();
    const existing = createMockNotaVersao({
      id: 1,
      sprint: 42,
      ativo: true,
      mensagem: 'old note',
      data_inativacao: undefined,
    });

    // Mock deactivateOtherVersionsForSprint to simulate its behavior
    const deactivateOthersSpy = vi
      .spyOn(repository, 'deactivateOtherVersionsForSprint')
      .mockImplementation(async () => {
        // Simulate what the real function does
        existing.ativo = false;
        existing.data_inativacao = new Date();
      });

    const persistSpy = vi
      .spyOn(repository, 'persistNotaVersaoGraph')
      .mockResolvedValue(
        createMockNotaVersao({
          id: 2,
          sprint: 42,
          ativo: true,
          mensagem: 'new message',
        }),
      );

    const result = await createNotaVersao(session, {
      data: '2025-01-15T00:00:00.000Z',
      sprint: 42,
      mensagem: 'new message',
    });

    // deactivateOtherVersionsForSprint should have been called
    expect(deactivateOthersSpy).toHaveBeenCalledWith(session, 42);
    expect(existing.ativo).toBe(false);
    expect(existing.data_inativacao).toBeInstanceOf(Date);
    expect(persistSpy).toHaveBeenCalledWith(
      session,
      expect.objectContaining({
        sprint: 42,
        mensagem: 'new message',
        ativo: true,
      }),
    );
    expect(result.mensagem).toBe('new message');
  });

  it('paginates nota-versao list with defaults', async () => {
    const session = createMockSession();
    const entity = createMockNotaVersao({
      id: 1,
      data: new Date('2025-01-01T00:00:00.000Z'),
      sprint: 10,
      mensagem: 'teste',
    });
    const listSpy = vi
      .spyOn(repository, 'listNotaVersaoEntities')
      .mockResolvedValue([entity]);
    const countSpy = vi
      .spyOn(repository, 'countNotaVersaoEntities')
      .mockResolvedValue(5);

    const result = await listNotaVersao(session, {});

    expect(listSpy).toHaveBeenCalledWith(
      session,
      expect.objectContaining({
        limit: result.pagination.pageSize,
        offset: 0,
      }),
    );
    expect(countSpy).toHaveBeenCalled();
    expect(result.items[0]).toMatchObject({
      id: 1,
      mensagem: 'teste',
    });
    expect(result.pagination).toMatchObject({
      page: 1,
      pageSize: result.pagination.pageSize,
      totalItems: 5,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it('rejects invalid pageSize values', async () => {
    const session = createMockSession();
    await expect(
      listNotaVersao(session, { pageSize: 0 }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('applies explicit page and pageSize when provided', async () => {
    const session = createMockSession();
    const listSpy = vi
      .spyOn(repository, 'listNotaVersaoEntities')
      .mockResolvedValue([]);
    vi.spyOn(repository, 'countNotaVersaoEntities').mockResolvedValue(30);

    const result = await listNotaVersao(session, { page: 2, pageSize: 10 });

    expect(listSpy).toHaveBeenCalledWith(
      session,
      expect.objectContaining({ limit: 10, offset: 10 }),
    );
    expect(result.pagination).toMatchObject({
      page: 2,
      pageSize: 10,
      totalItems: 30,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});

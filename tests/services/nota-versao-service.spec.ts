import { NotaVersao } from '../../src/entities/index.js';
import type { NotaVersaoCreateInput } from '../../src/services/nota-versao-service.js';
import * as repository from '../../src/repositories/nota-versao-repository.js';
import { BadRequestError } from '../../src/errors/http-error.js';
import { createNotaVersao, listNotaVersao, updateNotaVersao } from '../../src/services/nota-versao-service.js';
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
        ativo: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('deactivates other active versions before creating a new one', async () => {
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

    const newEntity = createMockNotaVersao({
      id: 2,
      sprint: 42,
      ativo: true,
      mensagem: 'new message',
    });

    const saveGraphSpy = vi.fn().mockResolvedValue(newEntity);
    const session = createMockSession({ saveGraph: saveGraphSpy });

    const result = await createNotaVersao(session, {
      data: '2025-01-15T00:00:00.000Z',
      sprint: 42,
      mensagem: 'new message',
      ativo: true,
    });

    // deactivateOtherVersionsForSprint should have been called
    expect(deactivateOthersSpy).toHaveBeenCalledWith(session, 42);
    expect(existing.ativo).toBe(false);
    expect(existing.data_inativacao).toBeInstanceOf(Date);
    expect(saveGraphSpy).toHaveBeenCalledWith(
      NotaVersao,
      expect.objectContaining({
        sprint: 42,
        mensagem: 'new message',
        ativo: true,
      }),
      { transactional: false },
    );
    expect(session.commit).toHaveBeenCalled();
    expect(result.mensagem).toBe('new message');
  });

  it('deactivates other versions when updating sprint while still active', async () => {
    const session = createMockSession();
    const entity = createMockNotaVersao({
      id: 10,
      sprint: 1,
      ativo: true,
    });

    vi.spyOn(repository, 'findNotaVersaoById').mockResolvedValue(entity);
    const deactivateOthersSpy = vi
      .spyOn(repository, 'deactivateOtherVersionsForSprint')
      .mockResolvedValue(undefined);

    const result = await updateNotaVersao(session, 10, { sprint: 2 });

    expect(deactivateOthersSpy).toHaveBeenCalledWith(session, 2, 10);
    expect(result.sprint).toBe(2);
    expect(session.commit).toHaveBeenCalled();
  });

  it('paginates nota-versao list with defaults', async () => {
    const session = createMockSession();
    const entity = createMockNotaVersao({
      id: 1,
      data: new Date('2025-01-01T00:00:00.000Z'),
      sprint: 10,
      mensagem: 'teste',
    });
    const pagedSpy = vi
      .spyOn(repository, 'listNotaVersaoEntitiesPaged')
      .mockResolvedValue({ items: [entity], totalItems: 5 });

    const result = await listNotaVersao(session, {});

    expect(pagedSpy).toHaveBeenCalledWith(
      session,
      expect.objectContaining({}),
      expect.objectContaining({
        page: 1,
        pageSize: result.pagination.pageSize,
      }),
    );
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
    const pagedSpy = vi
      .spyOn(repository, 'listNotaVersaoEntitiesPaged')
      .mockResolvedValue({ items: [], totalItems: 30 });

    const result = await listNotaVersao(session, { page: 2, pageSize: 10 });

    expect(pagedSpy).toHaveBeenCalledWith(
      session,
      expect.objectContaining({}),
      expect.objectContaining({ page: 2, pageSize: 10 }),
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

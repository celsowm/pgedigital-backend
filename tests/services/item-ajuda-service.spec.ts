import { ItemAjuda } from '../../src/entities/index.js';
import * as repository from '../../src/repositories/item-ajuda-repository.js';
import { BadRequestError } from '../../src/errors/http-error.js';
import { createItemAjuda, listItemAjuda } from '../../src/services/item-ajuda-service.js';
import { createMockItemAjuda, createMockSession } from '../mocks/index.js';

describe('item-ajuda service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects oversized identificador values', async () => {
    const session = createMockSession();
    await expect(
      createItemAjuda(session, {
        identificador: 'x'.repeat(151),
        html: '<p>help</p>',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects empty html values', async () => {
    const session = createMockSession();
    await expect(
      createItemAjuda(session, {
        identificador: 'ajuda.teste',
        html: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('paginates item-ajuda list with defaults', async () => {
    const session = createMockSession();
    const entity = createMockItemAjuda({ id: 1, identificador: 'ajuda.a', html: '<p>a</p>' });
    const pagedSpy = vi
      .spyOn(repository, 'listItemAjudaEntitiesPaged')
      .mockResolvedValue({ items: [entity], totalItems: 5 });

    const result = await listItemAjuda(session, {});

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
      identificador: 'ajuda.a',
      html: '<p>a</p>',
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

  it('creates an item-ajuda row via saveGraph', async () => {
    const newEntity = createMockItemAjuda({
      id: 10,
      identificador: 'ajuda.novo',
      html: '<p>novo</p>',
    });

    const saveGraphSpy = vi.fn().mockResolvedValue(newEntity);
    const session = createMockSession({ saveGraph: saveGraphSpy });

    const result = await createItemAjuda(session, {
      identificador: 'ajuda.novo',
      html: '<p>novo</p>',
    });

    expect(saveGraphSpy).toHaveBeenCalledWith(
      ItemAjuda,
      expect.objectContaining({
        identificador: 'ajuda.novo',
        html: '<p>novo</p>',
      }),
      { transactional: false },
    );
    expect(session.commit).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 10,
      identificador: 'ajuda.novo',
      html: '<p>novo</p>',
    });
  });
});


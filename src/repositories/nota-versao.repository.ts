import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { NotaVersao } from "../entities/NotaVersao";

const N = entityRef(NotaVersao);

export type NotaVersaoFilterFields = "sprint" | "ativo" | "mensagem";

export const NOTA_VERSAO_FILTER_MAPPINGS = {
  sprint: { field: "sprint", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" },
  mensagemContains: { field: "mensagem", operator: "contains" }
} satisfies Record<string, { field: NotaVersaoFilterFields; operator: "equals" | "contains" }>;

export class NotaVersaoRepository {
  readonly entityClass = NotaVersao;
  readonly entityRef: any = N;

  buildListQuery(): any {
    return selectFromEntity(NotaVersao).orderBy(this.entityRef.id, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<NotaVersao | null> {
    return session.find(this.entityClass, id);
  }
}


import { describe, expect, it } from "vitest";
import {
  BelongsTo,
  BelongsToMany,
  BelongsToReference,
  Column,
  Entity,
  ManyToManyCollection,
  PrimaryKey,
  col,
  entityRef,
  eq,
  isNotNull,
  or,
  selectFromEntity
} from "metal-orm";
import { withSession } from "../../src/db/mssql";

/**
 * Minimal reproduction for Metal ORM pivot hydration.
 *
 * This file is intentionally NOT named *.test.ts so it won't run here by default.
 * Copy it to the Metal ORM repo, rename to *.test.ts, and replace `withSession`
 * with your repo's session helper.
 *
 * Expected behavior:
 *   Pivot columns should be accessible directly on the related entity
 *   (e.g. substituto.usa_equipe_acervo_substituto), not only under `_pivot`.
 *
 * Current behavior:
 *   Pivot columns are only available as substituto._pivot.*
 */

@Entity({ tableName: "usuario" })
class Usuario {
  @PrimaryKey(col.notNull(col.int()))
  id!: number;

  @Column(col.varchar(255))
  nome?: string;
}

@Entity({ tableName: "afastamento_pessoa" })
class AfastamentoPessoa {
  @PrimaryKey(col.notNull(col.int()))
  id!: number;

  @BelongsToMany({
    target: () => Usuario,
    pivotTable: () => AfastamentoPessoaUsuario,
    pivotForeignKeyToRoot: "afastamento_pessoa_id",
    pivotForeignKeyToTarget: "usuario_id"
  })
  substitutos!: ManyToManyCollection<Usuario>;
}

@Entity({ tableName: "afastamento_pessoa_usuario" })
class AfastamentoPessoaUsuario {
  @PrimaryKey(col.notNull(col.int()))
  id!: number;

  @Column(col.notNull(col.int()))
  afastamento_pessoa_id!: number;

  @Column(col.notNull(col.int()))
  usuario_id!: number;

  @Column(col.boolean())
  usa_equipe_acervo_substituto?: boolean;

  @Column(col.text())
  final_codigo_pa?: string;

  @BelongsTo({ target: () => AfastamentoPessoa, foreignKey: "afastamento_pessoa_id" })
  afastamentoPessoa!: BelongsToReference<AfastamentoPessoa>;

  @BelongsTo({ target: () => Usuario, foreignKey: "usuario_id" })
  usuario!: BelongsToReference<Usuario>;
}

const REQUIRED_ENV = [
  "PGE_DIGITAL_HOST",
  "PGE_DIGITAL_USER",
  "PGE_DIGITAL_PASSWORD",
  "PGE_DIGITAL_ENCRYPT",
  "PGE_DIGITAL_TRUST_CERT",
  "PGE_DIGITAL_DATABASE"
] as const;

const hasDbEnv = REQUIRED_ENV.every((name) => !!process.env[name]);
const describeDb = hasDbEnv ? describe : describe.skip;

describeDb("Metal ORM pivot hydration (minimal repro)", () => {
  it("should surface pivot columns on related entities", async () => {
    await withSession(async (session) => {
      const pivotRef = entityRef(AfastamentoPessoaUsuario);
      // NOTE: we cast the result shape to avoid TypeScript reducing the
      // entity/row intersection to `never` due to column vs class property typing.
      const pivotRows = await selectFromEntity(AfastamentoPessoaUsuario)
        .select({
          afastamento_pessoa_id: pivotRef.afastamento_pessoa_id,
          usuario_id: pivotRef.usuario_id,
          usa: pivotRef.usa_equipe_acervo_substituto,
          final: pivotRef.final_codigo_pa
        })
        .where(or(
          isNotNull(pivotRef.usa_equipe_acervo_substituto),
          isNotNull(pivotRef.final_codigo_pa)
        ))
        .executePlain(session) as Array<{
        afastamento_pessoa_id: number;
        usuario_id: number;
        usa?: boolean | null;
        final?: string | null;
      }>;

      const pivotRow = pivotRows[0];

      if (!pivotRow) {
        throw new Error("No pivot rows with non-null pivot columns found.");
      }

      const afastamentoRef = entityRef(AfastamentoPessoa);
      const [afastamento] = await selectFromEntity(AfastamentoPessoa)
        .include("substitutos", {
          columns: ["id", "nome"],
          pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"] }
        })
        .where(eq(afastamentoRef.id, pivotRow.afastamento_pessoa_id))
        .execute(session);

      expect(afastamento).toBeTruthy();

      const substitutos = await afastamento.substitutos.load();
      const substituto = substitutos.find((s: any) => s.id === pivotRow.usuario_id) ?? substitutos[0];
      expect(substituto).toBeTruthy();

      // This is the bug: fields are only in _pivot, not on the entity itself.
      const hasUsa = Object.prototype.hasOwnProperty.call(substituto as object, "usa_equipe_acervo_substituto");
      const hasFinal = Object.prototype.hasOwnProperty.call(substituto as object, "final_codigo_pa");
      expect(hasUsa).toBe(true);
      expect(hasFinal).toBe(true);
    });
  });
});

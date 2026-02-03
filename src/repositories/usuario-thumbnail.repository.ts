import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { UsuarioThumbnail } from "../entities/UsuarioThumbnail";
import { BaseRepository } from "./base.repository";

export class UsuarioThumbnailRepository extends BaseRepository<UsuarioThumbnail> {
  readonly entityClass = UsuarioThumbnail;

  constructor() {
    super({ defaultLabelField: "id" });
  }

  async findByUsuarioId(
    session: OrmSession,
    usuarioId: number
  ): Promise<UsuarioThumbnail | null> {
    const ref = this.entityRef;
    const [thumbnail] = await selectFromEntity(this.entityClass)
      .where(eq(ref.usuario_id, usuarioId))
      .execute(session);
    return thumbnail ?? null;
  }
}

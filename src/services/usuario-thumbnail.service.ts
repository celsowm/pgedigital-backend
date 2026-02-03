import { eq, entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { withSession } from "../db/mssql";
import { Usuario } from "../entities/Usuario";
import { UsuarioThumbnail } from "../entities/UsuarioThumbnail";
import { UsuarioThumbnailRepository } from "../repositories/usuario-thumbnail.repository";
import { LdapService } from "./ldap.service";

export interface UsuarioThumbnailUpdateResult {
  total: number;
  updated: number;
  skipped: number;
  errors: Array<{ login: string; error: string }>;
}

export type UsuarioThumbnailUpdateLogger = Pick<Console, "log" | "error">;
type UsuarioThumbnailTarget = { id: number; login: string };

export class UsuarioThumbnailService {
  private readonly repository: UsuarioThumbnailRepository;
  private readonly ldapService: LdapService;

  constructor(
    repository?: UsuarioThumbnailRepository,
    ldapService?: LdapService
  ) {
    this.repository = repository ?? new UsuarioThumbnailRepository();
    this.ldapService = ldapService ?? new LdapService();
  }

  async updateFromLdap(options: {
    logger?: UsuarioThumbnailUpdateLogger;
  } = {}): Promise<UsuarioThumbnailUpdateResult> {
    const logger = options.logger ?? console;
    const result: UsuarioThumbnailUpdateResult = {
      total: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    await withSession(async (session) => {
      const usuarioRef = entityRef(Usuario);
      const usuarios = (await selectFromEntity(Usuario)
        .select("id", "login")
        .where(eq(usuarioRef.estado_inatividade, false))
        .executePlain(session)) as UsuarioThumbnailTarget[];

      result.total = usuarios.length;
      logger.log(`Found ${usuarios.length} active users to process`);

      for (const usuario of usuarios) {
        try {
          logger.log(`Processing user: ${usuario.login}`);

          const ldapUser = await this.ldapService.getUsuario(usuario.login);
          if (!ldapUser?.thumbnailphoto) {
            logger.log(`  No thumbnail found in LDAP for ${usuario.login}`);
            result.skipped++;
            continue;
          }

          const thumbnailBuffer = Buffer.from(ldapUser.thumbnailphoto, "base64");
          const action = await this.upsertThumbnail(
            session,
            usuario.id,
            thumbnailBuffer
          );

          if (action === "created") {
            logger.log(`  Created thumbnail for ${usuario.login}`);
          } else {
            logger.log(`  Updated thumbnail for ${usuario.login}`);
          }
          result.updated++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`  Error processing ${usuario.login}: ${errorMessage}`);
          result.errors.push({ login: usuario.login, error: errorMessage });
        }
      }
    });

    return result;
  }

  private async upsertThumbnail(
    session: OrmSession,
    usuarioId: number,
    thumbnailBuffer: Buffer
  ): Promise<"created" | "updated"> {
    const existingThumbnail = await this.repository.findByUsuarioId(
      session,
      usuarioId
    );

    if (existingThumbnail) {
      existingThumbnail.thumbnail = thumbnailBuffer;
      existingThumbnail.data_atualizacao = new Date();
      await session.commit();
      return "updated";
    }

    const newThumbnail = new UsuarioThumbnail();
    newThumbnail.usuario_id = usuarioId;
    newThumbnail.thumbnail = thumbnailBuffer;
    newThumbnail.data_atualizacao = new Date();
    await session.persist(newThumbnail);
    await session.commit();
    return "created";
  }
}

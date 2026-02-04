import { Dto, Field, t } from "adorn-api";
import { UsuarioWithRelationsDto } from "../usuario/usuario.dtos";

@Dto({ description: "Payload de login usando AD/LDAP." })
export class AuthLoginRequestDto {
  @Field(t.string({ minLength: 1 }))
  login!: string;

  @Field(t.string({ minLength: 1 }))
  senha!: string;
}

@Dto({ description: "Dados do usuário retornados pelo AD/LDAP." })
export class LdapUserDto {
  @Field(t.optional(t.string({ minLength: 1 })))
  nome?: string;

  @Field(t.optional(t.string({ minLength: 1 })))
  login?: string;

  @Field(t.optional(t.string({ minLength: 1 })))
  cargo?: string;

  @Field(t.optional(t.string({ minLength: 1 })))
  unidade?: string;

  @Field(t.optional(t.string({ minLength: 1 })))
  mail?: string;

  @Field(t.optional(t.array(t.string({ minLength: 1 }))))
  grupos?: string[];

  @Field(t.optional(t.string({ minLength: 1 })))
  nome_ad?: string;

  @Field(t.optional(t.string({ minLength: 1 })))
  thumbnailphoto?: string;
}

@Dto({ description: "Resposta de login." })
export class AuthLoginResponseDto {
  @Field(t.string({ minLength: 1 }))
  access_token!: string;

  @Field(t.string({ minLength: 1 }))
  token_type!: string;

  @Field(t.integer({ minimum: 1 }))
  expires_in!: number;

  @Field(t.ref(LdapUserDto))
  ldap!: LdapUserDto;

  @Field(t.optional(t.ref(UsuarioWithRelationsDto)))
  usuario?: InstanceType<typeof UsuarioWithRelationsDto> | null;
}

@Dto({ description: "Resposta de refresh do token de acesso." })
export class AuthRefreshResponseDto {
  @Field(t.string({ minLength: 1 }))
  access_token!: string;

  @Field(t.string({ minLength: 1 }))
  token_type!: string;

  @Field(t.integer({ minimum: 1 }))
  expires_in!: number;
}

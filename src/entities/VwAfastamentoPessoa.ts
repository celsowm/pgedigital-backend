// MANUAL: view entity used for afastamento validations
import { col, Entity, Column, PrimaryKey } from "metal-orm";

@Entity({ tableName: "vw_afastamento_pessoa" })
export class VwAfastamentoPessoa {
  @PrimaryKey(col.notNull(col.int()))
  id!: number;

  @Column(col.date<Date>())
  data_inicio?: Date;

  @Column(col.date<Date>())
  data_inicio_comunicacao?: Date;

  @Column(col.date<Date>())
  data_fim?: Date;

  @Column(col.date<Date>())
  data_fim_comunicacao?: Date;

  @Column(col.date<Date>())
  menor_data_inicio?: Date;

  @Column(col.date<Date>())
  maior_data_fim?: Date;

  @Column(col.int())
  usuario_id?: number;
}

import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { eq, entityRef, selectFromEntity } from 'metal-orm';

import { Especializada } from '../src/entities/index.js';
import { openSession, disposeDbPool } from '../src/db/session-mssql.js';

const E = entityRef(Especializada);

const belongsToRelations = [
  'equipeTriagem',
  'responsavel',
  'tipoDivisaoCargaTrabalho',
  'tipoLocalidadeEspecializada',
  'tipoEspecializada',
] ;

const selectColumns = [
  'id',
  'equipe_triagem_id',
  'responsavel_id',
  'nome',
  'usa_pge_digital',
  'codigo_ad',
  'usa_plantao_audiencia',
  'tipo_divisao_carga_trabalho_id',
  'tipo_localidade_especializada_id',
  'email',
  'restricao_ponto_focal',
  'sigla',
  'tipo_especializada_id',
  'especializada_triagem',
  'caixa_entrada_max',
];

async function fetchEspecializada(session, id) {
  let builder = selectFromEntity(Especializada).select(...selectColumns);

  for (const relation of belongsToRelations) {
    builder = builder.include(relation);
  }

  const [especializada] = await builder.where(eq(E.id, id)).execute(session);
  return especializada ?? null;
}

const TARGET_ESPECIALIZADA_ID = 135;

async function main() {
  const id = TARGET_ESPECIALIZADA_ID;

  const { session, cleanup } = await openSession();
  try {
    const especializada = await fetchEspecializada(session, id);
    if (especializada) {
      console.log(JSON.stringify(especializada, null, 2));
    } else {
      console.log(`Especializada with id ${id} not found`);
    }
  } finally {
    await cleanup();
    console.log('handles after cleanup', process._getActiveHandles().map((handle) => handle.constructor?.name));
    await disposeDbPool();
    console.log('handles after disposeDbPool', process._getActiveHandles().map((handle) => handle.constructor?.name));
    process.exit(0);
  }
}

function isMain() {
  try {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    return pathToFileURL(resolve(argv1)).href === import.meta.url;
  } catch {
    return false;
  }
}

if (isMain()) {
  void main();
}

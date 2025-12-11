import { NotaVersao, bootstrapEntityTables } from './entities.js';

const entityTables = bootstrapEntityTables();

export const notaVersaoTable = entityTables.NotaVersao;
export const allEntityTables = () => entityTables;

export { NotaVersao };

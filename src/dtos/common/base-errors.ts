import { Errors, SimpleErrorDto } from "adorn-api";

/**
 * Creates standard CRUD error definitions for an entity
 */
export function createCrudErrors(entityName: string) {
  return Errors(SimpleErrorDto, [
    { status: 400, description: `Invalid ${entityName} id.` },
    { status: 404, description: `${entityName} not found.` }
  ]);
}

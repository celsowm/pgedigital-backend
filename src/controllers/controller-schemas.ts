import { v } from 'adorn-api';

export const idParamSchema = v
  .object({
    id: v.number().int().min(1),
  })
  .strict();

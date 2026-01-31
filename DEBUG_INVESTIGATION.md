# Debug Investigation: Especializada responsavel data not returning

## Problem Statement
The `responsavel` field on `Especializada` endpoint was returning an empty object `{}` instead of the expected `id` and `nome` fields.

## Root Cause Summary

**This is a framework-level bug in `adorn-api`** that affects how metal-orm entities with lazy-load references are serialized.

### Two issues identified:

1. **Class instance serialization issue** - Class instances fail the `isPlainObject()` check, causing them to be returned unchanged
2. **`BelongsToReference` wrapper handling** - The lazy-load wrapper needs special handling to extract the loaded entity

## Investigation Timeline

### Step 1: Examined Entity Structure
- **File:** [`src/entities/Especializada.ts`](src/entities/Especializada.ts)
- Found `responsavel` defined as `BelongsToReference<Usuario>` (line 176-177)
- Entity has `responsavel_id` foreign key (line 54-55)

### Step 2: Examined Controller Logic
- **File:** [`src/controllers/especializada/especializada.controller.ts`](src/controllers/especializada/especializada.controller.ts)
- Query uses `.includePick("responsavel", ["id", "nome"])` (line 78, 123)
- Both `getOne` and `list` endpoints use this pattern

### Step 3: Examined DTO Structure
- **File:** [`src/dtos/especializada/especializada.dtos.ts`](src/dtos/especializada/especializada.dtos.ts)
- Found `ResponsavelResumoDto` with `id` and `nome` fields (line 35-41)
- Used explicit `EspecializadaWithResponsavelDto` with `@Field(t.optional(t.ref(ResponsavelResumoDto)))`

### Step 4: Compared with Working Example (Acervo)
- **File:** [`src/controllers/acervo/acervo.controller.ts`](src/controllers/acervo/acervo.controller.ts)
- **File:** [`src/dtos/acervo/acervo.dtos.ts`](src/dtos/acervo/acervo.dtos.ts)
- `AcervoWithRelationsDto` explicitly defines ALL relation fields in a single class

### Step 5: Added Diagnostic Logs
Added debug logs to [`node_modules/adorn-api/src/adapter/express/response-serializer.ts`](node_modules/adorn-api/src/adapter/express/response-serializer.ts):

```typescript
const wrapper = value as { current: unknown; loaded: boolean; load: () => unknown };
console.log("[DEBUG toPlainObject] Found lazy-load wrapper, current:", wrapper.current, "loaded:", wrapper.loaded);
```

### Step 6: Identified Root Cause

**Evidence:**
- **Raw metal-orm response** (debug log) - Contains FULL `responsavel` object
- **API response** - Was returning empty object before fix

**Root Cause Analysis:**
1. `createMetalCrudDtoClasses(Especializada)` creates `EspecializadaDto` which includes ALL entity fields
2. The entity has a `responsavel` property (from `@BelongsTo` decorator)
3. `includePick("responsavel", ["id", "nome"])` loads the related entity into the `BelongsToReference.current` property
4. **BUG:** `serializeWithDto()` and `serializeObject()` in adorn-api don't convert class instances to plain objects before processing
5. The `isPlainObject()` check fails for class instances (metal-orm entities), so they are returned unchanged
6. For nested objects within the entity, the lazy-load `BelongsToReference` wrapper needs special handling

## What Needs to be Fixed

### In `adorn-api` Framework

#### File: `node_modules/adorn-api/src/adapter/express/response-serializer.ts`

**Issue 1: Class instance serialization**

The `serializeWithDto()` and `serializeObject()` functions need to convert class instances to plain objects before processing:

```typescript
// BEFORE (broken)
function serializeWithDto(value: unknown, dto: DtoConstructor): unknown {
  // ...
  // value is a class instance, isPlainObject(value) returns false
  // so value is returned unchanged without field extraction
}

// AFTER (fixed - implemented)
function toPlainObject(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }
  // Handle metal-orm's DefaultBelongsToReference and similar lazy-load wrappers FIRST
  if (typeof value === "object" && typeof (value as Record<string, unknown>).load === "function") {
    const wrapper = value as { current: unknown; loaded: boolean; load: () => unknown };
    if (wrapper.current !== undefined && wrapper.current !== null) {
      return toPlainObject(wrapper.current);
    }
    if (wrapper.loaded) {
      return null;
    }
    return null;
  }
  if (isPlainObject(value)) {
    return value;
  }
  // For class instances (like metal-orm entities), convert to plain object
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.getOwnPropertyNames(value)) {
      if (key.startsWith('_') || key === 'constructor' || key === 'prototype') continue;
      try {
        const desc = Object.getOwnPropertyDescriptor(value, key);
        if (desc && typeof desc.get === 'function') {
          try {
            result[key] = value[key as keyof typeof value];
          } catch (e) { /* ignore */ }
        } else if (desc && desc.enumerable !== false) {
          result[key] = value[key as keyof typeof value];
        }
      } catch (e) { /* ignore */ }
    }
    return result;
  }
  return null;
}
```

**Issue 2: Lazy-load wrapper handling**

The `toPlainObject()` function must handle metal-orm's `BelongsToReference` and similar lazy-load wrappers by:
1. Checking if the value has a `load` function (indicating it's a lazy-load wrapper)
2. Extracting the `current` property if it contains the loaded entity
3. Properly handling the `loaded` flag

## Solution Applied

### Workaround in Application Code

**File:** [`src/dtos/especializada/especializada.dtos.ts`](src/dtos/especializada/especializada.dtos.ts)

Changed from using `MergeDto` to explicit field definitions:

```typescript
@Dto({ description: "Especializada com responsavel resumido." })
export class EspecializadaWithResponsavelDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.integer()))
  equipe_triagem_id?: number;

  @Field(t.integer())
  responsavel_id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.boolean())
  usa_pge_digital!: boolean;

  @Field(t.integer())
  codigo_ad!: number;

  @Field(t.boolean())
  usa_plantao_audiencia!: boolean;

  @Field(t.optional(t.integer()))
  tipo_divisao_carga_trabalho_id?: number;

  @Field(t.optional(t.integer()))
  tipo_localidade_especializada_id?: number;

  @Field(t.optional(t.string()))
  email?: string;

  @Field(t.boolean())
  restricao_ponto_focal!: boolean;

  @Field(t.optional(t.string({ maxLength: 10 })))
  sigla?: string;

  @Field(t.optional(t.integer()))
  tipo_especializada_id?: number;

  @Field(t.boolean())
  especializada_triagem!: boolean;

  @Field(t.optional(t.integer()))
  caixa_entrada_max?: number;

  @Field(t.optional(t.ref(ResponsavelResumoDto)))
  responsavel?: ResponsavelResumoDto;
}
```

### Framework Fix Applied

**File:** `node_modules/adorn-api/src/adapter/express/response-serializer.ts`

Added the `toPlainObject()` function with:
1. Handling for lazy-load wrappers (`BelongsToReference`)
2. Class instance to plain object conversion
3. Diagnostic logs for debugging

## Verification

```bash
curl http://localhost:3001/especializada/47
```

Response now includes:
```json
{
  "id": 47,
  "nome": "PG02 - Gabinete da Procuradoria Geral do Estado",
  "responsavel": {
    "id": 128,
    "nome": "Carlos Eduardo Carvalho Mendes"
  },
  ...
}
```

## Recommendations for Framework Maintainer

Since you are the owner of both **adorn-api** and **metal-orm**, here are the recommended fixes:

### 1. Fix `adorn-api` response-serializer.ts

The `toPlainObject()` function should:
- Handle `BelongsToReference` and similar lazy-load wrappers from metal-orm
- Convert class instances to plain objects using `Object.getOwnPropertyNames()`
- Be called in both `serializeWithDto()` and `serializeObject()` before processing

### 2. Add Vitest Tests in `adorn-api`

There are existing tests in adorn-api, but none caught this problem. Add these test cases:

**File:** `adorn-api/src/adapter/express/__tests__/response-serializer.test.ts` (or similar)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { serializeResponse } from '../response-serializer';

// Mock metal-orm's BelongsToReference
function createMockBelongsToReference<T>(current: T | null, loaded: boolean = true) {
  return {
    current,
    loaded,
    load: vi.fn(() => Promise.resolve(current)),
    // Internal properties that metal-orm uses
    [Symbol.toStringTag]: 'BelongsToReference'
  };
}

describe('toPlainObject', () => {
  it('should extract current property from BelongsToReference wrapper', () => {
    const usuario = { id: 128, nome: 'Carlos Eduardo Carvalho Mendes' };
    const wrapper = createMockBelongsToReference(usuario);
    
    const result = toPlainObject(wrapper);
    expect(result).toEqual(usuario);
  });

  it('should return null for loaded wrapper with null current', () => {
    const wrapper = createMockBelongsToReference(null, true);
    
    const result = toPlainObject(wrapper);
    expect(result).toBeNull();
  });

  it('should handle class instances with properties', () => {
    class Entity {
      id = 47;
      nome = 'Test';
      responsavel = createMockBelongsToReference({ id: 128, nome: 'Responsavel' });
    }
    
    const entity = new Entity();
    const result = toPlainObject(entity);
    
    expect(result).toEqual({
      id: 47,
      nome: 'Test',
      responsavel: { id: 128, nome: 'Responsavel' }
    });
  });

  it('should skip internal properties starting with _', () => {
    class Entity {
      id = 1;
      _internal = 'should be skipped';
      _meta = { data: 'hidden' };
    }
    
    const entity = new Entity();
    const result = toPlainObject(entity);
    
    expect(result).toEqual({ id: 1 });
    expect(result).not.toHaveProperty('_internal');
    expect(result).not.toHaveProperty('_meta');
  });
});

describe('serializeWithDto', () => {
  it('should serialize entity with BelongsToReference correctly', () => {
    // Create a mock entity class
    class MockEspecializada {
      id = 47;
      nome = 'PG02';
      responsavel = createMockBelongsToReference({ id: 128, nome: 'Carlos' });
    }
    
    // Define DTO schema
    const MockDto = {
      fields: {
        id: { schema: { kind: 'string' } },
        nome: { schema: { kind: 'string' } },
        responsavel: { schema: { kind: 'ref', dto: () => MockResponsavelDto } }
      }
    };
    
    const MockResponsavelDto = {
      fields: {
        id: { schema: { kind: 'string' } },
        nome: { schema: { kind: 'string' } }
      }
    };
    
    const entity = new MockEspecializada();
    const result = serializeWithDto(entity, MockDto as any);
    
    expect(result).toEqual({
      id: '47',
      nome: 'PG02',
      responsavel: { id: '128', nome: 'Carlos' }
    });
  });
});
```

### 3. Consider metal-orm improvements

Option A: Make metal-orm entities extend `Map` or use a different pattern that `isPlainObject()` can detect

Option B: Provide a utility function or mixin that makes entity serialization easier

Option C: Document the requirement to use `toPlainObject()` or similar when serializing entities

### 3. Add tests

Add test cases that verify:
- Entity class instances are properly serialized
- Lazy-load references (`BelongsToReference`, `HasOneReference`) are handled
- `includePick()` loaded relations are included in the response
- Circular references don't cause infinite loops

## Files Modified

1. [`src/dtos/especializada/especializada.dtos.ts`](src/dtos/especializada/especializada.dtos.ts) - Refactored DTO to use explicit fields
2. [`node_modules/adorn-api/src/adapter/express/response-serializer.ts`](node_modules/adorn-api/src/adapter/express/response-serializer.ts) - Added `toPlainObject()` function with lazy-load wrapper handling and diagnostic logs

## Test Endpoints

- `GET /especializada` - List all with responsavel data
- `GET /especializada/47` - Single item with responsavel data
- `GET /especializada/48` - Another example with different responsavel

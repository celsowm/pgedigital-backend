# TSOA to Adorn-API Migration Plan

## Overview
This plan details the migration from tsoa to adorn-api to resolve decorator conflicts with metal-orm and achieve a cleaner, more maintainable architecture.

## Current Architecture Analysis

### TSOA Implementation
- **Controllers**: 3 main controllers using tsoa decorators (`@Route`, `@Get`, `@Post`, etc.)
- **Base Controller**: `OrmController` provides session management
- **Generated Files**: `src/routes/routes.ts` (auto-generated, 1487 lines)
- **Configuration**: `tsoa.json` with controller glob patterns
- **Type System**: Complex type helpers in `service-types.ts`
- **Dependencies**: tsoa runtime and CLI tools

### Adorn-API Benefits
- **Stage-3 Decorators**: No experimental decorator conflicts with metal-orm
- **Better Integration**: Native metal-orm helpers (`entityDto`, `filtersFromEntity`)
- **Cleaner Code**: Reduced boilerplate and generated files
- **Express Native**: Direct integration without generated routing layer
- **Type Safety**: Built-in TypeScript support without complex type gymnastics

## Migration Strategy

### Phase 1: Environment Setup

#### 1.1 Update Dependencies
```json
{
  "remove": ["tsoa", "@types/swagger-ui-express"],
  "add": ["adorn-api"],
  "update": {
    "scripts": {
      "tsoa:routes": "remove this script",
      "tsoa:spec": "remove this script"
    }
  }
}
```

#### 1.2 Configure TypeScript
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": false,
    "useDefineForClassFields": false
  }
}
```

**Key Change**: Remove `experimentalDecorators: true` since adorn-api uses Stage-3 decorators.

### Phase 2: Core Infrastructure Migration

#### 2.1 New App Factory
Replace `src/app.ts` tsoa integration:

```typescript
// BEFORE (tsoa)
import { RegisterRoutes } from './routes/routes.js';
app.use(API_DOCS_PATH, swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));
RegisterRoutes(app);

// AFTER (adorn-api)
import { createAdornExpressApp } from 'adorn-api/express';
import { openapiDocument } from './generated/openapi.js';

const app = createAdornExpressApp({
  controllers: [EspecializadaController, ItemAjudaController, NotaVersaoController],
  controllerFactory: createOrmControllerFactory(),
  openapi: {
    document: openapiDocument,
    path: API_DOCS_PATH
  }
});
```

#### 2.2 Base Controller Migration
Replace `OrmController`:

```typescript
// BEFORE (tsoa)
import { Controller } from 'tsoa';
export abstract class OrmController extends Controller {
  protected requireSession(request: ExpressRequest): OrmSession {
    if (!request.ormSession) {
      throw new Error('Orm session is missing from the request');
    }
    return request.ormSession;
  }
}

// AFTER (adorn-api)
import type { Request } from 'express';
import type { ControllerCtor } from 'adorn-api';
import type { OrmSession } from 'metal-orm';

export interface AdornController {
  requireSession(request: Request): OrmSession;
}

export function createOrmControllerFactory() {
  return (ctor: ControllerCtor, req: Request) => {
    const controller = new ctor();
    if ('requireSession' in controller) {
      controller.requireSession = (request: Request) => {
        if (!request.ormSession) {
          throw new Error('Orm session is missing from the request');
        }
        return request.ormSession;
      };
    }
    return controller;
  };
}
```

### Phase 3: Controller Migration

#### 3.1 Decorator Mapping

| TSOA | Adorn-API | Notes |
|------|-----------|-------|
| `@Controller('route')` | `@Controller('/api/route')` | Same syntax, just base path |
| `@Get()` | `@Get('/')` | Need leading slash |
| `@Get('{id}')` | `@Get('/{id}')` | Need leading slash |
| `@Post()` | `@Post('/')` | Need leading slash |
| `@Put('{id}')` | `@Put('/{id}')` | Need leading slash |
| `@Delete('{id}')` | `@Delete('/{id}')` | Need leading slash |
| `@Query() name?: string` | `@Query() name?: string` | Same syntax |
| `@Path() id: number` | `@Bindings({ path: { id: 'int' } })` | Different approach |
| `@Body() payload: Type` | `@Body() payload: Type` | Same syntax |
| `@Request() request: ExpressRequest` | `@Request() request: Request` | Type change only |
| `@Response(404, 'Not Found')` | `@Response({ status: 404, description: 'Not Found' })` | Object syntax |
| `@SuccessResponse(201, 'Created')` | Remove - handled automatically | Adorn sets status from return |
| `@Tags('Tag')` | `@Tags(['Tag'])` | Array syntax |

#### 3.2 Controller Migration Example

**Before (TSOA):**
```typescript
@Route('especializada')
@Tags('Especializada')
export class EspecializadaController extends OrmController {
  @Get()
  public async list(
    @Request() request: ExpressRequest,
    @Query() nome?: string,
    @Query() responsavel_id?: number,
    @Query() page?: number,
    @Query() pageSize?: number,
  ): Promise<EspecializadaListResponse> {
    const query: EspecializadaListQuery = { nome, responsavel_id, page, pageSize };
    return listEspecializada(this.requireSession(request), query);
  }

  @Get('{id}')
  @Response(404, 'Especializada not found')
  public async find(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<EspecializadaResponse> {
    return getEspecializada(this.requireSession(request), id);
  }

  @Post()
  @SuccessResponse('201', 'Created')
  public async create(
    @Request() request: ExpressRequest,
    @Body() payload: EspecializadaCreateInput,
  ): Promise<EspecializadaResponse> {
    this.setStatus(201);
    return createEspecializada(this.requireSession(request), payload);
  }
}
```

**After (Adorn-API):**
```typescript
import { Controller, Get, Post, Query, Body, Request, Response, Tags } from 'adorn-api';
import { entityDto, filtersFromEntity } from 'adorn-api/metal-orm';

@Controller('/api/especializada')
@Tags(['Especializada'])
export class EspecializadaController implements AdornController {
  requireSession: (request: Request) => OrmSession;

  @Get('/')
  @Response({ status: 404, description: 'Especializada not found' })
  async list(
    @Request() request: Request,
    @Query() nome?: string,
    @Query() responsavel_id?: number,
    @Query() page?: number,
    @Query() pageSize?: number,
  ) {
    const query = { nome, responsavel_id, page, pageSize };
    return listEspecializada(this.requireSession(request), query);
  }

  @Get('/{id}')
  @Response({ status: 404, description: 'Especializada not found' })
  async find(
    @Request() request: Request,
    @Bindings({ path: { id: 'int' } }) id: number,
  ) {
    return getEspecializada(this.requireSession(request), id);
  }

  @Post('/')
  async create(
    @Request() request: Request,
    @entityDto() payload: EspecializadaCreateInput,
  ) {
    const result = createEspecializada(this.requireSession(request), payload);
    // Status 201 is automatically set for POST requests
    return result;
  }
}
```

### Phase 4: Service Layer Optimization

#### 4.1 Simplify Service Types
With adorn-api's metal-orm integration, many complex types become unnecessary:

**Before (service-types.ts):**
```typescript
export type EntityResponse<TEntity> = Jsonify<TEntity>;
export type PagedResponse<TItem> = {
  items: TItem[];
  pagination: PaginationMeta;
};
export type CreateInput<
  TEntityJson extends object,
  TRequiredKeys extends keyof TEntityJson,
  TOptionalKeys extends keyof TEntityJson = never,
> = Pick<TEntityJson, TRequiredKeys> & Partial<Pick<TEntityJson, TOptionalKeys>>;
```

**After**: These can be replaced with adorn-api's `entityDto` and built-in pagination types.

#### 4.2 Update Base Entity Service
Enhance the base service to work with adorn-api's metal-orm helpers:

```typescript
import { entityDto, filtersFromEntity } from 'adorn-api/metal-orm';

export abstract class BaseEntityService<
  TEntity extends object,
  TCreateInput,
  TUpdateInput,
  TListQuery extends object,
  TFilters,
> {
  // Use adorn-api helpers for DTO generation
  protected createDto = entityDto<TCreateInput>();
  protected updateDto = entityDto<TUpdateInput>();
  protected filters = filtersFromEntity<TFilters>();
  
  // Service methods remain largely the same
  // but benefit from better type inference
}
```

### Phase 5: Cleanup and Finalization

#### 5.1 Remove TSOA Artifacts
- Delete `tsoa.json`
- Remove `src/routes/routes.ts`
- Remove `scripts/fix-tsoa-routes.mjs`
- Remove tsoa-related package scripts

#### 5.2 Update Build Configuration
- Remove tsoa generation from build pipeline
- Update OpenAPI generation to use adorn-api
- Update development scripts

#### 5.3 Testing Strategy
1. **Unit Tests**: Verify each controller method individually
2. **Integration Tests**: Test complete request/response cycles
3. **API Compatibility**: Ensure existing API contracts remain unchanged
4. **Performance Tests**: Verify no regression in response times

## Benefits of Migration

### Technical Benefits
1. **Decorator Conflict Resolution**: Stage-3 decorators don't conflict with metal-orm
2. **Reduced Generated Code**: No more 1487-line auto-generated routes file
3. **Better Type Safety**: Native TypeScript support without complex type gymnastics
4. **Cleaner Architecture**: Direct Express integration without middleware layers

### Developer Experience
1. **Faster Development**: Less boilerplate and generated files to manage
2. **Better IDE Support**: Improved IntelliSense and refactoring capabilities
3. **Easier Debugging**: No generated code to step through
4. **Simpler Configuration**: No separate tsoa.json configuration file

### Maintenance Benefits
1. **Smaller Codebase**: Significantly reduced generated and configuration code
2. **Easier Updates**: No tsoa CLI updates or route regeneration steps
3. **Better Error Messages**: Direct correlation between code and routes
4. **Reduced Dependencies**: One less major framework dependency

## Risk Mitigation

### Potential Risks
1. **API Breaking Changes**: Ensure all existing API contracts remain unchanged
2. **Performance Regression**: Test response times after migration
3. **Validation Changes**: Verify that input validation remains equivalent
4. **Documentation Updates**: Update any external API documentation

### Mitigation Strategies
1. **Comprehensive Testing**: Full test suite coverage before and after migration
2. **Gradual Migration**: Migrate controllers one at a time if needed
3. **Parallel Testing**: Run old and new implementations side by side temporarily
4. **Rollback Plan**: Keep tsoa implementation until migration is complete

## Success Criteria

1. **Functionality**: All existing API endpoints work exactly as before
2. **Performance**: No significant performance degradation
3. **Developer Experience**: Faster development and easier maintenance
4. **Code Quality**: Reduced complexity and cleaner architecture
5. **Dependencies**: Successfully removed tsoa and its dependencies

## Implementation Timeline

- **Phase 1** (Setup): 1-2 days
- **Phase 2** (Infrastructure): 2-3 days
- **Phase 3** (Controllers): 3-4 days
- **Phase 4** (Services): 2-3 days
- **Phase 5** (Cleanup): 1 day
- **Testing**: 2-3 days

**Total Estimated Time**: 11-16 days

This migration will result in a cleaner, more maintainable codebase that's better aligned with modern TypeScript practices and has no conflicts with metal-orm's decorator usage.
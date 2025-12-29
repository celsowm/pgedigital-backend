# TSOA to Adorn-API Migration Architecture Diagrams

## Current TSOA Architecture

```mermaid
graph TD
    A[Client Request] --> B[Express App]
    B --> C[tsoa middleware]
    C --> D[Generated Routes]
    D --> E[Controller Methods]
    E --> F[tsoa decorators]
    F --> G[Service Layer]
    G --> H[Repository Layer]
    H --> I[MetalORM]
    
    J[TSOA CLI] --> K[tsoa.json config]
    K --> D
    K --> L[OpenAPI Spec]
    
    M[Swagger UI] --> L
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style D fill:#ffcdd2
    style J fill:#fff3e0
```

## Target Adorn-API Architecture

```mermaid
graph TD
    A[Client Request] --> B[Adorn Express App]
    B --> C[Controller Methods]
    C --> D[Stage-3 decorators]
    D --> E[Service Layer]
    E --> F[Repository Layer]
    F --> G[MetalORM]
    
    H[OpenAPI Generator] --> I[OpenAPI Spec]
    I --> J[Swagger UI]
    
    K[TypeScript Compiler] --> D
    
    style A fill:#e1f5fe
    style G fill:#c8e6c9
    style B fill:#e8f5e8
    style K fill:#fff3e0
```

## Migration Flow

```mermaid
graph LR
    A[TSOA Setup] --> B[Dependency Update]
    B --> C[TypeScript Config]
    C --> D[App Factory Migration]
    D --> E[Controller Migration]
    E --> F[Service Layer Update]
    F --> G[Cleanup TSOA Artifacts]
    G --> H[Testing & Validation]
    
    A1[tsoa.json] --> A2[package.json]
    A1 --> A3[tsconfig.json]
    A2 --> B
    A3 --> C
    
    D1[RegisterRoutes] --> D2[createAdornExpressApp]
    
    E1[@Controller, @Get, etc.] --> E2[Same decorators]
    E1 --> F1[service-types.ts]
    F1 --> F2[Simplified types]
    
    G1[Generated routes.ts] --> G2[Delete file]
    G1 --> G3[Remove tsoa scripts]
    
    style A fill:#ffcdd2
    style H fill:#c8e6c9
    style B fill:#fff3e0
```

## Controller Comparison

```mermaid
graph TB
    subgraph TSOA ["TSOA Controller"]
        A1[@Route('especializada')]
        A2[@Tags('Especializada')]
        A3[@Get()]
        A4[@Post()]
        A5[@Get('{id}')]
        A6[@Body()]
        A7[@Query()]
        A8[@Path()]
        A9[@Response(404, 'Not Found')]
        A10[@SuccessResponse(201, 'Created')]
        
        A3 --> A7
        A4 --> A6
        A5 --> A8
        A4 --> A10
        A5 --> A9
    end
    
    subgraph AdornAPI ["Adorn-API Controller"]
        B1[@Controller('/api/especializada')]
        B2[@Tags(['Especializada'])]
        B3[@Get('/')]
        B4[@Post('/')]
        B5[@Get('/{id}')]
        B6[@entityDto()]
        B7[@Bindings({ path: { id: 'int' } })]
        B8[@Response({ status: 404, description: 'Not Found' })]
        
        B3 --> B7
        B4 --> B6
        B5 --> B7
        B3 --> B8
    end
    
    style A1 fill:#ffcdd2
    style B1 fill:#c8e6c9
```

## Service Layer Simplification

```mermaid
graph TD
    subgraph Before ["Current Service Types"]
        A1[EntityResponse<TEntity>]
        A2[PagedResponse<TItem>]
        A3[CreateInput<T, K1, K2>]
        A4[UpdateInput<TCreateInput>]
        A5[ListQuery<TFilters>]
        A6[Complex type gymnastics]
    end
    
    subgraph After ["Simplified with Adorn-API"]
        B1[entityDto<T>]
        B2[filtersFromEntity<T>]
        B3[Native TypeScript types]
        B4[Built-in pagination]
        B5[Direct metal-orm types]
    end
    
    A1 --> B1
    A2 --> B4
    A3 --> B1
    A4 --> B3
    A5 --> B2
    A6 --> B5
    
    style A6 fill:#ffcdd2
    style B5 fill:#c8e6c9
```

## TypeScript Configuration Changes

```mermaid
graph LR
    A[TSOA Config] --> B[Experimental Decorators]
    B --> C[emitDecoratorMetadata]
    C --> D[Complex TypeScript setup]
    
    E[Adorn-API Config] --> F[Stage-3 Decorators]
    F --> G[Standard TypeScript]
    G --> H[Cleaner tsconfig]
    
    B --> F
    C --> G
    D --> H
    
    I["tsconfig.json for TSOA"] --> J["experimentalDecorators: true"]
    I --> K["emitDecoratorMetadata: true"]
    
    L["tsconfig.json for Adorn"] --> M["experimentalDecorators: false"]
    L --> N["useDefineForClassFields: false"]
    
    style B fill:#ffcdd2
    style F fill:#c8e6c9
    style J fill:#ffcdd2
    style M fill:#c8e6c9
```

## File Structure Comparison

```mermaid
graph TB
    subgraph Current ["Current File Structure"]
        A[src/]
        A1[controllers/]
        A1 --> A2[EspecializadaController.ts]
        A1 --> A3[ItemAjudaController.ts]
        A1 --> A4[NotaVersaoController.ts]
        A1 --> A5[OrmController.ts]
        
        A6[routes/]
        A6 --> A7[routes.ts] # 1487 lines!
        
        A8[services/]
        A8 --> A9[service-types.ts] # Complex types
        
        B[tsoa.json]
        C[scripts/fix-tsoa-routes.mjs]
    end
    
    subgraph Target ["Target File Structure"]
        D[src/]
        D1[controllers/]
        D1 --> D2[EspecializadaController.ts] # Clean decorators
        D1 --> D3[ItemAjudaController.ts]
        D1 --> D4[NotaVersaoController.ts]
        D1 --> D5[adorn-controller.ts] # Simple base
        
        D6[services/] 
        D6 --> D7[simplified-services.ts] # Less complex
        
        E[No generated files!]
        F[No tsoa.json]
        G[No route generation scripts]
    end
    
    A7 --> E
    B --> F
    C --> G
    
    style A7 fill:#ffcdd2
    style B fill:#ffcdd2
    style C fill:#ffcdd2
    style E fill:#c8e6c9
    style F fill:#c8e6c9
    style G fill:#c8e6c9
```

## Migration Benefits Summary

```mermaid
graph TD
    A[TSOA Migration Pain Points] --> B[Benefits of Adorn-API]
    
    A1[1487-line generated routes.ts] --> B1[No generated files]
    A2[Experimental decorator conflicts] --> B2[Stage-3 decorators]
    A3[Complex type gymnastics] --> B3[Native TypeScript types]
    A4[Separate tsoa.json config] --> B4[Code-first configuration]
    A5[Swagger dependency] --> B5[Built-in OpenAPI]
    A6[Multiple CLI commands] --> B6[Single build process]
    A7[tsoa runtime overhead] --> B7[Direct Express integration]
    
    style A fill:#ffcdd2
    style B fill:#c8e6c9
```

## Error Handling Comparison

```mermaid
graph TB
    subgraph TSOA ["TSOA Error Handling"]
        A1[Controller.setStatus(201)]
        A2[@Response(404, 'Not Found')]
        A3[@SuccessResponse(201, 'Created')]
        A4[Manual status code management]
    end
    
    subgraph AdornAPI ["Adorn-API Error Handling"]
        B1[Automatic 201 for POST]
        B2[@Response({ status: 404, description: 'Not Found' })]
        B3[Built-in error mapping]
        B4[Problem Details format]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    
    style A1 fill:#ffcdd2
    style B1 fill:#c8e6c9
```

These diagrams illustrate the key architectural differences and migration benefits between the current tsoa implementation and the target adorn-api architecture. The migration will result in a cleaner, more maintainable codebase with better integration with metal-orm.
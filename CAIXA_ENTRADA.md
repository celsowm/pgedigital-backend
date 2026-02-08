# Caixa de Entrada — Análise do Legado e Plano de Migração

## 1. O que é a Caixa de Entrada

A Caixa de Entrada é a **tela principal do sistema** — é a primeira tela que o usuário vê após o login. Funciona como uma caixa de entrada de e-mail, mas para **processos administrativos (PAs)**. Cada usuário (procurador) vê nela os PAs que lhe foram atribuídos (via tabela `carga`), organizados por abas de tipo de PA (Contencioso, Consultivo, Autocomposição).

---

## 2. Modelo de Dados no Legado

### Tabela real: `carga`

A entidade `CaixaEntrada` do legado **NÃO possui tabela própria** — ela é um alias para a tabela `carga`:

```php
// CaixaEntradaTable.php
$this->setTable('carga');
```

A tabela `carga` já existe no novo projeto como entidade `Carga.ts` com os campos:

| Campo                     | Tipo    | Descrição                                      |
| ------------------------- | ------- | ---------------------------------------------- |
| `id`                      | int     | PK auto-increment                              |
| `registro_tramitacao_id`  | int FK  | Referência ao registro de tramitação            |
| `usuario_id`              | int FK  | Usuário dono da carga (destinatário)            |
| `processo_administrativo_id` | int FK | PA vinculado                                  |
| `lido`                    | boolean | Se o item foi lido pelo usuário                 |
| `pasta_id`                | int FK  | Pasta organizacional do usuário (pasta_caixa_entrada) |

### Tabela: `pasta_caixa_entrada`

Já existe como `PastaCaixaEntrada.ts`:

| Campo        | Tipo       | Descrição                |
| ------------ | ---------- | ------------------------ |
| `id`         | int        | PK                       |
| `nome`       | text       | Nome da pasta            |
| `cor`        | varchar(50)| Cor visual da pasta      |
| `ldap_user`  | varchar(50)| Login LDAP do usuário    |
| `usuario_id` | int FK     | Usuário dono da pasta    |

### Relacionamentos principais

```
Carga
  ├── BelongsTo → RegistroTramitacao
  │     ├── BelongsTo → Tramitacao (tipo: encaminhamento, solicitação, etc.)
  │     ├── BelongsTo → Usuario (remetente)
  │     ├── BelongsTo → ProcessoAdministrativo
  │     │     ├── BelongsTo → Classificacao
  │     │     ├── BelongsTo → Acervo
  │     │     ├── BelongsTo → Especializada
  │     │     ├── BelongsTo → TemaPrincipal (Tema)
  │     │     ├── BelongsTo → NaturezaIncidente
  │     │     ├── BelongsTo → Urgencia
  │     │     ├── HasMany → Comunicacao (demandas com prazo)
  │     │     ├── HasMany → ProvidenciaJuridica (prazos judiciais)
  │     │     ├── HasMany → ProcessoJudicial → Parte → Pessoa
  │     │     ├── HasMany → Interessado → Pessoa
  │     │     └── HasMany → Carga (para verificar lido de outros usuários)
  │     ├── BelongsTo → Solicitacao
  │     └── BelongsTo → DocumentoRascunho → ProvidenciaJuridica
  ├── BelongsTo → Usuario (destinatário/dono)
  └── BelongsTo → PastaCaixaEntrada
```

---

## 3. Funcionalidades do Controller Legado

### 3.1. `index()` — Tela principal
- Determina a aba default (preferência do usuário ou tipo da especializada)
- Carrega lista de `TipoProcessoAdministrativo` para gerar as abas
- Query param `tipo-pa-ativo` define a aba ativa
- Query param `pasta-selecionada` define a pasta selecionada

### 3.2. `abaIndex(tipo_processo_administrativo_id)` — Conteúdo de cada aba
- Verifica se o usuário existe/está cadastrado
- Carrega filtros: pastas do usuário, acervos, especializadas, tipos de entrada, classificação, origem de demanda, urgência
- Cada aba é carregada independentemente via AJAX

### 3.3. `ajaxAbaIndex(tipo_processo_administrativo_id)` — Listagem paginada (AJAX)
- **Query principal** usa `findListagem` com contain profundo (20+ tabelas)
- Paginação com 20 itens por página
- Ordenação padrão: `data_hora_tramitacao DESC`, depois `prazo judicial ASC`
- **Filtros suportados:**
  - `tipo_entrada` (código da tramitação)
  - `classificacao_id`
  - `tema_principal_id`
  - `acervo_id` (múltiplos)
  - `especializada_id` (múltiplos)
  - `urgencia` (múltiplos)
  - `numero_judicial` (busca parcial/exata)
  - `numero_pa` (busca parcial/exata)
  - `codigo_externo_numero`
  - `autor` (nome ou CPF/CNPJ)
  - `reu` (nome ou CPF/CNPJ)
  - `interessado` (nome, LIKE)
  - `data_inicio` / `data_fim` (range de data da tramitação)
  - `entrada_propria_substituicao` (S/N)
  - `com_prazo` (comunicações com prazo)
  - `com_prazo_definido` (providências abertas)
  - `pasta_id` (0 = sem pasta, >0 = pasta específica)
- Join com subquery de `ProvidenciaJuridica` para exibir prazos judiciais (MAX/MIN prazo)
- Renderiza template diferente por tipo de PA (`contencioso.php`, `consultivo.php`, `autocomposicao.php`)

### 3.4. `ajaxModalPastas()` — Modal de pastas
- Retorna lista de pastas do usuário logado

### 3.5. `ajaxMigrarProcessos(pastaId, processos)` — Migrar PAs para pasta
- Recebe array JSON de IDs de `processo_administrativo`
- Atualiza `pasta_id` na tabela `carga` para cada PA do usuário

### 3.6. `ajaxExcluirProcessos(processos)` — Remover de pasta
- Seta `pasta_id = null` nos registros de carga selecionados

### 3.7. `getTotalNaoLidos(nome_tipo_pa)` — Badge de não lidos
- Retorna contagem de `carga` onde `lido = false` para o usuário e tipo de PA

### 3.8. `ajaxPrazos()` — Estatísticas de prazos
- Conta providências vencidas e a vencer para o usuário
- Retorna detalhes com PA, tipo de providência, número judicial

### 3.9. `verificaCaixaEntradaLido()` — Marcar como lido (CargaComponent)
- Quando o usuário acessa um PA, marca `carga.lido = true`

---

## 4. Colunas exibidas por tipo de PA

### Contencioso
| Coluna | Origem |
| --- | --- |
| Checkbox | seleção múltipla |
| Pasta | `carga.pasta_id` → cor da pasta |
| Origem | Comunicações do PA (tipo, ícone, link) |
| Prazo Judicial | `providencia_juridica.prazo` (abertas) |
| Tipo de Entrada | `tramitacao.nome` + remetente + envelope + prazo interno |
| Nº PA / Nº Judicial | `processo_administrativo.codigo_pa` + `processo_judicial.numero` + valor da causa |
| Especializada / Acervo | `especializada.nome` + `acervo.nome` |
| Partes | Autor/Réu do processo judicial |
| Classificação | `classificacao.relevancia_recorrencia` |
| Tema / Natureza | `tema_principal.nome` + `natureza_incidente.nome` |
| Data de Entrada | `registro_tramitacao.data_hora_tramitacao` |

### Consultivo
| Coluna | Origem |
| --- | --- |
| Checkbox | seleção múltipla |
| Pasta | `carga.pasta_id` → cor da pasta |
| Tipo de Entrada | `tramitacao.nome` + remetente + envelope |
| Nº PA | `processo_administrativo.codigo_pa` |
| Especializada / Acervo | `especializada.nome` + `acervo.nome` |
| Interessados | `interessado.pessoa.nome` (qualificados por tipo) |
| Urgência | `urgencia.nome` |
| Tema | `tema_principal.nome` |
| Sigilo Interno | boolean |
| Impacto Econômico | `valor_estimativa_impacto` |
| Data de Entrada | `registro_tramitacao.data_hora_tramitacao` |

### Autocomposição
Similar ao Consultivo (reutiliza template de busca consultivo).

---

## 5. Lógica de "Tipo de Entrada" (routing por tramitação)

O sistema determina para onde linkar cada item baseado no código da tramitação:

| Código Tramitação | Ação/Destino |
| --- | --- |
| `NSO` (Nova Solicitação) | `Solicitacao/executar-solicitacao` |
| `NDS` (Novo Destinatário da Solicitação) | `Solicitacao/executar-solicitacao` |
| `SDE` (Solicitação Devolvida) | `Solicitacao/executar-solicitacao` |
| `SCO` (Solicitação Concluída) | `Solicitacao/revisar-solicitacao` |
| `MSA` (Minuta Submetida para Aprovação) | `ProcessoAdministrativo/revisar-minuta` |
| `MDD` (Minuta de Documento Devolvida) | `ProcessoAdministrativo/minutar-documento` |
| `CJP` (Comunicação Judicial/Prazo) | `ProcessoAdministrativo/tratar-comunicacao` |
| default (Encaminhamento, etc.) | `ProcessoAdministrativo/visualizar` |

---

## 6. Plano de Implementação no Novo Backend

### 6.1. Arquivos a Criar

```
src/
  controllers/caixa-entrada.controller.ts
  services/caixa-entrada.service.ts
  repositories/caixa-entrada.repository.ts
  dtos/caixa-entrada/caixa-entrada.dtos.ts
```

### 6.2. Endpoints Propostos

```
GET  /caixa-entrada                    → index (metadados: abas, aba default)
GET  /caixa-entrada/aba/:tipoPaId      → abaIndex (filtros disponíveis)
GET  /caixa-entrada/listagem/:tipoPaId → ajaxAbaIndex (listagem paginada)
GET  /caixa-entrada/nao-lidos/:tipoPa  → getTotalNaoLidos
GET  /caixa-entrada/prazos             → ajaxPrazos (estatísticas)
GET  /caixa-entrada/pastas             → ajaxModalPastas
POST /caixa-entrada/migrar-pastas      → ajaxMigrarProcessos
POST /caixa-entrada/remover-pastas     → ajaxExcluirProcessos
PATCH /caixa-entrada/:id/lido          → marcar como lido
```

### 6.3. Repository: `CaixaEntradaRepository`

O repository deve ser construído sobre a entidade `Carga` (não herdar de `BaseRepository` de CRUD, pois a Caixa de Entrada não é um CRUD simples):

```typescript
class CaixaEntradaRepository {
  // Query principal de listagem com todos os includes profundos
  buildListagemQuery(usuarioId: number, tipoPaId: number): SelectQueryBuilder

  // Contagem de não lidos
  countNaoLidos(session: OrmSession, usuarioId: number, tipoPaId?: number): Promise<number>

  // Busca carga do usuário para um PA (para marcar como lido)
  findCargaByUsuarioAndPA(session: OrmSession, usuarioId: number, paId: number): Promise<Carga | null>
}
```

#### Includes necessários na query de listagem:
```typescript
selectFromEntity(Carga)
  .include("registroTramitacao", {
    include: {
      tramitacao: { columns: ["id", "nome", "codigo"] },
      remetente: { columns: ["id", "nome"] },
      solicitacao: { columns: ["id", "prazo", "estado_id"] },
      documentoRascunho: {
        columns: ["id"],
        include: {
          providenciaJuridica: { columns: ["id"], include: { tipoProvidenciaJuridica: { columns: ["id", "nome"] } } }
        }
      },
      processoAdministrativo: {
        columns: ["id", "codigo_pa", "acervo_id", "especializada_id", "valor_causa", "valor_estimativa_impacto", "sigilo_interno", "tipo_processo_administrativo_id"],
        include: {
          classificacao: { columns: ["id", "nome"] },
          acervo: { columns: ["id", "nome"] },
          especializada: { columns: ["id", "nome"] },
          temaPrincipal: { columns: ["id", "nome"] },
          naturezaIncidente: { columns: ["id", "nome"] },
          urgencia: { columns: ["id", "nome"] },
          comunicacoes: { /* filtrar por estado */ },
          providenciasJuridicas: { /* filtrar por estado Aberta */ },
          processosJudiciais: { include: { partes: { include: { pessoa: true } } } },
          interessados: { include: { pessoa: true } },
        }
      }
    }
  })
  .include("pasta", { columns: ["id", "nome", "cor"] })
```

### 6.4. Service: `CaixaEntradaService`

```typescript
class CaixaEntradaService {
  // Não estende BaseService — lógica específica

  async getIndex(usuarioId: number): Promise<CaixaEntradaIndexDto>
  // Retorna: tipos de PA, aba default (preferência do usuário), total não lidos por aba

  async getAbaFiltros(usuarioId: number, tipoPaId: number): Promise<CaixaEntradaAbaFiltrosDto>
  // Retorna: pastas, acervos, especializadas, tipos de entrada, classificações, origens de demanda, urgências

  async getListagem(usuarioId: number, tipoPaId: number, query: ListagemQueryDto): Promise<PagedResponse>
  // Aplica filtros, paginação, ordenação
  // Join com subquery de ProvidenciaJuridica para prazos

  async getTotalNaoLidos(usuarioId: number, tipoPa?: string): Promise<number>

  async getEstatisticasPrazos(usuarioId: number): Promise<EstatisticasPrazosDto>

  async getPastas(usuarioId: number): Promise<PastaCaixaEntrada[]>

  async migrarProcessos(usuarioId: number, pastaId: number, processoIds: number[]): Promise<void>
  // Atualiza carga.pasta_id

  async removerDePasta(usuarioId: number, processoIds: number[]): Promise<void>
  // Seta carga.pasta_id = null

  async marcarComoLido(usuarioId: number, processoAdministrativoId: number): Promise<void>
  // Seta carga.lido = true
}
```

### 6.5. DTOs

```typescript
// Query de listagem (filtros)
interface ListagemQueryDto {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  tipo_entrada?: string;        // código da tramitação
  classificacao_id?: number;
  tema_principal_id?: number;
  acervo_id?: number[];
  especializada_id?: number[];
  urgencia?: number[];
  numero_judicial?: string;
  numero_pa?: string;
  codigo_externo_numero?: string;
  autor?: string;
  reu?: string;
  interessado?: string;
  data_inicio?: string;         // formato ISO
  data_fim?: string;
  substituicao?: 'S' | 'N';
  com_prazo?: boolean;
  com_prazo_definido?: boolean;
  pasta_id?: number;            // 0 = sem pasta
}

// Item da listagem
interface CaixaEntradaItemDto {
  id: number;                   // carga.id
  lido: boolean;
  pasta_id: number | null;
  pasta_cor: string | null;
  registro_tramitacao: {
    id: number;
    data_hora_tramitacao: string;
    substituicao: boolean;
    descricao_tramitacao: string | null;
    gerou_documento: boolean;
    tramitacao: { id: number; nome: string; codigo: string };
    remetente: { id: number; nome: string };
    solicitacao?: { id: number; prazo: string | null; estado_id: number };
    documento_rascunho_providencia?: { tipo_nome: string };
  };
  processo_administrativo: {
    id: number;
    codigo_pa: string;
    valor_causa: number | null;
    valor_estimativa_impacto: number | null;
    sigilo_interno: boolean;
    classificacao: { id: number; nome: string } | null;
    acervo: { id: number; nome: string } | null;
    especializada: { id: number; nome: string } | null;
    tema_principal: { id: number; nome: string } | null;
    natureza_incidente: { id: number; nome: string } | null;
    urgencia: { id: number; nome: string } | null;
    processos_judiciais: Array<{
      id: number;
      numero: string;
      partes: Array<{ nome: string; tipo_polo: string }>;
    }>;
    interessados: Array<{ nome: string; tipo: string }>;
    comunicacoes: Array<{
      id: number;
      tipo: string;
      prazo: boolean;
      data_recebimento: string | null;
    }>;
    prazos_judiciais: Array<{
      prazo: string;
      comunicacao_id: number | null;
    }>;
  };
  prazo_judicial_mais_proximo: string | null; // para ordenação
}
```

### 6.6. Controller

```typescript
@Controller("/caixa-entrada")
class CaixaEntradaController {
  @Get("/")                           // index
  @Get("/aba/:tipoPaId")              // filtros da aba
  @Get("/listagem/:tipoPaId")         // listagem paginada
  @Get("/nao-lidos/:tipoPa")          // contagem não lidos
  @Get("/prazos")                     // estatísticas de prazos
  @Get("/pastas")                     // pastas do usuário
  @Post("/migrar-pastas")             // migrar processos para pasta
  @Post("/remover-pastas")            // remover de pasta
  @Patch("/:cargaId/lido")            // marcar como lido
}
```

---

## 7. Complexidades e Atenções

### 7.1. A query de listagem é pesada
- O `findListagem` do legado faz contain em 20+ tabelas
- Usa subquery para prazos judiciais (`ProvidenciaJuridica` com MIN/MAX)
- Filtros por autor/réu fazem matching em tabelas distantes (`ProcessoJudicial → Parte → Pessoa`)
- Considerar: carregar dados pesados (partes, comunicações) via endpoint separado ou lazy

### 7.2. Lógica condicional por tipo de PA
- A view renderizada varia por tipo de PA (contencioso vs consultivo vs autocomposição)
- As **colunas retornadas** mudam conforme o tipo
- Sugestão: retornar sempre o superset de dados e deixar o frontend decidir quais colunas exibir

### 7.3. Lógica de link por tipo de tramitação
- O destino do link de cada item depende do código da tramitação (`NSO`, `SDE`, `MSA`, etc.)
- Essa lógica estava nas views e deve migrar para o DTO de resposta da API (campo `acao_url` ou `acao_tipo`)

### 7.4. Pasta "Caixa Entrada" (pasta_id = null ou 0)
- Quando `pasta_id` é `null`, o processo está na "raiz" (Caixa Entrada principal)
- Quando filtro `pasta_id = 0`, mostrar só os sem pasta
- Quando `pasta_id > 0`, filtrar pela pasta

### 7.5. Marcação de lido
- Ocorre ao acessar o PA (não ao listar)
- Feita no `CargaComponent.verificaCaixaEntradaLido()`
- Items não lidos são renderizados em negrito (`trBoldFields`)

### 7.6. Autenticação
- Todos os endpoints precisam do `usuario_id` do usuário logado
- O legado obtém de `$this->infoUsuario` / `$_SESSION`

---

## 8. Ordem Sugerida de Implementação

1. **Repository** — `caixa-entrada.repository.ts` com a query de listagem
2. **Service** — `caixa-entrada.service.ts` com listagem, filtros e contagem
3. **DTOs** — `dtos/caixa-entrada/caixa-entrada.dtos.ts`
4. **Controller** — `caixa-entrada.controller.ts` com os endpoints
5. **Pastas** — CRUD de `PastaCaixaEntrada` (migrar/remover)
6. **Prazos** — Endpoint de estatísticas de prazos
7. **Não lidos** — Badge de contagem por aba
8. **Marcar lido** — Endpoint PATCH para marcar como lido

---

## 9. Implementação Fase 1 — Contencioso (MVP)

### 9.1. Filosofia: Mínimo Viável + Extensível

A primeira implementação foca exclusivamente no **Contencioso**, mas a arquitetura segue o princípio **Open/Closed (SOLID)**: aberta para extensão (Consultivo, Autocomposição no futuro), fechada para modificação.

A estratégia é:
- **Interface `ICaixaEntradaStrategy`** define o contrato de dados por tipo de PA
- **`ContenciosoStrategy`** é a primeira (e por enquanto única) implementação
- **`CaixaEntradaService`** recebe a strategy via factory, sem `if/else` por tipo
- Dados pesados (autor/réu, comunicações, prazos judiciais) ficam em **endpoint lazy separado**, não na listagem principal

### 9.2. Dados Mínimos da Listagem (Contencioso MVP)

A listagem principal retorna **apenas os dados leves**, suficientes para renderizar a tabela:

| Coluna              | Origem                                                    | Include necessário                              |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `id`                | `carga.id`                                                | —                                               |
| `lido`              | `carga.lido`                                              | —                                               |
| `pasta_cor`         | `pasta_caixa_entrada.cor`                                 | `pasta`                                          |
| `codigo_pa`         | `processo_administrativo.codigo_pa`                       | `registroTramitacao → processoAdministrativo`   |
| `numero_judicial`   | `processo_judicial.numero`                                | `registroTramitacao → processoAdministrativo → processoJudicial` |
| `tipo_entrada`      | `tramitacao.nome` + `tramitacao.codigo`                   | `registroTramitacao → tramitacao`               |
| `remetente`         | `usuario.id` + `usuario.nome`                             | `registroTramitacao → remetente`                |
| `classificacao`     | `classificacao.id` + `classificacao.nome`                 | `registroTramitacao → processoAdministrativo → classificacao` |
| `data_entrada`      | `registro_tramitacao.data_hora_tramitacao`                | `registroTramitacao`                            |
| `especializada`     | `especializada.id` + `especializada.nome`                 | `registroTramitacao → processoAdministrativo → especializada` |
| `acervo`            | `acervo.id` + `acervo.nome`                               | `registroTramitacao → processoAdministrativo → acervo` |
| `acao_tipo`         | código da tramitação → tipo de ação no front              | derivado de `tramitacao.codigo`                 |

### 9.3. Dados Lazy (endpoint separado)

Dados pesados são carregados sob demanda pelo front, por PA:

```
GET /caixa-entrada/:paId/detalhes-contencioso
```

Retorna:

| Dado                  | Origem                                                      |
| --------------------- | ----------------------------------------------------------- |
| `partes`              | `ProcessoJudicial → Parte → Pessoa` + `TipoPolo`           |
| `comunicacoes`        | `Comunicacao` (filtrar por `processo_administrativo_id`)     |
| `prazos_judiciais`    | `ProvidenciaJuridica` (filtrar por `ativa = true`)          |
| `tema_principal`      | `Tema`                                                      |
| `natureza_incidente`  | `NaturezaIncidente`                                         |
| `valor_causa`         | `ProcessoAdministrativo.valor_causa`                        |

O front pode chamar esse endpoint ao expandir uma linha, ou ao abrir um painel de detalhes, evitando joins pesados na listagem.

### 9.4. Arquitetura: Strategy Pattern

```
src/
  services/
    caixa-entrada.service.ts              ← orquestra, delega para strategy
    caixa-entrada-strategies/
      caixa-entrada-strategy.interface.ts ← contrato
      contencioso.strategy.ts             ← implementação Contencioso
      (futuro) consultivo.strategy.ts
      (futuro) autocomposicao.strategy.ts
      strategy-factory.ts                 ← factory que resolve strategy por tipoPaId
  repositories/
    caixa-entrada.repository.ts           ← queries sobre Carga (não estende BaseRepository)
  controllers/
    caixa-entrada.controller.ts
  dtos/
    caixa-entrada/
      caixa-entrada.dtos.ts               ← DTOs compartilhados
      contencioso.dtos.ts                 ← DTOs específicos do Contencioso
      (futuro) consultivo.dtos.ts
```

### 9.5. Interface `ICaixaEntradaStrategy`

```typescript
interface ICaixaEntradaStrategy {
  readonly tipoPaId: number;

  buildListagemIncludes(): IncludeConfig;

  mapToListItem(carga: Carga): CaixaEntradaListItemDto;

  getDetalhesPA(session: OrmSession, paId: number): Promise<unknown>;

  getAcaoTipo(codigoTramitacao: string): string;
}
```

Cada tipo de PA implementa essa interface. O service chama `strategy.buildListagemIncludes()` para montar a query, e `strategy.mapToListItem()` para transformar o resultado em DTO.

### 9.6. `ContenciosoStrategy`

```typescript
class ContenciosoStrategy implements ICaixaEntradaStrategy {
  readonly tipoPaId = 1; // ID do tipo "Contencioso"

  buildListagemIncludes(): IncludeConfig {
    return {
      registroTramitacao: {
        columns: ["id", "data_hora_tramitacao", "substituicao"],
        include: {
          tramitacao: { columns: ["id", "nome", "codigo"] },
          remetente: { columns: ["id", "nome"] },
          processoAdministrativo: {
            columns: ["id", "codigo_pa", "especializada_id", "acervo_id", "classificacao_id", "processo_judicial_id"],
            include: {
              classificacao: { columns: ["id", "nome"] },
              especializada: { columns: ["id", "nome"] },
              acervo: { columns: ["id", "nome"] },
              processoJudicial: { columns: ["id", "numero"] }
            }
          }
        }
      },
      pasta: { columns: ["id", "cor"] }
    };
  }

  mapToListItem(carga: Carga): ContenciosoListItemDto {
    const rt = carga.registroTramitacao;
    const pa = rt.processoAdministrativo;
    return {
      id: carga.id,
      lido: carga.lido ?? false,
      pasta_cor: carga.pasta?.cor ?? null,
      pasta_id: carga.pasta_id ?? null,
      codigo_pa: pa.codigo_pa ?? "",
      numero_judicial: pa.processoJudicial?.numero ?? null,
      tipo_entrada: {
        id: rt.tramitacao.id,
        nome: rt.tramitacao.nome,
        codigo: rt.tramitacao.codigo
      },
      remetente: {
        id: rt.remetente.id,
        nome: rt.remetente.nome
      },
      classificacao: pa.classificacao
        ? { id: pa.classificacao.id, nome: pa.classificacao.nome }
        : null,
      especializada: pa.especializada
        ? { id: pa.especializada.id, nome: pa.especializada.nome }
        : null,
      acervo: pa.acervo
        ? { id: pa.acervo.id, nome: pa.acervo.nome }
        : null,
      data_entrada: rt.data_hora_tramitacao,
      acao_tipo: this.getAcaoTipo(rt.tramitacao.codigo),
      processo_administrativo_id: pa.id
    };
  }

  getAcaoTipo(codigo: string): string {
    const mapa: Record<string, string> = {
      NSO: "executar-solicitacao",
      NDS: "executar-solicitacao",
      SDE: "executar-solicitacao",
      SCO: "revisar-solicitacao",
      MSA: "revisar-minuta",
      MDD: "minutar-documento",
      CJP: "tratar-comunicacao"
    };
    return mapa[codigo] ?? "visualizar";
  }

  async getDetalhesPA(session: OrmSession, paId: number): Promise<ContenciosoDetalhesDto> {
    // Query dedicada: carrega partes (autor/réu), comunicações, prazos, tema, natureza, valor_causa
    // Essa query é isolada e só roda quando o front pede
  }
}
```

### 9.7. Strategy Factory

```typescript
const strategies: Map<number, ICaixaEntradaStrategy> = new Map();

function registerStrategy(strategy: ICaixaEntradaStrategy): void {
  strategies.set(strategy.tipoPaId, strategy);
}

function getStrategy(tipoPaId: number): ICaixaEntradaStrategy {
  const strategy = strategies.get(tipoPaId);
  if (!strategy) {
    throw new HttpError(400, `Tipo de PA ${tipoPaId} não suportado na Caixa de Entrada.`);
  }
  return strategy;
}

// Bootstrap
registerStrategy(new ContenciosoStrategy());
// Futuro:
// registerStrategy(new ConsultivoStrategy());
// registerStrategy(new AutocomposicaoStrategy());
```

### 9.8. DTOs — Contencioso MVP

```typescript
// === DTOs de listagem (leves) ===

@Dto({ description: "Resumo da tramitação na listagem." })
class TipoEntradaResumoDto {
  @Field(t.integer()) id!: number;
  @Field(t.string())  nome!: string;
  @Field(t.string())  codigo!: string;
}

@Dto({ description: "Resumo do remetente." })
class RemetenteResumoDto {
  @Field(t.integer()) id!: number;
  @Field(t.string())  nome!: string;
}

@Dto({ description: "Resumo id+nome genérico." })
class IdNomeResumoDto {
  @Field(t.integer()) id!: number;
  @Field(t.string())  nome!: string;
}

@Dto({ description: "Item da listagem Contencioso." })
class ContenciosoListItemDto {
  @Field(t.integer())                          id!: number;
  @Field(t.boolean())                          lido!: boolean;
  @Field(t.optional(t.string()))               pasta_cor?: string | null;
  @Field(t.optional(t.integer()))              pasta_id?: number | null;
  @Field(t.string())                           codigo_pa!: string;
  @Field(t.optional(t.string()))               numero_judicial?: string | null;
  @Field(t.ref(TipoEntradaResumoDto))          tipo_entrada!: TipoEntradaResumoDto;
  @Field(t.ref(RemetenteResumoDto))             remetente!: RemetenteResumoDto;
  @Field(t.optional(t.ref(IdNomeResumoDto)))    classificacao?: IdNomeResumoDto | null;
  @Field(t.optional(t.ref(IdNomeResumoDto)))    especializada?: IdNomeResumoDto | null;
  @Field(t.optional(t.ref(IdNomeResumoDto)))    acervo?: IdNomeResumoDto | null;
  @Field(t.optional(t.string()))                data_entrada?: string;
  @Field(t.string())                           acao_tipo!: string;
  @Field(t.integer())                          processo_administrativo_id!: number;
}

// === DTOs de detalhes lazy (pesados) ===

@Dto({ description: "Parte processual (autor ou réu)." })
class ParteDto {
  @Field(t.integer())             id!: number;
  @Field(t.string())              nome!: string;
  @Field(t.optional(t.string()))  numero_documento?: string | null;
  @Field(t.string())              tipo_polo_id!: string;      // "AT" | "PA"
  @Field(t.string())              tipo_polo_descricao!: string; // "Polo Ativo" | "Polo Passivo"
}

@Dto({ description: "Providência jurídica ativa (prazo judicial)." })
class PrazoJudicialDto {
  @Field(t.integer())             id!: number;
  @Field(t.optional(t.string()))  prazo?: string | null;
  @Field(t.optional(t.string()))  descricao?: string | null;
  @Field(t.string())              tipo_providencia!: string;
  @Field(t.optional(t.integer())) comunicacao_id?: number | null;
}

@Dto({ description: "Comunicação resumida do PA." })
class ComunicacaoResumoDto {
  @Field(t.integer())             id!: number;
  @Field(t.optional(t.string()))  tipo_comunicacao_id?: string | null;
  @Field(t.optional(t.integer())) prazo?: number | null;
  @Field(t.optional(t.string()))  data_recebimento?: string | null;
}

@Dto({ description: "Detalhes pesados do PA Contencioso (lazy)." })
class ContenciosoDetalhesDto {
  @Field(t.integer())                                processo_administrativo_id!: number;
  @Field(t.array(t.ref(ParteDto)))                   partes!: ParteDto[];
  @Field(t.array(t.ref(PrazoJudicialDto)))           prazos_judiciais!: PrazoJudicialDto[];
  @Field(t.array(t.ref(ComunicacaoResumoDto)))       comunicacoes!: ComunicacaoResumoDto[];
  @Field(t.optional(t.ref(IdNomeResumoDto)))          tema_principal?: IdNomeResumoDto | null;
  @Field(t.optional(t.ref(IdNomeResumoDto)))          natureza_incidente?: IdNomeResumoDto | null;
  @Field(t.optional(t.number()))                      valor_causa?: number | null;
}
```

### 9.9. Endpoints Fase 1

```
GET  /caixa-entrada                           → metadados (abas, aba default, totais não lidos)
GET  /caixa-entrada/listagem/:tipoPaId        → listagem paginada (dados leves via strategy)
GET  /caixa-entrada/:paId/detalhes            → dados pesados lazy (via strategy.getDetalhesPA)
GET  /caixa-entrada/nao-lidos/:tipoPaId       → contagem não lidos
GET  /caixa-entrada/pastas                    → pastas do usuário
POST /caixa-entrada/migrar-pastas             → mover PAs para pasta
POST /caixa-entrada/remover-pastas            → remover PAs de pasta
PATCH /caixa-entrada/:cargaId/lido            → marcar como lido
```

### 9.10. Fluxo de Chamadas do Front

```
1. Front carrega a tela:
   GET /caixa-entrada → recebe abas + aba default + badge não lidos

2. Front seleciona aba "Contencioso" (tipoPaId=1):
   GET /caixa-entrada/listagem/1?page=1&pageSize=20
   → Recebe lista com dados leves (codigo_pa, numero_judicial, tipo_entrada, remetente, classificacao, etc.)

3. Usuário expande uma linha ou abre detalhes:
   GET /caixa-entrada/42/detalhes
   → Recebe partes (autor/réu), comunicações, prazos judiciais, tema, natureza, valor_causa

4. Usuário acessa o PA:
   PATCH /caixa-entrada/77/lido
   → Marca carga como lida
```

### 9.11. Repository — Métodos Fase 1

O `CaixaEntradaRepository` **não estende `BaseRepository`** — a Caixa de Entrada não é CRUD, é uma view de leitura sobre `Carga`.

```typescript
class CaixaEntradaRepository {
  buildListagemQuery(
    usuarioId: number,
    tipoPaId: number,
    includes: IncludeConfig
  ): SelectQueryBuilder {
    // SELECT FROM carga
    // WHERE usuario_id = :usuarioId
    // AND processoAdministrativo.tipo_processo_administrativo_id = :tipoPaId
    // INCLUDE ...includes (definidos pela strategy)
    // ORDER BY registro_tramitacao.data_hora_tramitacao DESC
  }

  async countNaoLidos(
    session: OrmSession,
    usuarioId: number,
    tipoPaId: number
  ): Promise<number> {
    // COUNT(*) FROM carga WHERE usuario_id = :id AND lido = false
    // JOIN processo_administrativo WHERE tipo_processo_administrativo_id = :tipoPaId
  }

  async findCargaByUsuarioAndPA(
    session: OrmSession,
    usuarioId: number,
    paId: number
  ): Promise<Carga | null> {
    // Para marcar como lido
  }

  async updatePastaIds(
    session: OrmSession,
    usuarioId: number,
    paIds: number[],
    pastaId: number | null
  ): Promise<void> {
    // UPDATE carga SET pasta_id = :pastaId
    // WHERE usuario_id = :id AND processo_administrativo_id IN (:paIds)
  }
}
```

### 9.12. Extensão Futura (Consultivo / Autocomposição)

Para adicionar Consultivo, basta:

1. Criar `consultivo.strategy.ts` implementando `ICaixaEntradaStrategy`
2. Criar `consultivo.dtos.ts` com DTOs específicos (interessados, urgência, sigilo, impacto econômico)
3. Registrar na factory: `registerStrategy(new ConsultivoStrategy())`

Nenhuma alteração no Service, Controller ou Repository é necessária. O front apenas precisa tratar as colunas extras do tipo Consultivo.

### 9.13. Checklist de Implementação Fase 1

- [ ] `src/services/caixa-entrada-strategies/caixa-entrada-strategy.interface.ts`
- [ ] `src/services/caixa-entrada-strategies/contencioso.strategy.ts`
- [ ] `src/services/caixa-entrada-strategies/strategy-factory.ts`
- [ ] `src/repositories/caixa-entrada.repository.ts`
- [ ] `src/services/caixa-entrada.service.ts`
- [ ] `src/dtos/caixa-entrada/caixa-entrada.dtos.ts` (compartilhados)
- [ ] `src/dtos/caixa-entrada/contencioso.dtos.ts` (específicos)
- [ ] `src/controllers/caixa-entrada.controller.ts`
- [ ] Testes para listagem, contagem, lazy detalhes, marcar lido, pastas

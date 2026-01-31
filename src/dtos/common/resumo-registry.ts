import { createIdNomeResumoDto, createResumoWithEspecializadaDto } from "./base-resumo.dto";

/**
 * Central registry of all resumo DTOs
 * Ensures consistent naming and prevents duplication across modules
 */

// Base especializada resumo (used by many other resumos)
export const EspecializadaResumoDto = createIdNomeResumoDto(
  "EspecializadaResumoDto",
  "Resumo da especializada."
);

// Acervo-related resumos
export const TipoAcervoResumoDto = createIdNomeResumoDto(
  "TipoAcervoResumoDto",
  "Resumo do tipo de acervo."
);

export const TipoMigracaoAcervoResumoDto = createIdNomeResumoDto(
  "TipoMigracaoAcervoResumoDto",
  "Resumo do tipo de migração de acervo."
);

// Equipe-related resumos
export const EquipeResponsavelResumoDto = createIdNomeResumoDto(
  "EquipeResponsavelResumoDto",
  "Resumo da equipe responsável."
);

export const EquipeApoioResumoDto = createResumoWithEspecializadaDto(
  "EquipeApoioResumoDto",
  "Resumo da equipe de apoio.",
  EspecializadaResumoDto
);

// Tipo-related resumos
export const TipoDivisaoCargaTrabalhoResumoDto = createIdNomeResumoDto(
  "TipoDivisaoCargaTrabalhoResumoDto",
  "Resumo do tipo de divisão de carga de trabalho."
);

// Pessoa-related resumos
export const ProcuradorTitularResumoDto = createIdNomeResumoDto(
  "ProcuradorTitularResumoDto",
  "Resumo do procurador titular."
);

export const ResponsavelResumoDto = createIdNomeResumoDto(
  "ResponsavelResumoDto",
  "Resumo do responsável."
);

// Classificação-related resumos
export const ClassificacaoResumoDto = createIdNomeResumoDto(
  "ClassificacaoResumoDto",
  "Resumo de classificação de processos."
);

export const TemaResumoDto = createIdNomeResumoDto(
  "TemaResumoDto",
  "Resumo de tema relacionado."
);

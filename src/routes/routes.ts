/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotaVersaoController } from './../controllers/NotaVersaoController.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ItemAjudaController } from './../controllers/ItemAjudaController.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EspecializadaController } from './../controllers/EspecializadaController.js';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Jsonify_NotaVersao_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"double","required":true},"data":{"dataType":"string","required":true},"sprint":{"dataType":"double","required":true},"ativo":{"dataType":"boolean","required":true},"mensagem":{"dataType":"string","required":true},"data_exclusao":{"dataType":"string"},"data_inativacao":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntityResponse_NotaVersao_": {
        "dataType": "refAlias",
        "type": {"ref":"Jsonify_NotaVersao_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotaVersaoResponse": {
        "dataType": "refAlias",
        "type": {"ref":"EntityResponse_NotaVersao_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginationMeta": {
        "dataType": "refObject",
        "properties": {
            "page": {"dataType":"double","required":true},
            "pageSize": {"dataType":"double","required":true},
            "totalItems": {"dataType":"double","required":true},
            "totalPages": {"dataType":"double","required":true},
            "hasNextPage": {"dataType":"boolean","required":true},
            "hasPreviousPage": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PagedResponse_NotaVersaoResponse_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"pagination":{"ref":"PaginationMeta","required":true},"items":{"dataType":"array","array":{"dataType":"refAlias","ref":"NotaVersaoResponse"},"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotaVersaoListResponse": {
        "dataType": "refAlias",
        "type": {"ref":"PagedResponse_NotaVersaoResponse_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Jsonify_NotaVersao_.data-or-sprint-or-mensagem_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Pick_Jsonify_NotaVersao_.ativo__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInput_Jsonify_NotaVersao_.data-or-sprint-or-mensagem.ativo_": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"ref":"Pick_Jsonify_NotaVersao_.data-or-sprint-or-mensagem_"},{"ref":"Partial_Pick_Jsonify_NotaVersao_.ativo__"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotaVersaoCreateInput": {
        "dataType": "refAlias",
        "type": {"ref":"CreateInput_Jsonify_NotaVersao_.data-or-sprint-or-mensagem.ativo_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_NotaVersaoCreateInput_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"data":{"dataType":"string"},"sprint":{"dataType":"double"},"mensagem":{"dataType":"string"},"ativo":{"dataType":"boolean"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateInput_NotaVersaoCreateInput_": {
        "dataType": "refAlias",
        "type": {"ref":"Partial_NotaVersaoCreateInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotaVersaoUpdateInput": {
        "dataType": "refAlias",
        "type": {"ref":"UpdateInput_NotaVersaoCreateInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Jsonify_ItemAjuda_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"double","required":true},"identificador":{"dataType":"string","required":true},"html":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntityResponse_ItemAjuda_": {
        "dataType": "refAlias",
        "type": {"ref":"Jsonify_ItemAjuda_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ItemAjudaResponse": {
        "dataType": "refAlias",
        "type": {"ref":"EntityResponse_ItemAjuda_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PagedResponse_ItemAjudaResponse_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"pagination":{"ref":"PaginationMeta","required":true},"items":{"dataType":"array","array":{"dataType":"refAlias","ref":"ItemAjudaResponse"},"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ItemAjudaListResponse": {
        "dataType": "refAlias",
        "type": {"ref":"PagedResponse_ItemAjudaResponse_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Jsonify_ItemAjuda_.identificador-or-html_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Pick_Jsonify_ItemAjuda_.never__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInput_Jsonify_ItemAjuda_.identificador-or-html_": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"ref":"Pick_Jsonify_ItemAjuda_.identificador-or-html_"},{"ref":"Partial_Pick_Jsonify_ItemAjuda_.never__"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ItemAjudaCreateInput": {
        "dataType": "refAlias",
        "type": {"ref":"CreateInput_Jsonify_ItemAjuda_.identificador-or-html_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ItemAjudaCreateInput_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"identificador":{"dataType":"string"},"html":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateInput_ItemAjudaCreateInput_": {
        "dataType": "refAlias",
        "type": {"ref":"Partial_ItemAjudaCreateInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ItemAjudaUpdateInput": {
        "dataType": "refAlias",
        "type": {"ref":"UpdateInput_ItemAjudaCreateInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_OrgaoJulgador_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_AssuntoLocal_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Materia_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Usuario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_FilaCircular_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Confidencialidade_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Localidade_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_ProcessoJudicial_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_PredicaoOrgaoJulgadorEspecializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ClassificacaoEspecializadaTema_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_PredicaoAssuntoEspecializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EspecializadaMateria_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EspecializadaTema_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EspecializadaDistribuidor_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Equipe_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_TipoDispensa_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ModeloFormulario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EspecializadaAssistente_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Especializada": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "equipe_triagem_id": {"dataType":"double"},
            "responsavel_id": {"dataType":"double","required":true},
            "nome": {"dataType":"string","required":true},
            "usa_pge_digital": {"dataType":"boolean","required":true},
            "codigo_ad": {"dataType":"double","required":true},
            "usa_plantao_audiencia": {"dataType":"boolean","required":true},
            "tipo_divisao_carga_trabalho_id": {"dataType":"double"},
            "tipo_localidade_especializada_id": {"dataType":"double"},
            "email": {"dataType":"string"},
            "restricao_ponto_focal": {"dataType":"boolean","required":true},
            "sigla": {"dataType":"string"},
            "tipo_especializada_id": {"dataType":"double"},
            "especializada_triagem": {"dataType":"boolean","required":true},
            "caixa_entrada_max": {"dataType":"double"},
            "orgaosJulgador": {"ref":"ManyToManyCollection_OrgaoJulgador_","required":true},
            "assuntosLocal": {"ref":"ManyToManyCollection_AssuntoLocal_","required":true},
            "materias": {"ref":"ManyToManyCollection_Materia_","required":true},
            "usuarios": {"ref":"ManyToManyCollection_Usuario_","required":true},
            "filasCircular": {"ref":"ManyToManyCollection_FilaCircular_","required":true},
            "confidencialidades": {"ref":"ManyToManyCollection_Confidencialidade_","required":true},
            "localidades": {"ref":"ManyToManyCollection_Localidade_","required":true},
            "processosJudicial": {"ref":"ManyToManyCollection_ProcessoJudicial_","required":true},
            "predicoesOrgaoJulgadorEspecializada": {"ref":"HasManyCollection_PredicaoOrgaoJulgadorEspecializada_","required":true},
            "classificacoesEspecializadaTema": {"ref":"HasManyCollection_ClassificacaoEspecializadaTema_","required":true},
            "predicoesAssuntoEspecializada": {"ref":"HasManyCollection_PredicaoAssuntoEspecializada_","required":true},
            "especializadasMateria": {"ref":"HasManyCollection_EspecializadaMateria_","required":true},
            "especializadasTema": {"ref":"HasManyCollection_EspecializadaTema_","required":true},
            "especializadasDistribuidor": {"ref":"HasManyCollection_EspecializadaDistribuidor_","required":true},
            "equipes": {"ref":"HasManyCollection_Equipe_","required":true},
            "tiposDispensa": {"ref":"HasManyCollection_TipoDispensa_","required":true},
            "modelosFormulario": {"ref":"HasManyCollection_ModeloFormulario_","required":true},
            "especializadasAssistente": {"ref":"HasManyCollection_EspecializadaAssistente_","required":true},
            "dboEspecializada": {"ref":"Especializada"},
            "especializada": {"ref":"HasOneReference_Especializada_","required":true},
            "equipeTriagem": {"ref":"Equipe"},
            "responsavel": {"ref":"Usuario"},
            "tipoDivisaoCargaTrabalho": {"ref":"TipoDivisaoCargaTrabalho"},
            "tipoLocalidadeEspecializada": {"ref":"TipoLocalidadeEspecializada"},
            "tipoEspecializada": {"ref":"TipoEspecializada"},
            "processosAdministrativo": {"ref":"HasManyCollection_ProcessoAdministrativo_","required":true},
            "historicosDistribuicaoEspecializada": {"ref":"HasManyCollection_HistoricoDistribuicaoEspecializada_","required":true},
            "historicosUsuarioEspecializada": {"ref":"HasManyCollection_HistoricoUsuarioEspecializada_","required":true},
            "sorteiosCorreicao": {"ref":"HasManyCollection_SorteioCorreicao_","required":true},
            "especializadasUsuarioNotificacao": {"ref":"HasManyCollection_EspecializadaUsuarioNotificacao_","required":true},
            "registrosTramitacao": {"ref":"HasManyCollection_RegistroTramitacao_","required":true},
            "confidencialidadesEspecializada": {"ref":"HasManyCollection_ConfidencialidadeEspecializada_","required":true},
            "modelos": {"ref":"HasManyCollection_Modelo_","required":true},
            "mapeamentosLocalidadeRegional": {"ref":"HasManyCollection_MapeamentoLocalidadeRegional_","required":true},
            "predicoesEspecializadaMachineLearning": {"ref":"HasManyCollection_PredicaoEspecializadaMachineLearning_","required":true},
            "acervos": {"ref":"HasManyCollection_Acervo_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasOneReference_Especializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Acervo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_RetornoProgramado_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Especializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_AfastamentoPessoa_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ElementoFilaCircular_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Acervo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FilaCircular": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ultimo_elemento": {"dataType":"double","required":true},
            "especializadas": {"ref":"ManyToManyCollection_Especializada_","required":true},
            "classificacoesEspecializadaTema": {"ref":"HasManyCollection_ClassificacaoEspecializadaTema_","required":true},
            "especializadasTema": {"ref":"HasManyCollection_EspecializadaTema_","required":true},
            "equipes": {"ref":"HasManyCollection_Equipe_","required":true},
            "afastamentosPessoa": {"ref":"HasManyCollection_AfastamentoPessoa_","required":true},
            "elementosFilaCircular": {"ref":"HasManyCollection_ElementoFilaCircular_","required":true},
            "acervos": {"ref":"HasManyCollection_Acervo_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_AcervoEquipeApoio_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Especializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EquipeUsuario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_TramitacaoAutomaticaAcervoTema_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Equipe": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "nome": {"dataType":"string","required":true},
            "especializada_id": {"dataType":"double","required":true},
            "fila_circular_id": {"dataType":"double"},
            "acervos": {"ref":"ManyToManyCollection_Acervo_","required":true},
            "usuarios": {"ref":"ManyToManyCollection_Usuario_","required":true},
            "retornosProgramado": {"ref":"HasManyCollection_RetornoProgramado_","required":true},
            "especializada": {"ref":"Especializada"},
            "filaCircular": {"ref":"FilaCircular"},
            "acervosEquipeApoio": {"ref":"HasManyCollection_AcervoEquipeApoio_","required":true},
            "especializadas": {"ref":"HasManyCollection_Especializada_","required":true},
            "equipesUsuario": {"ref":"HasManyCollection_EquipeUsuario_","required":true},
            "tramitacoesAutomaticaAcervoTema": {"ref":"HasManyCollection_TramitacaoAutomaticaAcervoTema_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Perfil_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_RegistroTramitacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_Equipe_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_AcessoRestritoFuncionalidade_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_AfastamentoPessoa_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManyToManyCollection_ProcessoAdministrativo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_DocumentoProcessoAdministrativoAcordo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_PreferenciaUsuario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EstadoSolicitacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Correicao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_MarcadorDocumentoProcessoJudicial_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ModeloFormularioProcessoAdministrativo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ModeloFormularioProcessoAdministrativoEstadoModeloFormulario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_DocumentoRascunho_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Carga_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_DocumentoRascunhoEstado_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_DocumentoAcordoContencioso_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_UsuarioPerfil_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EstadoProcessoAdministrativo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Despacho_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_DocumentoAnexoRascunho_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_AcervoDestinatarioPa_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_DocumentoProcessoAdministrativo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_HistoricoDistribuicaoAcervo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_HistoricoDistribuicaoEspecializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_HistoricoUsuarioEspecializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Quesito_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Protocolizacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Acordo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_SorteioCorreicao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_EspecializadaUsuarioNotificacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_SorteioCorreicaoProcessoAdministrativo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_SorteioCorreicaoProcessoAdministrativoQuesito_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_AcessoRestritoFuncionalidadeUsuario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_PastaCaixaEntrada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_AfastamentoPessoaUsuario_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_HistoricoPrazo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ProvidenciaJuridica_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Audiencia_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Comunicacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Modelo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Entrega_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ComunicacaoEstado_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_UsuarioPermitidoAcessarProcessoAdministrativoSigiloso_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ValorAdicional_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_Solicitacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ManifestacaoEstado_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Usuario": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "especializada_id": {"dataType":"double"},
            "nome": {"dataType":"string","required":true},
            "login": {"dataType":"string","required":true},
            "cargo": {"dataType":"string","required":true},
            "estado_inatividade": {"dataType":"boolean","required":true},
            "vinculo": {"dataType":"string"},
            "exibe_cargo": {"dataType":"boolean"},
            "exibe_vinculo": {"dataType":"boolean"},
            "exibe_matricula": {"dataType":"boolean"},
            "exibe_funcao": {"dataType":"boolean"},
            "funcao": {"dataType":"string"},
            "matricula": {"dataType":"string"},
            "abreviatura": {"dataType":"string"},
            "ponto_focal": {"dataType":"boolean"},
            "especializadas": {"ref":"ManyToManyCollection_Especializada_","required":true},
            "perfis": {"ref":"ManyToManyCollection_Perfil_","required":true},
            "registrosTramitacao": {"ref":"ManyToManyCollection_RegistroTramitacao_","required":true},
            "acervos": {"ref":"ManyToManyCollection_Acervo_","required":true},
            "equipes": {"ref":"ManyToManyCollection_Equipe_","required":true},
            "acessosRestritoFuncionalidade": {"ref":"ManyToManyCollection_AcessoRestritoFuncionalidade_","required":true},
            "afastamentosPessoa": {"ref":"ManyToManyCollection_AfastamentoPessoa_","required":true},
            "processosAdministrativo": {"ref":"ManyToManyCollection_ProcessoAdministrativo_","required":true},
            "documentosProcessoAdministrativoAcordo": {"ref":"HasManyCollection_DocumentoProcessoAdministrativoAcordo_","required":true},
            "preferenciasUsuario": {"ref":"HasManyCollection_PreferenciaUsuario_","required":true},
            "estadosSolicitacao": {"ref":"HasManyCollection_EstadoSolicitacao_","required":true},
            "correicoes": {"ref":"HasManyCollection_Correicao_","required":true},
            "marcadoresDocumentoProcessoJudicial": {"ref":"HasManyCollection_MarcadorDocumentoProcessoJudicial_","required":true},
            "modelosFormularioProcessoAdministrativo": {"ref":"HasManyCollection_ModeloFormularioProcessoAdministrativo_","required":true},
            "retornosProgramado": {"ref":"HasManyCollection_RetornoProgramado_","required":true},
            "especializadasDistribuidor": {"ref":"HasManyCollection_EspecializadaDistribuidor_","required":true},
            "modelosFormularioProcessoAdministrativoEstadoModeloFormulario": {"ref":"HasManyCollection_ModeloFormularioProcessoAdministrativoEstadoModeloFormulario_","required":true},
            "documentosRascunho": {"ref":"HasManyCollection_DocumentoRascunho_","required":true},
            "cargas": {"ref":"HasManyCollection_Carga_","required":true},
            "documentosRascunhoEstado": {"ref":"HasManyCollection_DocumentoRascunhoEstado_","required":true},
            "modelosFormulario": {"ref":"HasManyCollection_ModeloFormulario_","required":true},
            "documentosAcordoContencioso": {"ref":"HasManyCollection_DocumentoAcordoContencioso_","required":true},
            "usuariosPerfil": {"ref":"HasManyCollection_UsuarioPerfil_","required":true},
            "estadosProcessoAdministrativo": {"ref":"HasManyCollection_EstadoProcessoAdministrativo_","required":true},
            "especializadasAssistente": {"ref":"HasManyCollection_EspecializadaAssistente_","required":true},
            "despachos": {"ref":"HasManyCollection_Despacho_","required":true},
            "documentosAnexoRascunho": {"ref":"HasManyCollection_DocumentoAnexoRascunho_","required":true},
            "acervosDestinatarioPa": {"ref":"HasManyCollection_AcervoDestinatarioPa_","required":true},
            "equipesUsuario": {"ref":"HasManyCollection_EquipeUsuario_","required":true},
            "documentosProcessoAdministrativo": {"ref":"HasManyCollection_DocumentoProcessoAdministrativo_","required":true},
            "historicosDistribuicaoAcervo": {"ref":"HasManyCollection_HistoricoDistribuicaoAcervo_","required":true},
            "historicosDistribuicaoEspecializada": {"ref":"HasManyCollection_HistoricoDistribuicaoEspecializada_","required":true},
            "historicosUsuarioEspecializada": {"ref":"HasManyCollection_HistoricoUsuarioEspecializada_","required":true},
            "quesitos": {"ref":"HasManyCollection_Quesito_","required":true},
            "protocolizacoes": {"ref":"HasManyCollection_Protocolizacao_","required":true},
            "acordos": {"ref":"HasManyCollection_Acordo_","required":true},
            "sorteiosCorreicao": {"ref":"HasManyCollection_SorteioCorreicao_","required":true},
            "especializadasUsuarioNotificacao": {"ref":"HasManyCollection_EspecializadaUsuarioNotificacao_","required":true},
            "sorteiosCorreicaoProcessoAdministrativo": {"ref":"HasManyCollection_SorteioCorreicaoProcessoAdministrativo_","required":true},
            "sorteiosCorreicaoProcessoAdministrativoQuesito": {"ref":"HasManyCollection_SorteioCorreicaoProcessoAdministrativoQuesito_","required":true},
            "acessosRestritoFuncionalidadeUsuario": {"ref":"HasManyCollection_AcessoRestritoFuncionalidadeUsuario_","required":true},
            "pastasCaixaEntrada": {"ref":"HasManyCollection_PastaCaixaEntrada_","required":true},
            "afastamentosPessoaUsuario": {"ref":"HasManyCollection_AfastamentoPessoaUsuario_","required":true},
            "historicosPrazo": {"ref":"HasManyCollection_HistoricoPrazo_","required":true},
            "especializada": {"ref":"Especializada"},
            "providenciasJuridica": {"ref":"HasManyCollection_ProvidenciaJuridica_","required":true},
            "audiencias": {"ref":"HasManyCollection_Audiencia_","required":true},
            "comunicacoes": {"ref":"HasManyCollection_Comunicacao_","required":true},
            "modelos": {"ref":"HasManyCollection_Modelo_","required":true},
            "entregas": {"ref":"HasManyCollection_Entrega_","required":true},
            "comunicacoesEstado": {"ref":"HasManyCollection_ComunicacaoEstado_","required":true},
            "usuariosPermitidoAcessarProcessoAdministrativoSigiloso": {"ref":"HasManyCollection_UsuarioPermitidoAcessarProcessoAdministrativoSigiloso_","required":true},
            "valoresAdicional": {"ref":"HasManyCollection_ValorAdicional_","required":true},
            "solicitacoes": {"ref":"HasManyCollection_Solicitacao_","required":true},
            "manifestacoesEstado": {"ref":"HasManyCollection_ManifestacaoEstado_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoDivisaoCargaTrabalho": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "nome": {"dataType":"string","required":true},
            "especializadas": {"ref":"HasManyCollection_Especializada_","required":true},
            "afastamentosPessoa": {"ref":"HasManyCollection_AfastamentoPessoa_","required":true},
            "acervos": {"ref":"HasManyCollection_Acervo_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoLocalidadeEspecializada": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "nome": {"dataType":"string","required":true},
            "especializadas": {"ref":"HasManyCollection_Especializada_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoEspecializada": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "nome": {"dataType":"string"},
            "descricao": {"dataType":"string"},
            "especializadas": {"ref":"HasManyCollection_Especializada_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ProcessoAdministrativo_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_RegistroTramitacao_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_ConfidencialidadeEspecializada_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_MapeamentoLocalidadeRegional_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HasManyCollection_PredicaoEspecializadaMachineLearning_": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Jsonify_Especializada_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"double","required":true},"equipe_triagem_id":{"dataType":"double"},"responsavel_id":{"dataType":"double","required":true},"nome":{"dataType":"string","required":true},"usa_pge_digital":{"dataType":"boolean","required":true},"codigo_ad":{"dataType":"double","required":true},"usa_plantao_audiencia":{"dataType":"boolean","required":true},"tipo_divisao_carga_trabalho_id":{"dataType":"double"},"tipo_localidade_especializada_id":{"dataType":"double"},"email":{"dataType":"string"},"restricao_ponto_focal":{"dataType":"boolean","required":true},"sigla":{"dataType":"string"},"tipo_especializada_id":{"dataType":"double"},"especializada_triagem":{"dataType":"boolean","required":true},"caixa_entrada_max":{"dataType":"double"},"orgaosJulgador":{"ref":"ManyToManyCollection_OrgaoJulgador_","required":true},"assuntosLocal":{"ref":"ManyToManyCollection_AssuntoLocal_","required":true},"materias":{"ref":"ManyToManyCollection_Materia_","required":true},"usuarios":{"ref":"ManyToManyCollection_Usuario_","required":true},"filasCircular":{"ref":"ManyToManyCollection_FilaCircular_","required":true},"confidencialidades":{"ref":"ManyToManyCollection_Confidencialidade_","required":true},"localidades":{"ref":"ManyToManyCollection_Localidade_","required":true},"processosJudicial":{"ref":"ManyToManyCollection_ProcessoJudicial_","required":true},"predicoesOrgaoJulgadorEspecializada":{"ref":"HasManyCollection_PredicaoOrgaoJulgadorEspecializada_","required":true},"classificacoesEspecializadaTema":{"ref":"HasManyCollection_ClassificacaoEspecializadaTema_","required":true},"predicoesAssuntoEspecializada":{"ref":"HasManyCollection_PredicaoAssuntoEspecializada_","required":true},"especializadasMateria":{"ref":"HasManyCollection_EspecializadaMateria_","required":true},"especializadasTema":{"ref":"HasManyCollection_EspecializadaTema_","required":true},"especializadasDistribuidor":{"ref":"HasManyCollection_EspecializadaDistribuidor_","required":true},"equipes":{"ref":"HasManyCollection_Equipe_","required":true},"tiposDispensa":{"ref":"HasManyCollection_TipoDispensa_","required":true},"modelosFormulario":{"ref":"HasManyCollection_ModeloFormulario_","required":true},"especializadasAssistente":{"ref":"HasManyCollection_EspecializadaAssistente_","required":true},"dboEspecializada":{"ref":"Especializada"},"especializada":{"ref":"HasOneReference_Especializada_","required":true},"equipeTriagem":{"ref":"Equipe"},"responsavel":{"ref":"Usuario"},"tipoDivisaoCargaTrabalho":{"ref":"TipoDivisaoCargaTrabalho"},"tipoLocalidadeEspecializada":{"ref":"TipoLocalidadeEspecializada"},"tipoEspecializada":{"ref":"TipoEspecializada"},"processosAdministrativo":{"ref":"HasManyCollection_ProcessoAdministrativo_","required":true},"historicosDistribuicaoEspecializada":{"ref":"HasManyCollection_HistoricoDistribuicaoEspecializada_","required":true},"historicosUsuarioEspecializada":{"ref":"HasManyCollection_HistoricoUsuarioEspecializada_","required":true},"sorteiosCorreicao":{"ref":"HasManyCollection_SorteioCorreicao_","required":true},"especializadasUsuarioNotificacao":{"ref":"HasManyCollection_EspecializadaUsuarioNotificacao_","required":true},"registrosTramitacao":{"ref":"HasManyCollection_RegistroTramitacao_","required":true},"confidencialidadesEspecializada":{"ref":"HasManyCollection_ConfidencialidadeEspecializada_","required":true},"modelos":{"ref":"HasManyCollection_Modelo_","required":true},"mapeamentosLocalidadeRegional":{"ref":"HasManyCollection_MapeamentoLocalidadeRegional_","required":true},"predicoesEspecializadaMachineLearning":{"ref":"HasManyCollection_PredicaoEspecializadaMachineLearning_","required":true},"acervos":{"ref":"HasManyCollection_Acervo_","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntityResponse_Especializada_": {
        "dataType": "refAlias",
        "type": {"ref":"Jsonify_Especializada_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EspecializadaResponse": {
        "dataType": "refAlias",
        "type": {"ref":"EntityResponse_Especializada_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PagedResponse_EspecializadaResponse_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"pagination":{"ref":"PaginationMeta","required":true},"items":{"dataType":"array","array":{"dataType":"refAlias","ref":"EspecializadaResponse"},"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EspecializadaListResponse": {
        "dataType": "refAlias",
        "type": {"ref":"PagedResponse_EspecializadaResponse_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Jsonify_Especializada_.responsavel_id-or-nome-or-usa_pge_digital-or-codigo_ad-or-usa_plantao_audiencia_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Pick_Jsonify_Especializada_.equipe_triagem_id-or-tipo_divisao_carga_trabalho_id-or-tipo_localidade_especializada_id-or-email-or-restricao_ponto_focal-or-sigla-or-tipo_especializada_id-or-especializada_triagem-or-caixa_entrada_max__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInput_Jsonify_Especializada_.responsavel_id-or-nome-or-usa_pge_digital-or-codigo_ad-or-usa_plantao_audiencia.equipe_triagem_id-or-tipo_divisao_carga_trabalho_id-or-tipo_localidade_especializada_id-or-email-or-restricao_ponto_focal-or-sigla-or-tipo_especializada_id-or-especializada_triagem-or-caixa_entrada_max_": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"ref":"Pick_Jsonify_Especializada_.responsavel_id-or-nome-or-usa_pge_digital-or-codigo_ad-or-usa_plantao_audiencia_"},{"ref":"Partial_Pick_Jsonify_Especializada_.equipe_triagem_id-or-tipo_divisao_carga_trabalho_id-or-tipo_localidade_especializada_id-or-email-or-restricao_ponto_focal-or-sigla-or-tipo_especializada_id-or-especializada_triagem-or-caixa_entrada_max__"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EspecializadaCreateInput": {
        "dataType": "refAlias",
        "type": {"ref":"CreateInput_Jsonify_Especializada_.responsavel_id-or-nome-or-usa_pge_digital-or-codigo_ad-or-usa_plantao_audiencia.equipe_triagem_id-or-tipo_divisao_carga_trabalho_id-or-tipo_localidade_especializada_id-or-email-or-restricao_ponto_focal-or-sigla-or-tipo_especializada_id-or-especializada_triagem-or-caixa_entrada_max_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_EspecializadaCreateInput_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"responsavel_id":{"dataType":"double"},"nome":{"dataType":"string"},"usa_pge_digital":{"dataType":"boolean"},"codigo_ad":{"dataType":"double"},"usa_plantao_audiencia":{"dataType":"boolean"},"equipe_triagem_id":{"dataType":"double"},"tipo_divisao_carga_trabalho_id":{"dataType":"double"},"tipo_localidade_especializada_id":{"dataType":"double"},"email":{"dataType":"string"},"restricao_ponto_focal":{"dataType":"boolean"},"sigla":{"dataType":"string"},"tipo_especializada_id":{"dataType":"double"},"especializada_triagem":{"dataType":"boolean"},"caixa_entrada_max":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateInput_EspecializadaCreateInput_": {
        "dataType": "refAlias",
        "type": {"ref":"Partial_EspecializadaCreateInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EspecializadaUpdateInput": {
        "dataType": "refAlias",
        "type": {"ref":"UpdateInput_EspecializadaCreateInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsNotaVersaoController_list: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                sprint: {"in":"query","name":"sprint","dataType":"double"},
                ativo: {"in":"query","name":"ativo","dataType":"boolean"},
                includeInactive: {"in":"query","name":"includeInactive","dataType":"boolean"},
                includeDeleted: {"in":"query","name":"includeDeleted","dataType":"boolean"},
                page: {"in":"query","name":"page","dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","dataType":"double"},
        };
        app.get('/api/nota-versao',
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController)),
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController.prototype.list)),

            async function NotaVersaoController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotaVersaoController_list, request, response });

                const controller = new NotaVersaoController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotaVersaoController_find: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/nota-versao/:id',
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController)),
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController.prototype.find)),

            async function NotaVersaoController_find(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotaVersaoController_find, request, response });

                const controller = new NotaVersaoController();

              await templateService.apiHandler({
                methodName: 'find',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotaVersaoController_create: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                payload: {"in":"body","name":"payload","required":true,"ref":"NotaVersaoCreateInput"},
        };
        app.post('/api/nota-versao',
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController)),
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController.prototype.create)),

            async function NotaVersaoController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotaVersaoController_create, request, response });

                const controller = new NotaVersaoController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotaVersaoController_update: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                payload: {"in":"body","name":"payload","required":true,"ref":"NotaVersaoUpdateInput"},
        };
        app.put('/api/nota-versao/:id',
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController)),
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController.prototype.update)),

            async function NotaVersaoController_update(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotaVersaoController_update, request, response });

                const controller = new NotaVersaoController();

              await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotaVersaoController_remove: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/nota-versao/:id',
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController)),
            ...(fetchMiddlewares<RequestHandler>(NotaVersaoController.prototype.remove)),

            async function NotaVersaoController_remove(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotaVersaoController_remove, request, response });

                const controller = new NotaVersaoController();

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsItemAjudaController_list: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                identificador: {"in":"query","name":"identificador","dataType":"string"},
                page: {"in":"query","name":"page","dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","dataType":"double"},
        };
        app.get('/api/item-ajuda',
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController)),
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController.prototype.list)),

            async function ItemAjudaController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsItemAjudaController_list, request, response });

                const controller = new ItemAjudaController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsItemAjudaController_find: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/item-ajuda/:id',
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController)),
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController.prototype.find)),

            async function ItemAjudaController_find(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsItemAjudaController_find, request, response });

                const controller = new ItemAjudaController();

              await templateService.apiHandler({
                methodName: 'find',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsItemAjudaController_create: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                payload: {"in":"body","name":"payload","required":true,"ref":"ItemAjudaCreateInput"},
        };
        app.post('/api/item-ajuda',
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController)),
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController.prototype.create)),

            async function ItemAjudaController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsItemAjudaController_create, request, response });

                const controller = new ItemAjudaController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsItemAjudaController_update: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                payload: {"in":"body","name":"payload","required":true,"ref":"ItemAjudaUpdateInput"},
        };
        app.put('/api/item-ajuda/:id',
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController)),
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController.prototype.update)),

            async function ItemAjudaController_update(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsItemAjudaController_update, request, response });

                const controller = new ItemAjudaController();

              await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsItemAjudaController_remove: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/item-ajuda/:id',
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController)),
            ...(fetchMiddlewares<RequestHandler>(ItemAjudaController.prototype.remove)),

            async function ItemAjudaController_remove(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsItemAjudaController_remove, request, response });

                const controller = new ItemAjudaController();

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEspecializadaController_list: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                nome: {"in":"query","name":"nome","dataType":"string"},
                responsavel_id: {"in":"query","name":"responsavel_id","dataType":"double"},
                tipo_especializada_id: {"in":"query","name":"tipo_especializada_id","dataType":"double"},
                tipo_localidade_especializada_id: {"in":"query","name":"tipo_localidade_especializada_id","dataType":"double"},
                page: {"in":"query","name":"page","dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","dataType":"double"},
        };
        app.get('/api/especializada',
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController)),
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController.prototype.list)),

            async function EspecializadaController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEspecializadaController_list, request, response });

                const controller = new EspecializadaController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEspecializadaController_find: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/especializada/:id',
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController)),
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController.prototype.find)),

            async function EspecializadaController_find(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEspecializadaController_find, request, response });

                const controller = new EspecializadaController();

              await templateService.apiHandler({
                methodName: 'find',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEspecializadaController_create: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                payload: {"in":"body","name":"payload","required":true,"ref":"EspecializadaCreateInput"},
        };
        app.post('/api/especializada',
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController)),
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController.prototype.create)),

            async function EspecializadaController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEspecializadaController_create, request, response });

                const controller = new EspecializadaController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEspecializadaController_update: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                payload: {"in":"body","name":"payload","required":true,"ref":"EspecializadaUpdateInput"},
        };
        app.put('/api/especializada/:id',
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController)),
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController.prototype.update)),

            async function EspecializadaController_update(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEspecializadaController_update, request, response });

                const controller = new EspecializadaController();

              await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEspecializadaController_remove: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/especializada/:id',
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController)),
            ...(fetchMiddlewares<RequestHandler>(EspecializadaController.prototype.remove)),

            async function EspecializadaController_remove(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEspecializadaController_remove, request, response });

                const controller = new EspecializadaController();

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

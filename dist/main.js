/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.controller.ts":
/*!*******************************!*\
  !*** ./src/app.controller.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    getHealth() {
        return this.appService.getHealth();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check da aplicação',
        description: 'Endpoint para verificar se a aplicação está funcionando'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Aplicação funcionando corretamente'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Status detalhado da aplicação',
        description: 'Endpoint com informações detalhadas sobre o status da aplicação'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Status da aplicação com detalhes'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('app'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const contracts_module_1 = __webpack_require__(/*! ./contracts/contracts.module */ "./src/contracts/contracts.module.ts");
const clients_module_1 = __webpack_require__(/*! ./clients/clients.module */ "./src/clients/clients.module.ts");
const shared_module_1 = __webpack_require__(/*! ./shared/shared.module */ "./src/shared/shared.module.ts");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                    dbName: configService.get('MONGODB_DATABASE'),
                    tls: true,
                    tlsAllowInvalidCertificates: true,
                    tlsAllowInvalidHostnames: true,
                    retryWrites: false,
                    authMechanism: 'SCRAM-SHA-1',
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            shared_module_1.SharedModule,
            contracts_module_1.ContractsModule,
            clients_module_1.ClientsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),

/***/ "./src/app.service.ts":
/*!****************************!*\
  !*** ./src/app.service.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AppService = class AppService {
    getHello() {
        return 'Inanbetec-Omie Integration API v1.0 - Sistema funcionando! 🚀';
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'inanbetec-omie-integration',
            version: '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            features: [
                'contract-management',
                'client-synchronization',
                'volumetria-reports',
                'omie-integration'
            ]
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),

/***/ "./src/clients/clients.controller.ts":
/*!*******************************************!*\
  !*** ./src/clients/clients.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ClientsController_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const client_sync_service_1 = __webpack_require__(/*! ./services/client-sync.service */ "./src/clients/services/client-sync.service.ts");
const inanbetec_mongo_service_1 = __webpack_require__(/*! ./services/inanbetec-mongo.service */ "./src/clients/services/inanbetec-mongo.service.ts");
let ClientsController = ClientsController_1 = class ClientsController {
    constructor(clientSyncService, inanbetecService) {
        this.clientSyncService = clientSyncService;
        this.inanbetecService = inanbetecService;
        this.logger = new common_1.Logger(ClientsController_1.name);
    }
    async buscarCliente(cnpj) {
        this.logger.log(`Buscando cliente CNPJ: ${cnpj}`);
        try {
            const [clienteInanbetec, clienteOmie] = await Promise.allSettled([
                this.inanbetecService.buscarClientePorCNPJ(cnpj),
                this.clientSyncService.buscarClienteOmiePorCNPJ(cnpj)
            ]);
            return {
                cnpj,
                inanbetec: {
                    encontrado: clienteInanbetec.status === 'fulfilled' && clienteInanbetec.value,
                    dados: clienteInanbetec.status === 'fulfilled' ? clienteInanbetec.value : null,
                    erro: clienteInanbetec.status === 'rejected' ? clienteInanbetec.reason.message : null
                },
                omie: {
                    encontrado: clienteOmie.status === 'fulfilled' && clienteOmie.value,
                    dados: clienteOmie.status === 'fulfilled' ? clienteOmie.value : null,
                    erro: clienteOmie.status === 'rejected' ? clienteOmie.reason.message : null
                }
            };
        }
        catch (error) {
            this.logger.error(`Erro ao buscar cliente: ${error.message}`);
            throw error;
        }
    }
    async listarClientesInanbetec(pagina, limite) {
        this.logger.log('Listando clientes da Inanbetec');
        return this.inanbetecService.listarClientes({
            pagina: pagina || 1,
            limite: limite || 50
        });
    }
    async statusSistema() {
        return {
            sincronizacaoAutomatica: 'DESABILITADA',
            motivo: 'Sistema em modo somente leitura por segurança',
            operacoesPermitidas: [
                'Busca de clientes por CNPJ',
                'Listagem de clientes Inanbetec'
            ],
            operacoesDesabilitadas: [
                'Sincronização manual',
                'Webhooks de modificação',
                'Criação de novos clientes',
                'Atualização de dados'
            ],
            dataDesabilitacao: '2024-12-19',
            status: 'MODO SEGURO ATIVO'
        };
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Get)('buscar/:cnpj'),
    (0, swagger_1.ApiOperation)({
        summary: 'Buscar cliente por CNPJ em ambas as plataformas',
        description: 'Busca um cliente por CNPJ tanto na Inanbetec quanto no Omie'
    }),
    (0, swagger_1.ApiParam)({ name: 'cnpj', description: 'CNPJ do cliente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dados do cliente retornados' }),
    __param(0, (0, common_1.Param)('cnpj')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "buscarCliente", null);
__decorate([
    (0, common_1.Get)('inanbetec'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar clientes da Inanbetec',
        description: 'Lista clientes cadastrados na Inanbetec'
    }),
    (0, swagger_1.ApiQuery)({ name: 'pagina', required: false, description: 'Número da página' }),
    (0, swagger_1.ApiQuery)({ name: 'limite', required: false, description: 'Registros por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de clientes da Inanbetec' }),
    __param(0, (0, common_1.Query)('pagina')),
    __param(1, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "listarClientesInanbetec", null);
__decorate([
    (0, common_1.Get)('status-sistema'),
    (0, swagger_1.ApiOperation)({
        summary: 'Status do sistema de clientes',
        description: 'Retorna informações sobre o estado atual do sistema de clientes'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status do sistema' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "statusSistema", null);
exports.ClientsController = ClientsController = ClientsController_1 = __decorate([
    (0, swagger_1.ApiTags)('clientes'),
    (0, common_1.Controller)('clientes'),
    __metadata("design:paramtypes", [typeof (_a = typeof client_sync_service_1.ClientSyncService !== "undefined" && client_sync_service_1.ClientSyncService) === "function" ? _a : Object, typeof (_b = typeof inanbetec_mongo_service_1.InanbetecService !== "undefined" && inanbetec_mongo_service_1.InanbetecService) === "function" ? _b : Object])
], ClientsController);


/***/ }),

/***/ "./src/clients/clients.module.ts":
/*!***************************************!*\
  !*** ./src/clients/clients.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const clients_controller_1 = __webpack_require__(/*! ./clients.controller */ "./src/clients/clients.controller.ts");
const client_sync_service_1 = __webpack_require__(/*! ./services/client-sync.service */ "./src/clients/services/client-sync.service.ts");
const inanbetec_mongo_service_1 = __webpack_require__(/*! ./services/inanbetec-mongo.service */ "./src/clients/services/inanbetec-mongo.service.ts");
const contracts_module_1 = __webpack_require__(/*! ../contracts/contracts.module */ "./src/contracts/contracts.module.ts");
const empresa_inanbetec_schema_1 = __webpack_require__(/*! ./schemas/empresa-inanbetec.schema */ "./src/clients/schemas/empresa-inanbetec.schema.ts");
let ClientsModule = class ClientsModule {
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            contracts_module_1.ContractsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: empresa_inanbetec_schema_1.EmpresaInanbetec.name, schema: empresa_inanbetec_schema_1.EmpresaInanbetecSchema }
            ]),
        ],
        controllers: [clients_controller_1.ClientsController],
        providers: [
            client_sync_service_1.ClientSyncService,
            inanbetec_mongo_service_1.InanbetecService,
        ],
        exports: [
            client_sync_service_1.ClientSyncService,
            inanbetec_mongo_service_1.InanbetecService,
        ],
    })
], ClientsModule);


/***/ }),

/***/ "./src/clients/schemas/empresa-inanbetec.schema.ts":
/*!*********************************************************!*\
  !*** ./src/clients/schemas/empresa-inanbetec.schema.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmpresaInanbetecSchema = exports.EmpresaInanbetec = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let EmpresaInanbetec = class EmpresaInanbetec {
};
exports.EmpresaInanbetec = EmpresaInanbetec;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "nome", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "razaoSocial", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "nomeFantasia", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "cnpj", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "cpf", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "telefone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "celular", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "endereco", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "numero", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "complemento", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "bairro", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "cidade", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "estado", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "cep", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "inscricaoEstadual", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "inscricaoMunicipal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Boolean)
], EmpresaInanbetec.prototype, "ativo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], EmpresaInanbetec.prototype, "dataCriacao", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], EmpresaInanbetec.prototype, "dataAtualizacao", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmpresaInanbetec.prototype, "documento", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EmpresaInanbetec.prototype, "idEmpresa", void 0);
exports.EmpresaInanbetec = EmpresaInanbetec = __decorate([
    (0, mongoose_1.Schema)({ collection: 'empresas', timestamps: false })
], EmpresaInanbetec);
exports.EmpresaInanbetecSchema = mongoose_1.SchemaFactory.createForClass(EmpresaInanbetec);


/***/ }),

/***/ "./src/clients/services/client-sync.service.ts":
/*!*****************************************************!*\
  !*** ./src/clients/services/client-sync.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClientSyncService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientSyncService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const inanbetec_mongo_service_1 = __webpack_require__(/*! ./inanbetec-mongo.service */ "./src/clients/services/inanbetec-mongo.service.ts");
const omie_service_1 = __webpack_require__(/*! ../../contracts/services/omie.service */ "./src/contracts/services/omie.service.ts");
let ClientSyncService = ClientSyncService_1 = class ClientSyncService {
    constructor(inanbetecService, omieService) {
        this.inanbetecService = inanbetecService;
        this.omieService = omieService;
        this.logger = new common_1.Logger(ClientSyncService_1.name);
    }
    async sincronizarClientePorCNPJ(cnpj, origem) {
        try {
            this.logger.log(`Iniciando sincronização do cliente CNPJ: ${cnpj} - Origem: ${origem || 'auto'}`);
            const cnpjLimpo = this.limparDocumento(cnpj);
            const [clienteInanbetec, clienteOmie] = await Promise.allSettled([
                this.inanbetecService.buscarClientePorCNPJ(cnpjLimpo),
                this.buscarClienteOmiePorCNPJ(cnpjLimpo)
            ]);
            const dadosInanbetec = clienteInanbetec.status === 'fulfilled' ? clienteInanbetec.value : null;
            const dadosOmie = clienteOmie.status === 'fulfilled' ? clienteOmie.value : null;
            let resultado = {
                cnpj: cnpjLimpo,
                sincronizado: false,
                acoes: [],
                detalhes: {}
            };
            if (dadosInanbetec && !dadosOmie) {
                this.logger.log('Cliente existe apenas na Inanbetec - Criando no Omie');
                const clienteOmieFormat = this.inanbetecService.mapearParaOmie(dadosInanbetec);
                const novoClienteOmie = await this.omieService.incluirCliente(clienteOmieFormat);
                resultado.acoes.push('criado_no_omie');
                resultado.detalhes = {
                    inanbetec: dadosInanbetec,
                    omie: novoClienteOmie,
                    acao: 'cliente_criado_no_omie'
                };
                resultado.sincronizado = true;
            }
            else if (!dadosInanbetec && dadosOmie) {
                this.logger.log('Cliente existe apenas no Omie - Criando na Inanbetec');
                const novoClienteInanbetec = await this.inanbetecService.criarCliente(dadosOmie);
                resultado.acoes.push('criado_na_inanbetec');
                resultado.detalhes = {
                    omie: dadosOmie,
                    inanbetec: novoClienteInanbetec,
                    acao: 'cliente_criado_na_inanbetec'
                };
                resultado.sincronizado = true;
            }
            else if (dadosInanbetec && dadosOmie) {
                this.logger.log('Cliente existe em ambas as plataformas - Verificando necessidade de atualização');
                if (origem === 'inanbetec' || this.clienteInanbetecMaisRecente(dadosInanbetec, dadosOmie)) {
                    const clienteOmieAtualizado = this.inanbetecService.mapearParaOmie(dadosInanbetec);
                    clienteOmieAtualizado.codigo_cliente_omie = dadosOmie.codigo_cliente_omie;
                    await this.omieService.alterarCliente(clienteOmieAtualizado);
                    resultado.acoes.push('atualizado_no_omie');
                    resultado.detalhes = {
                        origem: 'inanbetec',
                        atualizado: 'omie',
                        dados: clienteOmieAtualizado
                    };
                }
                else {
                    await this.inanbetecService.atualizarCliente(String(dadosInanbetec.id), dadosOmie);
                    resultado.acoes.push('atualizado_na_inanbetec');
                    resultado.detalhes = {
                        origem: 'omie',
                        atualizado: 'inanbetec',
                        dados: dadosOmie
                    };
                }
                resultado.sincronizado = true;
            }
            else {
                this.logger.warn(`Cliente com CNPJ ${cnpjLimpo} não encontrado em nenhuma plataforma`);
                resultado.acoes.push('nao_encontrado');
                resultado.detalhes = { erro: 'Cliente não encontrado em nenhuma plataforma' };
            }
            this.logger.log(`Sincronização concluída para CNPJ ${cnpjLimpo}: ${JSON.stringify(resultado)}`);
            return resultado;
        }
        catch (error) {
            this.logger.error(`Erro na sincronização do cliente CNPJ ${cnpj}: ${error.message}`);
            throw error;
        }
    }
    async processarWebhookCliente(evento, clienteData, origem) {
        try {
            this.logger.log(`Processando webhook de cliente - Evento: ${evento}, Origem: ${origem}`);
            const cnpj = clienteData.cnpj_cpf || clienteData.documento;
            if (!cnpj) {
                throw new Error('CNPJ/CPF não encontrado nos dados do cliente');
            }
            switch (evento) {
                case 'created':
                case 'updated':
                    return await this.sincronizarClientePorCNPJ(cnpj, origem);
                case 'deleted':
                    this.logger.log(`Cliente deletado na ${origem} - CNPJ: ${cnpj}`);
                    return {
                        cnpj: this.limparDocumento(cnpj),
                        sincronizado: true,
                        acoes: [`marcado_como_deletado_${origem}`],
                        detalhes: { evento: 'deleted', origem }
                    };
                default:
                    throw new Error(`Evento não suportado: ${evento}`);
            }
        }
        catch (error) {
            this.logger.error(`Erro no processamento do webhook: ${error.message}`);
            throw error;
        }
    }
    async buscarClienteOmiePorCNPJ(cnpj) {
        try {
            const clientes = await this.omieService.listarClientes({
                pagina: 1,
                registros_por_pagina: 1,
                clientesFiltro: {
                    cnpj_cpf: this.limparDocumento(cnpj)
                }
            });
            if (clientes?.clientes_cadastro && clientes.clientes_cadastro.length > 0) {
                return clientes.clientes_cadastro[0];
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar cliente no Omie por CNPJ: ${error.message}`);
            return null;
        }
    }
    clienteInanbetecMaisRecente(clienteInanbetec, clienteOmie) {
        const dataInanbetec = clienteInanbetec.updated_at || clienteInanbetec.created_at;
        const dataOmie = clienteOmie.info?.dAlt || clienteOmie.info?.dInc;
        if (!dataInanbetec || !dataOmie) {
            return true;
        }
        return new Date(dataInanbetec) > new Date(dataOmie);
    }
    limparDocumento(documento) {
        if (!documento)
            return '';
        return documento.replace(/[^\d]/g, '');
    }
};
exports.ClientSyncService = ClientSyncService;
exports.ClientSyncService = ClientSyncService = ClientSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof inanbetec_mongo_service_1.InanbetecService !== "undefined" && inanbetec_mongo_service_1.InanbetecService) === "function" ? _a : Object, typeof (_b = typeof omie_service_1.OmieService !== "undefined" && omie_service_1.OmieService) === "function" ? _b : Object])
], ClientSyncService);


/***/ }),

/***/ "./src/clients/services/inanbetec-mongo.service.ts":
/*!*********************************************************!*\
  !*** ./src/clients/services/inanbetec-mongo.service.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InanbetecService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InanbetecService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const empresa_inanbetec_schema_1 = __webpack_require__(/*! ../schemas/empresa-inanbetec.schema */ "./src/clients/schemas/empresa-inanbetec.schema.ts");
let InanbetecService = InanbetecService_1 = class InanbetecService {
    constructor(empresaModel, configService) {
        this.empresaModel = empresaModel;
        this.configService = configService;
        this.logger = new common_1.Logger(InanbetecService_1.name);
    }
    async buscarClientePorCNPJ(cnpj) {
        try {
            this.logger.log(`Buscando cliente na Inanbetec por CNPJ: ${cnpj}`);
            const cnpjLimpo = this.limparDocumento(cnpj);
            const empresa = await this.empresaModel.findOne({
                $or: [
                    { cpf: cnpjLimpo },
                    { cnpj: cnpjLimpo },
                    { documento: cnpjLimpo },
                    { cpf: this.formatarDocumento(cnpjLimpo, 'cpf') },
                    { cnpj: this.formatarDocumento(cnpjLimpo, 'cnpj') }
                ]
            }).exec();
            if (empresa) {
                this.logger.log(`Cliente encontrado na Inanbetec: ${empresa.nome} (${empresa.cpf || empresa.cnpj})`);
                return this.mapearEmpresaParaCliente(empresa);
            }
            this.logger.log(`Cliente não encontrado na Inanbetec para CNPJ: ${cnpj}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar cliente na Inanbetec: ${error.message}`);
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
    async criarCliente(clienteData) {
        try {
            this.logger.log(`Criando cliente na Inanbetec: ${JSON.stringify(clienteData)}`);
            const dadosInanbetec = this.mapearParaInanbetec(clienteData);
            const novaEmpresa = new this.empresaModel(dadosInanbetec);
            const resultado = await novaEmpresa.save();
            this.logger.log(`Cliente criado na Inanbetec: ${resultado._id}`);
            return resultado;
        }
        catch (error) {
            this.logger.error(`Erro ao criar cliente na Inanbetec: ${error.message}`);
            throw error;
        }
    }
    async atualizarCliente(clienteId, clienteData) {
        try {
            this.logger.log(`Atualizando cliente na Inanbetec ID: ${clienteId}`);
            const dadosInanbetec = this.mapearParaInanbetec(clienteData);
            const resultado = await this.empresaModel.findByIdAndUpdate(clienteId, dadosInanbetec, { new: true }).exec();
            this.logger.log(`Cliente atualizado na Inanbetec: ${resultado?._id}`);
            return resultado;
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar cliente na Inanbetec: ${error.message}`);
            throw error;
        }
    }
    async listarClientes(filtros = {}) {
        try {
            this.logger.log(`Listando clientes na Inanbetec com filtros: ${JSON.stringify(filtros)}`);
            const query = this.empresaModel.find();
            if (filtros.modificado_apos) {
                query.where('dataCriacao').gte(new Date(filtros.modificado_apos).getTime());
            }
            if (filtros.idEmpresa) {
                query.where('idEmpresa').equals(filtros.idEmpresa);
            }
            const empresas = await query.exec();
            this.logger.log(`Lista de clientes retornada da Inanbetec: ${empresas.length} registros`);
            return empresas.map(empresa => this.mapearEmpresaParaCliente(empresa));
        }
        catch (error) {
            this.logger.error(`Erro ao listar clientes na Inanbetec: ${error.message}`);
            throw error;
        }
    }
    mapearEmpresaParaCliente(empresa) {
        return {
            id: empresa._id,
            cnpj_cpf: empresa.cpf || empresa.cnpj || empresa.documento,
            razao_social: empresa.razaoSocial || empresa.nome,
            nome_fantasia: empresa.nomeFantasia || empresa.nome,
            email: empresa.email,
            telefone: empresa.telefone || empresa.celular,
            endereco: {
                endereco: empresa.endereco || '',
                numero: empresa.numero || '',
                complemento: empresa.complemento || '',
                bairro: empresa.bairro || '',
                cidade: empresa.cidade || '',
                estado: empresa.estado || '',
                cep: empresa.cep || ''
            },
            data_cadastro: empresa.dataCriacao,
            origem: 'inanbetec'
        };
    }
    mapearParaInanbetec(clienteOmie) {
        this.logger.debug(`Dados do cliente Omie para mapeamento: ${JSON.stringify(clienteOmie, null, 2)}`);
        return {
            nome: clienteOmie.razao_social || clienteOmie.nome_fantasia || '',
            razaoSocial: clienteOmie.razao_social || '',
            nomeFantasia: clienteOmie.nome_fantasia || clienteOmie.razao_social || '',
            email: clienteOmie.email || '',
            telefone: clienteOmie.telefone1_numero || '',
            celular: clienteOmie.telefone1_numero || '',
            cpf: this.isCPF(clienteOmie.cnpj_cpf) ? this.limparDocumento(clienteOmie.cnpj_cpf) : undefined,
            cnpj: this.isCNPJ(clienteOmie.cnpj_cpf) ? this.limparDocumento(clienteOmie.cnpj_cpf) : undefined,
            documento: this.limparDocumento(clienteOmie.cnpj_cpf),
            endereco: clienteOmie.endereco || '',
            numero: clienteOmie.endereco_numero || '',
            complemento: clienteOmie.complemento || '',
            bairro: clienteOmie.bairro || '',
            cidade: clienteOmie.cidade ? clienteOmie.cidade.replace(/\s*\([^)]*\)/, '') : '',
            estado: clienteOmie.estado || '',
            cep: this.limparCEP(clienteOmie.cep) || '',
            inscricaoEstadual: clienteOmie.inscricao_estadual || '',
            inscricaoMunicipal: clienteOmie.inscricao_municipal || '',
            ativo: true,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
            tipo: 'cliente',
            status: 'ativo',
            idEmpresa: this.configService.get('INANBETEC_EMPRESA_ID', 258)
        };
    }
    mapearParaOmie(clienteInanbetec) {
        return {
            cnpj_cpf: this.limparDocumento(clienteInanbetec.cnpj_cpf),
            razao_social: clienteInanbetec.razao_social,
            nome_fantasia: clienteInanbetec.nome_fantasia,
            email: clienteInanbetec.email,
            telefone1_numero: clienteInanbetec.telefone,
            endereco: {
                endereco: clienteInanbetec.endereco?.endereco,
                numero: clienteInanbetec.endereco?.numero,
                complemento: clienteInanbetec.endereco?.complemento,
                bairro: clienteInanbetec.endereco?.bairro,
                cidade: clienteInanbetec.endereco?.cidade,
                estado: clienteInanbetec.endereco?.estado,
                cep: this.limparCEP(clienteInanbetec.endereco?.cep)
            },
            tags: [
                {
                    tag: 'origem:inanbetec'
                }
            ]
        };
    }
    formatarDocumento(documento, tipo) {
        const limpo = this.limparDocumento(documento);
        if (tipo === 'cpf' && limpo.length === 11) {
            return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        else if (tipo === 'cnpj' && limpo.length === 14) {
            return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return documento;
    }
    isCPF(documento) {
        const limpo = this.limparDocumento(documento);
        return limpo.length === 11;
    }
    isCNPJ(documento) {
        const limpo = this.limparDocumento(documento);
        return limpo.length === 14;
    }
    limparDocumento(documento) {
        if (!documento)
            return '';
        return documento.replace(/[^\d]/g, '');
    }
    limparCEP(cep) {
        if (!cep)
            return '';
        return cep.replace(/[^\d]/g, '');
    }
};
exports.InanbetecService = InanbetecService;
exports.InanbetecService = InanbetecService = InanbetecService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(empresa_inanbetec_schema_1.EmpresaInanbetec.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], InanbetecService);


/***/ }),

/***/ "./src/contracts/contracts.controller.ts":
/*!***********************************************!*\
  !*** ./src/contracts/contracts.controller.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContractsController_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const contracts_service_1 = __webpack_require__(/*! ./services/contracts.service */ "./src/contracts/services/contracts.service.ts");
let ContractsController = ContractsController_1 = class ContractsController {
    constructor(contractsService) {
        this.contractsService = contractsService;
        this.logger = new common_1.Logger(ContractsController_1.name);
    }
    async testarCriacaoContrato(empresaId, competencia, enviarOmie) {
        this.logger.log(`🧪 Teste de criação de contrato - Empresa: ${empresaId}, Competência: ${competencia}`);
        const enviarParaOmie = enviarOmie === 'true';
        return this.contractsService.testarCriacaoContrato(empresaId, competencia, enviarParaOmie);
    }
    async processarConsolidacaoMensal(dto) {
        this.logger.log(`=== PROCESSAMENTO CONSOLIDAÇÃO MENSAL ===`);
        this.logger.log(`Competência: ${dto.competencia}`);
        this.logger.log(`Empresas: ${dto.empresaIds ? dto.empresaIds.join(',') : 'TODAS'}`);
        return this.contractsService.processarConsolidacaoMensal(dto.competencia, dto.empresaIds);
    }
    async processarConsolidacaoManual(empresaId, dto) {
        this.logger.log(`Consolidação manual - Empresa: ${empresaId}, Competência: ${dto.competencia}`);
        return this.contractsService.processarConsolidacaoMensal(dto.competencia, [empresaId]);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)('teste/:empresaId/:competencia'),
    (0, swagger_1.ApiOperation)({
        summary: 'TESTE: Criar contrato sem salvar no banco',
        description: 'Testa a criação de contrato agrupando volumetria por produto e separando por proposta, SEM PERSISTIR dados'
    }),
    (0, swagger_1.ApiParam)({ name: 'empresaId', description: 'ID da empresa' }),
    (0, swagger_1.ApiParam)({ name: 'competencia', description: 'Competência no formato YYYY-MM (ex: 2025-08)' }),
    (0, swagger_1.ApiQuery)({ name: 'enviarOmie', required: false, description: 'Se true, envia para Omie; se false, apenas simula' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Teste executado com sucesso' }),
    __param(0, (0, common_1.Param)('empresaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('competencia')),
    __param(2, (0, common_1.Query)('enviarOmie')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "testarCriacaoContrato", null);
__decorate([
    (0, common_1.Post)('consolidacao/processar'),
    (0, swagger_1.ApiOperation)({
        summary: 'Processar consolidação mensal por proposta comercial',
        description: 'Executa o processo de consolidação mensal agrupando por número de proposta comercial (FLUXO CORRETO)'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consolidação processada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erro no processamento da consolidação' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "processarConsolidacaoMensal", null);
__decorate([
    (0, common_1.Post)('consolidacao/manual/:empresaId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Processar consolidação manual para uma empresa',
        description: 'Executa consolidação para uma empresa específica (modo manual)'
    }),
    (0, swagger_1.ApiParam)({ name: 'empresaId', description: 'ID da empresa' }),
    __param(0, (0, common_1.Param)('empresaId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "processarConsolidacaoManual", null);
exports.ContractsController = ContractsController = ContractsController_1 = __decorate([
    (0, swagger_1.ApiTags)('contratos'),
    (0, common_1.Controller)('contratos'),
    __metadata("design:paramtypes", [typeof (_a = typeof contracts_service_1.ContractsService !== "undefined" && contracts_service_1.ContractsService) === "function" ? _a : Object])
], ContractsController);


/***/ }),

/***/ "./src/contracts/contracts.module.ts":
/*!*******************************************!*\
  !*** ./src/contracts/contracts.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const contracts_controller_1 = __webpack_require__(/*! ./contracts.controller */ "./src/contracts/contracts.controller.ts");
const contracts_service_1 = __webpack_require__(/*! ./services/contracts.service */ "./src/contracts/services/contracts.service.ts");
const volumetria_service_1 = __webpack_require__(/*! ./services/volumetria.service */ "./src/contracts/services/volumetria.service.ts");
const omie_service_1 = __webpack_require__(/*! ./services/omie.service */ "./src/contracts/services/omie.service.ts");
const propostas_service_1 = __webpack_require__(/*! ./services/propostas.service */ "./src/contracts/services/propostas.service.ts");
const consolidacao_service_1 = __webpack_require__(/*! ./services/consolidacao.service */ "./src/contracts/services/consolidacao.service.ts");
const configuracao_service_1 = __webpack_require__(/*! ./services/configuracao.service */ "./src/contracts/services/configuracao.service.ts");
const consolidacao_scheduler_service_1 = __webpack_require__(/*! ./services/consolidacao-scheduler.service */ "./src/contracts/services/consolidacao-scheduler.service.ts");
const volumetria_consolidada_schema_1 = __webpack_require__(/*! ./schemas/volumetria-consolidada.schema */ "./src/contracts/schemas/volumetria-consolidada.schema.ts");
let ContractsModule = class ContractsModule {
};
exports.ContractsModule = ContractsModule;
exports.ContractsModule = ContractsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            schedule_1.ScheduleModule.forRoot(),
            mongoose_1.MongooseModule.forFeature([{ name: volumetria_consolidada_schema_1.VolumetriaConsolidada.name, schema: volumetria_consolidada_schema_1.VolumetriaConsolidadaSchema }])
        ],
        controllers: [contracts_controller_1.ContractsController],
        providers: [
            contracts_service_1.ContractsService,
            volumetria_service_1.VolumetriaService,
            omie_service_1.OmieService,
            propostas_service_1.PropostasService,
            consolidacao_service_1.ConsolidacaoService,
            configuracao_service_1.ConfiguracaoService,
            consolidacao_scheduler_service_1.ConsolidacaoSchedulerService,
        ],
        exports: [
            contracts_service_1.ContractsService,
            volumetria_service_1.VolumetriaService,
            omie_service_1.OmieService,
            propostas_service_1.PropostasService,
            consolidacao_service_1.ConsolidacaoService,
            configuracao_service_1.ConfiguracaoService,
            consolidacao_scheduler_service_1.ConsolidacaoSchedulerService,
        ],
    })
], ContractsModule);


/***/ }),

/***/ "./src/contracts/schemas/volumetria-consolidada.schema.ts":
/*!****************************************************************!*\
  !*** ./src/contracts/schemas/volumetria-consolidada.schema.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VolumetriaConsolidadaSchema = exports.VolumetriaConsolidada = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let VolumetriaConsolidada = class VolumetriaConsolidada {
};
exports.VolumetriaConsolidada = VolumetriaConsolidada;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], VolumetriaConsolidada.prototype, "competencia", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], VolumetriaConsolidada.prototype, "empresaId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], VolumetriaConsolidada.prototype, "numeroProposta", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], VolumetriaConsolidada.prototype, "proposta", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], VolumetriaConsolidada.prototype, "valorTotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], VolumetriaConsolidada.prototype, "quantidadeTotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], VolumetriaConsolidada.prototype, "totalProdutos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", typeof (_b = typeof Array !== "undefined" && Array) === "function" ? _b : Object)
], VolumetriaConsolidada.prototype, "produtos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], VolumetriaConsolidada.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], VolumetriaConsolidada.prototype, "codigoIntegracao", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'ready_to_send', enum: ['ready_to_send', 'sending', 'sent', 'error'] }),
    __metadata("design:type", String)
], VolumetriaConsolidada.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], VolumetriaConsolidada.prototype, "tentativas", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VolumetriaConsolidada.prototype, "mensagemErro", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], VolumetriaConsolidada.prototype, "omieRequest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], VolumetriaConsolidada.prototype, "omieResponse", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], VolumetriaConsolidada.prototype, "contratoOmieId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], VolumetriaConsolidada.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], VolumetriaConsolidada.prototype, "updatedAt", void 0);
exports.VolumetriaConsolidada = VolumetriaConsolidada = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], VolumetriaConsolidada);
exports.VolumetriaConsolidadaSchema = mongoose_1.SchemaFactory.createForClass(VolumetriaConsolidada);
exports.VolumetriaConsolidadaSchema.index({ competencia: 1, empresaId: 1, numeroProposta: 1 }, { unique: true });


/***/ }),

/***/ "./src/contracts/services/configuracao.service.ts":
/*!********************************************************!*\
  !*** ./src/contracts/services/configuracao.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConfiguracaoService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfiguracaoService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const mongodb_1 = __webpack_require__(/*! mongodb */ "mongodb");
const axios_1 = __webpack_require__(/*! axios */ "axios");
let ConfiguracaoService = ConfiguracaoService_1 = class ConfiguracaoService {
    constructor(configService, mongoConnection) {
        this.configService = configService;
        this.mongoConnection = mongoConnection;
        this.logger = new common_1.Logger(ConfiguracaoService_1.name);
    }
    async obterEmpresasAtivas() {
        try {
            const empresasConfig = this.configService.get('EMPRESAS_ATIVAS', '51,66');
            const empresas = empresasConfig.split(',').map(id => parseInt(id.trim()));
            this.logger.log(`Empresas ativas configuradas: ${empresas.join(', ')}`);
            return empresas;
        }
        catch (error) {
            this.logger.error(`Erro ao obter empresas ativas: ${error.message}`);
            return [51, 66];
        }
    }
    async obterCodigoClienteOmie(empresaId) {
        try {
            const mapeamento = {
                51: 2370765,
                66: 1234567,
                258: 1234568
            };
            const codigoCliente = mapeamento[empresaId];
            if (!codigoCliente) {
                throw new Error(`Código cliente Omie não configurado para empresa ${empresaId}`);
            }
            return codigoCliente;
        }
        catch (error) {
            this.logger.error(`Erro ao obter código cliente Omie: ${error.message}`);
            throw error;
        }
    }
    async obterConfiguracaoEmpresa(empresaId) {
        try {
            this.logger.log(`🔍 Obtendo configuração dinâmica para empresa ${empresaId}`);
            const empresaInAnbetec = await this.buscarEmpresaInAnbetec(empresaId);
            if (!empresaInAnbetec) {
                this.logger.warn(`⚠️ Empresa ${empresaId} não encontrada no banco InAnbetec, usando fallback`);
                return await this.obterConfiguracaoEmpresaFallback(empresaId);
            }
            this.logger.log(`✅ Empresa encontrada: ${empresaInAnbetec.nome} - CNPJ: ${empresaInAnbetec.cnpj}`);
            const codigoClienteOmie = await this.buscarCodigoClienteOmie(empresaInAnbetec.cnpj);
            if (!codigoClienteOmie) {
                this.logger.warn(`⚠️ Cliente CNPJ ${empresaInAnbetec.cnpj} não encontrado no Omie, usando fallback`);
                return await this.obterConfiguracaoEmpresaFallback(empresaId);
            }
            this.logger.log(`✅ Cliente Omie encontrado: ${codigoClienteOmie}`);
            return {
                empresaId: empresaId,
                nomeEmpresa: empresaInAnbetec.nome,
                cnpj: empresaInAnbetec.cnpj,
                codigoClienteOmie: codigoClienteOmie,
                ativo: empresaInAnbetec.status || true,
                configuracao: {
                    tipoFaturamento: '01',
                    diaFaturamento: 30,
                    vigenciaInicial: '01/01/2025',
                    vigenciaFinal: '31/12/2025',
                    codigosServico: {
                        'cobranca': {
                            codServico: 1001,
                            codLC116: '3.05',
                            natOperacao: '01',
                            aliqISS: 5.0
                        },
                        'bolepix': {
                            codServico: 1003,
                            codLC116: '3.05',
                            natOperacao: '01',
                            aliqISS: 5.0
                        },
                        'pagamentos': {
                            codServico: 1002,
                            codLC116: '3.05',
                            natOperacao: '01',
                            aliqISS: 5.0
                        },
                        'pixpay': {
                            codServico: 1004,
                            codLC116: '3.05',
                            natOperacao: '01',
                            aliqISS: 5.0
                        },
                        'webcheckout': {
                            codServico: 1005,
                            codLC116: '3.05',
                            natOperacao: '01',
                            aliqISS: 5.0
                        }
                    }
                }
            };
        }
        catch (error) {
            this.logger.error(`❌ Erro ao obter configuração da empresa ${empresaId}: ${error.message}`);
            this.logger.warn(`⚠️ Usando configuração de fallback para empresa ${empresaId}`);
            return await this.obterConfiguracaoEmpresaFallback(empresaId);
        }
    }
    async buscarEmpresaInAnbetec(empresaId) {
        try {
            const collection = this.mongoConnection.collection('empresas');
            const empresa = await collection.findOne({
                $or: [
                    { id: empresaId },
                    { empresaId: empresaId },
                    { _id: new mongodb_1.ObjectId(empresaId.toString().padStart(24, '0')) }
                ]
            });
            return empresa;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar empresa ${empresaId} no MongoDB: ${error.message}`);
            return null;
        }
    }
    async buscarCodigoClienteOmie(cnpj) {
        try {
            const omieAppKey = this.configService.get('OMIE_APP_KEY');
            const omieAppSecret = this.configService.get('OMIE_APP_SECRET');
            if (!omieAppKey || !omieAppSecret) {
                throw new Error('Credenciais do Omie não configuradas');
            }
            const payload = {
                call: 'ConsultarCliente',
                app_key: omieAppKey,
                app_secret: omieAppSecret,
                param: [{
                        cnpj_cpf: cnpj.replace(/[^\d]/g, '')
                    }]
            };
            const response = await axios_1.default.post('https://app.omie.com.br/api/v1/geral/clientes/', payload);
            if (response.data && response.data.codigo_cliente_omie) {
                return response.data.codigo_cliente_omie;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao consultar cliente no Omie: ${error.message}`);
            return null;
        }
    }
    async obterConfiguracaoEmpresaFallback(empresaId) {
        try {
            const configuracoesPadrao = {
                51: {
                    empresaId: 51,
                    nomeEmpresa: 'Empresa 51 - InAnbetec',
                    cnpj: '00.000.000/0001-51',
                    codigoClienteOmie: 2370765,
                    ativo: true,
                    configuracao: {
                        tipoFaturamento: '01',
                        diaFaturamento: 30,
                        vigenciaInicial: '01/01/2025',
                        vigenciaFinal: '31/12/2025',
                        codigosServico: {
                            'cobranca': {
                                codServico: 1001,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'pagamentos': {
                                codServico: 1002,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'bolepix': {
                                codServico: 1003,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'pixpay': {
                                codServico: 1004,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            }
                        }
                    }
                },
                66: {
                    empresaId: 66,
                    nomeEmpresa: 'Empresa 66 - InAnbetec',
                    cnpj: '00.000.000/0001-66',
                    codigoClienteOmie: 1234567,
                    ativo: true,
                    configuracao: {
                        tipoFaturamento: '01',
                        diaFaturamento: 30,
                        vigenciaInicial: '01/01/2025',
                        vigenciaFinal: '31/12/2025',
                        codigosServico: {
                            'cobranca': {
                                codServico: 1001,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'webcheckout': {
                                codServico: 1005,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 0
                            }
                        }
                    }
                },
                258: {
                    empresaId: 258,
                    nomeEmpresa: 'Empresa 258 - InAnbetec',
                    cnpj: '02.678.694/0002-27',
                    codigoClienteOmie: 6488507558,
                    ativo: true,
                    configuracao: {
                        tipoFaturamento: '01',
                        diaFaturamento: 30,
                        vigenciaInicial: '01/01/2025',
                        vigenciaFinal: '31/12/2025',
                        codigosServico: {
                            'cobranca': {
                                codServico: 1001,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'bolepix': {
                                codServico: 1003,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'pagamentos': {
                                codServico: 1002,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'pixpay': {
                                codServico: 1004,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            },
                            'webcheckout': {
                                codServico: 1005,
                                codLC116: '3.05',
                                natOperacao: '01',
                                aliqISS: 5.0
                            }
                        }
                    }
                }
            };
            const config = configuracoesPadrao[empresaId];
            if (!config) {
                throw new Error(`Configuração não encontrada para empresa ${empresaId}`);
            }
            return config;
        }
        catch (error) {
            this.logger.error(`Erro ao obter configuração da empresa ${empresaId}: ${error.message}`);
            throw error;
        }
    }
    async obterCodigosServico(empresaId, nomeProduto) {
        try {
            const config = await this.obterConfiguracaoEmpresa(empresaId);
            const codigoProduto = config.configuracao.codigosServico[nomeProduto.toLowerCase()];
            if (!codigoProduto) {
                return {
                    codServico: 1000,
                    codLC116: '3.05',
                    natOperacao: '01',
                    aliqISS: 5.0
                };
            }
            return codigoProduto;
        }
        catch (error) {
            this.logger.error(`Erro ao obter códigos de serviço: ${error.message}`);
            throw error;
        }
    }
    async validarEmpresa(empresaId) {
        try {
            const empresasAtivas = await this.obterEmpresasAtivas();
            if (!empresasAtivas.includes(empresaId)) {
                return false;
            }
            const config = await this.obterConfiguracaoEmpresa(empresaId);
            return config.ativo;
        }
        catch (error) {
            this.logger.warn(`Empresa ${empresaId} não está válida: ${error.message}`);
            return false;
        }
    }
    isPrimeiroDiaUtil() {
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            return false;
        }
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        while (primeiroDia.getDay() === 0 || primeiroDia.getDay() === 6) {
            primeiroDia.setDate(primeiroDia.getDate() + 1);
        }
        return hoje.getDate() === primeiroDia.getDate();
    }
    obterCompetenciaAnterior() {
        const hoje = new Date();
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const ano = mesAnterior.getFullYear();
        const mes = String(mesAnterior.getMonth() + 1).padStart(2, '0');
        return `${ano}-${mes}`;
    }
    obterConfiguracaoGeral() {
        return {
            inanbetecVolumetriaURL: this.configService.get('INANBETEC_VOLUMETRIA_URL'),
            omieApiURL: this.configService.get('OMIE_API_URL'),
            omieAppKey: this.configService.get('OMIE_APP_KEY'),
            omieAppSecret: this.configService.get('OMIE_APP_SECRET'),
            maxTentativas: this.configService.get('MAX_TENTATIVAS', 3),
            timeoutAPI: this.configService.get('TIMEOUT_API', 30000),
            horarioConsolidacao: this.configService.get('HORARIO_CONSOLIDACAO', '06:00'),
            horarioRetentativa1: this.configService.get('HORARIO_RETENTATIVA_1', '10:00'),
            horarioRetentativa2: this.configService.get('HORARIO_RETENTATIVA_2', '14:00'),
            mesesRetencao: this.configService.get('MESES_RETENCAO', 12)
        };
    }
};
exports.ConfiguracaoService = ConfiguracaoService;
exports.ConfiguracaoService = ConfiguracaoService = ConfiguracaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Connection !== "undefined" && mongoose_2.Connection) === "function" ? _b : Object])
], ConfiguracaoService);


/***/ }),

/***/ "./src/contracts/services/consolidacao-scheduler.service.ts":
/*!******************************************************************!*\
  !*** ./src/contracts/services/consolidacao-scheduler.service.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ConsolidacaoSchedulerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsolidacaoSchedulerService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const contracts_service_1 = __webpack_require__(/*! ./contracts.service */ "./src/contracts/services/contracts.service.ts");
const configuracao_service_1 = __webpack_require__(/*! ./configuracao.service */ "./src/contracts/services/configuracao.service.ts");
let ConsolidacaoSchedulerService = ConsolidacaoSchedulerService_1 = class ConsolidacaoSchedulerService {
    constructor(contractsService, configuracaoService) {
        this.contractsService = contractsService;
        this.configuracaoService = configuracaoService;
        this.logger = new common_1.Logger(ConsolidacaoSchedulerService_1.name);
        this.processandoConsolidacao = false;
    }
    async executarConsolidacaoPrincipal() {
        try {
            this.logger.log('Verificando se deve executar consolidação mensal...');
            if (this.processandoConsolidacao) {
                this.logger.warn('Consolidação já está em andamento - ignorando execução');
                return;
            }
            if (!this.configuracaoService.isPrimeiroDiaUtil()) {
                this.logger.log('Hoje não é o primeiro dia útil do mês - aguardando');
                return;
            }
            await this.executarConsolidacao('Principal às 6h');
        }
        catch (error) {
            this.logger.error(`Erro na consolidação principal: ${error.message}`);
        }
    }
    async executarPrimeiraRetentativa() {
        try {
            this.logger.log('Executando primeira retentativa...');
            if (this.processandoConsolidacao) {
                this.logger.warn('Consolidação em andamento - ignorando retentativa');
                return;
            }
            if (!this.configuracaoService.isPrimeiroDiaUtil()) {
                return;
            }
            await this.executarConsolidacao('Retentativa 1 às 10h');
        }
        catch (error) {
            this.logger.error(`Erro na primeira retentativa: ${error.message}`);
        }
    }
    async executarSegundaRetentativa() {
        try {
            this.logger.log('Executando segunda retentativa...');
            if (this.processandoConsolidacao) {
                this.logger.warn('Consolidação em andamento - ignorando retentativa');
                return;
            }
            if (!this.configuracaoService.isPrimeiroDiaUtil()) {
                return;
            }
            await this.executarConsolidacao('Retentativa 2 às 14h');
        }
        catch (error) {
            this.logger.error(`Erro na segunda retentativa: ${error.message}`);
        }
    }
    async executarLimpezaMensal() {
        try {
            this.logger.log('Executando limpeza mensal de registros antigos...');
        }
        catch (error) {
            this.logger.error(`Erro na limpeza mensal: ${error.message}`);
        }
    }
    async executarConsolidacao(contexto) {
        this.processandoConsolidacao = true;
        const inicioProcessamento = new Date();
        try {
            this.logger.log(`=== INICIANDO CONSOLIDAÇÃO MENSAL - ${contexto} ===`);
            const competencia = this.configuracaoService.obterCompetenciaAnterior();
            this.logger.log(`Processando competência: ${competencia}`);
            const empresasAtivas = await this.configuracaoService.obterEmpresasAtivas();
            this.logger.log(`Empresas a processar: ${empresasAtivas.join(', ')}`);
            const resultado = await this.contractsService.processarConsolidacaoMensal(competencia, empresasAtivas.map(id => id.toString()));
            const tempoProcessamento = Date.now() - inicioProcessamento.getTime();
            const tempoFormatado = this.formatarTempo(tempoProcessamento);
            if (resultado.success) {
                this.logger.log(`=== CONSOLIDAÇÃO CONCLUÍDA COM SUCESSO - ${contexto} ===`);
                this.logger.log(`Competência: ${resultado.competencia}`);
                this.logger.log(`Empresas processadas: ${resultado.empresasProcessadas}`);
                this.logger.log(`Empresas com sucesso: ${resultado.empresasComSucesso}`);
                this.logger.log(`Tempo de processamento: ${tempoFormatado}`);
                resultado.resultados.forEach(empresaResult => {
                    if (empresaResult.success) {
                        this.logger.log(`✅ Empresa ${empresaResult.empresaId}: ${empresaResult.propostas?.length || 0} propostas processadas`);
                    }
                    else {
                        this.logger.error(`❌ Empresa ${empresaResult.empresaId}: ${empresaResult.error}`);
                    }
                });
            }
            else {
                this.logger.error(`=== CONSOLIDAÇÃO FALHOU - ${contexto} ===`);
                this.logger.error(`Erro: ${resultado.error}`);
            }
            await this.enviarNotificacaoStatus(resultado, contexto, tempoFormatado);
        }
        catch (error) {
            const tempoProcessamento = Date.now() - inicioProcessamento.getTime();
            const tempoFormatado = this.formatarTempo(tempoProcessamento);
            this.logger.error(`=== ERRO CRÍTICO NA CONSOLIDAÇÃO - ${contexto} ===`);
            this.logger.error(`Erro: ${error.message}`);
            this.logger.error(`Tempo até erro: ${tempoFormatado}`);
            await this.enviarAlertaCritico(error, contexto);
        }
        finally {
            this.processandoConsolidacao = false;
        }
    }
    async executarConsolidacaoManual(competencia, empresaIds) {
        if (this.processandoConsolidacao) {
            throw new Error('Consolidação automática em andamento. Aguarde a conclusão.');
        }
        try {
            this.processandoConsolidacao = true;
            const competenciaProcessar = competencia || this.configuracaoService.obterCompetenciaAnterior();
            const empresasProcessar = empresaIds || (await this.configuracaoService.obterEmpresasAtivas()).map(id => id.toString());
            this.logger.log(`Executando consolidação MANUAL - Competência: ${competenciaProcessar}`);
            const resultado = await this.contractsService.processarConsolidacaoMensal(competenciaProcessar, empresasProcessar);
            this.logger.log(`Consolidação manual concluída: ${resultado.success ? 'SUCESSO' : 'ERRO'}`);
            return resultado;
        }
        finally {
            this.processandoConsolidacao = false;
        }
    }
    obterStatusProcessamento() {
        return {
            processando: this.processandoConsolidacao,
            detalhes: this.processandoConsolidacao ? {
                iniciado: new Date(),
                proximaExecucao: this.obterProximaExecucao()
            } : null
        };
    }
    formatarTempo(milissegundos) {
        const segundos = Math.floor(milissegundos / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        if (horas > 0) {
            return `${horas}h ${minutos % 60}m ${segundos % 60}s`;
        }
        else if (minutos > 0) {
            return `${minutos}m ${segundos % 60}s`;
        }
        else {
            return `${segundos}s`;
        }
    }
    obterProximaExecucao() {
        const agora = new Date();
        const proximoDiaUtil = new Date(agora);
        do {
            proximoDiaUtil.setDate(proximoDiaUtil.getDate() + 1);
        } while (proximoDiaUtil.getDay() === 0 || proximoDiaUtil.getDay() === 6);
        proximoDiaUtil.setHours(6, 0, 0, 0);
        return proximoDiaUtil.toISOString();
    }
    async enviarNotificacaoStatus(resultado, contexto, tempo) {
        this.logger.log(`Notificação de status enviada - ${contexto} - Sucesso: ${resultado.success}`);
    }
    async enviarAlertaCritico(error, contexto) {
        this.logger.error(`Alerta crítico enviado - ${contexto} - Erro: ${error.message}`);
    }
};
exports.ConsolidacaoSchedulerService = ConsolidacaoSchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 6 * * 1-5', {
        name: 'consolidacao-mensal-principal',
        timeZone: 'America/Sao_Paulo'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsolidacaoSchedulerService.prototype, "executarConsolidacaoPrincipal", null);
__decorate([
    (0, schedule_1.Cron)('0 10 * * 1-5', {
        name: 'consolidacao-retentativa-1',
        timeZone: 'America/Sao_Paulo'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsolidacaoSchedulerService.prototype, "executarPrimeiraRetentativa", null);
__decorate([
    (0, schedule_1.Cron)('0 14 * * 1-5', {
        name: 'consolidacao-retentativa-2',
        timeZone: 'America/Sao_Paulo'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsolidacaoSchedulerService.prototype, "executarSegundaRetentativa", null);
__decorate([
    (0, schedule_1.Cron)('0 2 15 * *', {
        name: 'limpeza-registros-antigos',
        timeZone: 'America/Sao_Paulo'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsolidacaoSchedulerService.prototype, "executarLimpezaMensal", null);
exports.ConsolidacaoSchedulerService = ConsolidacaoSchedulerService = ConsolidacaoSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof contracts_service_1.ContractsService !== "undefined" && contracts_service_1.ContractsService) === "function" ? _a : Object, typeof (_b = typeof configuracao_service_1.ConfiguracaoService !== "undefined" && configuracao_service_1.ConfiguracaoService) === "function" ? _b : Object])
], ConsolidacaoSchedulerService);


/***/ }),

/***/ "./src/contracts/services/consolidacao.service.ts":
/*!********************************************************!*\
  !*** ./src/contracts/services/consolidacao.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConsolidacaoService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsolidacaoService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const volumetria_consolidada_schema_1 = __webpack_require__(/*! ../schemas/volumetria-consolidada.schema */ "./src/contracts/schemas/volumetria-consolidada.schema.ts");
let ConsolidacaoService = ConsolidacaoService_1 = class ConsolidacaoService {
    constructor(consolidacaoModel) {
        this.consolidacaoModel = consolidacaoModel;
        this.logger = new common_1.Logger(ConsolidacaoService_1.name);
    }
    async persistirConsolidacao(dados) {
        try {
            const quantidadeTotal = dados.produtos.reduce((total, produto) => total + (produto.quantidade || 1), 0);
            const totalProdutos = dados.produtos.length;
            const codigoIntegracao = this.gerarCodigoIntegracao(dados.competencia, dados.empresaId, dados.numeroProposta);
            const consolidacao = new this.consolidacaoModel({
                competencia: this.converterCompetenciaParaDate(dados.competencia),
                empresaId: dados.empresaId,
                numeroProposta: dados.numeroProposta,
                proposta: dados.numeroProposta,
                valorTotal: dados.valorTotal,
                quantidadeTotal,
                totalProdutos,
                produtos: dados.produtos,
                payload: dados.payload || {},
                codigoIntegracao,
                status: 'ready_to_send',
                tentativas: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const resultado = await consolidacao.save();
            this.logger.log(`Consolidação persistida - ID: ${resultado._id}`);
            return resultado;
        }
        catch (error) {
            if (error.code === 11000) {
                this.logger.warn(`Consolidação duplicada detectada - reprocessando: ${dados.competencia}/${dados.empresaId}/${dados.numeroProposta}`);
                return await this.buscarConsolidacao(dados.competencia, dados.empresaId, dados.numeroProposta);
            }
            this.logger.error(`Erro ao persistir consolidação: ${error.message}`);
            throw error;
        }
    }
    async buscarConsolidacao(competencia, empresaId, proposta) {
        try {
            const competenciaDate = this.converterCompetenciaParaDate(competencia);
            return await this.consolidacaoModel.findOne({
                competencia: competenciaDate,
                empresaId,
                proposta
            }).exec();
        }
        catch (error) {
            this.logger.error(`Erro ao buscar consolidação: ${error.message}`);
            return null;
        }
    }
    async atualizarStatusConsolidacao(id, novoStatus, mensagemErro, omieRequest, omieResponse) {
        try {
            const updates = {
                status: novoStatus,
                updatedAt: new Date()
            };
            if (mensagemErro) {
                updates.mensagemErro = mensagemErro;
            }
            if (omieRequest) {
                updates.omieRequest = omieRequest;
            }
            if (omieResponse) {
                updates.omieResponse = omieResponse;
                if (omieResponse.cCodStatus === '0') {
                    updates.contratoOmieId = omieResponse.nCodCtr;
                    updates.mensagemErro = null;
                }
            }
            if (novoStatus === 'error') {
                updates.$inc = { tentativas: 1 };
            }
            const resultado = await this.consolidacaoModel.findByIdAndUpdate(id, updates, { new: true });
            if (!resultado) {
                throw new Error(`Consolidação não encontrada: ${id}`);
            }
            this.logger.log(`Status atualizado para ${novoStatus} - ID: ${id}`);
            return resultado;
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar status: ${error.message}`);
            throw error;
        }
    }
    async listarConsolidacoes(filtros = {}) {
        try {
            const query = {};
            if (filtros.competencia) {
                query.competencia = this.converterCompetenciaParaDate(filtros.competencia);
            }
            if (filtros.empresaId) {
                query.empresaId = filtros.empresaId;
            }
            if (filtros.status) {
                query.status = filtros.status;
            }
            if (filtros.proposta) {
                query.proposta = filtros.proposta;
            }
            return await this.consolidacaoModel
                .find(query)
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            this.logger.error(`Erro ao listar consolidações: ${error.message}`);
            throw error;
        }
    }
    async marcarParaReprocessamento(id) {
        try {
            const resultado = await this.consolidacaoModel.findByIdAndUpdate(id, {
                status: 'ready_to_send',
                mensagemErro: null,
                omieRequest: null,
                omieResponse: null
            }, { new: true });
            if (resultado) {
                this.logger.log(`Consolidação marcada para reprocessamento: ${id}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Erro ao marcar para reprocessamento: ${error.message}`);
            return false;
        }
    }
    async atualizarTotais(id, novosTotais) {
        try {
            const resultado = await this.consolidacaoModel.findByIdAndUpdate(id, {
                valorTotal: novosTotais.valorTotal,
                quantidadeTotal: novosTotais.quantidadeTotal,
                totalProdutos: novosTotais.totalProdutos,
                updatedAt: new Date()
            }, { new: true });
            if (!resultado) {
                throw new Error(`Consolidação não encontrada: ${id}`);
            }
            this.logger.log(`Totais atualizados - ID: ${id}`);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar totais: ${error.message}`);
            throw error;
        }
    }
    async obterEstatisticas(competencia) {
        try {
            const matchStage = {};
            if (competencia) {
                matchStage.competencia = this.converterCompetenciaParaDate(competencia);
            }
            const stats = await this.consolidacaoModel.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$status',
                        total: { $sum: 1 },
                        valorTotal: { $sum: '$valorTotal' },
                        valorMedio: { $avg: '$valorTotal' }
                    }
                }
            ]);
            const resultado = {
                totalRegistros: 0,
                porStatus: {},
                valorTotalGeral: 0
            };
            for (const stat of stats) {
                resultado.totalRegistros += stat.total;
                resultado.valorTotalGeral += stat.valorTotal;
                resultado.porStatus[stat._id] = {
                    total: stat.total,
                    valorTotal: stat.valorTotal,
                    valorMedio: stat.valorMedio
                };
            }
            return resultado;
        }
        catch (error) {
            this.logger.error(`Erro ao obter estatísticas: ${error.message}`);
            throw error;
        }
    }
    async limparConsolidacoes(competencia, apenasErros = false) {
        try {
            const filtro = {};
            if (competencia) {
                filtro.competencia = this.converterCompetenciaParaDate(competencia);
            }
            if (apenasErros) {
                filtro.status = 'error';
            }
            const resultado = await this.consolidacaoModel.deleteMany(filtro);
            this.logger.log(`Limpeza concluída: ${resultado.deletedCount} registros removidos`);
            return resultado.deletedCount;
        }
        catch (error) {
            this.logger.error(`Erro na limpeza: ${error.message}`);
            throw error;
        }
    }
    converterCompetenciaParaDate(competencia) {
        const [ano, mes] = competencia.split('-');
        return new Date(`${ano}-${mes}-01T00:00:00.000Z`);
    }
    gerarCodigoIntegracao(competencia, empresaId, proposta) {
        const [ano, mes] = competencia.split('-');
        return `CTR-${ano}-${mes}-EMP${empresaId}-PROP-${proposta}`;
    }
    async limparRegistrosAntigos(mesesAnteriores = 12) {
        try {
            const dataLimite = new Date();
            dataLimite.setMonth(dataLimite.getMonth() - mesesAnteriores);
            const resultado = await this.consolidacaoModel.deleteMany({
                competencia: { $lt: dataLimite },
                status: 'sent'
            });
            this.logger.log(`Limpeza concluída: ${resultado.deletedCount} registros removidos`);
            return resultado.deletedCount;
        }
        catch (error) {
            this.logger.error(`Erro na limpeza de registros: ${error.message}`);
            return 0;
        }
    }
};
exports.ConsolidacaoService = ConsolidacaoService;
exports.ConsolidacaoService = ConsolidacaoService = ConsolidacaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(volumetria_consolidada_schema_1.VolumetriaConsolidada.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], ConsolidacaoService);


/***/ }),

/***/ "./src/contracts/services/contracts.service.ts":
/*!*****************************************************!*\
  !*** ./src/contracts/services/contracts.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContractsService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const volumetria_service_1 = __webpack_require__(/*! ./volumetria.service */ "./src/contracts/services/volumetria.service.ts");
const omie_service_1 = __webpack_require__(/*! ./omie.service */ "./src/contracts/services/omie.service.ts");
const propostas_service_1 = __webpack_require__(/*! ./propostas.service */ "./src/contracts/services/propostas.service.ts");
const consolidacao_service_1 = __webpack_require__(/*! ./consolidacao.service */ "./src/contracts/services/consolidacao.service.ts");
const configuracao_service_1 = __webpack_require__(/*! ./configuracao.service */ "./src/contracts/services/configuracao.service.ts");
let ContractsService = ContractsService_1 = class ContractsService {
    constructor(volumetriaService, omieService, propostasService, consolidacaoService, configuracaoService) {
        this.volumetriaService = volumetriaService;
        this.omieService = omieService;
        this.propostasService = propostasService;
        this.consolidacaoService = consolidacaoService;
        this.configuracaoService = configuracaoService;
        this.logger = new common_1.Logger(ContractsService_1.name);
    }
    async testarCriacaoContrato(empresaId, competencia, enviarParaOmie = false) {
        try {
            this.logger.log(`🧪 === TESTE CRIAÇÃO CONTRATO (SEM PERSISTIR) ===`);
            this.logger.log(`Empresa: ${empresaId} | Competência: ${competencia}`);
            this.logger.log(`Enviar para Omie: ${enviarParaOmie ? 'SIM' : 'NÃO (apenas simulação)'}`);
            const { dataInicial, dataFinal } = this.calcularPeriodoCompetencia(competencia);
            this.logger.log(`📅 Período: ${dataInicial} até ${dataFinal}`);
            this.logger.log(`🔍 Buscando volumetria...`);
            const volumetriaData = await this.volumetriaService.consultarVolumetria({
                dataInicial,
                dataFinal,
                empresas: empresaId.toString()
            });
            if (!volumetriaData || volumetriaData.length === 0) {
                this.logger.warn(`⚠️ Sem dados de volumetria para empresa ${empresaId}`);
                return {
                    success: false,
                    error: 'Sem dados de volumetria no período',
                    dadosProcessamento: {
                        empresaId,
                        competencia,
                        periodo: { dataInicial, dataFinal }
                    }
                };
            }
            const produtos = this.extrairProdutosDaVolumetria(volumetriaData[0]);
            this.logger.log(`📦 Produtos detectados na volumetria: ${produtos.length}`);
            if (produtos.length === 0) {
                this.logger.warn(`⚠️ Nenhum produto com valor encontrado`);
                return {
                    success: false,
                    error: 'Nenhum produto com valor > 0',
                    dadosProcessamento: {
                        empresaId,
                        competencia,
                        volumetria: volumetriaData[0]
                    }
                };
            }
            this.logger.log(`🔗 Buscando TODOS os produtos com propostas comerciais...`);
            const produtosComPropostasDisponiveis = await this.propostasService.obterProdutosComPropostas(empresaId);
            this.logger.log(`📋 Produtos com propostas disponíveis: ${produtosComPropostasDisponiveis.join(', ')}`);
            const produtosComProposta = [];
            for (const nomeProduto of produtosComPropostasDisponiveis) {
                try {
                    this.logger.log(`   🔍 Processando produto: ${nomeProduto}`);
                    const produtoNaVolumetria = produtos.find(p => p.nome.toLowerCase() === nomeProduto.toLowerCase());
                    const numeroProposta = await this.propostasService.obterPropostaPorProduto(empresaId, nomeProduto, competencia);
                    if (numeroProposta) {
                        const quantidade = produtoNaVolumetria?.quantidade || 0;
                        const precoDaProposta = await this.propostasService.obterPrecoProdutoNaProposta(numeroProposta, nomeProduto, quantidade);
                        if (precoDaProposta !== null && precoDaProposta >= 0) {
                            produtosComProposta.push({
                                produto: nomeProduto,
                                valor: precoDaProposta,
                                quantidade: quantidade,
                                proposta: numeroProposta,
                                volumetriaReferencia: produtoNaVolumetria?.valor || 0
                            });
                            const statusVolumetria = produtoNaVolumetria ?
                                `(${quantidade} transações, volumetria: R$ ${produtoNaVolumetria.valor})` :
                                '(sem dados na volumetria)';
                            this.logger.log(`   ✅ ${nomeProduto} → Proposta ${numeroProposta}: R$ ${precoDaProposta} ${statusVolumetria}`);
                        }
                        else {
                            this.logger.warn(`   ❌ ${nomeProduto} → Proposta ${numeroProposta} encontrada, mas preço não calculado`);
                        }
                    }
                    else {
                        this.logger.warn(`   ❌ ${nomeProduto} → Sem proposta vinculada`);
                    }
                }
                catch (error) {
                    this.logger.error(`   🔥 ${nomeProduto} → Erro: ${error.message}`);
                }
            }
            if (produtosComProposta.length === 0) {
                this.logger.warn(`⚠️ Nenhum produto com proposta vinculada encontrado`);
                return {
                    success: false,
                    error: 'Nenhum produto possui proposta vinculada',
                    dadosProcessamento: {
                        empresaId,
                        competencia,
                        produtos,
                        produtosSemProposta: produtos.filter(p => p.valor > 0).map(p => p.nome)
                    }
                };
            }
            const propostasConsolidadas = this.agruparPorNumeroProposta(produtosComProposta);
            this.logger.log(`📋 Propostas consolidadas: ${Object.keys(propostasConsolidadas).length}`);
            Object.entries(propostasConsolidadas).forEach(([proposta, dados]) => {
                const produtosDetalhes = dados.produtos.map(p => `${p.nome}(R$ ${p.valor})`).join(' + ');
                this.logger.log(`   → Proposta ${proposta}: ${produtosDetalhes} = R$ ${dados.valorTotal}`);
            });
            const contratosPreparados = [];
            for (const [numeroProposta, dadosProposta] of Object.entries(propostasConsolidadas)) {
                try {
                    const registroSimulado = {
                        _id: `simulado_${Date.now()}`,
                        competencia,
                        empresaId,
                        proposta: numeroProposta,
                        valorTotal: dadosProposta.valorTotal,
                        produtos: dadosProposta.produtos,
                        status: 'ready_to_send'
                    };
                    const modeloContrato = await this.criarModeloContratoOmie(registroSimulado);
                    contratosPreparados.push({
                        proposta: numeroProposta,
                        valorTotal: dadosProposta.valorTotal,
                        produtos: dadosProposta.produtos,
                        modeloContrato: modeloContrato,
                        registroSimulado: registroSimulado
                    });
                    this.logger.log(`   📄 Contrato preparado - Proposta ${numeroProposta}`);
                }
                catch (error) {
                    this.logger.error(`   🔥 Erro ao preparar contrato - Proposta ${numeroProposta}: ${error.message}`);
                }
            }
            const resultadosEnvio = [];
            if (enviarParaOmie) {
                this.logger.log(`🚀 Enviando ${contratosPreparados.length} contratos para Omie...`);
                for (const contrato of contratosPreparados) {
                    try {
                        const response = await this.omieService.incluirContrato(contrato.modeloContrato);
                        resultadosEnvio.push({
                            proposta: contrato.proposta,
                            success: response.cCodStatus === '0',
                            contratoId: response.nCodCtr,
                            integrationCode: response.cCodIntCtr,
                            message: response.cDescStatus,
                            response: response
                        });
                        if (response.cCodStatus === '0') {
                            this.logger.log(`   ✅ Proposta ${contrato.proposta} → Contrato ${response.nCodCtr} criado`);
                        }
                        else {
                            this.logger.error(`   ❌ Proposta ${contrato.proposta} → Erro: ${response.cDescStatus}`);
                        }
                    }
                    catch (error) {
                        this.logger.error(`   🔥 Erro ao enviar proposta ${contrato.proposta}: ${error.message}`);
                        resultadosEnvio.push({
                            proposta: contrato.proposta,
                            success: false,
                            error: error.message
                        });
                    }
                }
            }
            else {
                this.logger.log(`💡 Simulação concluída - ${contratosPreparados.length} contratos preparados (não enviados)`);
            }
            const resultado = {
                success: true,
                modo: enviarParaOmie ? 'ENVIO_REAL' : 'SIMULACAO',
                dadosProcessamento: {
                    empresaId,
                    competencia,
                    periodo: { dataInicial, dataFinal },
                    volumetria: volumetriaData[0],
                    produtosEncontrados: produtos.length,
                    produtosComProposta: produtosComProposta.length,
                    propostas: Object.keys(propostasConsolidadas),
                    contratosPreparados: contratosPreparados.length
                },
                produtos,
                produtosComProposta,
                propostasConsolidadas,
                contratosPreparados,
                resultadosEnvio: enviarParaOmie ? resultadosEnvio : null
            };
            this.logger.log(`✅ Teste concluído com sucesso!`);
            return resultado;
        }
        catch (error) {
            this.logger.error(`💥 Erro no teste: ${error.message}`);
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }
    async processarConsolidacaoMensal(competencia, empresaIds) {
        try {
            this.logger.log(`=== INICIANDO CONSOLIDAÇÃO MENSAL ===`);
            this.logger.log(`Competência: ${competencia}`);
            const { dataInicial, dataFinal } = this.calcularPeriodoCompetencia(competencia);
            this.logger.log(`Período: ${dataInicial} até ${dataFinal}`);
            const empresas = empresaIds || (await this.configuracaoService.obterEmpresasAtivas()).map(id => id.toString());
            this.logger.log(`Empresas a processar: ${empresas.join(', ')}`);
            const resultados = [];
            for (const empresaId of empresas) {
                try {
                    this.logger.log(`--- Processando empresa: ${empresaId} ---`);
                    const resultadoEmpresa = await this.processarEmpresaPorProposta(parseInt(empresaId), dataInicial, dataFinal, competencia);
                    resultados.push(resultadoEmpresa);
                }
                catch (error) {
                    this.logger.error(`Erro ao processar empresa ${empresaId}: ${error.message}`);
                    resultados.push({
                        empresaId: parseInt(empresaId),
                        success: false,
                        error: error.message
                    });
                }
            }
            const empresasComSucesso = resultados.filter(r => r.success).length;
            this.logger.log(`=== CONSOLIDAÇÃO MENSAL CONCLUÍDA ===`);
            this.logger.log(`Total empresas: ${resultados.length}`);
            this.logger.log(`Sucessos: ${empresasComSucesso}`);
            this.logger.log(`Erros: ${resultados.length - empresasComSucesso}`);
            return {
                success: true,
                competencia,
                empresasProcessadas: resultados.length,
                empresasComSucesso,
                resultados
            };
        }
        catch (error) {
            this.logger.error(`Erro crítico na consolidação mensal: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async processarEmpresaPorProposta(empresaId, dataInicial, dataFinal, competencia) {
        try {
            this.logger.log(`Consultando volumetria empresa ${empresaId}...`);
            const volumetriaData = await this.volumetriaService.consultarVolumetria({
                dataInicial,
                dataFinal,
                empresas: empresaId.toString()
            });
            if (!volumetriaData || volumetriaData.length === 0) {
                this.logger.warn(`Sem dados de volumetria - Empresa: ${empresaId}`);
                return {
                    empresaId,
                    success: true,
                    propostas: [],
                    contratosEnviados: 0,
                    motivo: 'Sem dados de volumetria no período'
                };
            }
            const produtos = this.extrairProdutosDaVolumetria(volumetriaData[0]);
            if (produtos.length === 0) {
                this.logger.warn(`Nenhum produto com valor encontrado - Empresa: ${empresaId}`);
                return {
                    empresaId,
                    success: true,
                    propostas: [],
                    contratosEnviados: 0,
                    motivo: 'Nenhum produto com valor > 0'
                };
            }
            this.logger.log(`Produtos encontrados: ${produtos.map(p => `${p.nome}(${p.valor})`).join(', ')}`);
            const produtosComProposta = [];
            for (const produto of produtos) {
                if (produto.valor > 0) {
                    try {
                        const numeroProposta = await this.propostasService.obterPropostaPorProduto(empresaId, produto.nome, competencia);
                        if (numeroProposta) {
                            produtosComProposta.push({
                                produto: produto.nome,
                                valor: produto.valor,
                                quantidade: produto.quantidade,
                                proposta: numeroProposta
                            });
                            this.logger.log(`✅ ${produto.nome} → Proposta: ${numeroProposta} (R$ ${produto.valor})`);
                        }
                        else {
                            this.logger.warn(`❌ ${produto.nome} → Sem proposta vinculada`);
                        }
                    }
                    catch (error) {
                        this.logger.error(`Erro ao obter proposta para ${produto.nome}: ${error.message}`);
                    }
                }
            }
            if (produtosComProposta.length === 0) {
                return {
                    empresaId,
                    success: true,
                    propostas: [],
                    contratosEnviados: 0,
                    motivo: 'Nenhum produto com proposta vinculada'
                };
            }
            const propostasConsolidadas = this.agruparPorNumeroProposta(produtosComProposta);
            this.logger.log(`Propostas consolidadas: ${Object.keys(propostasConsolidadas).join(', ')}`);
            const registrosConsolidacao = [];
            for (const [numeroProposta, dadosProposta] of Object.entries(propostasConsolidadas)) {
                const dadosConsolidacao = {
                    competencia,
                    empresaId,
                    numeroProposta,
                    valorTotal: dadosProposta.valorTotal,
                    produtos: dadosProposta.produtos
                };
                const registro = await this.consolidacaoService.persistirConsolidacao(dadosConsolidacao);
                registrosConsolidacao.push(registro);
                this.logger.log(`💾 Proposta ${numeroProposta} salva - Status: ${registro.status}`);
            }
            const contratosEnviados = [];
            for (const registro of registrosConsolidacao) {
                if (registro.status === 'ready_to_send') {
                    try {
                        const contratoOmie = await this.enviarContratoParaOmie(registro);
                        contratosEnviados.push(contratoOmie);
                        this.logger.log(`🚀 Contrato enviado - Proposta: ${registro.proposta} - ID Omie: ${contratoOmie.contratoId}`);
                    }
                    catch (error) {
                        this.logger.error(`Erro ao enviar contrato - Proposta ${registro.proposta}: ${error.message}`);
                        await this.consolidacaoService.atualizarStatusConsolidacao(registro._id.toString(), 'error', error.message);
                    }
                }
            }
            return {
                empresaId,
                success: true,
                propostas: Object.keys(propostasConsolidadas),
                registrosConsolidacao: registrosConsolidacao.length,
                contratosEnviados: contratosEnviados.length,
                detalhes: contratosEnviados
            };
        }
        catch (error) {
            this.logger.error(`Erro ao processar empresa ${empresaId}: ${error.message}`);
            throw error;
        }
    }
    extrairProdutosDaVolumetria(volumetria) {
        const produtos = [];
        const regrasExtracao = [
            {
                nome: 'cobranca',
                condicao: (v) => v.cobranca && (v.cobranca.qtdeTitulos > 0 || v.cobranca.valorTotal > 0),
                valor: (v) => v.cobranca.valorTotal || 0,
                quantidade: (v) => v.cobranca.qtdeTitulos || 0
            },
            {
                nome: 'pixpay',
                condicao: (v) => v.pixpay && (v.pixpay.qtdeMotoristas > 0 || v.pixpay.valorTotal > 0),
                valor: (v) => v.pixpay.valorTotal || 0,
                quantidade: (v) => v.pixpay.qtdeMotoristas || v.pixpay.qtdeTitulos || 0
            },
            {
                nome: 'webcheckout',
                condicao: (v) => v.webcheckout && (v.webcheckout.qtdeTitulos > 0 || v.webcheckout.valorTotal > 0),
                valor: (v) => v.webcheckout.valorTotal || 0,
                quantidade: (v) => v.webcheckout.qtdeTitulos || 0
            },
            {
                nome: 'bolepix',
                condicao: (v) => v.bolepix && (v.bolepix.qtdeTitulos > 0 || v.bolepix.valorTotal > 0),
                valor: (v) => v.bolepix.valorTotal || 0,
                quantidade: (v) => v.bolepix.qtdeTitulos || 0
            }
        ];
        for (const regra of regrasExtracao) {
            if (regra.condicao(volumetria)) {
                const valor = regra.valor(volumetria);
                const quantidade = regra.quantidade(volumetria);
                produtos.push({
                    nome: regra.nome,
                    valor: valor,
                    quantidade: quantidade
                });
            }
        }
        const produtosMapeados = regrasExtracao.map(r => r.nome);
        const chavesVolumetria = Object.keys(volumetria).filter(k => k !== 'idEmpresa' && !produtosMapeados.includes(k));
        for (const chave of chavesVolumetria) {
            const dados = volumetria[chave];
            if (dados && typeof dados === 'object') {
                const valor = dados.valorTotal || 0;
                const quantidade = dados.qtdeTitulos || dados.qtdeMotoristas || dados.quantidade || 0;
                if (valor > 0 || quantidade > 0) {
                    produtos.push({
                        nome: chave,
                        valor: valor,
                        quantidade: quantidade
                    });
                    this.logger.log(`   ⚠️ Produto não mapeado encontrado: ${chave} - R$ ${valor} (qty: ${quantidade})`);
                }
            }
        }
        return produtos;
    }
    agruparPorNumeroProposta(produtos) {
        const agrupamento = {};
        for (const produto of produtos) {
            const { proposta, valor, produto: nomeProduto, quantidade } = produto;
            if (!agrupamento[proposta]) {
                agrupamento[proposta] = {
                    valorTotal: 0,
                    produtos: []
                };
            }
            agrupamento[proposta].valorTotal += valor;
            agrupamento[proposta].produtos.push({
                nome: nomeProduto,
                valor: valor,
                quantidade: quantidade || 0
            });
        }
        for (const proposta of Object.keys(agrupamento)) {
            agrupamento[proposta].valorTotal = Math.round(agrupamento[proposta].valorTotal * 100) / 100;
        }
        return agrupamento;
    }
    async enviarContratoParaOmie(registroConsolidacao) {
        const contratoModel = await this.criarModeloContratoOmie(registroConsolidacao);
        const response = await this.omieService.incluirContrato(contratoModel);
        if (response.cCodStatus === '0') {
            await this.consolidacaoService.atualizarStatusConsolidacao(registroConsolidacao._id.toString(), 'sent', null, contratoModel, response);
        }
        else {
            await this.consolidacaoService.atualizarStatusConsolidacao(registroConsolidacao._id.toString(), 'error', response.cDescStatus, contratoModel, response);
        }
        return {
            proposta: registroConsolidacao.proposta,
            success: response.cCodStatus === '0',
            contratoId: response.nCodCtr,
            integrationCode: response.cCodIntCtr,
            message: response.cDescStatus
        };
    }
    async criarModeloContratoOmie(registroConsolidacao) {
        const { competencia, empresaId, proposta: numeroProposta, valorTotal, produtos } = registroConsolidacao;
        const configEmpresa = await this.configuracaoService.obterConfiguracaoEmpresa(empresaId);
        const [ano, mes] = competencia.split('-');
        const anoCompacto = ano.slice(-2);
        const propCompacta = numeroProposta.slice(-6);
        const cCodIntCtr = `EMP${empresaId}-${anoCompacto}${mes}-${propCompacta}`;
        if (cCodIntCtr.length > 20) {
            this.logger.warn(`⚠️ Código de integração truncado: ${cCodIntCtr} (${cCodIntCtr.length} chars)`);
        }
        const descricaoProdutos = produtos.map(p => p.nome).join(', ');
        const descricaoCompleta = `Serviços do período ${mes}/${ano} — Proposta ${numeroProposta} — Produtos: ${descricaoProdutos}`;
        this.logger.log(`📋 Código integração: ${cCodIntCtr} (${cCodIntCtr.length} caracteres)`);
        const contratoModel = {
            cabecalho: {
                cCodIntCtr: cCodIntCtr,
                cNumCtr: numeroProposta,
                cCodSit: '10',
                cTipoFat: configEmpresa.configuracao.tipoFaturamento,
                dVigInicial: configEmpresa.configuracao.vigenciaInicial,
                dVigFinal: configEmpresa.configuracao.vigenciaFinal,
                nCodCli: configEmpresa.codigoClienteOmie,
                nDiaFat: configEmpresa.configuracao.diaFaturamento,
                nValTotMes: valorTotal
            },
            itensContrato: produtos.filter(produto => produto.valor > 0).map((produto, index) => {
                const quantidade = produto.quantidade || 1;
                const valorTotalItem = parseFloat(produto.valor) || 0;
                const valorUnitario = quantidade > 0 ? Math.round((valorTotalItem / quantidade) * 100) / 100 : valorTotalItem;
                this.logger.log(`🔍 Item ${index + 1}: ${produto.nome} - Qtd: ${quantidade}, ValorTotal: ${valorTotalItem}, ValorUnit: ${valorUnitario}`);
                if (valorTotalItem === 0 || isNaN(valorTotalItem)) {
                    this.logger.error(`⚠️ PROBLEMA: Produto ${produto.nome} tem valorTotalItem inválido: ${valorTotalItem}`);
                }
                return {
                    itemCabecalho: {
                        aliqDesconto: 0,
                        cCodCategItem: '1.01.03',
                        cNaoGerarFinanceiro: 'N',
                        cTpDesconto: '',
                        codIntItem: (index + 1).toString(),
                        codLC116: '1.06',
                        codNBS: '',
                        codServMunic: '620230000',
                        codServico: 2360610897,
                        natOperacao: '01',
                        quant: quantidade,
                        seq: index + 1,
                        valorAcrescimo: 0,
                        valorDed: 0,
                        valorDesconto: 0,
                        valorOutrasRetencoes: 0,
                        valorTotal: valorTotalItem,
                        valorUnit: valorUnitario
                    },
                    itemDescrServ: {
                        descrCompleta: produto.nome.toUpperCase()
                    },
                    itemImpostos: {
                        aliqCOFINS: 3,
                        aliqCSLL: 1,
                        aliqINSS: 0,
                        aliqIR: 1.5,
                        aliqISS: 2,
                        aliqPIS: 0.65,
                        lDeduzISS: false,
                        redBaseCOFINS: 0,
                        redBaseINSS: 0,
                        redBasePIS: 0,
                        retCOFINS: 'S',
                        retCSLL: 'S',
                        retINSS: 'N',
                        retIR: 'N',
                        retISS: 'N',
                        retPIS: 'S',
                        valorCOFINS: Math.round(valorTotalItem * 0.03 * 100) / 100,
                        valorCSLL: Math.round(valorTotalItem * 0.01 * 100) / 100,
                        valorINSS: 0,
                        valorIR: Math.round(valorTotalItem * 0.015 * 100) / 100,
                        valorISS: Math.round(valorTotalItem * 0.02 * 100) / 100,
                        valorPIS: Math.round(valorTotalItem * 0.0065 * 100) / 100
                    },
                    itemLeiTranspImp: {
                        aliMunicipal: 0,
                        aliqEstadual: 0,
                        aliqFederal: 0,
                        chave: '',
                        fonte: ''
                    }
                };
            }),
            observacoes: {
                cObsContrato: `Consolidação automática InAnbetec. Competência ${mes}/${ano}.`
            },
            infAdic: {
                cCodCateg: '1.01.01',
                nCodCC: 2404200141
            },
            vencTextos: {
                cAdContrato: 'N',
                cAdPeriodo: 'S',
                cAdVenc: 'S',
                cAntecipar: 'S',
                cCodPerRef: '001',
                cDiaFim: 1,
                cDiaIni: 1,
                cPostergar: 'N',
                cProxMes: '',
                cTpVenc: '002',
                nDias: 30,
                nDiaFixo: 30
            },
            departamentos: [],
            emailCliente: {
                cEnviarBoleto: 'N',
                cEnviarLinkNfse: 'N',
                cEnviarRecibo: 'N',
                cUtilizarEmails: ''
            }
        };
        this.logger.log(`📤 JSON completo que será enviado para Omie:`);
        this.logger.log(JSON.stringify(contratoModel, null, 2));
        contratoModel.itensContrato.forEach((item, index) => {
            if (!item.itemCabecalho.valorUnit || item.itemCabecalho.valorUnit === 0) {
                this.logger.error(`🚨 ERRO: Item ${index + 1} tem valorUnit inválido: ${item.itemCabecalho.valorUnit}`);
            }
        });
        return contratoModel;
    }
    calcularPeriodoCompetencia(competencia) {
        const [ano, mes] = competencia.split('-');
        const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
        return {
            dataInicial: `${ano}-${mes}-01`,
            dataFinal: `${ano}-${mes}-${ultimoDia.toString().padStart(2, '0')}`
        };
    }
    createListRequest(params) {
        return {
            pagina: params.pagina || 1,
            registros_por_pagina: params.registros_por_pagina || 50,
            apenas_importado_api: params.apenas_importado_api || 'N'
        };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = ContractsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof volumetria_service_1.VolumetriaService !== "undefined" && volumetria_service_1.VolumetriaService) === "function" ? _a : Object, typeof (_b = typeof omie_service_1.OmieService !== "undefined" && omie_service_1.OmieService) === "function" ? _b : Object, typeof (_c = typeof propostas_service_1.PropostasService !== "undefined" && propostas_service_1.PropostasService) === "function" ? _c : Object, typeof (_d = typeof consolidacao_service_1.ConsolidacaoService !== "undefined" && consolidacao_service_1.ConsolidacaoService) === "function" ? _d : Object, typeof (_e = typeof configuracao_service_1.ConfiguracaoService !== "undefined" && configuracao_service_1.ConfiguracaoService) === "function" ? _e : Object])
], ContractsService);


/***/ }),

/***/ "./src/contracts/services/omie.service.ts":
/*!************************************************!*\
  !*** ./src/contracts/services/omie.service.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OmieService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OmieService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let OmieService = OmieService_1 = class OmieService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(OmieService_1.name);
        this.baseURL = 'https://app.omie.com.br/api/v1/servicos/contrato/';
        this.appKey = this.configService.get('OMIE_APP_KEY');
        this.appSecret = this.configService.get('OMIE_APP_SECRET');
        if (!this.appKey || !this.appSecret) {
            throw new Error('Variáveis de ambiente OMIE_APP_KEY e OMIE_APP_SECRET são obrigatórias');
        }
    }
    async callAPI(method, params) {
        try {
            const payload = {
                call: method,
                app_key: this.appKey,
                app_secret: this.appSecret,
                param: [params]
            };
            this.logger.log(`Chamando API Omie - Método: ${method}`);
            this.logger.debug(`Payload completo: ${JSON.stringify(payload, null, 2)}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.baseURL, payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro na chamada da API Omie: ${error.message}`);
            if (error.response?.data) {
                this.logger.error(`Resposta da API Omie: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    async incluirContrato(contratoCadastro) {
        return this.callAPI('IncluirContrato', contratoCadastro);
    }
    async alterarContrato(contratoCadastro) {
        return this.callAPI('AlterarContrato', contratoCadastro);
    }
    async consultarContrato(contratoChave) {
        return this.callAPI('ConsultarContrato', { contratoChave });
    }
    async listarContratos(csListarRequest) {
        return this.callAPI('ListarContratos', csListarRequest);
    }
    async upsertContrato(contratoCadastro) {
        return this.callAPI('UpsertContrato', contratoCadastro);
    }
    async excluirItem(contratoChave, itensExclusao) {
        const params = {
            contratoChave,
            ItensExclusao: itensExclusao
        };
        return this.callAPI('ExcluirItem', params);
    }
    async incluirCliente(clienteCadastro) {
        const payload = {
            call: 'IncluirCliente',
            app_key: this.appKey,
            app_secret: this.appSecret,
            param: [clienteCadastro]
        };
        try {
            this.logger.log('Incluindo cliente no Omie');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao incluir cliente no Omie: ${error.message}`);
            throw error;
        }
    }
    async alterarCliente(clienteCadastro) {
        const payload = {
            call: 'AlterarCliente',
            app_key: this.appKey,
            app_secret: this.appSecret,
            param: [clienteCadastro]
        };
        try {
            this.logger.log('Alterando cliente no Omie');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao alterar cliente no Omie: ${error.message}`);
            throw error;
        }
    }
    async consultarCliente(clienteChave) {
        const payload = {
            call: 'ConsultarCliente',
            app_key: this.appKey,
            app_secret: this.appSecret,
            param: [{ clienteChave }]
        };
        try {
            this.logger.log('Consultando cliente no Omie');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao consultar cliente no Omie: ${error.message}`);
            throw error;
        }
    }
    async listarClientes(listarRequest) {
        const payload = {
            call: 'ListarClientes',
            app_key: this.appKey,
            app_secret: this.appSecret,
            param: [listarRequest]
        };
        try {
            this.logger.log('Listando clientes no Omie');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao listar clientes no Omie: ${error.message}`);
            throw error;
        }
    }
};
exports.OmieService = OmieService;
exports.OmieService = OmieService = OmieService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], OmieService);


/***/ }),

/***/ "./src/contracts/services/propostas.service.ts":
/*!*****************************************************!*\
  !*** ./src/contracts/services/propostas.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PropostasService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropostasService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let PropostasService = PropostasService_1 = class PropostasService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(PropostasService_1.name);
        this._propostasGeradas = new Set();
    }
    async obterPropostaPorProduto(empresaId, nomeProduto, competencia) {
        try {
            this.logger.log(`Obtendo proposta - Empresa: ${empresaId}, Produto: ${nomeProduto}, Competência: ${competencia}`);
            const propostaPorConfig = await this.buscarPropostaNaConfiguracao(empresaId, nomeProduto, competencia);
            if (propostaPorConfig) {
                return propostaPorConfig;
            }
            const propostaPorAPI = await this.buscarPropostaNaAPI(empresaId, nomeProduto, competencia);
            if (propostaPorAPI) {
                return propostaPorAPI;
            }
            const propostaPorMapeamento = this.obterPropostaPorMapeamentoEstatico(empresaId, nomeProduto);
            if (propostaPorMapeamento) {
                return propostaPorMapeamento;
            }
            this.logger.warn(`Nenhuma proposta encontrada para: Empresa ${empresaId}, Produto ${nomeProduto}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao obter proposta: ${error.message}`);
            return null;
        }
    }
    async obterPrecoProdutoNaProposta(numeroProposta, nomeProduto, quantidade) {
        try {
            this.logger.log(`Calculando preço - Proposta: ${numeroProposta}, Produto: ${nomeProduto}, Qty: ${quantidade}`);
            const precoPorAPI = await this.buscarPrecoViaAPI(numeroProposta, nomeProduto, quantidade);
            if (precoPorAPI !== null)
                return precoPorAPI;
            const precoPorTabela = await this.buscarPrecoViaTabela(numeroProposta, nomeProduto, quantidade);
            if (precoPorTabela !== null)
                return precoPorTabela;
            const precoPorRegras = await this.calcularPrecoViaRegras(numeroProposta, nomeProduto, quantidade);
            if (precoPorRegras !== null)
                return precoPorRegras;
            const precoUltimoConhecido = await this.buscarUltimoPrecoConhecido(numeroProposta, nomeProduto);
            if (precoUltimoConhecido !== null) {
                this.logger.warn(`⚠️ Usando último preço conhecido: R$ ${precoUltimoConhecido} (${nomeProduto})`);
                return precoUltimoConhecido;
            }
            this.logger.warn(`❌ Não foi possível calcular preço para: ${nomeProduto} na proposta ${numeroProposta}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao calcular preço do produto: ${error.message}`);
            return null;
        }
    }
    async buscarPrecoViaAPI(proposta, produto, quantidade) {
        try {
            const inanbetecUrl = this.configService.get('INANBETEC_API_URL');
            if (!inanbetecUrl)
                return null;
            const endpoint = `${inanbetecUrl}/pricing/proposta/${proposta}/produto/${produto}`;
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, {
                    params: { quantidade },
                    timeout: 1500
                }));
                const preco = response.data?.preco || response.data?.valor || response.data?.valorTotal;
                if (typeof preco === 'number' && preco >= 0) {
                    this.logger.log(`✅ Preço via API: R$ ${preco} (${produto})`);
                    return preco;
                }
            }
            catch (error) {
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async buscarPrecoViaTabela(proposta, produto, quantidade) {
        try {
            const inanbetecUrl = this.configService.get('INANBETEC_API_URL');
            if (!inanbetecUrl)
                return null;
            const endpoint = `${inanbetecUrl}/propostas/${proposta}/tabela-precos`;
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, { timeout: 1500 }));
                const tabela = response.data?.tabelaPrecos || response.data?.produtos || response.data || {};
                if (typeof tabela === 'object' && tabela[produto.toLowerCase()]) {
                    const precoProduto = tabela[produto.toLowerCase()];
                    let preco = typeof precoProduto === 'number' ? precoProduto : precoProduto.valor || precoProduto.preco;
                    if (typeof preco === 'number' && preco >= 0) {
                        this.logger.log(`✅ Preço via tabela: R$ ${preco} (${produto})`);
                        return preco;
                    }
                }
            }
            catch (error) {
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async calcularPrecoViaRegras(proposta, produto, quantidade) {
        try {
            switch (produto.toLowerCase()) {
                case 'pixpay':
                    if (quantidade > 0) {
                        const preco = quantidade * 22.0;
                        this.logger.log(`✅ Preço calculado (PixPay): R$ ${preco} (${quantidade} × R$ 22)`);
                        return preco;
                    }
                    break;
                case 'webcheckout':
                case '@webcheckout':
                    const taxaBase = quantidade > 1000 ? 2000 : 1500;
                    this.logger.log(`✅ Preço calculado (WebCheckout): R$ ${taxaBase}`);
                    return taxaBase;
                case 'cobranca':
                case 'cobrança':
                    if (quantidade > 0) {
                        const preco = Math.round(quantidade * 0.06 * 100) / 100;
                        this.logger.log(`✅ Preço calculado (Cobrança): R$ ${preco} (${quantidade} × R$ 0.06)`);
                        return preco;
                    }
                    break;
                case 'bolepix':
                    if (quantidade > 0) {
                        const preco = Math.round(quantidade * 0.06 * 100) / 100;
                        this.logger.log(`✅ Preço calculado (BolePix): R$ ${preco} (${quantidade} × R$ 0.06)`);
                        return preco;
                    }
                    break;
                case 'pagamentos':
                    const preco = quantidade > 10000 ? quantidade * 0.01 : 0;
                    this.logger.log(`✅ Preço calculado (Pagamentos): R$ ${preco}`);
                    return preco;
                default:
                    return 0;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async buscarUltimoPrecoConhecido(proposta, produto) {
        try {
            const inanbetecUrl = this.configService.get('INANBETEC_API_URL');
            if (!inanbetecUrl)
                return null;
            const endpoints = [
                `${inanbetecUrl}/historico-precos/${proposta}/${produto}`,
                `${inanbetecUrl}/contratos/ultimo-preco/${produto}`
            ];
            for (const endpoint of endpoints) {
                try {
                    this.logger.debug(`📚 Buscando último preço: ${endpoint}`);
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, { timeout: 2000 }));
                    const ultimoPreco = response.data?.ultimoPreco || response.data?.valor || response.data?.preco;
                    if (typeof ultimoPreco === 'number' && ultimoPreco >= 0) {
                        this.logger.log(`✅ Último preço conhecido: R$ ${ultimoPreco} (${produto})`);
                        return ultimoPreco;
                    }
                }
                catch (error) {
                    this.logger.debug(`Último preço endpoint falhou: ${error.message}`);
                    continue;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.debug(`Busca último preço falhou: ${error.message}`);
            return null;
        }
    }
    async buscarPropostaNaConfiguracao(empresaId, nomeProduto, competencia) {
        try {
            const inanbetecUrl = this.configService.get('INANBETEC_API_URL');
            if (!inanbetecUrl) {
                return null;
            }
            const endpointPrincipal = `${inanbetecUrl}/propostas/empresa/${empresaId}/produto/${nomeProduto}`;
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpointPrincipal, {
                    params: { competencia },
                    timeout: 2000
                }));
                const proposta = response.data?.numeroProposta || response.data?.numero;
                if (proposta) {
                    this.logger.log(`✅ Proposta encontrada via API: ${proposta} (${nomeProduto})`);
                    return proposta;
                }
            }
            catch (error) {
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async buscarPropostaEspecifica(baseUrl, empresaId, produto, competencia) {
        try {
            const endpoints = [
                `${baseUrl}/propostas/empresa/${empresaId}/produto/${produto}`,
                `${baseUrl}/comercial/propostas/${empresaId}/${produto}`,
                `${baseUrl}/contratos/proposta-produto`
            ];
            for (const endpoint of endpoints) {
                try {
                    this.logger.debug(`🎯 Buscando proposta específica: ${endpoint}`);
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, {
                        params: { competencia, status: 'ativo' },
                        timeout: 3000
                    }));
                    const proposta = response.data?.numeroProposta || response.data?.numero || response.data?.proposta;
                    if (proposta) {
                        this.logger.log(`✅ Proposta específica encontrada: ${proposta} (${produto})`);
                        return proposta;
                    }
                }
                catch (error) {
                    this.logger.debug(`Endpoint específico falhou: ${error.message}`);
                    continue;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.debug(`Busca específica falhou: ${error.message}`);
            return null;
        }
    }
    async buscarPropostaViaContratos(baseUrl, empresaId, produto) {
        try {
            const endpoints = [
                `${baseUrl}/contratos/ativos/${empresaId}`,
                `${baseUrl}/empresas/${empresaId}/contratos/ativos`
            ];
            for (const endpoint of endpoints) {
                try {
                    this.logger.debug(`📄 Buscando via contratos: ${endpoint}`);
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, {
                        params: { produto, status: 'ativo' },
                        timeout: 4000
                    }));
                    const contratos = response.data?.contratos || response.data || [];
                    if (Array.isArray(contratos)) {
                        const contratoComProduto = contratos.find(c => c.produtos && c.produtos.includes(produto.toLowerCase()));
                        if (contratoComProduto && contratoComProduto.numeroProposta) {
                            this.logger.log(`✅ Proposta via contrato: ${contratoComProduto.numeroProposta} (${produto})`);
                            return contratoComProduto.numeroProposta;
                        }
                    }
                }
                catch (error) {
                    this.logger.debug(`Endpoint contrato falhou: ${error.message}`);
                    continue;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.debug(`Busca via contratos falhou: ${error.message}`);
            return null;
        }
    }
    async buscarPropostaHistorica(baseUrl, empresaId, produto) {
        try {
            const endpoints = [
                `${baseUrl}/propostas/historico/${empresaId}`,
                `${baseUrl}/comercial/historico-propostas`
            ];
            for (const endpoint of endpoints) {
                try {
                    this.logger.debug(`📚 Buscando histórico: ${endpoint}`);
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, {
                        params: { produto, empresaId, limit: 1 },
                        timeout: 3000
                    }));
                    const historico = response.data?.propostas || response.data || [];
                    if (Array.isArray(historico) && historico.length > 0) {
                        const ultimaProposta = historico[0];
                        const numero = ultimaProposta.numero || ultimaProposta.numeroProposta;
                        if (numero) {
                            this.logger.log(`✅ Proposta histórica: ${numero} (${produto})`);
                            return numero;
                        }
                    }
                }
                catch (error) {
                    this.logger.debug(`Endpoint histórico falhou: ${error.message}`);
                    continue;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.debug(`Busca histórica falhou: ${error.message}`);
            return null;
        }
    }
    async buscarPropostaNaAPI(empresaId, nomeProduto, competencia) {
        try {
            const inanbetecUrl = this.configService.get('INANBETEC_API_URL');
            if (!inanbetecUrl)
                return null;
            const endpoint = `${inanbetecUrl}/propostas`;
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, {
                    params: {
                        empresa: empresaId,
                        produto: nomeProduto,
                        competencia,
                        status: 'ativo'
                    },
                    timeout: 2000
                }));
                const propostas = response.data?.propostas || response.data || [];
                if (Array.isArray(propostas) && propostas.length > 0) {
                    const proposta = propostas[0];
                    const numeroProposta = proposta.numero || proposta.numeroProposta || proposta.id;
                    if (numeroProposta) {
                        this.logger.log(`✅ Proposta encontrada via API geral: ${numeroProposta}`);
                        return numeroProposta;
                    }
                }
            }
            catch (error) {
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    obterPropostaPorMapeamentoEstatico(empresaId, nomeProduto) {
        const ano = new Date().getFullYear();
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        const sufixoEmpresa = String(empresaId).padStart(3, '0');
        const propostaPadrao = `${ano}${mes}00${sufixoEmpresa}`;
        if (!this._propostasGeradas)
            this._propostasGeradas = new Set();
        if (!this._propostasGeradas.has(empresaId)) {
            this.logger.log(`🔄 Proposta dinâmica gerada: ${propostaPadrao} (Empresa ${empresaId})`);
            this._propostasGeradas.add(empresaId);
        }
        return propostaPadrao;
    }
    async listarPropostasEmpresa(empresaId, competencia) {
        try {
            const produtos = this.obterProdutosEmpresa(empresaId);
            const propostas = [];
            for (const produto of produtos) {
                const numeroProposta = this.obterPropostaPorMapeamentoEstatico(empresaId, produto);
                if (numeroProposta) {
                    propostas.push({
                        numero: numeroProposta,
                        empresaId,
                        produto,
                        competencia: competencia || new Date().toISOString().slice(0, 7),
                        vigenciaInicial: '01/01/2025',
                        vigenciaFinal: '31/12/2025'
                    });
                }
            }
            return propostas;
        }
        catch (error) {
            this.logger.error(`Erro ao listar propostas da empresa ${empresaId}: ${error.message}`);
            return [];
        }
    }
    async obterProdutosComPropostas(empresaId) {
        try {
            this.logger.log(`Obtendo produtos com propostas para empresa ${empresaId}`);
            const produtosDinamicos = await this.descobrirProdutosViaVolumetria(empresaId);
            if (produtosDinamicos.length > 0) {
                this.logger.log(`✅ Encontrados ${produtosDinamicos.length} produtos via API dinâmica`);
                return produtosDinamicos;
            }
            this.logger.debug('🔄 Usando mapeamento estático como fallback');
            return this.obterProdutosEmpresa(empresaId);
        }
        catch (error) {
            this.logger.error(`Erro ao obter produtos da empresa ${empresaId}: ${error.message}`);
            return this.obterProdutosEmpresa(empresaId);
        }
    }
    async consultarProdutosViaAPI(baseUrl, empresaId) {
        const endpoints = [
            `${baseUrl}/empresas/${empresaId}/produtos`,
            `${baseUrl}/propostas/empresa/${empresaId}/produtos`,
            `${baseUrl}/comercial/empresa/${empresaId}/produtos`
        ];
        for (const endpoint of endpoints) {
            try {
                this.logger.debug(`🔍 Consultando: ${endpoint}`);
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(endpoint, {
                    params: { status: 'ativo', temProposta: true },
                    timeout: 3000
                }));
                const produtos = response.data?.produtos || response.data || [];
                if (Array.isArray(produtos) && produtos.length > 0) {
                    const nomesProdutos = produtos.map(p => p.nome || p.produto || p.codigo || p.id).filter(Boolean);
                    if (nomesProdutos.length > 0) {
                        this.logger.log(`✅ API: ${nomesProdutos.length} produtos encontrados: ${nomesProdutos.join(', ')}`);
                        return nomesProdutos;
                    }
                }
            }
            catch (error) {
                this.logger.debug(`Endpoint ${endpoint} falhou: ${error.message}`);
                continue;
            }
        }
        return [];
    }
    async descobrirProdutosViaVolumetria(empresaId) {
        try {
            const baseUrl = this.configService.get('INANBETEC_API_URL');
            const urlsVolumetria = [
                `${baseUrl}/empresas/${empresaId}/volumetria`,
                `${baseUrl}/clientes/volumetria/${empresaId}`
            ];
            for (const url of urlsVolumetria) {
                try {
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { timeout: 1500 }));
                    if (response.data) {
                        const produtos = this.extrairProdutosDaVolumetria(response.data);
                        if (produtos.length > 0) {
                            this.logger.log(`✅ Volumetria: ${produtos.length} produtos encontrados`);
                            return produtos;
                        }
                    }
                }
                catch (error) {
                    continue;
                }
            }
            return [];
        }
        catch (error) {
            return [];
        }
    }
    extrairProdutosDaVolumetria(dadosVolumetria) {
        try {
            const produtos = new Set();
            const datasets = [
                dadosVolumetria,
                dadosVolumetria?.produtos,
                dadosVolumetria?.volumetria,
                dadosVolumetria?.data,
                dadosVolumetria?.items
            ].filter(Boolean);
            for (const dataset of datasets) {
                if (Array.isArray(dataset)) {
                    dataset.forEach(item => {
                        const nome = item?.produto || item?.nome || item?.name || item?.tipo;
                        if (nome && typeof nome === 'string') {
                            produtos.add(nome.toLowerCase());
                        }
                    });
                }
                else if (typeof dataset === 'object') {
                    Object.keys(dataset).forEach(key => {
                        if (typeof dataset[key] === 'number' && dataset[key] > 0) {
                            produtos.add(key.toLowerCase());
                        }
                    });
                }
            }
            return Array.from(produtos);
        }
        catch (error) {
            return [];
        }
    }
    async buscarProdutosDinamicamente(empresaId, dataInicio, dataFim) {
        try {
            const baseUrl = this.configService.get('INANBETEC_API_URL');
            const urlsVolumetria = [
                `${baseUrl}/empresas/${empresaId}/volumetria${dataInicio ? `?inicio=${dataInicio}&fim=${dataFim}` : ''}`,
                `${baseUrl}/clientes/volumetria/${empresaId}${dataInicio ? `?periodo=${dataInicio}-${dataFim}` : ''}`
            ];
            for (const url of urlsVolumetria) {
                try {
                    const response = await this.httpService.axiosRef.get(url, { timeout: 1500 });
                    if (response.data) {
                        const produtos = this.extrairProdutosDaVolumetriaCompleta(response.data);
                        if (produtos.length > 0) {
                            this.logger.log(`✅ Descobertos ${produtos.length} produtos via volumetria`);
                            return produtos;
                        }
                    }
                }
                catch (error) {
                    continue;
                }
            }
            this.logger.log(`📦 Usando produtos padrão (volumetria não disponível)`);
            return ['PixPay', 'WebCheckout', 'Cobranca', 'BolePix', 'Pagamentos'];
        }
        catch (error) {
            this.logger.error(`Erro ao buscar produtos dinamicamente: ${error.message}`);
            return [];
        }
    }
    extrairProdutosDaVolumetriaCompleta(dadosVolumetria) {
        try {
            const produtos = new Set();
            const datasets = [
                dadosVolumetria,
                dadosVolumetria?.produtos,
                dadosVolumetria?.volumetria,
                dadosVolumetria?.data
            ].filter(Boolean);
            for (const dataset of datasets) {
                if (Array.isArray(dataset)) {
                    dataset.forEach(item => {
                        const nome = item?.produto || item?.nome || item?.name;
                        if (nome && typeof nome === 'string') {
                            produtos.add(nome);
                        }
                    });
                }
                else if (typeof dataset === 'object') {
                    Object.keys(dataset).forEach(key => {
                        const valor = dataset[key];
                        if (typeof valor === 'number' && valor > 0) {
                            produtos.add(key);
                        }
                        else if (typeof valor === 'object' && valor !== null) {
                            produtos.add(key);
                        }
                    });
                }
            }
            return Array.from(produtos);
        }
        catch (error) {
            return [];
        }
    }
    obterProdutosEmpresa(empresaId) {
        this.logger.warn(`⚠️ Usando fallback de produtos básicos para empresa ${empresaId}`);
        const produtosBasicos = [
            'cobranca', 'bolepix', 'pixpay', 'pagamentos', 'webcheckout'
        ];
        this.logger.debug(`🔄 Produtos básicos de fallback: ${produtosBasicos.join(', ')}`);
        return produtosBasicos;
    }
    async validarProposta(numeroProposta, empresaId) {
        try {
            const produtos = this.obterProdutosEmpresa(empresaId);
            for (const produto of produtos) {
                const proposta = this.obterPropostaPorMapeamentoEstatico(empresaId, produto);
                if (proposta === numeroProposta) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Erro ao validar proposta ${numeroProposta}: ${error.message}`);
            return false;
        }
    }
    getConfiguracaoVigencia() {
        return {
            inicial: this.configService.get('PROPOSTA_VIGENCIA_INICIAL', '01/01/2025'),
            final: this.configService.get('PROPOSTA_VIGENCIA_FINAL', '31/12/2025')
        };
    }
};
exports.PropostasService = PropostasService;
exports.PropostasService = PropostasService = PropostasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _b : Object])
], PropostasService);


/***/ }),

/***/ "./src/contracts/services/volumetria.service.ts":
/*!******************************************************!*\
  !*** ./src/contracts/services/volumetria.service.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VolumetriaService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VolumetriaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let VolumetriaService = VolumetriaService_1 = class VolumetriaService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(VolumetriaService_1.name);
        this.baseURL = this.configService.get('INANBETEC_VOLUMETRIA_URL', 'https://edi-financeiro.inanbetec.com.br/v1/volumetria');
    }
    async consultarVolumetria(params) {
        try {
            this.logger.log(`Iniciando consulta de volumetria com params: ${JSON.stringify(params)}`);
            const url = `${this.baseURL}/consultar`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { params }));
            this.logger.log(`Resposta da volumetria recebida: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao consultar volumetria: ${error.message}`);
            throw error;
        }
    }
    async buscarServicosPorEmpresa(empresaId) {
        try {
            this.logger.log(`Buscando serviços para empresa: ${empresaId}`);
            const url = `${this.baseURL}/servicos/${empresaId}`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            this.logger.log(`Serviços recebidos: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar serviços: ${error.message}`);
            return [];
        }
    }
    async buscarRelatorios(params) {
        try {
            this.logger.log(`Buscando relatórios com params: ${JSON.stringify(params)}`);
            const url = `${this.baseURL}/relatorios`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { params }));
            this.logger.log(`Relatórios recebidos: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar relatórios: ${error.message}`);
            return [];
        }
    }
    agruparRelatoriosPorProduto(relatorios) {
        this.logger.log('Agrupando relatórios por produto');
        const grupos = {
            cobranca: [],
            pixpay: [],
            outros: []
        };
        relatorios.forEach(relatorio => {
            if (relatorio.clearance_type === 'API' || relatorio.clearance_type === 'CNAB') {
                if (relatorio.bank_number === '1' || relatorio.bank_number === '237') {
                    grupos.cobranca.push(relatorio);
                }
                else if (relatorio.bank_number === '341' || relatorio.bank_number === '756') {
                    grupos.pixpay.push(relatorio);
                }
                else {
                    grupos.outros.push(relatorio);
                }
            }
        });
        this.logger.log(`Grupos criados: ${JSON.stringify(grupos)}`);
        return grupos;
    }
    mapearParaContratoOmie(dadosVolumetria, dadosEmpresa = {}) {
        this.logger.log('Mapeando dados da volumetria para contrato Omie');
        this.logger.log(`Dados volumetria: ${JSON.stringify(dadosVolumetria)}`);
        this.logger.log(`Dados empresa: ${JSON.stringify(dadosEmpresa)}`);
        const contrato = {
            cCodIntCtr: `VOL_${dadosVolumetria.idEmpresa}_${Date.now()}`,
            cNumCtr: '',
            nCodCli: dadosVolumetria.idEmpresa || 0,
            cCodSit: '10',
            dVigInicial: this.formatarData(new Date()),
            dVigFinal: this.formatarData(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
            nDiaFat: dadosEmpresa.diaFaturamento || 30,
            nValTotMes: this.calcularValorTotalMensal(dadosVolumetria),
            cTipoFat: '01',
            itensContrato: this.criarItensContrato(dadosVolumetria),
            infAdic: {
                cCidPrestServ: dadosEmpresa.cidade || '',
                cCodCateg: dadosEmpresa.categoria || '',
                nCodCC: dadosEmpresa.centroCusto || 0,
                nCodProj: dadosEmpresa.projeto || 0,
                nCodVend: dadosEmpresa.vendedor || 0
            },
            vencTextos: {
                cTpVenc: '001',
                nDias: dadosEmpresa.diasVencimento || 30,
                cProxMes: 'N',
                cAdContrato: 'N'
            }
        };
        return contrato;
    }
    mapearRelatorioPorProduto(relatorios, tipoProduto, dadosEmpresa = {}) {
        this.logger.log(`Mapeando relatórios do produto: ${tipoProduto}`);
        if (!relatorios || relatorios.length === 0) {
            return null;
        }
        const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
        const empresaId = relatorios[0].company_id;
        const contrato = {
            cCodIntCtr: `${tipoProduto.toUpperCase()}_${empresaId}_${Date.now()}`,
            cNumCtr: '',
            nCodCli: empresaId,
            cCodSit: '10',
            dVigInicial: this.formatarData(new Date()),
            dVigFinal: this.formatarData(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
            nDiaFat: dadosEmpresa.diaFaturamento || 30,
            nValTotMes: this.calcularValorPorProduto(relatorios, tipoProduto),
            cTipoFat: '01',
            itensContrato: this.criarItensRelatorio(relatorios, tipoProduto, empresaId),
            infAdic: {
                cCidPrestServ: dadosEmpresa.cidade || '',
                cCodCateg: dadosEmpresa.categoria || tipoProduto.toUpperCase(),
                nCodCC: dadosEmpresa.centroCusto || 0,
                nCodProj: dadosEmpresa.projeto || 0,
                nCodVend: dadosEmpresa.vendedor || 0
            },
            vencTextos: {
                cTpVenc: '001',
                nDias: dadosEmpresa.diasVencimento || 30,
                cProxMes: 'N',
                cAdContrato: 'N'
            }
        };
        this.logger.log(`Contrato ${tipoProduto} mapeado: ${JSON.stringify(contrato)}`);
        return contrato;
    }
    criarItensContrato(dadosVolumetria) {
        const itens = [];
        this.logger.log('Criando itens do contrato a partir da volumetria');
        if (dadosVolumetria.cobranca && dadosVolumetria.cobranca.qtdeTitulos > 0) {
            const itemCobranca = {
                codIntItem: `COBRANCA_${dadosVolumetria.idEmpresa}`,
                codServico: 1001,
                natOperacao: '01',
                codServMunic: '1401',
                codLC116: '1401',
                quant: dadosVolumetria.cobranca.qtdeTitulos,
                valorUnit: this.calcularValorUnitario(dadosVolumetria.cobranca),
                valorTotal: dadosVolumetria.cobranca.valorTotal || 0,
                descrCompleta: `Serviço de cobrança - ${dadosVolumetria.cobranca.qtdeTitulos} títulos`,
                aliqISS: 5.0
            };
            this.logger.log(`Item de cobrança criado: ${JSON.stringify(itemCobranca)}`);
            itens.push(itemCobranca);
        }
        if (dadosVolumetria.pixpay && dadosVolumetria.pixpay.qtdeMotoristas > 0) {
            const itemPixPay = {
                codIntItem: `PIXPAY_${dadosVolumetria.idEmpresa}`,
                codServico: 1002,
                natOperacao: '01',
                codServMunic: '1402',
                codLC116: '1402',
                quant: dadosVolumetria.pixpay.qtdeMotoristas,
                valorUnit: this.calcularValorUnitarioPixPay(dadosVolumetria.pixpay),
                valorTotal: dadosVolumetria.pixpay.valorTotal || 0,
                descrCompleta: `Serviço PixPay - ${dadosVolumetria.pixpay.qtdeMotoristas} motoristas`,
                aliqISS: 5.0
            };
            this.logger.log(`Item PixPay criado: ${JSON.stringify(itemPixPay)}`);
            itens.push(itemPixPay);
        }
        return itens;
    }
    criarItensRelatorio(relatorios, tipoProduto, empresaId) {
        const itens = [];
        const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
        const valorTotal = this.calcularValorPorProduto(relatorios, tipoProduto);
        if (totalRecords > 0) {
            const codigoServico = this.obterCodigoServico(tipoProduto);
            const item = {
                codIntItem: `${tipoProduto.toUpperCase()}_${empresaId}`,
                codServico: codigoServico.codigo,
                natOperacao: '01',
                codServMunic: codigoServico.municipal,
                codLC116: codigoServico.lc116,
                quant: totalRecords,
                valorUnit: totalRecords > 0 ? valorTotal / totalRecords : 0,
                valorTotal: valorTotal,
                descrCompleta: `${codigoServico.descricao} - ${totalRecords} registros`,
                aliqISS: 5.0
            };
            this.logger.log(`Item ${tipoProduto} criado: ${JSON.stringify(item)}`);
            itens.push(item);
        }
        return itens;
    }
    calcularValorTotalMensal(dadosVolumetria) {
        let valorTotal = 0;
        if (dadosVolumetria.cobranca && dadosVolumetria.cobranca.valorTotal) {
            valorTotal += dadosVolumetria.cobranca.valorTotal;
        }
        if (dadosVolumetria.pixpay && dadosVolumetria.pixpay.valorTotal) {
            valorTotal += dadosVolumetria.pixpay.valorTotal;
        }
        return valorTotal;
    }
    calcularValorUnitario(cobranca) {
        if (!cobranca.qtdeTitulos || cobranca.qtdeTitulos === 0)
            return 0;
        return (cobranca.valorTotal || 0) / cobranca.qtdeTitulos;
    }
    calcularValorUnitarioPixPay(pixpay) {
        if (!pixpay.qtdeMotoristas || pixpay.qtdeMotoristas === 0)
            return 0;
        return (pixpay.valorTotal || 0) / pixpay.qtdeMotoristas;
    }
    calcularValorPorProduto(relatorios, tipoProduto) {
        const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
        const tabelaPrecos = {
            cobranca: 0.50,
            pixpay: 2.00,
            outros: 1.00
        };
        return totalRecords * (tabelaPrecos[tipoProduto] || 1.00);
    }
    obterCodigoServico(tipoProduto) {
        const codigos = {
            cobranca: {
                codigo: 1001,
                municipal: '1401',
                lc116: '1401',
                descricao: 'Serviço de cobrança bancária'
            },
            pixpay: {
                codigo: 1002,
                municipal: '1402',
                lc116: '1402',
                descricao: 'Serviço de pagamentos PIX'
            },
            outros: {
                codigo: 1003,
                municipal: '1403',
                lc116: '1403',
                descricao: 'Outros serviços financeiros'
            }
        };
        return codigos[tipoProduto] || codigos.outros;
    }
    formatarData(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
};
exports.VolumetriaService = VolumetriaService;
exports.VolumetriaService = VolumetriaService = VolumetriaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], VolumetriaService);


/***/ }),

/***/ "./src/shared/interceptors/logging.interceptor.ts":
/*!********************************************************!*\
  !*** ./src/shared/interceptors/logging.interceptor.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        const now = Date.now();
        this.logger.log(`[${method}] ${url} - START`);
        return next.handle().pipe((0, operators_1.tap)(() => {
            const responseTime = Date.now() - now;
            this.logger.log(`[${method}] ${url} - COMPLETED in ${responseTime}ms`);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),

/***/ "./src/shared/interceptors/response.interceptor.ts":
/*!*********************************************************!*\
  !*** ./src/shared/interceptors/response.interceptor.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        return next.handle().pipe((0, operators_1.map)((data) => ({
            success: true,
            data,
            timestamp: new Date().toISOString(),
            path: req.url,
        })));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);


/***/ }),

/***/ "./src/shared/shared.module.ts":
/*!*************************************!*\
  !*** ./src/shared/shared.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const logging_interceptor_1 = __webpack_require__(/*! ./interceptors/logging.interceptor */ "./src/shared/interceptors/logging.interceptor.ts");
const response_interceptor_1 = __webpack_require__(/*! ./interceptors/response.interceptor */ "./src/shared/interceptors/response.interceptor.ts");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        providers: [
            logging_interceptor_1.LoggingInterceptor,
            response_interceptor_1.ResponseInterceptor,
        ],
        exports: [
            axios_1.HttpModule,
            logging_interceptor_1.LoggingInterceptor,
            response_interceptor_1.ResponseInterceptor,
        ],
    })
], SharedModule);


/***/ }),

/***/ "@nestjs/axios":
/*!********************************!*\
  !*** external "@nestjs/axios" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/schedule":
/*!***********************************!*\
  !*** external "@nestjs/schedule" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const logging_interceptor_1 = __webpack_require__(/*! ./shared/interceptors/logging.interceptor */ "./src/shared/interceptors/logging.interceptor.ts");
const response_interceptor_1 = __webpack_require__(/*! ./shared/interceptors/response.interceptor */ "./src/shared/interceptors/response.interceptor.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new response_interceptor_1.ResponseInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Inanbetec-Omie Integration API')
        .setDescription('API para integração entre Inanbetec e Omie - Sistema de contratos e sincronização de clientes')
        .setVersion('1.0')
        .addTag('contratos', 'Operações relacionadas a contratos')
        .addTag('clientes', 'Operações de sincronização de clientes')
        .addTag('volumetria', 'Operações de volumetria')
        .addTag('relatorios', 'Operações de relatórios')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
    console.log(`📚 Documentação Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();

})();

/******/ })()
;
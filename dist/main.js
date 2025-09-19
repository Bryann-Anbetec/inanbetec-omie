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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const client_sync_service_1 = __webpack_require__(/*! ./services/client-sync.service */ "./src/clients/services/client-sync.service.ts");
const inanbetec_service_1 = __webpack_require__(/*! ./services/inanbetec.service */ "./src/clients/services/inanbetec.service.ts");
const client_dto_1 = __webpack_require__(/*! ./dto/client.dto */ "./src/clients/dto/client.dto.ts");
let ClientsController = ClientsController_1 = class ClientsController {
    constructor(clientSyncService, inanbetecService) {
        this.clientSyncService = clientSyncService;
        this.inanbetecService = inanbetecService;
        this.logger = new common_1.Logger(ClientsController_1.name);
    }
    async sincronizarCliente(dto) {
        this.logger.log(`Sincronizando cliente CNPJ: ${dto.documento}`);
        return this.clientSyncService.sincronizarClientePorCNPJ(dto.documento, dto.origem);
    }
    async webhookInanbetec(dto) {
        this.logger.log(`Webhook Inanbetec recebido - Evento: ${dto.evento}`);
        return this.clientSyncService.processarWebhookCliente(dto.evento, dto.cliente, 'inanbetec');
    }
    async webhookOmie(dto) {
        this.logger.log(`Webhook Omie recebido - Evento: ${dto.evento}`);
        return this.clientSyncService.processarWebhookCliente(dto.evento, dto.cliente, 'omie');
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
    async sincronizacaoManual() {
        this.logger.log('Executando sincronização manual de clientes');
        return this.clientSyncService.sincronizacaoAutomatica();
    }
    async statusSincronizacao() {
        return {
            sincronizacaoAutomatica: 'ativa',
            proximaExecucao: 'a cada hora',
            ultimaExecucao: new Date().toISOString(),
            status: 'funcionando',
            webhooks: {
                inanbetec: '/clientes/webhook/inanbetec',
                omie: '/clientes/webhook/omie'
            }
        };
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)('sincronizar'),
    (0, swagger_1.ApiOperation)({
        summary: 'Sincronizar cliente por CNPJ',
        description: 'Sincroniza um cliente entre Inanbetec e Omie baseado no CNPJ. Se o cliente existir apenas em uma plataforma, será criado na outra.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente sincronizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erro na sincronização' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof client_dto_1.SyncClientDto !== "undefined" && client_dto_1.SyncClientDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "sincronizarCliente", null);
__decorate([
    (0, common_1.Post)('webhook/inanbetec'),
    (0, swagger_1.ApiOperation)({
        summary: 'Webhook para eventos de cliente da Inanbetec',
        description: 'Recebe webhooks da Inanbetec quando um cliente é criado, atualizado ou excluído'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof client_dto_1.ClientWebhookDto !== "undefined" && client_dto_1.ClientWebhookDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "webhookInanbetec", null);
__decorate([
    (0, common_1.Post)('webhook/omie'),
    (0, swagger_1.ApiOperation)({
        summary: 'Webhook para eventos de cliente do Omie',
        description: 'Recebe webhooks do Omie quando um cliente é criado, atualizado ou excluído'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof client_dto_1.ClientWebhookDto !== "undefined" && client_dto_1.ClientWebhookDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "webhookOmie", null);
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
    (0, common_1.Post)('sincronizacao-manual'),
    (0, swagger_1.ApiOperation)({
        summary: 'Executar sincronização manual',
        description: 'Executa uma sincronização manual de todos os clientes modificados recentemente'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sincronização executada com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "sincronizacaoManual", null);
__decorate([
    (0, common_1.Get)('status-sincronizacao'),
    (0, swagger_1.ApiOperation)({
        summary: 'Status da sincronização de clientes',
        description: 'Retorna informações sobre o status da sincronização automática'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status da sincronização' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "statusSincronizacao", null);
exports.ClientsController = ClientsController = ClientsController_1 = __decorate([
    (0, swagger_1.ApiTags)('clientes'),
    (0, common_1.Controller)('clientes'),
    __metadata("design:paramtypes", [typeof (_a = typeof client_sync_service_1.ClientSyncService !== "undefined" && client_sync_service_1.ClientSyncService) === "function" ? _a : Object, typeof (_b = typeof inanbetec_service_1.InanbetecService !== "undefined" && inanbetec_service_1.InanbetecService) === "function" ? _b : Object])
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
const clients_controller_1 = __webpack_require__(/*! ./clients.controller */ "./src/clients/clients.controller.ts");
const client_sync_service_1 = __webpack_require__(/*! ./services/client-sync.service */ "./src/clients/services/client-sync.service.ts");
const inanbetec_service_1 = __webpack_require__(/*! ./services/inanbetec.service */ "./src/clients/services/inanbetec.service.ts");
const contracts_module_1 = __webpack_require__(/*! ../contracts/contracts.module */ "./src/contracts/contracts.module.ts");
let ClientsModule = class ClientsModule {
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            contracts_module_1.ContractsModule,
        ],
        controllers: [clients_controller_1.ClientsController],
        providers: [
            client_sync_service_1.ClientSyncService,
            inanbetec_service_1.InanbetecService,
        ],
        exports: [
            client_sync_service_1.ClientSyncService,
            inanbetec_service_1.InanbetecService,
        ],
    })
], ClientsModule);


/***/ }),

/***/ "./src/clients/dto/client.dto.ts":
/*!***************************************!*\
  !*** ./src/clients/dto/client.dto.ts ***!
  \***************************************/
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientWebhookDto = exports.SyncClientDto = exports.CreateClientDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class CreateClientDto {
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CNPJ/CPF do cliente',
        example: '12.345.678/0001-90'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(11, 18),
    __metadata("design:type", String)
], CreateClientDto.prototype, "documento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome/Razão social do cliente',
        example: 'Empresa Exemplo Ltda'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome fantasia',
        example: 'Empresa Exemplo'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "nomeFantasia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email do cliente',
        example: 'contato@empresa.com'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Telefone do cliente',
        example: '(11) 99999-9999'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "telefone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Endereço completo'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateClientDto.prototype, "endereco", void 0);
class SyncClientDto {
}
exports.SyncClientDto = SyncClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CNPJ/CPF do cliente para sincronização',
        example: '12.345.678/0001-90'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncClientDto.prototype, "documento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Plataforma de origem (inanbetec ou omie)',
        example: 'inanbetec'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncClientDto.prototype, "origem", void 0);
class ClientWebhookDto {
}
exports.ClientWebhookDto = ClientWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de evento (created, updated, deleted)',
        example: 'created'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClientWebhookDto.prototype, "evento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dados do cliente'
    }),
    __metadata("design:type", Object)
], ClientWebhookDto.prototype, "cliente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Plataforma de origem',
        example: 'inanbetec'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClientWebhookDto.prototype, "origem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp do evento'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClientWebhookDto.prototype, "timestamp", void 0);


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
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const inanbetec_service_1 = __webpack_require__(/*! ./inanbetec.service */ "./src/clients/services/inanbetec.service.ts");
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
                    await this.inanbetecService.atualizarCliente(dadosInanbetec.id, dadosOmie);
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
    async sincronizacaoAutomatica() {
        try {
            this.logger.log('Iniciando sincronização automática de clientes');
            const dataLimite = new Date();
            dataLimite.setHours(dataLimite.getHours() - 1);
            const clientesInanbetec = await this.inanbetecService.listarClientes({
                modificado_apos: dataLimite.toISOString()
            });
            const clientesOmie = await this.omieService.listarClientes({
                pagina: 1,
                registros_por_pagina: 100,
                apenas_importado_api: 'N'
            });
            const resultados = [];
            for (const cliente of clientesInanbetec || []) {
                try {
                    const resultado = await this.sincronizarClientePorCNPJ(cliente.cnpj_cpf, 'inanbetec');
                    resultados.push(resultado);
                }
                catch (error) {
                    this.logger.error(`Erro ao sincronizar cliente Inanbetec ${cliente.cnpj_cpf}: ${error.message}`);
                }
            }
            for (const cliente of clientesOmie?.clientes_cadastro || []) {
                try {
                    const resultado = await this.sincronizarClientePorCNPJ(cliente.cnpj_cpf, 'omie');
                    resultados.push(resultado);
                }
                catch (error) {
                    this.logger.error(`Erro ao sincronizar cliente Omie ${cliente.cnpj_cpf}: ${error.message}`);
                }
            }
            this.logger.log(`Sincronização automática concluída: ${resultados.length} clientes processados`);
            return resultados;
        }
        catch (error) {
            this.logger.error(`Erro na sincronização automática: ${error.message}`);
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
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientSyncService.prototype, "sincronizacaoAutomatica", null);
exports.ClientSyncService = ClientSyncService = ClientSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof inanbetec_service_1.InanbetecService !== "undefined" && inanbetec_service_1.InanbetecService) === "function" ? _a : Object, typeof (_b = typeof omie_service_1.OmieService !== "undefined" && omie_service_1.OmieService) === "function" ? _b : Object])
], ClientSyncService);


/***/ }),

/***/ "./src/clients/services/inanbetec.service.ts":
/*!***************************************************!*\
  !*** ./src/clients/services/inanbetec.service.ts ***!
  \***************************************************/
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
var InanbetecService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InanbetecService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let InanbetecService = InanbetecService_1 = class InanbetecService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(InanbetecService_1.name);
        this.baseURL = this.configService.get('INANBETEC_API_URL', 'https://api.inanbetec.com.br/v1');
    }
    async buscarClientePorCNPJ(cnpj) {
        try {
            this.logger.log(`Buscando cliente na Inanbetec por CNPJ: ${cnpj}`);
            const url = `${this.baseURL}/clientes/buscar`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                params: { cnpj: this.limparDocumento(cnpj) }
            }));
            this.logger.log(`Cliente encontrado na Inanbetec: ${JSON.stringify(response.data)}`);
            return response.data;
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
            const url = `${this.baseURL}/clientes`;
            const dadosInanbetec = this.mapearParaInanbetec(clienteData);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, dadosInanbetec));
            this.logger.log(`Cliente criado na Inanbetec: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao criar cliente na Inanbetec: ${error.message}`);
            throw error;
        }
    }
    async atualizarCliente(clienteId, clienteData) {
        try {
            this.logger.log(`Atualizando cliente na Inanbetec ID: ${clienteId}`);
            const url = `${this.baseURL}/clientes/${clienteId}`;
            const dadosInanbetec = this.mapearParaInanbetec(clienteData);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(url, dadosInanbetec));
            this.logger.log(`Cliente atualizado na Inanbetec: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar cliente na Inanbetec: ${error.message}`);
            throw error;
        }
    }
    async listarClientes(filtros = {}) {
        try {
            this.logger.log(`Listando clientes na Inanbetec com filtros: ${JSON.stringify(filtros)}`);
            const url = `${this.baseURL}/clientes`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { params: filtros }));
            this.logger.log(`Lista de clientes retornada da Inanbetec: ${response.data?.length || 0} registros`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao listar clientes na Inanbetec: ${error.message}`);
            throw error;
        }
    }
    mapearParaInanbetec(clienteOmie) {
        return {
            cnpj_cpf: clienteOmie.cnpj_cpf || clienteOmie.documento,
            razao_social: clienteOmie.razao_social || clienteOmie.nome,
            nome_fantasia: clienteOmie.nome_fantasia || clienteOmie.nomeFantasia,
            email: clienteOmie.email,
            telefone1: clienteOmie.telefone1_numero || clienteOmie.telefone,
            endereco: {
                logradouro: clienteOmie.endereco?.endereco || clienteOmie.endereco?.logradouro,
                numero: clienteOmie.endereco?.numero,
                complemento: clienteOmie.endereco?.complemento,
                bairro: clienteOmie.endereco?.bairro,
                cidade: clienteOmie.endereco?.cidade,
                estado: clienteOmie.endereco?.estado,
                cep: clienteOmie.endereco?.cep
            }
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
                endereco: clienteInanbetec.endereco?.logradouro,
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
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const contracts_service_1 = __webpack_require__(/*! ./services/contracts.service */ "./src/contracts/services/contracts.service.ts");
const contract_dto_1 = __webpack_require__(/*! ./dto/contract.dto */ "./src/contracts/dto/contract.dto.ts");
let ContractsController = ContractsController_1 = class ContractsController {
    constructor(contractsService) {
        this.contractsService = contractsService;
        this.logger = new common_1.Logger(ContractsController_1.name);
    }
    async createContractFromVolumetria(dto) {
        this.logger.log(`Criando contrato a partir da volumetria para empresa: ${dto.empresaId}`);
        return this.contractsService.createContractFromVolumetria(dto.empresaId, dto.dataInicial, dto.dataFinal, dto.dadosEmpresa);
    }
    async createContractsFromReports(dto) {
        this.logger.log(`Criando contratos a partir de relatórios para empresa: ${dto.empresaId}`);
        return this.contractsService.createContractsFromReports(dto.empresaId, dto.dataInicial, dto.dataFinal, dto.dadosEmpresa);
    }
    async listContracts(query) {
        this.logger.log(`Listando contratos - Página: ${query.pagina}`);
        return this.contractsService.listContracts(query);
    }
    async getVolumetriaData(empresaId, dataInicial, dataFinal) {
        this.logger.log(`Consultando volumetria para empresa: ${empresaId}`);
        return this.contractsService.getVolumetriaData(empresaId, dataInicial, dataFinal);
    }
    async getReportsData(empresaId, dataInicial, dataFinal) {
        this.logger.log(`Consultando relatórios para empresa: ${empresaId}`);
        return this.contractsService.getReportsData(empresaId, dataInicial, dataFinal);
    }
    async getContract(id) {
        this.logger.log(`Buscando contrato: ${id}`);
        return this.contractsService.getContract({ nCodCtr: id });
    }
    async updateContract(id, contractData) {
        this.logger.log(`Atualizando contrato: ${id}`);
        return this.contractsService.updateContract({
            ...contractData,
            cabecalho: {
                ...contractData.cabecalho,
                nCodCtr: id
            }
        });
    }
    async deleteContractItem(contractId, itemId) {
        this.logger.log(`Excluindo item ${itemId} do contrato ${contractId}`);
        return this.contractsService.deleteContractItem({ nCodCtr: contractId }, [{ codItem: itemId }]);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)('volumetria'),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar contrato baseado em volumetria',
        description: 'Cria um contrato único no Omie baseado nos dados de volumetria da Inanbetec'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contrato criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erro na criação do contrato' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof contract_dto_1.CreateContractFromVolumetriaDto !== "undefined" && contract_dto_1.CreateContractFromVolumetriaDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "createContractFromVolumetria", null);
__decorate([
    (0, common_1.Post)('relatorios'),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar contratos baseados em relatórios por produto',
        description: 'Cria múltiplos contratos no Omie baseados nos relatórios agrupados por produto (cobrança, pixpay, outros)'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contratos criados com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erro na criação dos contratos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof contract_dto_1.CreateContractFromReportsDto !== "undefined" && contract_dto_1.CreateContractFromReportsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "createContractsFromReports", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar contratos',
        description: 'Lista contratos do Omie com paginação'
    }),
    (0, swagger_1.ApiQuery)({ name: 'pagina', required: false, description: 'Número da página' }),
    (0, swagger_1.ApiQuery)({ name: 'registros_por_pagina', required: false, description: 'Registros por página' }),
    (0, swagger_1.ApiQuery)({ name: 'apenas_importado_api', required: false, description: 'Apenas contratos via API' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de contratos retornada com sucesso' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof contract_dto_1.ListContractsDto !== "undefined" && contract_dto_1.ListContractsDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "listContracts", null);
__decorate([
    (0, common_1.Get)('volumetria/:empresaId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consultar dados de volumetria',
        description: 'Consulta dados de volumetria para análise sem criar contrato'
    }),
    (0, swagger_1.ApiParam)({ name: 'empresaId', description: 'ID da empresa' }),
    (0, swagger_1.ApiQuery)({ name: 'dataInicial', required: true, description: 'Data inicial' }),
    (0, swagger_1.ApiQuery)({ name: 'dataFinal', required: true, description: 'Data final' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dados de volumetria retornados com sucesso' }),
    __param(0, (0, common_1.Param)('empresaId')),
    __param(1, (0, common_1.Query)('dataInicial')),
    __param(2, (0, common_1.Query)('dataFinal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getVolumetriaData", null);
__decorate([
    (0, common_1.Get)('relatorios/:empresaId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consultar dados de relatórios agrupados',
        description: 'Consulta relatórios agrupados por produto para análise sem criar contratos'
    }),
    (0, swagger_1.ApiParam)({ name: 'empresaId', description: 'ID da empresa' }),
    (0, swagger_1.ApiQuery)({ name: 'dataInicial', required: true, description: 'Data inicial' }),
    (0, swagger_1.ApiQuery)({ name: 'dataFinal', required: true, description: 'Data final' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dados de relatórios retornados com sucesso' }),
    __param(0, (0, common_1.Param)('empresaId')),
    __param(1, (0, common_1.Query)('dataInicial')),
    __param(2, (0, common_1.Query)('dataFinal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getReportsData", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Buscar contrato por ID',
        description: 'Busca um contrato específico no Omie'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do contrato' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contrato encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contrato não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getContract", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Atualizar contrato',
        description: 'Atualiza um contrato existente no Omie'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do contrato' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contrato atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erro na atualização do contrato' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "updateContract", null);
__decorate([
    (0, common_1.Delete)(':contractId/itens/:itemId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Excluir item do contrato',
        description: 'Remove um item específico de um contrato'
    }),
    (0, swagger_1.ApiParam)({ name: 'contractId', description: 'ID do contrato' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'ID do item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Item excluído com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erro na exclusão do item' }),
    __param(0, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "deleteContractItem", null);
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
const contracts_controller_1 = __webpack_require__(/*! ./contracts.controller */ "./src/contracts/contracts.controller.ts");
const contracts_service_1 = __webpack_require__(/*! ./services/contracts.service */ "./src/contracts/services/contracts.service.ts");
const volumetria_service_1 = __webpack_require__(/*! ./services/volumetria.service */ "./src/contracts/services/volumetria.service.ts");
const omie_service_1 = __webpack_require__(/*! ./services/omie.service */ "./src/contracts/services/omie.service.ts");
let ContractsModule = class ContractsModule {
};
exports.ContractsModule = ContractsModule;
exports.ContractsModule = ContractsModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [contracts_controller_1.ContractsController],
        providers: [
            contracts_service_1.ContractsService,
            volumetria_service_1.VolumetriaService,
            omie_service_1.OmieService,
        ],
        exports: [
            contracts_service_1.ContractsService,
            volumetria_service_1.VolumetriaService,
            omie_service_1.OmieService,
        ],
    })
], ContractsModule);


/***/ }),

/***/ "./src/contracts/dto/contract.dto.ts":
/*!*******************************************!*\
  !*** ./src/contracts/dto/contract.dto.ts ***!
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListContractsDto = exports.CreateContractFromReportsDto = exports.CreateContractFromVolumetriaDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class CreateContractFromVolumetriaDto {
}
exports.CreateContractFromVolumetriaDto = CreateContractFromVolumetriaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da empresa',
        example: '123456'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContractFromVolumetriaDto.prototype, "empresaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data inicial para consulta',
        example: '2025-01-01'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContractFromVolumetriaDto.prototype, "dataInicial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data final para consulta',
        example: '2025-12-31'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContractFromVolumetriaDto.prototype, "dataFinal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dados adicionais da empresa'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateContractFromVolumetriaDto.prototype, "dadosEmpresa", void 0);
class CreateContractFromReportsDto {
}
exports.CreateContractFromReportsDto = CreateContractFromReportsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da empresa',
        example: '123456'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContractFromReportsDto.prototype, "empresaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data inicial para consulta',
        example: '2025-01-01'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContractFromReportsDto.prototype, "dataInicial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data final para consulta',
        example: '2025-12-31'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContractFromReportsDto.prototype, "dataFinal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dados adicionais da empresa'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateContractFromReportsDto.prototype, "dadosEmpresa", void 0);
class ListContractsDto {
    constructor() {
        this.pagina = 1;
        this.registros_por_pagina = 50;
        this.apenas_importado_api = 'N';
    }
}
exports.ListContractsDto = ListContractsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número da página',
        example: 1,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListContractsDto.prototype, "pagina", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Registros por página',
        example: 50,
        default: 50
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListContractsDto.prototype, "registros_por_pagina", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Apenas contratos importados via API',
        example: 'N',
        default: 'N'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListContractsDto.prototype, "apenas_importado_api", void 0);


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const volumetria_service_1 = __webpack_require__(/*! ./volumetria.service */ "./src/contracts/services/volumetria.service.ts");
const omie_service_1 = __webpack_require__(/*! ./omie.service */ "./src/contracts/services/omie.service.ts");
let ContractsService = ContractsService_1 = class ContractsService {
    constructor(volumetriaService, omieService) {
        this.volumetriaService = volumetriaService;
        this.omieService = omieService;
        this.logger = new common_1.Logger(ContractsService_1.name);
    }
    async createContractFromVolumetria(empresaId, dataInicial, dataFinal, dadosEmpresa = {}) {
        try {
            this.logger.log('Iniciando criação de contrato a partir da volumetria');
            const volumetriaData = await this.volumetriaService.consultarVolumetria({
                dataInicial,
                dataFinal,
                empresas: empresaId
            });
            this.logger.log(`Dados de volumetria recebidos: ${JSON.stringify(volumetriaData)}`);
            if (!volumetriaData || volumetriaData.length === 0) {
                this.logger.warn('Nenhum dado de volumetria encontrado para o período informado');
                return {
                    success: false,
                    error: 'Nenhum dado de volumetria encontrado para o período informado'
                };
            }
            const servicosEmpresa = await this.volumetriaService.buscarServicosPorEmpresa(empresaId);
            const dadosContrato = this.volumetriaService.mapearParaContratoOmie(volumetriaData[0], dadosEmpresa);
            this.logger.log(`Dados do contrato mapeado: ${JSON.stringify(dadosContrato)}`);
            const contractModel = this.createContractModel(dadosContrato);
            this.logger.log(`Modelo do contrato Omie: ${JSON.stringify(contractModel)}`);
            const response = await this.omieService.incluirContrato(contractModel);
            this.logger.log(`Resposta da criação do contrato Omie: ${JSON.stringify(response)}`);
            return {
                success: response.cCodStatus === '0',
                contractId: response.nCodCtr,
                integrationCode: response.cCodIntCtr,
                message: response.cDescStatus,
                volumetriaData: volumetriaData[0],
                servicosEmpresa: servicosEmpresa,
                contractData: dadosContrato
            };
        }
        catch (error) {
            this.logger.error(`Erro na criação do contrato a partir da volumetria: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async createContractsFromReports(empresaId, dataInicial, dataFinal, dadosEmpresa = {}) {
        try {
            this.logger.log('Iniciando criação de contratos baseados em relatórios');
            const relatorios = await this.volumetriaService.buscarRelatorios({
                dataInicial,
                dataFinal,
                empresas: empresaId
            });
            if (!relatorios || relatorios.length === 0) {
                return {
                    success: false,
                    error: 'Nenhum relatório encontrado para o período informado'
                };
            }
            const gruposProdutos = this.volumetriaService.agruparRelatoriosPorProduto(relatorios);
            const contratosCreated = [];
            const erros = [];
            for (const [tipoProduto, relatoriosProduto] of Object.entries(gruposProdutos)) {
                if (relatoriosProduto.length > 0) {
                    try {
                        this.logger.log(`Criando contrato para produto: ${tipoProduto}`);
                        const dadosContrato = this.volumetriaService.mapearRelatorioPorProduto(relatoriosProduto, tipoProduto, dadosEmpresa);
                        if (dadosContrato) {
                            const contractModel = this.createContractModel(dadosContrato);
                            const response = await this.omieService.incluirContrato(contractModel);
                            contratosCreated.push({
                                produto: tipoProduto,
                                success: response.cCodStatus === '0',
                                contractId: response.nCodCtr,
                                integrationCode: response.cCodIntCtr,
                                message: response.cDescStatus,
                                relatorios: relatoriosProduto.length,
                                totalRegistros: relatoriosProduto.reduce((sum, rel) => sum + (rel.record_count || 0), 0)
                            });
                        }
                    }
                    catch (error) {
                        erros.push({
                            produto: tipoProduto,
                            error: error.message
                        });
                    }
                }
            }
            return {
                success: contratosCreated.length > 0,
                contratosCreated,
                erros,
                totalProdutos: Object.keys(gruposProdutos).filter(key => gruposProdutos[key].length > 0).length,
                relatoriosProcessados: relatorios.length
            };
        }
        catch (error) {
            this.logger.error(`Erro na criação de contratos baseados em relatórios: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getVolumetriaData(empresaId, dataInicial, dataFinal) {
        try {
            const volumetriaData = await this.volumetriaService.consultarVolumetria({
                dataInicial,
                dataFinal,
                empresas: empresaId
            });
            const servicosEmpresa = await this.volumetriaService.buscarServicosPorEmpresa(empresaId);
            return {
                success: true,
                volumetria: volumetriaData,
                servicos: servicosEmpresa,
                contratoMapeado: volumetriaData && volumetriaData.length > 0 ?
                    this.volumetriaService.mapearParaContratoOmie(volumetriaData[0]) : null
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getReportsData(empresaId, dataInicial, dataFinal) {
        try {
            this.logger.log('Consultando relatórios para análise');
            const relatorios = await this.volumetriaService.buscarRelatorios({
                dataInicial,
                dataFinal,
                empresas: empresaId
            });
            const gruposProdutos = this.volumetriaService.agruparRelatoriosPorProduto(relatorios);
            const contratosMapeados = {};
            for (const [tipoProduto, relatoriosProduto] of Object.entries(gruposProdutos)) {
                if (relatoriosProduto.length > 0) {
                    contratosMapeados[tipoProduto] = this.volumetriaService.mapearRelatorioPorProduto(relatoriosProduto, tipoProduto);
                }
            }
            return {
                success: true,
                relatorios,
                gruposProdutos,
                contratosMapeados,
                resumo: {
                    totalRelatorios: relatorios.length,
                    produtosEncontrados: Object.keys(gruposProdutos).filter(key => gruposProdutos[key].length > 0),
                    totalRegistros: relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0)
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async createContract(contractData) {
        try {
            const contractModel = this.createContractModel(contractData);
            const response = await this.omieService.incluirContrato(contractModel);
            return {
                success: response.cCodStatus === '0',
                contractId: response.nCodCtr,
                integrationCode: response.cCodIntCtr,
                message: response.cDescStatus
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getContract(contractKey) {
        try {
            const response = await this.omieService.consultarContrato(contractKey);
            return {
                success: !!response.contratoCadastro,
                contract: response.contratoCadastro || null
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async listContracts(listParams = {}) {
        try {
            const listRequest = this.createListRequest(listParams);
            const response = await this.omieService.listarContratos(listRequest);
            return {
                success: true,
                pagina: response.pagina,
                total_de_paginas: response.total_de_paginas,
                registros: response.registros,
                total_de_registros: response.total_de_registros,
                contratos: response.contratoCadastro || []
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async updateContract(contractData) {
        try {
            const contractModel = this.createContractModel(contractData);
            const response = await this.omieService.alterarContrato(contractModel);
            return {
                success: response.cCodStatus === '0',
                contractId: response.nCodCtr,
                integrationCode: response.cCodIntCtr,
                message: response.cDescStatus
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async upsertContract(contractData) {
        try {
            const contractModel = this.createContractModel(contractData);
            const response = await this.omieService.upsertContrato(contractModel);
            return {
                success: response.cCodStatus === '0',
                contractId: response.nCodCtr,
                integrationCode: response.cCodIntCtr,
                message: response.cDescStatus
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async deleteContractItem(contractKey, itemsToDelete) {
        try {
            const response = await this.omieService.excluirItem(contractKey, itemsToDelete);
            return {
                success: response.cCodStatus === '0',
                message: response.cDescStatus
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    createContractModel(contractData) {
        return {
            cabecalho: {
                cCodIntCtr: contractData.cCodIntCtr || '',
                cNumCtr: contractData.cNumCtr || '',
                nCodCli: contractData.nCodCli || 0,
                cCodSit: contractData.cCodSit || '10',
                dVigInicial: contractData.dVigInicial || '',
                dVigFinal: contractData.dVigFinal || '',
                nDiaFat: contractData.nDiaFat || 0,
                nValTotMes: contractData.nValTotMes || 0,
                cTipoFat: contractData.cTipoFat || '01'
            },
            departamentos: [],
            infAdic: contractData.infAdic || {
                cCidPrestServ: '',
                cCodCateg: '',
                nCodCC: 0,
                nCodProj: 0,
                nCodVend: 0
            },
            vencTextos: contractData.vencTextos || {
                cTpVenc: '001',
                nDias: 5,
                cProxMes: 'N',
                cAdContrato: 'N'
            },
            itensContrato: contractData.itensContrato || [],
            emailCliente: {
                cEnviarBoleto: 'N',
                cEnviarLinkNfse: 'N',
                cEnviarRecibo: 'N',
                cUtilizarEmails: ''
            },
            observacoes: {
                cObsContrato: ''
            }
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
    __metadata("design:paramtypes", [typeof (_a = typeof volumetria_service_1.VolumetriaService !== "undefined" && volumetria_service_1.VolumetriaService) === "function" ? _a : Object, typeof (_b = typeof omie_service_1.OmieService !== "undefined" && omie_service_1.OmieService) === "function" ? _b : Object])
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.baseURL, payload));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro na chamada da API Omie: ${error.message}`);
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

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

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
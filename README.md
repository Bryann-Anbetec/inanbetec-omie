# Inanbetec-Omie Integration API

Sistema de integração completo entre as plataformas **Inanbetec** e **Omie**, desenvolvido em **NestJS**, que oferece:

1. **Sistema de Contratos**: Criação automática de contratos no Omie baseados em dados de volumetria e relatórios da Inanbetec
2. **Sincronização de Clientes**: Sincronização bidirecional automática de clientes entre as plataformas via CNPJ

## 🚀 Funcionalidades

### 📋 Sistema de Contratos
- ✅ Criação de contratos baseados em **volumetria** (contrato único)
- ✅ Criação de contratos baseados em **relatórios por produto** (cobrança, pixpay, outros)
- ✅ Listagem completa de contratos com paginação
- ✅ Consulta de dados de volumetria e relatórios
- ✅ Operações CRUD completas de contratos

### 👥 Sincronização de Clientes
- ✅ Sincronização automática via **CNPJ**
- ✅ **Webhooks** para eventos em tempo real
- ✅ **Cron jobs** para sincronização periódica
- ✅ Detecção automática de conflitos e resolução
- ✅ Suporte para criação, atualização e exclusão

## 🏗️ Arquitetura

```
src/
├── main.ts                    # Ponto de entrada da aplicação
├── app.module.ts             # Módulo principal
├── app.controller.ts         # Controller principal
├── app.service.ts            # Service principal
├── contracts/                # Módulo de contratos
│   ├── contracts.module.ts
│   ├── contracts.controller.ts
│   ├── dto/
│   │   └── contract.dto.ts
│   └── services/
│       ├── contracts.service.ts    # Lógica principal de contratos
│       ├── volumetria.service.ts   # Integração com Inanbetec
│       └── omie.service.ts         # Integração com Omie
├── clients/                  # Módulo de sincronização de clientes
│   ├── clients.module.ts
│   ├── clients.controller.ts
│   ├── dto/
│   │   └── client.dto.ts
│   └── services/
│       ├── client-sync.service.ts  # Lógica de sincronização
│       └── inanbetec.service.ts    # Cliente Inanbetec
└── shared/                   # Módulo compartilhado
    ├── shared.module.ts
    └── interceptors/
        ├── logging.interceptor.ts   # Log de requisições
        └── response.interceptor.ts  # Padronização de respostas
```

## 📦 Instalação

### 1. Clonar o repositório
```bash
git clone <repository_url>
cd inanbetec-omie-integration
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Configurações do Omie
OMIE_APP_KEY=sua_app_key_aqui
OMIE_APP_SECRET=seu_app_secret_aqui

# Configurações da Inanbetec
INANBETEC_API_URL=https://api.inanbetec.com.br/v1
INANBETEC_VOLUMETRIA_URL=https://edi-financeiro.inanbetec.com.br/v1/volumetria
```

### 4. Executar a aplicação
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 API Endpoints

### 🏠 Principal
- `GET /` - Health check
- `GET /health` - Status detalhado
- `GET /api/docs` - Documentação Swagger

### 📋 Contratos (`/contratos`)

#### Criação de Contratos
```http
# Criar contrato baseado em volumetria
POST /contratos/volumetria
{
  "empresaId": "123456",
  "dataInicial": "2025-01-01",
  "dataFinal": "2025-12-31",
  "dadosEmpresa": {
    "diaFaturamento": 30,
    "cidade": "São Paulo"
  }
}

# Criar contratos baseados em relatórios por produto
POST /contratos/relatorios
{
  "empresaId": "123456",
  "dataInicial": "2025-01-01",
  "dataFinal": "2025-12-31"
}
```

#### Consultas
```http
# Listar contratos
GET /contratos?pagina=1&registros_por_pagina=50

# Buscar contrato específico
GET /contratos/123456

# Consultar dados de volumetria
GET /contratos/volumetria/123456?dataInicial=2025-01-01&dataFinal=2025-12-31

# Consultar relatórios agrupados
GET /contratos/relatorios/123456?dataInicial=2025-01-01&dataFinal=2025-12-31
```

### 👥 Clientes (`/clientes`)

#### Sincronização
```http
# Sincronizar cliente por CNPJ
POST /clientes/sincronizar
{
  "documento": "12.345.678/0001-90",
  "origem": "inanbetec"
}

# Buscar cliente em ambas as plataformas
GET /clientes/buscar/12345678000190
```

#### Webhooks
```http
# Webhook Inanbetec
POST /clientes/webhook/inanbetec
{
  "evento": "created",
  "cliente": { ... },
  "origem": "inanbetec"
}

# Webhook Omie
POST /clientes/webhook/omie
{
  "evento": "updated", 
  "cliente": { ... },
  "origem": "omie"
}
```

## ⚙️ Configuração de Webhooks

### Inanbetec
Configure o webhook para: `https://sua-api.com/clientes/webhook/inanbetec`

### Omie  
Configure o webhook para: `https://sua-api.com/clientes/webhook/omie`

## 🕐 Sincronização Automática

O sistema executa sincronização automática **a cada hora** para:
- Buscar clientes modificados nas últimas horas
- Sincronizar automaticamente entre as plataformas
- Resolver conflitos baseado na data de modificação

## 🔧 Desenvolvimento

### Scripts disponíveis
```bash
npm run start:dev     # Desenvolvimento com hot-reload
npm run build         # Build para produção
npm run test          # Executar testes
npm run test:watch    # Testes com watch
npm run lint          # Linter
npm run format        # Formatação de código
```

### Testes
```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Logs

O sistema utiliza logging estruturado com:
- ✅ Log de todas as requisições HTTP
- ✅ Log detalhado de integrações com APIs externas
- ✅ Log de sincronizações de clientes
- ✅ Log de criação de contratos
- ✅ Interceptors para padronização

## 🛡️ Segurança

- ✅ Validação de dados com `class-validator`
- ✅ Sanitização de inputs
- ✅ Rate limiting (configurável)
- ✅ CORS habilitado
- ✅ Logs de auditoria

## 🚀 Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]
```

### Variables de Ambiente Obrigatórias
```env
OMIE_APP_KEY=xxx
OMIE_APP_SECRET=xxx
PORT=3000
```

## 📈 Monitoramento

- Health check em `/health`
- Métricas de sincronização em `/clientes/status-sincronizacao`
- Logs estruturados para integração com sistemas de monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação Swagger em `/api/docs`

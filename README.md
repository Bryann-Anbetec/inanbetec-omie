# Inanbetec-Omie Integration API

Sistema de integração completo entre as plataformas **Inanbetec** e **Omie**, desenvolvido em **NestJS**, que oferece:

1. **Sistema de Consolidação Mensal**: Consolidação automática de contratos por proposta comercial, executada no primeiro dia útil de cada mês
2. **Sistema de Contratos**: Criação automática de contratos no Omie baseados em dados de volumetria da Inanbetec
3. **Sincronização de Clientes**: Sincronização bidirecional automática de clientes entre as plataformas via CNPJ

## 🚀 Funcionalidades

### �️ Sistema de Consolidação Mensal
- ✅ **Consolidação automática** por proposta comercial (não por produto)
- ✅ **Execução automática** no primeiro dia útil do mês (6h, 10h, 14h)
- ✅ **Agrupamento correto** por número de proposta comercial
- ✅ **Persistência em MongoDB** com controle de status
- ✅ **Idempotência** para evitar duplicações
- ✅ **Processamento manual** por empresa

### 📋 Sistema de Contratos (Legacy)
- ✅ Criação de contratos baseados em **volumetria** (contrato único)
- ✅ Listagem completa de contratos com paginação
- ✅ Consulta de dados de volumetria
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
├── contracts/                # Módulo de contratos e consolidação
│   ├── contracts.module.ts
│   ├── contracts.controller.ts
│   ├── dto/
│   │   └── contract.dto.ts
│   ├── schemas/
│   │   └── volumetria-consolidada.schema.ts   # Schema MongoDB
│   └── services/
│       ├── contracts.service.ts               # Lógica principal (CORRIGIDO)
│       ├── volumetria.service.ts              # Integração com Inanbetec
│       ├── omie.service.ts                    # Integração com Omie
│       ├── propostas.service.ts               # Mapeamento produto→proposta
│       ├── consolidacao.service.ts            # CRUD consolidação
│       ├── configuracao.service.ts            # Configurações de negócio
│       └── consolidacao-scheduler.service.ts  # Automação cron jobs
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
# Configurações para reverter
OMIE_APP_KEY=sua_app_key_aqui
OMIE_APP_SECRET=seu_app_secret_aqui

# Configurações da Inanbetec
INANBETEC_API_URL=https://api.inanbetec.com.br/v1
INANBETEC_VOLUMETRIA_URL=https://edi-financeiro.inanbetec.com.br/v1/volumetria

# PostgreSQL para consolidação (não MongoDB)
DATABASE_URL=postgresql://user:password@localhost:5432/inanbetec_omie
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

---

## 📋 Contratos (`/contratos`)

### 🗓️ **CONSOLIDAÇÃO MENSAL** (Sistema Principal)

#### `POST /contratos/consolidacao/processar`
**Processar consolidação mensal por proposta comercial**

✨ **FLUXO CORRETO**: Agrupa por número de proposta (não por produto)

**Request Body:**
```json
{
  "competencia": "2025-01",           // OBRIGATÓRIO: Formato YYYY-MM
  "empresaIds": ["51", "66"]          // OPCIONAL: Se omitido, processa todas
}
```

**Campos Detalhados:**
- `competencia` (string, obrigatório): Mês de referência no formato `YYYY-MM`
  - Exemplo: `"2025-01"` para Janeiro/2025
  - O sistema processará dados do mês anterior automaticamente
- `empresaIds` (array, opcional): Lista de IDs das empresas a processar
  - Se omitido: processa todas as empresas ativas
  - Exemplo: `["51", "66", "123"]`

**Response:**
```json
{
  "success": true,
  "competencia": "2025-01",
  "empresasProcessadas": 2,
  "empresasComSucesso": 2,
  "resultados": [
    {
      "empresaId": 51,
      "success": true,
      "propostas": ["202300100024", "P-8899"],
      "registrosConsolidacao": 2,
      "contratosEnviados": 2,
      "detalhes": [
        {
          "proposta": "202300100024",
          "success": true,
          "contratoId": 123456,
          "integrationCode": "CTR-2025-01-EMP51-PROP-202300100024"
        }
      ]
    }
  ]
}
```

#### `POST /contratos/consolidacao/manual/{empresaId}`
**Processar consolidação manual para uma empresa específica**

**Path Parameters:**
- `empresaId` (string, obrigatório): ID da empresa
  - Exemplo: `51` ou `66`

**Request Body:**
```json
{
  "competencia": "2025-01"            // OBRIGATÓRIO: Formato YYYY-MM
}
```

**Response:** Mesmo formato do endpoint anterior, mas apenas para a empresa especificada.

---

### 📋 **SISTEMA DE CONTRATOS** (Legacy)

#### `POST /contratos/volumetria`
**Criar contrato baseado em volumetria (sistema antigo)**

**Request Body:**
```json
{
  "empresaId": "123456",              // OBRIGATÓRIO: ID da empresa
  "dataInicial": "2025-01-01",        // OBRIGATÓRIO: Formato YYYY-MM-DD  
  "dataFinal": "2025-01-31",          // OBRIGATÓRIO: Formato YYYY-MM-DD
  "dadosEmpresa": {                   // OPCIONAL: Dados adicionais
    "diaFaturamento": 30,
    "cidade": "São Paulo",
    "categoria": "Serviços",
    "centroCusto": 1001,
    "projeto": 2001,
    "vendedor": 3001,
    "diasVencimento": 30
  }
}
```

**Campos Detalhados:**
- `empresaId`: Identificador numérico da empresa na Inanbetec
- `dataInicial/dataFinal`: Período para buscar dados de volumetria
- `dadosEmpresa.diaFaturamento`: Dia do mês para faturamento (1-31)
- `dadosEmpresa.cidade`: Cidade para prestação do serviço
- `dadosEmpresa.diasVencimento`: Prazo para vencimento em dias

#### `GET /contratos`
**Listar contratos com paginação**

**Query Parameters:**
```
?pagina=1                           // Número da página (padrão: 1)
&registros_por_pagina=50           // Registros por página (padrão: 50)
&apenas_importado_api=N            // Apenas contratos via API (padrão: N)
```

#### `GET /contratos/volumetria/{empresaId}`
**Consultar dados de volumetria sem criar contrato**

**Path Parameters:**
- `empresaId`: ID da empresa

**Query Parameters:**
```
?dataInicial=2025-01-01            // OBRIGATÓRIO: Data inicial
&dataFinal=2025-01-31              // OBRIGATÓRIO: Data final
```

**Response:**
```json
{
  "success": true,
  "volumetria": {
    "cobranca": {
      "qtdeTitulos": 150,
      "valorTotal": 25000.00
    },
    "pixpay": {
      "qtdeMotoristas": 50,
      "valorTotal": 8000.00
    }
  },
  "servicos": [...],
  "contratoMapeado": {...}
}
```

#### `GET /contratos/{id}`
**Buscar contrato específico por ID**

**Path Parameters:**
- `id` (number): ID numérico do contrato no Omie

#### `PUT /contratos/{id}`
**Atualizar contrato existente**

**Path Parameters:**
- `id` (number): ID do contrato

**Request Body:** Objeto completo do contrato para atualização

#### `DELETE /contratos/{contractId}/itens/{itemId}`
**Excluir item específico de um contrato**

**Path Parameters:**
- `contractId` (number): ID do contrato
- `itemId` (number): ID do item a ser excluído

---

## 👥 Clientes (`/clientes`)

### ⚠️ **SINCRONIZAÇÃO DESABILITADA**
**Por medidas de segurança, a sincronização automática de clientes foi DESABILITADA após problemas com a base de dados.**

#### `GET /clientes/buscar/{cnpj}` ✅ **ATIVO**
**Buscar cliente por CNPJ (APENAS CONSULTA - sem modificações)**

**Path Parameters:**
- `cnpj`: CNPJ com ou sem formatação

**Response:**
```json
{
  "success": true,
  "inanbetec": {
    "id": 123,
    "razaoSocial": "Empresa Exemplo Ltda", 
    "cnpj": "12.345.678/0001-90"
  },
  "omie": {
    "codigo_cliente_omie": 456,
    "razao_social": "Empresa Exemplo Ltda",
    "cnpj_cpf": "12345678000190"  
  }
}
```

### ❌ **ENDPOINTS DESABILITADOS**
- ~~`POST /clientes/sincronizar`~~ - **REMOVIDO** 
- ~~`POST /clientes/webhook/inanbetec`~~ - **REMOVIDO**
- ~~`POST /clientes/webhook/omie`~~ - **REMOVIDO**

**Motivo:** Problemas identificados na base de dados que afetaram mais de 91 mil clientes.

---

## ⚙️ Configuração e Automação

### 🤖 Consolidação Automática

O sistema executa **automaticamente** nos primeiros dias úteis de cada mês:

- **6h**: Execução principal da consolidação mensal
- **10h**: Retentativa para registros com erro
- **14h**: Última tentativa do dia

**Processo Automático:**
1. Verifica se é o primeiro dia útil do mês
2. Busca dados de volumetria do mês anterior
3. Extrai produtos: `cobranca`, `pixpay`, `webcheckout`
4. Mapeia cada produto para sua proposta comercial
5. **Agrupa por número de proposta** (correção principal)
6. Salva na tabela `ab_volumetria_consolidada`
7. Envia contratos para o Omie
8. Atualiza status: `pending` → `ready_to_send` → `sent`

### 🗂️ Mapeamento Produto → Proposta

**Configuração Atual:**
```javascript
// Empresa 51
cobranca → "202300100024"
pixpay → "202300100024"

// Empresa 66  
cobranca → "P-8899"
pixpay → "P-8899"
```

### 📊 PostgreSQL - Estrutura de Dados

**Tabela:** `ab_volumetria_consolidada`
```sql
CREATE TABLE ab_volumetria_consolidada (
  id SERIAL PRIMARY KEY,
  competencia DATE NOT NULL,           -- Primeiro dia do mês de referência
  empresa_id INTEGER NOT NULL,         -- ID da empresa
  proposta VARCHAR(30) NOT NULL,       -- Número da proposta
  valor_total DECIMAL(18,2) NOT NULL,  -- Soma dos produtos
  produtos JSONB NOT NULL,             -- Array de produtos
  origem_payload JSONB NOT NULL,       -- Dados originais da volumetria
  status VARCHAR(20) DEFAULT 'pending', -- Status do processamento  
  tentativas INTEGER DEFAULT 0,        -- Número de tentativas
  omie_request JSONB,                  -- Request enviado ao Omie
  omie_response JSONB,                 -- Response do Omie
  codigo_integracao VARCHAR(100),      -- Código único
  mensagem_erro TEXT,                  -- Mensagem de erro
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Índice único para evitar duplicação
  CONSTRAINT uk_consolidacao UNIQUE (competencia, empresa_id, proposta)
);

-- Índices para performance
CREATE INDEX idx_consolidacao_competencia ON ab_volumetria_consolidada(competencia);
CREATE INDEX idx_consolidacao_empresa ON ab_volumetria_consolidada(empresa_id);
CREATE INDEX idx_consolidacao_status ON ab_volumetria_consolidada(status);
```

**Dados de Exemplo:**
```json
{
  "id": 1,
  "competencia": "2025-01-01",
  "empresa_id": 51,
  "proposta": "202300100024",
  "valor_total": 33000.00,
  "produtos": [
    {"nome": "cobranca", "valor": 25000.00, "quantidade": 150},
    {"nome": "pixpay", "valor": 8000.00, "quantidade": 50}
  ],
  "status": "sent",
  "codigo_integracao": "CTR-2025-01-EMP51-PROP-202300100024"
}
```

---

## ⚙️ Configuração de Webhooks

### Inanbetec
Configure o webhook para: `https://sua-api.com/clientes/webhook/inanbetec`

### Omie  
Configure o webhook para: `https://sua-api.com/clientes/webhook/omie`

### Sincronização de Clientes
O sistema executa sincronização automática **a cada hora** para:
- Buscar clientes modificados nas últimas horas
- Sincronizar automaticamente entre as plataformas
- Resolver conflitos baseado na data de modificação

---

## 🚨 Diferenças do Sistema Anterior

### ❌ **ANTES** (Sistema Incorreto)
```
Volumetria → Agrupamento por PRODUTO → Múltiplos contratos
- cobranca: Contrato A (R$ 25.000)
- pixpay: Contrato B (R$ 8.000)
- webcheckout: Contrato C (R$ 5.000)
```

### ✅ **AGORA** (Sistema Correto)
```
Volumetria → Produto → Proposta → Agrupamento por PROPOSTA → Um contrato
- Proposta "202300100024": Contrato Único (R$ 38.000)
  - cobranca: R$ 25.000
  - pixpay: R$ 8.000  
  - webcheckout: R$ 5.000
```

### 🔧 **Principais Correções**
1. **Agrupamento Correto**: Por número de proposta comercial
2. **Execução Automática**: Primeiro dia útil de cada mês
3. **Persistência**: MongoDB com controle de status
4. **Idempotência**: Evita duplicações com índices únicos
5. **Código de Integração**: `CTR-YYYY-MM-EMP{id}-PROP-{proposta}`

---

## 🧪 Exemplos de Teste

### Testar Consolidação Manual
```bash
curl -X POST http://localhost:3000/contratos/consolidacao/manual/51 \
  -H "Content-Type: application/json" \
  -d '{"competencia": "2025-01"}'
```

### Testar Consolidação Geral
```bash
curl -X POST http://localhost:3000/contratos/consolidacao/processar \
  -H "Content-Type: application/json" \
  -d '{"competencia": "2025-01", "empresaIds": ["51", "66"]}'
```

### Verificar Volumetria
```bash
curl "http://localhost:3000/contratos/volumetria/51?dataInicial=2025-01-01&dataFinal=2025-01-31"
```

---

## � Desenvolvimento

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

---

## � Logs e Monitoramento

### Logs Estruturados
O sistema utiliza logging detalhado com:
- ✅ **Consolidação Mensal**: Log completo do processo de agrupamento por proposta
- ✅ **Integração Omie**: Request/Response completos para auditoria  
- ✅ **Mapeamento Produto→Proposta**: Log de cada mapeamento realizado
- ✅ **Status MongoDB**: Log de persistência e atualização de status
- ✅ **Execução Automática**: Log dos cron jobs e primeiro dia útil
- ✅ **Sincronização de Clientes**: Log de webhooks e sincronizações
- ✅ **Interceptors**: Padronização de respostas

### Exemplo de Log - Consolidação
```
[ConsolidacaoSchedulerService] Verificando se deve executar consolidação mensal...
[ConfiguracaoService] Hoje é primeiro dia útil: true
[ContractsService] === INICIANDO CONSOLIDAÇÃO MENSAL ===
[ContractsService] Competência: 2025-01
[ContractsService] Período: 2025-01-01 até 2025-01-31
[ContractsService] --- Processando empresa: 51 ---
[ContractsService] Produtos encontrados: cobranca(25000), pixpay(8000)
[PropostasService] ✅ cobranca → Proposta: 202300100024 (R$ 25000)
[PropostasService] ✅ pixpay → Proposta: 202300100024 (R$ 8000)  
[ContractsService] Propostas consolidadas: 202300100024
[ConsolidacaoService] 💾 Proposta 202300100024 salva - Status: ready_to_send
[ContractsService] 🚀 Contrato enviado - Proposta: 202300100024 - ID Omie: 123456
```

## 🛡️ Segurança

- ✅ Validação rigorosa de dados com `class-validator`
- ✅ Sanitização de inputs para MongoDB e APIs externas
- ✅ Índices únicos para evitar duplicação de consolidações
- ✅ Rate limiting configurável para APIs externas
- ✅ CORS habilitado para integração frontend
- ✅ Logs completos de auditoria com timestamps
- ✅ Validação de competência e formato de dados

---

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
# APIs Externas
OMIE_APP_KEY=xxx
OMIE_APP_SECRET=xxx
INANBETEC_VOLUMETRIA_URL=https://edi-financeiro.inanbetec.com.br/v1/volumetria

# PostgreSQL (não MongoDB)
DATABASE_URL=postgresql://user:password@localhost:5432/inanbetec_omie

# Aplicação
PORT=3000
NODE_ENV=production
```

## 📈 Monitoramento

- **Health Check**: `GET /health`
- **Status Consolidação**: Logs detalhados da consolidação mensal
- **Métricas Clientes**: `GET /clientes/buscar/{cnpj}` (apenas consulta)
- **PostgreSQL Status**: Conexão e saúde da base de dados
- **Cron Jobs**: Status dos agendamentos automáticos
- **Logs Estruturados**: Integração com sistemas de monitoramento externos

### ⚠️ **MUDANÇAS DE SEGURANÇA**
- **Sincronização de Clientes DESABILITADA**: Após problemas que afetaram 91k+ registros
- **Base de Dados**: Migração de MongoDB para PostgreSQL
- **Apenas Consulta**: Endpoint de busca por CNPJ permanece ativo (sem modificações)

### Métricas Importantes
```json
{
  "consolidacao": {
    "ultimaExecucao": "2025-09-01T06:00:00.000Z",
    "proximaExecucao": "2025-10-01T06:00:00.000Z", 
    "statusUltimaExecucao": "success",
    "empresasProcessadas": 15,
    "contratosEnviados": 25
  },
  "postgresql": {
    "status": "connected",
    "totalRegistros": 1250,
    "ultimoRegistro": "2025-09-01T06:05:30.000Z"
  }
}
```

---

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
- Entre em contato com a equipe de desenvolvimento Anbetec
- Consulte a documentação Swagger em `/api/docs`
- Verifique os logs da consolidação mensal em tempo real

### Troubleshooting Consolidação

**Problema**: Consolidação não executou automaticamente
- ✅ Verificar se é primeiro dia útil com `ConfiguracaoService.isPrimeiroDiaUtil()`
- ✅ Verificar logs do `ConsolidacaoSchedulerService`
- ✅ Verificar conexão com MongoDB
- ✅ Verificar se `processandoConsolidacao` não travou em `true`

**Problema**: Produtos não estão sendo agrupados por proposta
- ✅ Verificar mapeamento no `PropostasService`
- ✅ Verificar se `extrairProdutosDaVolumetria()` está retornando produtos
- ✅ Verificar logs do `ContractsService.processarEmpresaPorProposta()`

**Problema**: Contratos duplicados
- ✅ Verificar índice único em MongoDB: `{competencia, empresaId, proposta}`
- ✅ Verificar logs de `ConsolidacaoService.persistirConsolidacao()`

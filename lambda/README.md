# Projeto de Integração Omie - AWS Lambda

## 📋 Visão Geral

Este projeto converte uma integração monolítica NestJS em uma arquitetura serverless de microserviços usando AWS Lambda. O sistema realiza sincronização bidirecional de clientes via CNPJ, processamento de dados de volumetria e criação automática de contratos no Omie.

## 🏗️ Arquitetura

### Microserviços (Lambda Functions)

```
┌─────────────────────┐     ┌─────────────────────┐
│ sync-cnpj-          │     │ sync-cnpj-omie-     │
│ inanbetec-to-omie   │     │ to-inanbetec        │
│                     │     │                     │
│ • Busca CNPJs       │     │ • Lista clientes    │
│ • Cria clientes     │     │ • Sync reverso      │
│ • Valida dados      │     │ • Atualiza base     │
└─────────────────────┘     └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│ fetch-volumetria-   │────▶│ process-and-        │
│ data                │     │ store-data          │
│                     │     │                     │
│ • Coleta dados      │     │ • Extrai produtos   │
│ • Calcula período   │     │ • Calcula propostas │
│ • Trigger próxima   │     │ • Salva MongoDB     │
└─────────────────────┘     └─────────────────────┘
                                        │
                                        ▼
                            ┌─────────────────────┐
                            │ create-omie-        │
                            │ contracts           │
                            │                     │
                            │ • Cria contratos    │
                            │ • Envia para Omie   │
                            │ • Atualiza status   │
                            └─────────────────────┘
```

### Fluxo de Dados

1. **CloudWatch Event** dispara coleta de volumetria (diária às 2h)
2. **fetch-volumetria-data** busca dados da API externa
3. **process-and-store-data** processa e armazena no MongoDB
4. **create-omie-contracts** cria contratos no Omie
5. **sync-cnpj-*** sincroniza clientes (semanal ou manual)

## 📁 Estrutura do Projeto

```
lambda/
├── shared/                     # Utilitários compartilhados
│   ├── types.ts               # Definições de tipos TypeScript
│   ├── logger.ts              # Sistema de logging estruturado
│   ├── omie-client.ts         # Cliente da API Omie
│   └── mongodb-client.ts      # Cliente MongoDB
│
├── sync-cnpj-inanbetec-to-omie/  # Lambda 1: Sync CNPJ (InAnbetec → Omie)
│   ├── index.ts
│   └── package.json
│
├── sync-cnpj-omie-to-inanbetec/  # Lambda 2: Sync CNPJ (Omie → InAnbetec)
│   ├── index.ts
│   └── package.json
│
├── fetch-volumetria-data/        # Lambda 3: Buscar dados volumetria
│   ├── index.ts
│   └── package.json
│
├── process-and-store-data/       # Lambda 4: Processar e armazenar
│   ├── index.ts
│   └── package.json
│
├── create-omie-contracts/        # Lambda 5: Criar contratos
│   ├── index.ts
│   └── package.json
│
├── DEPLOYMENT.md              # Guia de deployment
└── EVENT-TRIGGERS.md          # Configuração de triggers
```

## 🚀 Quick Start

### 1. Pré-requisitos
- AWS CLI configurado
- Node.js 18+
- TypeScript
- Conta Omie API
- MongoDB

### 2. Configurar Variáveis de Ambiente
```bash
export OMIE_APP_KEY="sua_app_key"
export OMIE_APP_SECRET="sua_app_secret"
export MONGODB_URI="mongodb://user:pass@host:port/db"
export INANBETEC_API_URL="https://api.inanbetec.com.br"
export VOLUMETRIA_API_URL="https://api.volumetria.com.br"
export VOLUMETRIA_API_TOKEN="seu_token"
```

### 3. Deploy Rápido
```bash
# Clone e entre na pasta
cd lambda/

# Deploy todas as Lambdas
./deploy-all.sh
```

### 4. Configurar Triggers
```bash
# Configurar execução automática
./setup-triggers.sh
```

## 📊 Funcionalidades Principais

### 🔄 Sincronização CNPJ
- **Bidirecional**: InAnbetec ↔ Omie
- **Validação**: Verifica CNPJs antes de criar
- **Batch Processing**: Processa lotes de clientes
- **Error Handling**: Tratamento robusto de erros

### 📈 Processamento Volumetria
- **Coleta Automática**: Dados de cobrança, PIX Pay, etc.
- **Cálculos Inteligentes**: Extração de produtos e valores
- **Consolidação**: Agrupamento por proposta/empresa
- **Persistência**: Armazenamento em MongoDB

### 📄 Criação de Contratos
- **Modelo Omie**: Formatação correta para API
- **Validação**: Verificação de dados antes envio
- **Status Tracking**: Acompanhamento de status
- **Retry Logic**: Reprocessamento em caso de falha

## 🔧 Tecnologias Utilizadas

- **Runtime**: Node.js 18.x
- **Language**: TypeScript
- **Cloud**: AWS Lambda
- **Database**: MongoDB
- **APIs**: Omie, InAnbetec, Volumetria
- **Monitoring**: CloudWatch
- **Triggers**: CloudWatch Events

## 📚 Documentação Detalhada

- [**DEPLOYMENT.md**](./lambda/DEPLOYMENT.md) - Guia completo de deployment
- [**EVENT-TRIGGERS.md**](./lambda/EVENT-TRIGGERS.md) - Configuração de eventos e triggers

## 🎯 Principais Benefícios

### ✅ Escalabilidade
- Cada função escala independentemente
- Sem cold start prolongado
- Processamento paralelo

### ✅ Manutenibilidade  
- Código modular e focado
- Fácil debugging individual
- Deploy independente

### ✅ Custo-Efetivo
- Pagamento por uso real
- Sem recursos ociosos
- Otimização automática

### ✅ Confiabilidade
- Retry automático
- Dead Letter Queue
- Monitoramento detalhado

## 🔍 Monitoramento

### CloudWatch Logs
Cada Lambda gera logs estruturados:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO", 
  "service": "sync-cnpj-inanbetec-to-omie",
  "message": "Cliente criado com sucesso",
  "data": {
    "cnpj": "12345678000195",
    "clienteId": 12345
  }
}
```

### Métricas Importantes
- **Duration**: Tempo de execução
- **Invocations**: Número de execuções  
- **Errors**: Taxa de erro
- **Success Rate**: Taxa de sucesso

## 🛠️ Desenvolvimento

### Estrutura de Código
Cada Lambda segue o padrão:
```typescript
export const handler = async (event, context) => {
  const logger = new LambdaLogger('ServiceName');
  
  try {
    // Lógica de negócio
    logger.log('Processamento iniciado');
    
    // ... código ...
    
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    logger.error('Erro:', error);
    return { statusCode: 500, body: error.message };
  }
};
```

### Shared Utilities
Módulos reutilizáveis em `shared/`:
- **Logger**: Sistema de log padronizado
- **OmieClient**: Cliente HTTP para API Omie
- **MongoDBClient**: Operações de banco
- **Types**: Definições TypeScript

## 🧪 Testes

### Teste Individual
```bash
aws lambda invoke \
  --function-name sync-cnpj-inanbetec-to-omie \
  --payload '{"test": true}' \
  response.json
```

### Teste de Fluxo Completo
```bash
# Executa script de teste integrado
./test-integration.sh
```

## 🔒 Segurança

- **IAM Roles**: Permissões mínimas necessárias
- **Environment Variables**: Secrets protegidos
- **VPC**: Isolamento de rede quando necessário
- **Encryption**: Dados em trânsito e repouso

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique logs no CloudWatch
2. Consulte documentação de deployment
3. Execute testes de diagnóstico
4. Entre em contato com a equipe

---

**Desenvolvido por InAnbetec** - Integração Omie Serverless v1.0
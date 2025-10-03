# Exemplo de Event Triggers e Fluxo de Dados

## Fluxo Completo de Dados

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  CloudWatch     │    │   Fetch          │    │   Process &         │
│  Event (Cron)   │───▶│   Volumetria     │───▶│   Store Data        │
│  Daily 2:00 AM  │    │   Data           │    │                     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Sync CNPJ      │    │   Create Omie    │    │      MongoDB        │
│  (Manual ou     │    │   Contracts      │◀───│    (Storage)        │
│   Scheduled)    │    │                  │    │                     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## 1. Eventos de Entrada

### CloudWatch Event para Volumetria (Diário)
```json
{
  "Rules": [
    {
      "Name": "daily-volumetria-fetch",
      "ScheduleExpression": "cron(0 2 * * ? *)",
      "State": "ENABLED",
      "Targets": [
        {
          "Id": "1",
          "Arn": "arn:aws:lambda:us-east-1:ACCOUNT:function:fetch-volumetria-data",
          "Input": "{\"competencia\": \"auto\", \"trigger\": \"scheduled\"}"
        }
      ]
    }
  ]
}
```

### Manual Trigger via API Gateway
```json
{
  "httpMethod": "POST",
  "path": "/volumetria/process",
  "body": {
    "competencia": "2024-01",
    "empresaId": "12345"
  }
}
```

## 2. Eventos Entre Lambdas

### Fetch Volumetria → Process Data
**Lambda: fetch-volumetria-data**
```typescript
// Ao final do processamento, invoca próxima Lambda
const lambda = new AWS.Lambda();

const params = {
  FunctionName: 'process-and-store-data',
  InvocationType: 'Event', // Assíncrono
  Payload: JSON.stringify({
    volumetriaData: dadosColetados,
    competencia: competencia,
    trigger: 'volumetria-fetch'
  })
};

await lambda.invoke(params).promise();
```

### Process Data → Create Contracts
**Lambda: process-and-store-data**
```typescript
// Após salvar no MongoDB, invoca criação de contratos
const lambda = new AWS.Lambda();

const params = {
  FunctionName: 'create-omie-contracts',
  InvocationType: 'Event',
  Payload: JSON.stringify({
    consolidacaoData: dadosConsolidados,
    trigger: 'data-processed'
  })
};

await lambda.invoke(params).promise();
```

## 3. Configuração de Triggers

### Script de Setup de Triggers
```bash
#!/bin/bash

# 1. Criar regra de CloudWatch para execução diária
aws events put-rule \
  --name daily-volumetria-fetch \
  --schedule-expression "cron(0 2 * * ? *)" \
  --description "Executa fetch de volumetria diariamente às 2h"

# 2. Adicionar target (Lambda)
aws events put-targets \
  --rule daily-volumetria-fetch \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:fetch-volumetria-data","Input"='{"competencia":"auto","trigger":"scheduled"}'

# 3. Dar permissão para CloudWatch invocar a Lambda
aws lambda add-permission \
  --function-name fetch-volumetria-data \
  --statement-id daily-volumetria-trigger \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:us-east-1:ACCOUNT:rule/daily-volumetria-fetch"

# 4. Trigger semanal para sync de CNPJ
aws events put-rule \
  --name weekly-cnpj-sync \
  --schedule-expression "cron(0 1 ? * SUN *)" \
  --description "Sincroniza CNPJ semanalmente aos domingos 1h"

aws events put-targets \
  --rule weekly-cnpj-sync \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:sync-cnpj-inanbetec-to-omie"

aws lambda add-permission \
  --function-name sync-cnpj-inanbetec-to-omie \
  --statement-id weekly-cnpj-trigger \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:us-east-1:ACCOUNT:rule/weekly-cnpj-sync"
```

## 4. Exemplos de Payloads

### Event para Fetch Volumetria
```json
{
  "competencia": "2024-01",
  "empresaIds": [1, 2, 3],
  "trigger": "manual",
  "requestId": "req-123456789"
}
```

### Event para Process Data
```json
{
  "volumetriaData": [
    {
      "idEmpresa": 1,
      "cobranca": {
        "qtdeTitulos": 150,
        "valorTotal": 15000.00
      },
      "pixpay": {
        "qtdeMotoristas": 50,
        "valorTotal": 5000.00
      }
    }
  ],
  "competencia": "2024-01",
  "trigger": "volumetria-fetch"
}
```

### Event para Create Contracts
```json
{
  "consolidacaoData": {
    "competencia": "2024-01",
    "empresaId": "1",
    "numeroProposta": "PROP-2024-001",
    "valorTotal": 20000.00,
    "produtos": [
      {
        "nome": "Cobrança Bancária",
        "quantidade": 150,
        "valor": 15000.00
      },
      {
        "nome": "PIX Pay",
        "quantidade": 50,
        "valor": 5000.00
      }
    ],
    "status": "completed"
  },
  "trigger": "data-processed"
}
```

## 5. Monitoramento de Eventos

### CloudWatch Logs Insights Queries

#### Ver todas as execuções do fluxo
```sql
fields @timestamp, @message
| filter @message like /Iniciando|Finalizando|Erro/
| sort @timestamp desc
| limit 100
```

#### Rastrear um fluxo específico por requestId
```sql
fields @timestamp, @message
| filter @message like /req-123456789/
| sort @timestamp asc
```

#### Monitorar erros no fluxo
```sql
fields @timestamp, @message, @logStream
| filter @message like /ERROR|ERRO|Failed/
| sort @timestamp desc
| limit 50
```

## 6. Dead Letter Queue (DLQ)

### Configurar DLQ para falhas
```bash
# Criar SQS DLQ
aws sqs create-queue \
  --queue-name omie-integration-dlq \
  --attributes VisibilityTimeoutSeconds=300

# Configurar DLQ na Lambda
aws lambda update-function-configuration \
  --function-name fetch-volumetria-data \
  --dead-letter-config TargetArn=arn:aws:sqs:us-east-1:ACCOUNT:omie-integration-dlq
```

## 7. Retry Logic

### Configuração de Retry Automático
```typescript
// Em cada Lambda, implementar retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

async function invokeWithRetry(params: any, retryCount = 0): Promise<any> {
  try {
    return await lambda.invoke(params).promise();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      logger.log(`Retry ${retryCount + 1}/${MAX_RETRIES} após erro:`, error.message);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return invokeWithRetry(params, retryCount + 1);
    }
    throw error;
  }
}
```

## 8. Teste de Integração

### Script de Teste Completo
```bash
#!/bin/bash

echo "🧪 Testando fluxo completo de integração..."

# 1. Testar sync de CNPJ
echo "1. Testando sync CNPJ..."
aws lambda invoke \
  --function-name sync-cnpj-inanbetec-to-omie \
  --payload '{"test": true}' \
  /tmp/sync-response.json

# 2. Testar fetch de volumetria
echo "2. Testando fetch volumetria..."
aws lambda invoke \
  --function-name fetch-volumetria-data \
  --payload '{"competencia": "2024-01", "test": true}' \
  /tmp/fetch-response.json

# 3. Aguardar processamento em cadeia
echo "3. Aguardando processamento em cadeia (30s)..."
sleep 30

# 4. Verificar logs
echo "4. Verificando logs..."
aws logs tail /aws/lambda/process-and-store-data --follow --since 1m

echo "✅ Teste concluído!"
```

---

## Resumo de Configuração

1. **Deploy todas as Lambdas** (ver DEPLOYMENT.md)
2. **Configure variáveis de ambiente**
3. **Execute script de setup de triggers**
4. **Configure DLQ e monitoramento**
5. **Teste o fluxo completo**

O fluxo funcionará automaticamente uma vez configurado, com execução diária da volumetria e sincronização semanal de CNPJs.
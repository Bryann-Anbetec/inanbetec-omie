# Guia de Deployment - AWS Lambda Functions

## Visão Geral
Este projeto contém 5 funções Lambda para integração com Omie API e processamento de dados de volumetria:

1. **sync-cnpj-inanbetec-to-omie** - Sincroniza clientes via CNPJ (InAnbetec → Omie)
2. **sync-cnpj-omie-to-inanbetec** - Sincroniza clientes via CNPJ (Omie → InAnbetec) 
3. **fetch-volumetria-data** - Busca dados de volumetria
4. **process-and-store-data** - Processa volumetria e armazena no MongoDB
5. **create-omie-contracts** - Cria contratos no Omie

## Pré-requisitos

### 1. AWS CLI Configurado
```bash
aws configure
# Insira suas credenciais AWS
```

### 2. Variáveis de Ambiente
Cada Lambda precisa das seguintes variáveis:

```bash
# Omie API
OMIE_APP_KEY=sua_app_key
OMIE_APP_SECRET=sua_app_secret

# MongoDB
MONGODB_URI=mongodb://usuario:senha@host:porta/database

# APIs Externas
INANBETEC_API_URL=https://api.inanbetec.com.br
VOLUMETRIA_API_URL=https://api.volumetria.com.br
VOLUMETRIA_API_TOKEN=seu_token
```

## Deploy Individual

### 1. Build e Package
Para cada Lambda:

```bash
cd lambda/[nome-da-funcao]
npm install
npm run build
npm run package
```

### 2. Deploy via AWS CLI

#### Criar a função (primeira vez):
```bash
aws lambda create-function \
  --function-name sync-cnpj-inanbetec-to-omie \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 512
```

#### Atualizar código:
```bash
npm run deploy
```

### 3. Configurar Variáveis de Ambiente
```bash
aws lambda update-function-configuration \
  --function-name sync-cnpj-inanbetec-to-omie \
  --environment Variables='{
    "OMIE_APP_KEY":"sua_key",
    "OMIE_APP_SECRET":"sua_secret",
    "MONGODB_URI":"sua_uri"
  }'
```

## Deploy Automatizado

### Script de Deploy Completo
```bash
#!/bin/bash

# Lista de funções
FUNCTIONS=(
  "sync-cnpj-inanbetec-to-omie"
  "sync-cnpj-omie-to-inanbetec" 
  "fetch-volumetria-data"
  "process-and-store-data"
  "create-omie-contracts"
)

# Role ARN (substitua pelo seu)
ROLE_ARN="arn:aws:iam::ACCOUNT:role/lambda-execution-role"

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying $func..."
  
  cd "lambda/$func"
  
  # Build and package
  npm install
  npm run build
  npm run package
  
  # Verificar se função existe
  if aws lambda get-function --function-name "$func" 2>/dev/null; then
    # Atualizar código
    aws lambda update-function-code \
      --function-name "$func" \
      --zip-file fileb://function.zip
  else
    # Criar função
    aws lambda create-function \
      --function-name "$func" \
      --runtime nodejs18.x \
      --role "$ROLE_ARN" \
      --handler index.handler \
      --zip-file fileb://function.zip \
      --timeout 300 \
      --memory-size 512
  fi
  
  # Configurar variáveis de ambiente
  aws lambda update-function-configuration \
    --function-name "$func" \
    --environment Variables='{
      "OMIE_APP_KEY":"'$OMIE_APP_KEY'",
      "OMIE_APP_SECRET":"'$OMIE_APP_SECRET'",
      "MONGODB_URI":"'$MONGODB_URI'",
      "INANBETEC_API_URL":"'$INANBETEC_API_URL'",
      "VOLUMETRIA_API_URL":"'$VOLUMETRIA_API_URL'",
      "VOLUMETRIA_API_TOKEN":"'$VOLUMETRIA_API_TOKEN'"
    }'
  
  cd ../..
  echo "✅ $func deployed successfully"
done
```

## Configuração de Permissões

### IAM Role para Lambda
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow", 
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:*:*:function:*"
    }
  ]
}
```

## Triggers e Eventos

### 1. CloudWatch Events (Cron)
Para executar sincronização diária:

```bash
# Criar regra
aws events put-rule \
  --name daily-sync-cnpj \
  --schedule-expression "cron(0 2 * * ? *)"

# Adicionar target
aws events put-targets \
  --rule daily-sync-cnpj \
  --targets "Id"="1","Arn"="arn:aws:lambda:region:account:function:sync-cnpj-inanbetec-to-omie"

# Dar permissão
aws lambda add-permission \
  --function-name sync-cnpj-inanbetec-to-omie \
  --statement-id daily-sync \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:region:account:rule/daily-sync-cnpj"
```

### 2. Manual Invocation
```bash
# Testar função
aws lambda invoke \
  --function-name sync-cnpj-inanbetec-to-omie \
  --payload '{"test": true}' \
  response.json

cat response.json
```

### 3. API Gateway (Opcional)
Para expor via HTTP:

```bash
# Criar API
aws apigatewayv2 create-api \
  --name omie-integration-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:region:account:function:sync-cnpj-inanbetec-to-omie
```

## Monitoramento

### CloudWatch Logs
```bash
# Ver logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/"

# Stream de logs em tempo real
aws logs tail /aws/lambda/sync-cnpj-inanbetec-to-omie --follow
```

### Métricas
- **Duration** - Tempo de execução
- **Errors** - Número de erros
- **Invocations** - Número de invocações
- **Throttles** - Execuções limitadas

## Troubleshooting

### Problemas Comuns

1. **Timeout**
   - Aumentar timeout: `--timeout 900`
   - Otimizar código para execução mais rápida

2. **Memória Insuficiente**
   - Aumentar: `--memory-size 1024`

3. **Permissões**
   - Verificar role IAM
   - Adicionar políticas necessárias

4. **Dependências**
   - Verificar package.json
   - Testar build local

### Logs de Debug
```javascript
// Adicionar em qualquer Lambda para debug
console.log('DEBUG Event:', JSON.stringify(event, null, 2));
console.log('DEBUG Context:', JSON.stringify(context, null, 2));
```

## Estrutura de Pastas Final

```
lambda/
├── shared/
│   ├── types.ts
│   ├── logger.ts
│   ├── omie-client.ts
│   └── mongodb-client.ts
├── sync-cnpj-inanbetec-to-omie/
│   ├── index.ts
│   └── package.json
├── sync-cnpj-omie-to-inanbetec/
│   ├── index.ts
│   └── package.json
├── fetch-volumetria-data/
│   ├── index.ts
│   └── package.json
├── process-and-store-data/
│   ├── index.ts
│   └── package.json
└── create-omie-contracts/
    ├── index.ts
    └── package.json
```

---

**Importante**: Substitua `ACCOUNT`, `region` e outros placeholders pelos valores reais da sua conta AWS.
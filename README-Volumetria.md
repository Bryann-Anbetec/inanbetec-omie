# Integração Volumetria Inanbetec + Omie

## Estrutura dos Dados da Volumetria

### Endpoint de Consulta Volumetria
```
GET https://edi-financeiro.inanbetec.com.br/v1/volumetria/consultar?dataInicial=2025-08-28&dataFinal=2025-08-30&empresas=51
```

### Resposta da API de Volumetria:
```json
[
  {
    "idEmpresa": 51,
    "cobranca": {
      "qtdeTitulos": 1000,
      "valorTotal": 5974258.470000001,
      "quantidade": null,
      "error": null
    },
    "pixpay": {
      "qtdeTitulos": null,
      "valorTotal": null,
      "quantidade": null,
      "qtdeMotoristas": 0,
      "error": null
    }
  }
]
```

## Campos Identificados na Volumetria

### Estrutura Principal:
- **idEmpresa**: ID da empresa no sistema Inanbetec
- **cobranca**: Dados do serviço de cobrança
  - `qtdeTitulos`: Quantidade de títulos processados
  - `valorTotal`: Valor total do serviço de cobrança
  - `quantidade`: Campo adicional (pode ser nulo)
  - `error`: Indicador de erro (nulo quando ok)
- **pixpay**: Dados do serviço PixPay
  - `qtdeTitulos`: Títulos PixPay (pode ser nulo)
  - `valorTotal`: Valor total PixPay (pode ser nulo)
  - `quantidade`: Quantidade adicional (pode ser nulo)
  - `qtdeMotoristas`: Quantidade de motoristas atendidos
  - `error`: Indicador de erro (nulo quando ok)

## Mapeamento para Contrato Omie

### Estrutura do Contrato Gerado:
```json
{
  "cCodIntCtr": "VOL_51_1757422422422",
  "cNumCtr": "",
  "nCodCli": 51,
  "cCodSit": "10",
  "dVigInicial": "09/09/2025",
  "dVigFinal": "09/09/2026",
  "nDiaFat": 30,
  "nValTotMes": 5974258.470000001,
  "cTipoFat": "01",
  "itensContrato": [
    {
      "codIntItem": "COBRANCA_51",
      "codServico": 1001,
      "natOperacao": "01",
      "codServMunic": "1401",
      "codLC116": "1401",
      "quant": 1000,
      "valorUnit": 5974.258470000001,
      "valorTotal": 5974258.470000001,
      "descrCompleta": "Serviço de cobrança - 1000 títulos",
      "aliqISS": 5
    }
  ],
  "infAdic": {
    "cCidPrestServ": "",
    "cCodCateg": "",
    "nCodCC": 0,
    "nCodProj": 0,
    "nCodVend": 0
  },
  "vencTextos": {
    "cTpVenc": "001",
    "nDias": 30,
    "cProxMes": "N",
    "cAdContrato": "N"
  }
}
```

## Novos Endpoints Disponíveis

### 1. Criar Contrato Baseado em Volumetria
```http
POST /contratos/volumetria
Content-Type: application/json

{
  "empresaId": 51,
  "dataInicial": "2025-08-28",
  "dataFinal": "2025-08-30",
  "dadosEmpresa": {
    "cidade": "São Paulo",
    "categoria": "SERVICOS_TI",
    "centroCusto": 1001,
    "projeto": 2001,
    "vendedor": 123,
    "diaFaturamento": 30,
    "diasVencimento": 30
  }
}
```

### 2. Consultar Dados de Volumetria
```http
GET /volumetria/51?dataInicial=2025-08-28&dataFinal=2025-08-30
```

**Resposta:**
```json
{
  "success": true,
  "volumetria": [...],
  "servicos": [...],
  "contratoMapeado": {...}
}
```

## Endpoints da API Inanbetec Analisados

### Endpoints Funcionais:
✅ `/volumetria/consultar` - Retorna dados de volumetria  
✅ `/volumetria/servicos/{id}` - Retorna array vazio (empresa sem serviços cadastrados)

### Endpoints com Restrições:
❌ `/volumetria/relatorios` - Retorna erro 400 (possível necessidade de autenticação)  
❌ `/volumetria/subservicos/{config}` - Não testado (requer parâmetro config)

### Endpoints de Cadastro (POST):
- `/volumetria/servicos` - Inserir dados de serviço
- `/volumetria/subservicos` - Inserir dados de subserviço  
- `/volumetria/register` - Registros (GET/POST/PUT)

## Códigos de Serviço Utilizados

### Mapeamento de Serviços:
- **Cobrança**: Código 1001
  - Código Municipal: 1401
  - Código LC116: 1401
  - Alíquota ISS: 5%

- **PixPay**: Código 1002
  - Código Municipal: 1402
  - Código LC116: 1402
  - Alíquota ISS: 5%

## Exemplo de Uso Completo

```javascript
// 1. Consultar volumetria e criar contrato
const event = {
  httpMethod: 'POST',
  path: '/contratos/volumetria',
  body: JSON.stringify({
    empresaId: 51,
    dataInicial: '2025-08-28',
    dataFinal: '2025-08-30',
    dadosEmpresa: {
      cidade: 'São Paulo',
      vendedor: 123,
      diaFaturamento: 30
    }
  })
};

const result = await exports.handler(event, {});

// 2. Apenas consultar dados de volumetria
const consultaEvent = {
  httpMethod: 'GET',
  path: '/volumetria/51',
  queryStringParameters: {
    dataInicial: '2025-08-28',
    dataFinal: '2025-08-30'
  }
};

const consultaResult = await exports.handler(consultaEvent, {});
```

## Campos Customizáveis

### dadosEmpresa (opcional):
- `cidade`: Cidade de prestação de serviço
- `categoria`: Categoria do serviço  
- `centroCusto`: Código do centro de custo
- `projeto`: Código do projeto
- `vendedor`: Código do vendedor
- `diaFaturamento`: Dia do mês para faturamento (padrão: 30)
- `diasVencimento`: Dias para vencimento (padrão: 30)

### Campos Gerados Automaticamente:
- `cCodIntCtr`: Código de integração único (VOL_{empresaId}_{timestamp})
- `dVigInicial`: Data atual
- `dVigFinal`: Data atual + 1 ano
- `nValTotMes`: Soma dos valores de cobrança + pixpay
- `itensContrato`: Gerados baseados nos serviços com volumetria > 0

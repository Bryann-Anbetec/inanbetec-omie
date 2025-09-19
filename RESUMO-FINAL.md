# RESUMO COMPLETO - Campos da Volumetria Inanbetec para Contratos Omie

## 📋 Campos Identificados na API de Volumetria

### ✅ Endpoint Principal Funcional:
```
GET https://edi-financeiro.inanbetec.com.br/v1/volumetria/consultar
Parâmetros: dataInicial, dataFinal, empresas
```

### 📊 Estrutura de Dados Retornada:

```json
{
  "idEmpresa": 51,
  "cobranca": {
    "qtdeTitulos": 1000,           // ← CAMPO CHAVE para quantidade
    "valorTotal": 5974258.47,      // ← CAMPO CHAVE para valor
    "quantidade": null,            // Campo adicional (pode ser nulo)
    "error": null                  // Indicador de erro
  },
  "pixpay": {
    "qtdeTitulos": null,           // Títulos PixPay
    "valorTotal": null,            // Valor total PixPay
    "quantidade": null,            // Quantidade adicional
    "qtdeMotoristas": 0,          // ← CAMPO CHAVE para PixPay
    "error": null                 // Indicador de erro
  }
}
```

## 🔄 Mapeamento Automático para Omie

### Campos Gerados Automaticamente:
| Campo Omie | Origem | Descrição |
|------------|--------|-----------|
| `cCodIntCtr` | Gerado | VOL_{empresaId}_{timestamp} |
| `nCodCli` | `idEmpresa` | ID da empresa como cliente |
| `nValTotMes` | `valorTotal cobrança + pixpay` | Valor mensal total |
| `dVigInicial` | Data atual | Data de início do contrato |
| `dVigFinal` | Data atual + 1 ano | Data de fim do contrato |

### Itens de Contrato Criados:
1. **Serviço de Cobrança** (se qtdeTitulos > 0):
   - Quantidade: `cobranca.qtdeTitulos`
   - Valor Unitário: `valorTotal / qtdeTitulos`
   - Valor Total: `cobranca.valorTotal`

2. **Serviço PixPay** (se qtdeMotoristas > 0):
   - Quantidade: `pixpay.qtdeMotoristas`
   - Valor Total: `pixpay.valorTotal`

## 🆕 Novos Endpoints Criados

### 1. Consultar Volumetria + Mapear para Omie
```http
GET /volumetria/{empresaId}?dataInicial=2025-08-28&dataFinal=2025-08-30
```

**Resposta:**
```json
{
  "success": true,
  "volumetria": [...],           // Dados originais da volumetria
  "servicos": [...],             // Serviços da empresa
  "contratoMapeado": {...}       // Contrato já mapeado para Omie
}
```

### 2. Criar Contrato Baseado em Volumetria
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

## 🔧 Personalização Disponível

### Campos `dadosEmpresa` (opcionais):
```javascript
{
  cidade: "São Paulo",           // cCidPrestServ
  categoria: "SERVICOS_TI",      // cCodCateg  
  centroCusto: 1001,            // nCodCC
  projeto: 2001,                // nCodProj
  vendedor: 123,                // nCodVend
  diaFaturamento: 30,           // nDiaFat
  diasVencimento: 30            // nDias (vencTextos)
}
```

## 📋 Exemplo de Uso Prático

```javascript
// 1. Consultar dados de volumetria
const response = await fetch('/volumetria/51?dataInicial=2025-08-28&dataFinal=2025-08-30');
const data = await response.json();

console.log('Empresa:', data.volumetria[0].idEmpresa);
console.log('Títulos de cobrança:', data.volumetria[0].cobranca.qtdeTitulos);
console.log('Valor total:', data.volumetria[0].cobranca.valorTotal);
console.log('Contrato mapeado:', data.contratoMapeado);

// 2. Criar contrato no Omie com dados customizados
const contratoResponse = await fetch('/contratos/volumetria', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
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
});
```

## 🎯 Principais Benefícios

1. **✅ Automação Completa**: Volumetria → Contrato Omie automático
2. **✅ Mapeamento Inteligente**: Detecta serviços ativos e calcula valores
3. **✅ Flexibilidade**: Permite customizar dados da empresa
4. **✅ Validação**: Só cria itens para serviços com volumetria > 0
5. **✅ Rastreabilidade**: Código de integração único para cada contrato

## 📁 Arquivos Criados

1. **`index.js`** - Arquivo principal com integração completa
2. **`volumetria-mapper.js`** - Mapeador independente para análise
3. **`test-volumetria.js`** - Testes e exemplos de uso
4. **`README-Volumetria.md`** - Documentação detalhada

## 🔍 Próximos Passos

1. **Configurar Chaves Omie**: Definir `OMIE_APP_KEY` e `OMIE_APP_SECRET`
2. **Testar Criação**: Executar POST para criar contrato real
3. **Customizar Códigos**: Ajustar códigos de serviço conforme necessário
4. **Implementar Logs**: Adicionar logging para auditoria

## 💡 Campos Analisados nos Endpoints Inanbetec

### ✅ Funcionais:
- `/volumetria/consultar` - **Dados completos de volumetria**
- `/volumetria/servicos/{id}` - **Lista de serviços** (vazio para empresa 51)

### ⚠️ Com Restrições:
- `/volumetria/relatorios` - Requer autenticação adicional
- `/volumetria/subservicos/{config}` - Requer parâmetro específico

### 📝 Para Cadastro:
- `POST /volumetria/servicos` - Inserir novos serviços
- `POST /volumetria/subservicos` - Inserir subserviços
- `GET/POST/PUT /volumetria/register` - Gestão de registros

---

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA**  
**Testado**: ✅ **Consulta funcionando**  
**Pronto para**: 🚀 **Uso em produção** (após configurar chaves Omie)

/**
 * TIPOS COMPARTILHADOS PARA LAMBDAS
 * Definições de tipos usadas em todas as funções Lambda
 */

// Configuração de empresa
export interface EmpresaConfig {
  empresaId: number;
  codigoClienteOmie: number;
  configuracao: {
    tipoFaturamento: string;
    vigenciaInicial: string;
    vigenciaFinal: string;
    diaFaturamento: number;
  };
}

// Dados de volumetria
export interface VolumetriaData {
  idEmpresa: number;
  cobranca?: {
    qtdeTitulos: number;
    valorTotal: number;
  };
  pixpay?: {
    qtdeMotoristas: number;
    valorTotal?: number;
  };
  bolepix?: {
    qtdeTitulos: number;
    valorTotal: number;
  };
  webcheckout?: {
    qtdeTitulos: number;
    valorTotal: number;
  };
  pagamentos?: {
    qtdeTitulos: number;
    valorTotal: number;
  };
}

// Produto processado
export interface Produto {
  nome: string;
  valor: number;
  quantidade: number;
}

// Proposta consolidada
export interface PropostaConsolidada {
  numeroProposta: string;
  valorTotal: number;
  produtos: Produto[];
}

// Produto para consolidação
export interface ProdutoConsolidacao {
  nome: string;
  quantidade: number;
  valor: number;
}

// Dados de consolidação para persistir
export interface ConsolidacaoData {
  _id?: string;
  competencia: string;
  empresaId: string;
  numeroProposta: string;
  valorTotal: number;
  status: 'processing' | 'completed' | 'sent' | 'error';
  produtos: ProdutoConsolidacao[];
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

// Modelo de contrato Omie
export interface ContratoOmie {
  cabecalho: {
    cCodIntCtr: string;
    cNumCtr: string;
    cCodSit: string;
    cTipoFat: string;
    dVigInicial: string;
    dVigFinal: string;
    nCodCli: number;
    nDiaFat: number;
    nValTotMes: number;
  };
  itensContrato: ItemContrato[];
  observacoes: {
    cObsContrato: string;
  };
  infAdic: {
    cCodCateg: string;
    nCodCC: number;
  };
  vencTextos: {
    cAdContrato: string;
    cAdPeriodo: string;
    cAdVenc: string;
    cAntecipar: string;
    cCodPerRef: string;
    cDiaFim: number;
    cDiaIni: number;
    cPostergar: string;
    cProxMes: string;
    cTpVenc: string;
    nDias: number;
    nDiaFixo: number;
  };
  departamentos: Departamento[];
  emailCliente: {
    cEnviarBoleto: string;
    cEnviarLinkNfse: string;
    cEnviarRecibo: string;
    cUtilizarEmails: string;
  };
}

// Item de contrato
export interface ItemContrato {
  itemCabecalho: {
    aliqDesconto: number;
    cCodCategItem: string;
    cNaoGerarFinanceiro: string;
    cTpDesconto: string;
    codIntItem: string;
    codLC116: string;
    codNBS: string;
    codServMunic: string;
    codServico: number;
    natOperacao: string;
    quant: number;
    seq: number;
    valorAcrescimo: number;
    valorDed: number;
    valorDesconto: number;
    valorOutrasRetencoes: number;
    valorTotal: number;
    valorUnit: number;
  };
  itemDescrServ: {
    descrCompleta: string;
  };
  itemImpostos: {
    aliqCOFINS: number;
    aliqCSLL: number;
    aliqINSS: number;
    aliqIR: number;
    aliqISS: number;
    aliqPIS: number;
    lDeduzISS: boolean;
    redBaseCOFINS: number;
    redBaseINSS: number;
    redBasePIS: number;
    retCOFINS: string;
    retCSLL: string;
    retINSS: string;
    retIR: string;
    retISS: string;
    retPIS: string;
    valorCOFINS: number;
    valorCSLL: number;
    valorINSS: number;
    valorIR: number;
    valorISS: number;
    valorPIS: number;
  };
  itemLeiTranspImp: {
    aliMunicipal: number;
    aliqEstadual: number;
    aliqFederal: number;
    chave: string;
    fonte: string;
  };
}

// Departamento
export interface Departamento {
  cCodDep: string;
  cDesDep: string;
  nPerDep: number;
  nValDep: number;
}

// Resposta da API Omie
export interface OmieResponse {
  cCodStatus: string;
  cDescStatus: string;
  nCodCtr?: number;
  cCodIntCtr?: string;
}

// Event types para as Lambdas
export interface SyncCnpjEvent {
  empresaIds?: number[];
  direction: 'inanbetec-to-omie' | 'omie-to-inanbetec';
}

export interface FetchVolumetriaEvent {
  competencia: string; // YYYY-MM
  empresaId: number;
  dataInicial: string;
  dataFinal: string;
}

export interface ProcessDataEvent {
  volumetriaData: VolumetriaData[];
  competencia: string;
  empresaId: number;
}

export interface CreateContractEvent {
  consolidacaoData: ConsolidacaoData;
  empresaConfig: EmpresaConfig;
}

// Lambda Response types
export interface LambdaResponse {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}

export interface LambdaContext {
  requestId: string;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis(): number;
}
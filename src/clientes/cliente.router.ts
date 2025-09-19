import { Router } from "express";
import empresaMiddleware from "../empresas/empresa.middleware";

import ClienteController from "./cliente.controller";

const ClienteRouter = Router();

// Rotas principais de integração
ClienteRouter.route("/cadastrar")
  .post(
    empresaMiddleware.verificaDuplicidadeCnpj, 
    ClienteController.cadastrar
  );

ClienteRouter.route("/alterar/:id")
  .put(ClienteController.alterar);

// Rotas de sincronização
ClienteRouter.route("/sincronizar")
  .post(ClienteController.sincronizar);

// Rotas de consulta ao Omie
ClienteRouter.route("/omie/consultar/:cnpj")
  .get(ClienteController.consultarOmie);

ClienteRouter.route("/omie/listar")
  .get(ClienteController.listarOmie);

export default ClienteRouter;

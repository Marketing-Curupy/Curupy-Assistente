/* =========================================================
   ACQUA — COMUNICAÇÃO COM A PLANILHA
   ========================================================= */

import { CONFIG } from "./config.js";


/* =========================================================
   CARREGAR BASE DE CONHECIMENTO
   ========================================================= */

export async function carregarBaseConhecimento() {
  const dadosEmCache = obterCacheValido();

  try {
    const resposta = await buscarComTempoLimite(
      CONFIG.apiUrl,
      CONFIG.tempoLimiteApi
    );

    if (!resposta.ok) {
      throw new Error(
        `A planilha respondeu com o status ${resposta.status}.`
      );
    }

    const dados = await resposta.json();

    validarBaseConhecimento(dados);

    salvarCache(dados);

    return {
      dados,
      origem: "planilha"
    };
  } catch (erro) {
    console.error(
      "Acqua: não foi possível carregar a planilha.",
      erro
    );

    if (dadosEmCache) {
      console.warn(
        "Acqua: utilizando a última versão salva no navegador."
      );

      return {
        dados: dadosEmCache,
        origem: "cache"
      };
    }

    throw new Error(
      "Não foi possível carregar a base de conhecimento."
    );
  }
}


/* =========================================================
   FETCH COM TEMPO LIMITE
   ========================================================= */

async function buscarComTempoLimite(url, tempoLimite) {
  const controlador = new AbortController();

  const temporizador = window.setTimeout(
    () => controlador.abort(),
    tempoLimite
  );

  try {
    return await fetch(url, {
      method: "GET",

      cache: "no-store",

      signal: controlador.signal,

      headers: {
        Accept: "application/json"
      }
    });
  } finally {
    window.clearTimeout(temporizador);
  }
}


/* =========================================================
   VALIDAÇÃO DA RESPOSTA
   ========================================================= */

function validarBaseConhecimento(dados) {
  if (
    !dados ||
    typeof dados !== "object" ||
    Array.isArray(dados)
  ) {
    throw new Error(
      "A resposta da planilha não possui um formato válido."
    );
  }

  if (!Array.isArray(dados.intencoes)) {
    throw new Error(
      "A aba INTENCOES não foi encontrada ou está inválida."
    );
  }

  if (!dados.configuracoes) {
    dados.configuracoes = {};
  }

  if (!Array.isArray(dados.fluxoInicial)) {
    dados.fluxoInicial = [];
  }

  if (!Array.isArray(dados.contatos)) {
    dados.contatos = [];
  }

  if (!Array.isArray(dados.funcionamento)) {
    dados.funcionamento = [];
  }

  if (!dados.hospedagem) {
    dados.hospedagem = {};
  }

  if (!dados.bangalo) {
    dados.bangalo = {};
  }

  if (!dados.quiosque) {
    dados.quiosque = {};
  }
}


/* =========================================================
   CACHE LOCAL
   ========================================================= */

function salvarCache(dados) {
  try {
    const conteudo = {
      salvoEm: Date.now(),
      dados
    };

    localStorage.setItem(
      CONFIG.cache.chave,
      JSON.stringify(conteudo)
    );
  } catch (erro) {
    console.warn(
      "Acqua: não foi possível salvar o cache.",
      erro
    );
  }
}


function obterCacheValido() {
  try {
    const conteudoSalvo = localStorage.getItem(
      CONFIG.cache.chave
    );

    if (!conteudoSalvo) {
      return null;
    }

    const cache = JSON.parse(conteudoSalvo);

    if (
      !cache ||
      !cache.salvoEm ||
      !cache.dados
    ) {
      limparCache();
      return null;
    }

    const validadeEmMilissegundos =
      CONFIG.cache.validadeMinutos *
      60 *
      1000;

    const cacheExpirou =
      Date.now() - cache.salvoEm >
      validadeEmMilissegundos;

    if (cacheExpirou) {
      limparCache();
      return null;
    }

    return cache.dados;
  } catch (erro) {
    console.warn(
      "Acqua: o cache salvo está inválido.",
      erro
    );

    limparCache();

    return null;
  }
}


export function limparCache() {
  try {
    localStorage.removeItem(
      CONFIG.cache.chave
    );
  } catch (erro) {
    console.warn(
      "Acqua: não foi possível limpar o cache.",
      erro
    );
  }
}

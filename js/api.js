/* =========================================================
   ACQUA
   COMUNICAÇÃO COM A PLANILHA
   ========================================================= */

import { CONFIG } from "./config.js";

import {
    limparTexto,
    objetoValido
} from "./utils.js";


/* =========================================================
   CARREGAR BASE DE CONHECIMENTO
   ========================================================= */

export async function carregarBaseConhecimento() {
    validarConfiguracaoApi();

    const dadosEmCache =
        obterCacheValido();

    try {
        const resposta =
            await buscarComTempoLimite(
                CONFIG.apiUrl,
                CONFIG.tempoLimiteApi
            );

        if (!resposta.ok) {
            throw new Error(
                `A planilha respondeu com o status ${resposta.status}.`
            );
        }

        const dados =
            await lerRespostaJson(
                resposta
            );

        const baseNormalizada =
            normalizarBaseConhecimento(
                dados
            );

        salvarCache(
            baseNormalizada
        );

        return {
            dados:
                baseNormalizada,

            origem:
                "planilha"
        };
    } catch (erro) {
        console.error(
            "Acqua: não foi possível carregar a planilha.",
            erro
        );

        if (dadosEmCache) {
            console.warn(
                "Acqua: utilizando a última versão válida salva no navegador."
            );

            return {
                dados:
                    dadosEmCache,

                origem:
                    "cache"
            };
        }

        throw criarErroCarregamento(
            erro
        );
    }
}


/* =========================================================
   VALIDAR CONFIGURAÇÃO
   ========================================================= */

function validarConfiguracaoApi() {
    const apiUrl =
        limparTexto(
            CONFIG?.apiUrl
        );

    if (!apiUrl) {
        throw new Error(
            "A URL da API não foi configurada em config.js."
        );
    }

    if (
        !/^https?:\/\//i.test(
            apiUrl
        )
    ) {
        throw new Error(
            "A URL da API configurada é inválida."
        );
    }

    const tempoLimite =
        obterTempoLimite();

    if (
        !Number.isFinite(
            tempoLimite
        ) ||
        tempoLimite <= 0
    ) {
        throw new Error(
            "O tempo limite da API configurado é inválido."
        );
    }
}


/* =========================================================
   FETCH COM TEMPO LIMITE
   ========================================================= */

async function buscarComTempoLimite(
    url,
    tempoLimite
) {
    const controlador =
        new AbortController();

    const temporizador =
        window.setTimeout(
            () => {
                controlador.abort();
            },
            obterTempoLimite(
                tempoLimite
            )
        );

    try {
        return await fetch(
            url,
            {
                method:
                    "GET",

                cache:
                    "no-store",

                signal:
                    controlador.signal,

                headers: {
                    Accept:
                        "application/json"
                }
            }
        );
    } catch (erro) {
        if (
            erro?.name ===
            "AbortError"
        ) {
            throw new Error(
                "A planilha demorou demais para responder."
            );
        }

        throw erro;
    } finally {
        window.clearTimeout(
            temporizador
        );
    }
}


function obterTempoLimite(
    valor = CONFIG?.tempoLimiteApi
) {
    const tempo =
        Number(valor);

    if (
        Number.isFinite(tempo) &&
        tempo > 0
    ) {
        return tempo;
    }

    return 10000;
}


/* =========================================================
   LEITURA DA RESPOSTA
   ========================================================= */

async function lerRespostaJson(
    resposta
) {
    const tipoConteudo =
        resposta.headers
            ?.get("content-type") ||
        "";

    if (
        tipoConteudo &&
        !tipoConteudo
            .toLowerCase()
            .includes(
                "application/json"
            )
    ) {
        const conteudo =
            await resposta.text();

        console.warn(
            "Acqua: a API não retornou application/json.",
            conteudo.slice(0, 300)
        );

        throw new Error(
            "A planilha retornou uma resposta em formato inesperado."
        );
    }

    try {
        return await resposta.json();
    } catch (erro) {
        throw new Error(
            "Não foi possível interpretar os dados retornados pela planilha."
        );
    }
}


/* =========================================================
   VALIDAÇÃO E NORMALIZAÇÃO
   ========================================================= */

function normalizarBaseConhecimento(
    dados
) {
    if (
        !objetoValido(dados)
    ) {
        throw new Error(
            "A resposta da planilha não possui um formato válido."
        );
    }

    if (
        !Array.isArray(
            dados.intencoes
        )
    ) {
        throw new Error(
            "A aba INTENCOES não foi encontrada ou está inválida."
        );
    }

    const intencoes =
        dados.intencoes
            .filter(item => {
                return objetoValido(item);
            });

    if (
        intencoes.length === 0
    ) {
        console.warn(
            "Acqua: nenhuma intenção válida foi encontrada."
        );
    }

    return {
        ...dados,

        intencoes,

        configuracoes:
            normalizarConfiguracoes(
                dados.configuracoes
            ),

        fluxoInicial:
            normalizarLista(
                dados.fluxoInicial
            ),

        contatos:
            normalizarLista(
                dados.contatos
            ),

        funcionamento:
            normalizarLista(
                dados.funcionamento
            ),

        hospedagem:
            normalizarObjeto(
                dados.hospedagem
            ),

        bangalo:
            normalizarObjeto(
                dados.bangalo
            ),

        quiosque:
            normalizarObjeto(
                dados.quiosque
            )
    };
}


function normalizarConfiguracoes(
    configuracoes
) {
    if (
        Array.isArray(
            configuracoes
        )
    ) {
        return configuracoes.filter(
            item => objetoValido(item)
        );
    }

    if (
        objetoValido(
            configuracoes
        )
    ) {
        return configuracoes;
    }

    return {};
}


function normalizarLista(
    valor
) {
    if (
        !Array.isArray(valor)
    ) {
        return [];
    }

    return valor.filter(
        item => {
            return (
                objetoValido(item) ||
                typeof item === "string"
            );
        }
    );
}


function normalizarObjeto(
    valor
) {
    return objetoValido(valor)
        ? valor
        : {};
}


/* =========================================================
   CACHE LOCAL
   ========================================================= */

function salvarCache(
    dados
) {
    if (
        !cacheEstaConfigurado()
    ) {
        return;
    }

    try {
        const conteudo = {
            versao:
                1,

            salvoEm:
                Date.now(),

            dados
        };

        localStorage.setItem(
            CONFIG.cache.chave,
            JSON.stringify(
                conteudo
            )
        );
    } catch (erro) {
        console.warn(
            "Acqua: não foi possível salvar o cache.",
            erro
        );
    }
}


function obterCacheValido() {
    if (
        !cacheEstaConfigurado()
    ) {
        return null;
    }

    try {
        const conteudoSalvo =
            localStorage.getItem(
                CONFIG.cache.chave
            );

        if (!conteudoSalvo) {
            return null;
        }

        const cache =
            JSON.parse(
                conteudoSalvo
            );

        if (
            !objetoValido(cache) ||
            !cache.salvoEm ||
            !objetoValido(cache.dados)
        ) {
            limparCache();

            return null;
        }

        const validade =
            obterValidadeCache();

        const cacheExpirou =
            Date.now() -
            Number(cache.salvoEm) >
            validade;

        if (cacheExpirou) {
            limparCache();

            return null;
        }

        try {
            return normalizarBaseConhecimento(
                cache.dados
            );
        } catch (erro) {
            console.warn(
                "Acqua: a base armazenada no cache está inválida.",
                erro
            );

            limparCache();

            return null;
        }
    } catch (erro) {
        console.warn(
            "Acqua: o cache salvo está inválido.",
            erro
        );

        limparCache();

        return null;
    }
}


function obterValidadeCache() {
    const minutos =
        Number(
            CONFIG?.cache
                ?.validadeMinutos
        );

    const validadeMinutos =
        Number.isFinite(minutos) &&
        minutos > 0
            ? minutos
            : 60;

    return (
        validadeMinutos *
        60 *
        1000
    );
}


function cacheEstaConfigurado() {
    return Boolean(
        limparTexto(
            CONFIG?.cache?.chave
        )
    );
}


/* =========================================================
   LIMPAR CACHE
   ========================================================= */

export function limparCache() {
    if (
        !cacheEstaConfigurado()
    ) {
        return;
    }

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


/* =========================================================
   CONSULTAR CACHE
   ========================================================= */

export function existeCacheValido() {
    return Boolean(
        obterCacheValido()
    );
}


/* =========================================================
   ERRO DE CARREGAMENTO
   ========================================================= */

function criarErroCarregamento(
    erro
) {
    const mensagemOriginal =
        limparTexto(
            erro?.message
        );

    const erroFinal =
        new Error(
            mensagemOriginal ||
            "Não foi possível carregar a base de conhecimento."
        );

    erroFinal.cause =
        erro;

    return erroFinal;
}

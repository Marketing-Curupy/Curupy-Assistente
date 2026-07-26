/* =========================================================
   ACQUA
   CONTROLE DA CONVERSA
   ========================================================= */

import { CONFIG } from "./config.js";

import {
    encontrarIntencao,
    extrairPrimeiroNome,
    nomePareceValido,
    substituirVariaveis
} from "./intents.js";

import {
    processarFluxo,
    obterMenuPrincipal
} from "./flows.js";

import {
    adicionarMensagemAssistente,
    adicionarMensagemUsuario,
    atualizarSugestoes,
    bloquearCampo,
    limparCampo,
    limparMensagens,
    limparSugestoes,
    mostrarDigitando,
    removerDigitando,
    focarCampo
} from "./ui.js";

import {
    adicionarMensagem as adicionarMensagemAoStorage,
    obterHistorico as obterHistoricoDoStorage,
    limparHistorico,
    atualizarContexto,
    obterTodosContextos,
    limparContexto,
    definirVisitante,
    obterVisitante,
    definirConversaIniciada,
    conversaFoiIniciada as storageConversaFoiIniciada,
    limparEstado
} from "./storage.js";

import {
    esperar,
    limparTexto
} from "./utils.js";

/* =========================================================
   ESTADO LOCAL
   ========================================================= */

const estado = {
    processando: false,
    aguardandoNome: false,

    base: {
        intencoes: [],
        configuracoes: {},
        fluxoInicial: [],
        contatos: [],
        funcionamento: [],
        hospedagem: {},
        bangalo: {},
        quiosque: {}
    }
};

/* =========================================================
   CONFIGURAR BASE
   ========================================================= */

export function configurarBaseConhecimento(dados = {}) {
    estado.base = {
        ...dados,

        intencoes: Array.isArray(dados?.intencoes)
            ? dados.intencoes
            : [],

        configuracoes: dados?.configuracoes && typeof dados.configuracoes === "object"
            ? dados.configuracoes
            : {},

        fluxoInicial: Array.isArray(dados?.fluxoInicial)
            ? dados.fluxoInicial
            : [],

        contatos: Array.isArray(dados?.contatos)
            ? dados.contatos
            : [],

        funcionamento: Array.isArray(dados?.funcionamento)
            ? dados.funcionamento
            : [],

        hospedagem: dados?.hospedagem && typeof dados.hospedagem === "object"
            ? dados.hospedagem
            : {},

        bangalo: dados?.bangalo && typeof dados.bangalo === "object"
            ? dados.bangalo
            : {},

        quiosque: dados?.quiosque && typeof dados.quiosque === "object"
            ? dados.quiosque
            : {}
    };

    console.info("Acqua: base configurada para atendimento guiado.", {
        intencoes: estado.base.intencoes.length,
        funcionamento: estado.base.funcionamento.length
    });
}

/* =========================================================
   INICIAR CONVERSA
   ========================================================= */

export async function iniciarConversa() {
    if (estado.processando) return;

    estado.processando = true;
    estado.aguardandoNome = false;

    limparEstado();
    definirConversaIniciada(true);
    limparMensagens();
    limparSugestoes();
    limparCampo();
    bloquearCampo(true);

    try {
        await esperarDigitacao();

        if (obterConfiguracaoBooleana("perguntar_nome", true)) {
            estado.aguardandoNome = true;

            registrarMensagemAssistente(
                obterMensagemFluxo(
                    "PEDIR_NOME",
                    [
                        "Olá! 👋",
                        "Sou o Acqua, assistente virtual do Curupy.",
                        "",
                        "Antes de começarmos, como posso chamar você?"
                    ].join("\n")
                )
            );

            return;
        }

        apresentarMenuInicial();
    } catch (erro) {
        console.error("Acqua: erro ao iniciar conversa.", erro);
        registrarMensagemAssistente(
            "Não consegui iniciar o atendimento agora. Tente novamente em alguns instantes."
        );
    } finally {
        estado.processando = false;
        bloquearCampo(false);
        focarCampo();
    }
}

export async function reiniciarConversa() {
    if (estado.processando) return;

    estado.aguardandoNome = false;
    limparEstado();
    limparMensagens();
    limparSugestoes();
    limparCampo();

    await iniciarConversa();
}

/* =========================================================
   PROCESSAR MENSAGEM
   ========================================================= */

export async function processarMensagem(mensagem) {
    const texto = limparTexto(mensagem);

    if (!texto || estado.processando) return;

    estado.processando = true;
    bloquearCampo(true);
    limparCampo();
    limparSugestoes();
    registrarMensagemUsuario(texto);

    try {
        if (estado.aguardandoNome) {
            await processarNome(texto);
            return;
        }

        await esperarDigitacao();

        const contexto = obterTodosContextos();
        const retornoFluxo = processarFluxo(texto, estado.base, contexto);

        if (retornoFluxo?.tratado) {
            aplicarRetornoFluxo(retornoFluxo);
            return;
        }

        /*
         * Compatibilidade temporária:
         * assuntos ainda não transformados em fluxo continuam
         * usando a base de intenções da planilha.
         */
        const resultado = encontrarIntencao(
            texto,
            estado.base.intencoes,
            contexto
        );

        if (resultado) {
            responderConhecimentoLegado(resultado);
            return;
        }

        responderFallback(texto);
    } catch (erro) {
        console.error("Acqua: erro ao processar mensagem.", erro);
        responderFallback(texto);
    } finally {
        estado.processando = false;
        bloquearCampo(false);
        focarCampo();
    }
}

/* =========================================================
   NOME
   ========================================================= */

async function processarNome(mensagem) {
    await esperarDigitacao();

    if (!nomePareceValido(mensagem)) {
        registrarMensagemAssistente(
            obterConfiguracao(
                "mensagem_nome_invalido",
                "Não consegui identificar seu nome 😊\n\nDigite apenas o seu primeiro nome."
            )
        );

        estado.aguardandoNome = true;
        return;
    }

    const nome = extrairPrimeiroNome(mensagem);

    definirVisitante({ nome });
    estado.aguardandoNome = false;

    const mensagemBoasVindas = substituirVariaveis(
        obterMensagemFluxo(
            "CONFIRMAR_NOME",
            "Prazer, {nome}! 😊\n\nComo posso ajudar você hoje?"
        ),
        obterVariaveis()
    );

    registrarMensagemAssistente(mensagemBoasVindas);
    mostrarMenuInicial();
}

/* =========================================================
   RETORNO DO MOTOR DE FLUXOS
   ========================================================= */

function aplicarRetornoFluxo(retorno) {
    if (retorno?.contexto && typeof retorno.contexto === "object") {
        if (retorno.finalizado) {
            limparContexto();
        }

        atualizarContexto(retorno.contexto);
    }

    const mensagem = substituirVariaveis(
        retorno?.mensagem || "",
        obterVariaveis()
    );

    if (limparTexto(mensagem)) {
        registrarMensagemAssistente(mensagem);
    }

    const sugestoes = prepararSugestoesComVariaveis(retorno?.sugestoes || []);

    atualizarSugestoes(
        sugestoes,
        processarMensagem
    );
}

/* =========================================================
   MENU INICIAL
   ========================================================= */

function apresentarMenuInicial() {
    const mensagem = substituirVariaveis(
        obterMensagemFluxo(
            "APRESENTACAO",
            "Olá! 👋\nSou o Acqua, assistente virtual do Curupy.\n\nComo posso ajudar você hoje?"
        ),
        obterVariaveis()
    );

    registrarMensagemAssistente(mensagem);
    mostrarMenuInicial();
}

function mostrarMenuInicial() {
    atualizarSugestoes(
        prepararMenuPlanilha(),
        processarMensagem
    );
}

function prepararMenuPlanilha() {
    const itemMenu = estado.base.fluxoInicial.find(item => {
        return normalizarIdentificador(item?.id) === "menu_principal";
    });

    const mensagemAcao = limparTexto(
        itemMenu?.mensagem_acao ||
        itemMenu?.mensagem ||
        ""
    );

    const opcoes = mensagemAcao
        .replace(/^\s*exibir\s+os\s+bot[oõ]es\s*:\s*/i, "")
        .split("|")
        .map(limparTexto)
        .filter(Boolean);

    if (opcoes.length === 0) {
        return obterMenuPrincipal();
    }

    return opcoes.map(opcao => ({
        texto: formatarTextoBotao(opcao),
        mensagem: opcao
    }));
}

/* =========================================================
   CONHECIMENTO LEGADO
   ========================================================= */

function responderConhecimentoLegado(resultado) {
    atualizarContexto({
        assunto: resultado?.assunto || "",
        categoria: resultado?.categoria || "",
        intencao: resultado?.intencao || resultado?.id || ""
    });

    const resposta = substituirVariaveis(
        resultado?.resposta || "",
        obterVariaveis()
    );

    if (!limparTexto(resposta)) {
        responderFallback("");
        return;
    }

    registrarMensagemAssistente(resposta);

    const sugestoes = prepararSugestoesComVariaveis(resultado?.sugestoes || []);

    if (sugestoes.length > 0) {
        atualizarSugestoes(sugestoes, processarMensagem);
        return;
    }

    atualizarSugestoes(
        [{ texto: "🏠 Menu principal", mensagem: "Menu principal" }],
        processarMensagem
    );
}

/* =========================================================
   FALLBACK
   ========================================================= */

function responderFallback(mensagemOriginal) {
    const mensagem = substituirVariaveis(
        obterConfiguracao(
            "mensagem_fallback",
            CONFIG?.fallback?.mensagem ||
            "Ainda não consegui entender exatamente essa dúvida. 😊\n\nEscolha um dos assuntos abaixo."
        ),
        obterVariaveis()
    );

    registrarMensagemAssistente(mensagem);

    const sugestoes = obterMenuPrincipal();
    const whatsapp = obterLinkWhatsAppFallback(mensagemOriginal);

    if (whatsapp) {
        sugestoes.push({
            texto: "💬 Falar no WhatsApp",
            link: whatsapp
        });
    }

    atualizarSugestoes(sugestoes, processarMensagem);
}

/* =========================================================
   HISTÓRICO
   ========================================================= */

function registrarMensagemUsuario(mensagem) {
    adicionarMensagemUsuario(mensagem);
    adicionarAoHistorico("usuario", mensagem);
}

function registrarMensagemAssistente(mensagem) {
    adicionarMensagemAssistente(mensagem);
    adicionarAoHistorico("assistente", mensagem);
}

function adicionarAoHistorico(remetente, mensagem) {
    adicionarMensagemAoStorage({
        remetente,
        mensagem: String(mensagem || ""),
        horario: Date.now()
    });

    limitarHistorico();
}

function limitarHistorico() {
    const historico = obterHistoricoDoStorage();
    const limiteConfigurado = Number(CONFIG?.limiteHistorico);
    const limite = Number.isFinite(limiteConfigurado) && limiteConfigurado > 0
        ? limiteConfigurado
        : 50;

    if (historico.length <= limite) return;

    const mantidas = historico.slice(-limite);
    limparHistorico();
    mantidas.forEach(adicionarMensagemAoStorage);
}

export function obterHistorico() {
    return obterHistoricoDoStorage();
}

/* =========================================================
   CONFIGURAÇÕES DA PLANILHA
   ========================================================= */

function obterConfiguracao(chave, valorPadrao = "") {
    const configuracoes = estado.base.configuracoes;

    if (
        configuracoes &&
        !Array.isArray(configuracoes) &&
        typeof configuracoes === "object" &&
        configuracoes[chave] !== undefined
    ) {
        const valor = configuracoes[chave];

        if (valor && typeof valor === "object" && !Array.isArray(valor)) {
            return valor?.valor ?? valor?.conteudo ?? valor?.mensagem ?? valorPadrao;
        }

        return valor;
    }

    if (Array.isArray(configuracoes)) {
        const item = configuracoes.find(config => {
            return (config?.chave || config?.configuracao || config?.nome) === chave;
        });

        if (item) {
            return item?.valor ?? item?.conteudo ?? item?.mensagem ?? valorPadrao;
        }
    }

    return valorPadrao;
}

function obterConfiguracaoBooleana(chave, valorPadrao) {
    const valor = obterConfiguracao(chave, valorPadrao);

    if (typeof valor === "boolean") return valor;

    const texto = limparTexto(valor).toLowerCase();

    if (["sim", "true", "1", "ativo", "ativado"].includes(texto)) return true;
    if (["nao", "não", "false", "0", "inativo", "desativado"].includes(texto)) return false;

    return Boolean(valorPadrao);
}

function obterMensagemFluxo(id, valorPadrao = "") {
    const identificador = normalizarIdentificador(id);
    const item = estado.base.fluxoInicial.find(itemFluxo => {
        return normalizarIdentificador(itemFluxo?.id) === identificador;
    });

    const mensagem = item?.mensagem_acao || item?.mensagem || item?.texto || "";

    return limparTexto(mensagem) ? mensagem : valorPadrao;
}

/* =========================================================
   SUGESTÕES E VARIÁVEIS
   ========================================================= */

function prepararSugestoesComVariaveis(sugestoes) {
    if (!Array.isArray(sugestoes)) return [];

    return sugestoes
        .map(sugestao => {
            const item = typeof sugestao === "string"
                ? { texto: sugestao, mensagem: sugestao }
                : sugestao;

            return {
                ...item,
                texto: substituirVariaveis(item?.texto || "", obterVariaveis()),
                mensagem: substituirVariaveis(item?.mensagem || item?.texto || "", obterVariaveis()),
                link: substituirVariaveis(item?.link || item?.url || "", obterVariaveis())
            };
        })
        .filter(item => limparTexto(item.texto));
}

function obterVariaveis() {
    const visitante = obterVisitante() || {};

    return {
        nome: visitante.nome || "visitante",
        nome_assistente: CONFIG?.nomeAssistente || "Acqua",
        site: CONFIG?.linksEmergencia?.site || "",
        whatsapp: CONFIG?.linksEmergencia?.whatsappGeral || "",
        localizacao: CONFIG?.linksEmergencia?.localizacao || ""
    };
}

/* =========================================================
   DIGITAÇÃO
   ========================================================= */

async function esperarDigitacao() {
    mostrarDigitando();

    const minimoConfigurado = Number(CONFIG?.tempoDigitando?.minimo);
    const maximoConfigurado = Number(CONFIG?.tempoDigitando?.maximo);
    const minimo = Number.isFinite(minimoConfigurado) ? minimoConfigurado : 600;
    const maximo = Number.isFinite(maximoConfigurado)
        ? Math.max(maximoConfigurado, minimo)
        : 1200;
    const duracao = Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;

    try {
        await esperar(duracao);
    } finally {
        removerDigitando();
    }
}

/* =========================================================
   WHATSAPP
   ========================================================= */

function obterLinkWhatsAppFallback(mensagemOriginal) {
    const link = limparTexto(
        obterConfiguracao(
            "whatsapp_geral",
            CONFIG?.linksEmergencia?.whatsappGeral || ""
        )
    );

    if (!link) return "";

    const texto = limparTexto(mensagemOriginal)
        ? `Olá! Preciso de ajuda com esta dúvida: ${limparTexto(mensagemOriginal)}`
        : "Olá! Preciso de ajuda com uma informação do Curupy.";

    if (link.includes("wa.me") || link.includes("api.whatsapp.com")) {
        return `${link}${link.includes("?") ? "&" : "?"}text=${encodeURIComponent(texto)}`;
    }

    return link;
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function normalizarIdentificador(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function formatarTextoBotao(opcao) {
    const texto = limparTexto(opcao);
    const icones = {
        ingressos: "🎟",
        ingresso: "🎟",
        dias_e_horarios: "📅",
        funcionamento: "📅",
        hospedagem: "🏨",
        reservas: "🏨",
        associe_se: "💎",
        socios: "💎",
        regras: "📋",
        regras_do_parque: "📋",
        como_chegar: "📍"
    };

    const icone = icones[normalizarIdentificador(texto)];
    return icone ? `${icone} ${texto}` : texto;
}

/* =========================================================
   CONSULTAS DE ESTADO
   ========================================================= */

export function conversaFoiIniciada() {
    return storageConversaFoiIniciada();
}

export function conversaEstaProcessando() {
    return estado.processando;
}

export function obterEstadoConversa() {
    return {
        iniciado: storageConversaFoiIniciada(),
        processando: estado.processando,
        aguardandoNome: estado.aguardandoNome,
        visitante: { ...(obterVisitante() || { nome: "" }) },
        contexto: { ...obterTodosContextos() }
    };
}

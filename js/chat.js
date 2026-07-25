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

    definirContexto,
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
   ESTADO LOCAL DO CHAT
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
   CONFIGURAR BASE DE CONHECIMENTO
   ========================================================= */

export function configurarBaseConhecimento(dados = {}) {
    estado.base = {
        intencoes:
            Array.isArray(dados?.intencoes)
                ? dados.intencoes
                : [],

        configuracoes:
            dados?.configuracoes &&
            typeof dados.configuracoes === "object"
                ? dados.configuracoes
                : {},

        fluxoInicial:
            Array.isArray(dados?.fluxoInicial)
                ? dados.fluxoInicial
                : [],

        contatos:
            Array.isArray(dados?.contatos)
                ? dados.contatos
                : [],

        funcionamento:
            Array.isArray(dados?.funcionamento)
                ? dados.funcionamento
                : [],

        hospedagem:
            dados?.hospedagem &&
            typeof dados.hospedagem === "object"
                ? dados.hospedagem
                : {},

        bangalo:
            dados?.bangalo &&
            typeof dados.bangalo === "object"
                ? dados.bangalo
                : {},

        quiosque:
            dados?.quiosque &&
            typeof dados.quiosque === "object"
                ? dados.quiosque
                : {}
    };

    console.info("Acqua: base configurada.", {
        intencoes: estado.base.intencoes.length,
        fluxoInicial: estado.base.fluxoInicial.length,
        contatos: estado.base.contatos.length,
        funcionamento: estado.base.funcionamento.length
    });
}


/* =========================================================
   INICIAR CONVERSA
   ========================================================= */

export async function iniciarConversa() {
    if (estado.processando) {
        return;
    }

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

        const devePerguntarNome =
            obterConfiguracaoBooleana(
                "perguntar_nome",
                true
            );

        if (devePerguntarNome) {
            estado.aguardandoNome = true;

            const mensagem =
                obterMensagemFluxo(
                    "PEDIR_NOME",
                    obterConfiguracao(
                        "mensagem_pedir_nome",
                        [
                            "Olá! 👋",
                            "Sou o Acqua, assistente virtual do Curupy.",
                            "",
                            "Antes de começarmos, como posso chamar você?"
                        ].join("\n")
                    )
                );

            registrarMensagemAssistente(mensagem);
            return;
        }

        await apresentarMenuInicial();
    } catch (erro) {
        console.error(
            "Acqua: erro ao iniciar a conversa.",
            erro
        );

        registrarMensagemAssistente(
            "Não consegui iniciar o atendimento agora. Tente novamente em alguns instantes."
        );
    } finally {
        estado.processando = false;
        bloquearCampo(false);
        focarCampo();
    }
}


/* =========================================================
   REINICIAR CONVERSA
   ========================================================= */

export async function reiniciarConversa() {
    if (estado.processando) {
        return;
    }

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

    if (!texto || estado.processando) {
        return;
    }

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

        const contextoAtual =
            obterTodosContextos();

        const resultado =
            encontrarIntencao(
                texto,
                estado.base.intencoes,
                contextoAtual
            );

        if (resultado) {
            responderIntencao(resultado);
        } else {
            responderFallback(texto);
        }
    } catch (erro) {
        console.error(
            "Acqua: erro ao processar mensagem.",
            erro
        );

        responderFallback(texto);
    } finally {
        estado.processando = false;
        bloquearCampo(false);
        focarCampo();
    }
}


/* =========================================================
   PROCESSAR NOME
   ========================================================= */

async function processarNome(mensagem) {
    await esperarDigitacao();

    if (!nomePareceValido(mensagem)) {
        const mensagemInvalida =
            obterConfiguracao(
                "mensagem_nome_invalido",
                [
                    "Não consegui identificar seu nome 😊",
                    "",
                    "Digite apenas o seu primeiro nome."
                ].join("\n")
            );

        registrarMensagemAssistente(mensagemInvalida);
        estado.aguardandoNome = true;
        return;
    }

    const nome =
        extrairPrimeiroNome(mensagem);

    definirVisitante({ nome });

    estado.aguardandoNome = false;

    const mensagemBoasVindas =
        obterMensagemFluxo(
            "CONFIRMAR_NOME",
            obterConfiguracao(
                "mensagem_boas_vindas",
                [
                    "Prazer, {nome}! 😊",
                    "",
                    "Como posso ajudar você hoje?"
                ].join("\n")
            )
        );

    const mensagemFormatada =
        substituirVariaveis(
            mensagemBoasVindas,
            obterVariaveis()
        );

    registrarMensagemAssistente(
        mensagemFormatada
    );

    mostrarMenuInicial();
}


/* =========================================================
   APRESENTAR MENU INICIAL
   ========================================================= */

async function apresentarMenuInicial() {
    const mensagem =
        obterMensagemFluxo(
            "APRESENTACAO",
            obterConfiguracao(
                "mensagem_inicial",
                [
                    "Olá! 👋",
                    "Sou o Acqua, assistente virtual do Curupy.",
                    "",
                    "Como posso ajudar você hoje?"
                ].join("\n")
            )
        );

    const mensagemFormatada =
        substituirVariaveis(
            mensagem,
            obterVariaveis()
        );

    registrarMensagemAssistente(
        mensagemFormatada
    );

    mostrarMenuInicial();
}


/* =========================================================
   MENU INICIAL
   ========================================================= */

function mostrarMenuInicial() {
    const sugestoes =
        prepararFluxoInicial();

    atualizarSugestoes(
        sugestoes,
        processarMensagem
    );
}


function prepararFluxoInicial() {
    const fluxoInicial =
        Array.isArray(estado.base.fluxoInicial)
            ? estado.base.fluxoInicial
            : [];

    const itemMenu =
        fluxoInicial.find(item => {
            return normalizarIdentificador(item?.id) ===
                "menu_principal";
        });

    if (itemMenu) {
        const mensagemAcao =
            limparTexto(
                itemMenu?.mensagem_acao ||
                itemMenu?.mensagem ||
                ""
            );

        const opcoes =
            extrairOpcoesMenu(mensagemAcao);

        if (opcoes.length > 0) {
            return opcoes.map(opcao => ({
                texto: formatarTextoBotao(opcao),
                mensagem: opcao
            }));
        }
    }

    /*
     * Compatibilidade com uma possível estrutura futura,
     * contendo uma opção por linha.
     */
    const opcoesPorLinha =
        fluxoInicial
            .filter(item => {
                if (!itemEstaAtivo(item)) {
                    return false;
                }

                return Boolean(
                    limparTexto(
                        item?.texto ||
                        item?.titulo ||
                        item?.botao ||
                        item?.nome
                    )
                );
            })
            .sort((a, b) => {
                return (
                    Number(a?.ordem || a?.etapa || 0) -
                    Number(b?.ordem || b?.etapa || 0)
                );
            })
            .map(item => {
                const texto =
                    limparTexto(
                        item?.texto ||
                        item?.titulo ||
                        item?.botao ||
                        item?.nome
                    );

                const destino =
                    limparTexto(
                        item?.mensagem ||
                        item?.pergunta ||
                        item?.destino ||
                        texto
                    );

                if (ehLink(destino)) {
                    return {
                        texto,
                        link: destino
                    };
                }

                return {
                    texto,
                    mensagem: destino
                };
            });

    if (opcoesPorLinha.length > 0) {
        return opcoesPorLinha;
    }

    return obterMenuPadrao();
}


function extrairOpcoesMenu(mensagemAcao) {
    const texto =
        String(mensagemAcao || "")
            .replace(
                /^\s*exibir\s+os\s+bot[oõ]es\s*:\s*/i,
                ""
            )
            .trim();

    if (!texto) {
        return [];
    }

    return texto
        .split("|")
        .map(opcao => limparTexto(opcao))
        .filter(Boolean);
}


function formatarTextoBotao(opcao) {
    const texto =
        limparTexto(opcao);

    const textoNormalizado =
        normalizarIdentificador(texto);

    const icones = {
        ingressos: "🎟",
        ingresso: "🎟",
        dias_e_horarios: "📅",
        funcionamento: "📅",
        hospedagem: "🏨",
        associe_se: "💎",
        socios: "💎",
        reservas: "📋",
        regras: "📋",
        como_chegar: "📍"
    };

    const icone =
        icones[textoNormalizado];

    return icone
        ? `${icone} ${texto}`
        : texto;
}


function obterMenuPadrao() {
    return [
        {
            texto: "🎟 Ingressos",
            mensagem: "Ingressos"
        },
        {
            texto: "📅 Dias e horários",
            mensagem: "Dias e horários"
        },
        {
            texto: "🏨 Hospedagem",
            mensagem: "Hospedagem"
        },
        {
            texto: "💎 Associe-se",
            mensagem: "Associe-se"
        }
    ];
}


/* =========================================================
   RESPONDER INTENÇÃO
   ========================================================= */

function responderIntencao(resultado) {
    atualizarContexto(resultado);

    const respostaOriginal =
        resultado?.resposta || "";

    const resposta =
        substituirVariaveis(
            respostaOriginal,
            obterVariaveis()
        );

    if (!limparTexto(resposta)) {
        responderFallback("");
        return;
    }

    registrarMensagemAssistente(resposta);

    const sugestoesOriginais =
        resultado?.sugestoes ||
        resultado?.sugestoesRapidas ||
        resultado?.sugestoes_rapidas ||
        [];

    const sugestoes =
        prepararSugestoesComVariaveis(
            sugestoesOriginais
        );

    if (sugestoes.length > 0) {
        atualizarSugestoes(
            sugestoes,
            processarMensagem
        );

        return;
    }

    atualizarSugestoes(
        [
            {
                texto: "🏠 Menu principal",
                mensagem: "Quero voltar ao menu principal"
            }
        ],
        processarAcaoEspecial
    );
}


/* =========================================================
   FALLBACK
   ========================================================= */

function responderFallback(mensagemOriginal) {
    const mensagem =
        obterConfiguracao(
            "mensagem_fallback",
            CONFIG?.fallback?.mensagem ||
            "Não consegui encontrar essa informação. Escolha uma das opções abaixo ou fale com nossa equipe."
        );

    const mensagemFormatada =
        substituirVariaveis(
            mensagem,
            obterVariaveis()
        );

    registrarMensagemAssistente(
        mensagemFormatada
    );

    const sugestoes = [
        {
            texto: "🎟 Ingressos",
            mensagem: "Ingressos"
        },
        {
            texto: "📅 Dias e horários",
            mensagem: "Dias e horários"
        },
        {
            texto: "🏨 Hospedagem",
            mensagem: "Hospedagem"
        },
        {
            texto: "🏠 Menu principal",
            mensagem: "Quero voltar ao menu principal"
        }
    ];

    const whatsapp =
        obterLinkWhatsAppFallback(
            mensagemOriginal
        );

    if (whatsapp) {
        sugestoes.push({
            texto: "💬 Falar no WhatsApp",
            link: whatsapp
        });
    }

    atualizarSugestoes(
        sugestoes,
        processarAcaoEspecial
    );
}


/* =========================================================
   AÇÕES ESPECIAIS
   ========================================================= */

async function processarAcaoEspecial(mensagem) {
    const texto =
        limparTexto(mensagem)
            .toLowerCase();

    if (texto.includes("menu principal")) {
        if (estado.processando) {
            return;
        }

        estado.processando = true;

        bloquearCampo(true);
        limparSugestoes();

        registrarMensagemUsuario(
            "Voltar ao menu principal"
        );

        try {
            await esperarDigitacao();

            limparContexto();

            const mensagemMenu =
                substituirVariaveis(
                    obterConfiguracao(
                        "mensagem_menu",
                        "Claro, {nome}! Escolha uma opção abaixo:"
                    ),
                    obterVariaveis()
                );

            registrarMensagemAssistente(
                mensagemMenu
            );

            mostrarMenuInicial();
        } finally {
            estado.processando = false;
            bloquearCampo(false);
            focarCampo();
        }

        return;
    }

    await processarMensagem(mensagem);
}


/* =========================================================
   CONTEXTO
   ========================================================= */

function atualizarContexto(resultado) {
    if (resultado?.assunto) {
        definirContexto(
            "assunto",
            resultado.assunto
        );
    }

    if (resultado?.categoria) {
        definirContexto(
            "categoria",
            resultado.categoria
        );
    }

    if (
        resultado?.intencao ||
        resultado?.id
    ) {
        definirContexto(
            "intencao",
            resultado?.intencao ||
            resultado?.id
        );
    }
}


/* =========================================================
   MENSAGENS E HISTÓRICO
   ========================================================= */

function registrarMensagemUsuario(mensagem) {
    adicionarMensagemUsuario(mensagem);

    adicionarAoHistorico(
        "usuario",
        mensagem
    );
}


function registrarMensagemAssistente(mensagem) {
    adicionarMensagemAssistente(mensagem);

    adicionarAoHistorico(
        "assistente",
        mensagem
    );
}


function adicionarAoHistorico(remetente, mensagem) {
    const texto =
        String(mensagem || "");

    adicionarMensagemAoStorage({
        remetente,
        mensagem: texto,
        horario: Date.now()
    });

    limitarHistorico();
}


function limitarHistorico() {
    const historico =
        obterHistoricoDoStorage();

    const limiteConfigurado =
        Number(CONFIG?.limiteHistorico);

    const limite =
        Number.isFinite(limiteConfigurado) &&
        limiteConfigurado > 0
            ? limiteConfigurado
            : 50;

    if (historico.length <= limite) {
        return;
    }

    const mensagensMantidas =
        historico.slice(-limite);

    limparHistorico();

    mensagensMantidas.forEach(mensagem => {
        adicionarMensagemAoStorage(mensagem);
    });
}


export function obterHistorico() {
    return obterHistoricoDoStorage();
}


/* =========================================================
   CONFIGURAÇÕES DA PLANILHA
   ========================================================= */

function obterConfiguracao(chave, valorPadrao = "") {
    const configuracoes =
        estado.base.configuracoes;

    if (
        configuracoes &&
        !Array.isArray(configuracoes) &&
        typeof configuracoes === "object" &&
        configuracoes[chave] !== undefined
    ) {
        const valorConfigurado =
            configuracoes[chave];

        /*
         * O Apps Script retorna:
         * configuracoes[chave] = {
         *     valor: "...",
         *     observacao: "..."
         * }
         */
        if (
            valorConfigurado &&
            typeof valorConfigurado === "object" &&
            !Array.isArray(valorConfigurado)
        ) {
            return (
                valorConfigurado?.valor ??
                valorConfigurado?.conteudo ??
                valorConfigurado?.mensagem ??
                valorPadrao
            );
        }

        return valorConfigurado;
    }

    if (Array.isArray(configuracoes)) {
        const item =
            configuracoes.find(config => {
                const nome =
                    config?.chave ||
                    config?.configuracao ||
                    config?.nome;

                return nome === chave;
            });

        if (item) {
            return (
                item?.valor ??
                item?.conteudo ??
                item?.mensagem ??
                valorPadrao
            );
        }
    }

    return valorPadrao;
}


function obterConfiguracaoBooleana(chave, valorPadrao) {
    const valor =
        obterConfiguracao(
            chave,
            valorPadrao
        );

    if (typeof valor === "boolean") {
        return valor;
    }

    const texto =
        limparTexto(valor)
            .toLowerCase();

    if (
        [
            "sim",
            "true",
            "1",
            "ativo",
            "ativado"
        ].includes(texto)
    ) {
        return true;
    }

    if (
        [
            "nao",
            "não",
            "false",
            "0",
            "inativo",
            "desativado"
        ].includes(texto)
    ) {
        return false;
    }

    return Boolean(valorPadrao);
}


/* =========================================================
   FLUXO INICIAL
   ========================================================= */

function obterMensagemFluxo(id, valorPadrao = "") {
    const identificador =
        normalizarIdentificador(id);

    const item =
        estado.base.fluxoInicial.find(itemFluxo => {
            return (
                normalizarIdentificador(
                    itemFluxo?.id
                ) === identificador
            );
        });

    const mensagem =
        item?.mensagem_acao ||
        item?.mensagem ||
        item?.texto ||
        "";

    return limparTexto(mensagem)
        ? mensagem
        : valorPadrao;
}


/* =========================================================
   SUGESTÕES
   ========================================================= */

function prepararSugestoesComVariaveis(sugestoes) {
    const lista =
        normalizarSugestoes(sugestoes);

    return lista
        .map(sugestao => {
            const texto =
                substituirVariaveis(
                    sugestao?.texto || "",
                    obterVariaveis()
                );

            const mensagem =
                substituirVariaveis(
                    sugestao?.mensagem || "",
                    obterVariaveis()
                );

            const link =
                substituirVariaveis(
                    sugestao?.link || "",
                    obterVariaveis()
                );

            return {
                ...sugestao,
                texto,
                mensagem,
                link
            };
        })
        .filter(sugestao => {
            return Boolean(
                limparTexto(sugestao.texto)
            );
        });
}


function normalizarSugestoes(sugestoes) {
    if (!Array.isArray(sugestoes)) {
        return [];
    }

    return sugestoes
        .filter(Boolean)
        .map(sugestao => {
            if (typeof sugestao === "string") {
                const texto =
                    limparTexto(sugestao);

                return {
                    texto,
                    mensagem: texto
                };
            }

            const texto =
                limparTexto(
                    sugestao?.texto ||
                    sugestao?.titulo ||
                    sugestao?.nome ||
                    sugestao?.mensagem
                );

            const mensagem =
                limparTexto(
                    sugestao?.mensagem ||
                    sugestao?.pergunta ||
                    texto
                );

            const link =
                limparTexto(
                    sugestao?.link ||
                    sugestao?.url ||
                    ""
                );

            return {
                ...sugestao,
                texto,
                mensagem,
                link
            };
        });
}


/* =========================================================
   VARIÁVEIS
   ========================================================= */

function obterVariaveis() {
    const visitante =
        obterVisitante() || {};

    return {
        nome:
            visitante.nome ||
            "visitante",

        nome_assistente:
            CONFIG?.nomeAssistente ||
            "Acqua",

        site:
            CONFIG?.linksEmergencia?.site ||
            "",

        whatsapp:
            CONFIG?.linksEmergencia
                ?.whatsappGeral ||
            "",

        localizacao:
            CONFIG?.linksEmergencia
                ?.localizacao ||
            ""
    };
}


/* =========================================================
   DIGITAÇÃO
   ========================================================= */

async function esperarDigitacao() {
    mostrarDigitando();

    const minimoConfigurado =
        Number(CONFIG?.tempoDigitando?.minimo);

    const maximoConfigurado =
        Number(CONFIG?.tempoDigitando?.maximo);

    const minimo =
        Number.isFinite(minimoConfigurado)
            ? minimoConfigurado
            : 600;

    const maximo =
        Number.isFinite(maximoConfigurado)
            ? Math.max(
                maximoConfigurado,
                minimo
            )
            : 1200;

    const duracao =
        Math.floor(
            Math.random() *
            (maximo - minimo + 1)
        ) + minimo;

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
    const linkConfigurado =
        obterConfiguracao(
            "whatsapp_geral",
            CONFIG?.linksEmergencia
                ?.whatsappGeral ||
            ""
        );

    const link =
        limparTexto(linkConfigurado);

    if (!link) {
        return "";
    }

    const texto =
        limparTexto(mensagemOriginal)
            ? `Olá! Preciso de ajuda com esta dúvida: ${limparTexto(mensagemOriginal)}`
            : "Olá! Preciso de ajuda com uma informação do Curupy.";

    if (
        link.includes("wa.me") ||
        link.includes("api.whatsapp.com")
    ) {
        const separador =
            link.includes("?")
                ? "&"
                : "?";

        return (
            link +
            separador +
            `text=${encodeURIComponent(texto)}`
        );
    }

    return link;
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function itemEstaAtivo(item = {}) {
    if (
        item?.ativo === undefined ||
        item?.ativo === null ||
        item?.ativo === ""
    ) {
        return true;
    }

    if (typeof item.ativo === "boolean") {
        return item.ativo;
    }

    const valor =
        limparTexto(item.ativo)
            .toLowerCase();

    return [
        "sim",
        "true",
        "1",
        "ativo",
        "ativado"
    ].includes(valor);
}


function normalizarIdentificador(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}


function ehLink(valor) {
    return /^(https?:\/\/|mailto:|tel:)/i.test(
        limparTexto(valor)
    );
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
    const visitante =
        obterVisitante() || {
            nome: ""
        };

    const contexto =
        obterTodosContextos();

    return {
        iniciado:
            storageConversaFoiIniciada(),

        processando:
            estado.processando,

        aguardandoNome:
            estado.aguardandoNome,

        visitante: {
            ...visitante
        },

        contexto: {
            ...contexto
        }
    };
}

/* =========================================================
   ACQUA
   MOTOR DE FLUXOS
   ========================================================= */

import { limparTexto, normalizarTexto } from "./utils.js";

/* =========================================================
   CONSTANTES
   ========================================================= */

export const FLUXOS = Object.freeze({
    INGRESSOS: "ingressos",
    RESERVAS: "reservas",
    FUNCIONAMENTO: "funcionamento",
    REGRAS: "regras",
    ASSOCIACAO: "associacao",
    LOCALIZACAO: "localizacao"
});

export const ETAPAS = Object.freeze({
    CATEGORIA_INGRESSO: "categoria_ingresso",
    DATA_VISITA: "data_visita",
    TIPO_RESERVA: "tipo_reserva",
    DATA_RESERVA: "data_reserva",
    QUANTIDADE_PESSOAS: "quantidade_pessoas",
    ASSUNTO_REGRA: "assunto_regra"
});

const MENU_PRINCIPAL = [
    { texto: "🎟 Ingressos", mensagem: "Ingressos" },
    { texto: "📅 Dias e horários", mensagem: "Dias e horários" },
    { texto: "🏨 Reservas", mensagem: "Reservas" },
    { texto: "💎 Associe-se", mensagem: "Associe-se" },
];

const OPCOES_CATEGORIA_INGRESSO = [
    {
        texto: "Adulto (12 anos ou mais)",
        mensagem: "Adulto"
    },
    {
        texto: "Kids (5 a 11 anos)",
        mensagem: "Kids"
    },
    {
        texto: "Melhor idade (60 anos ou mais)",
        mensagem: "Melhor idade"
    },
    {
        texto: "Convidado de sócio",
        mensagem: "Convidado de sócio"
    }
];

const OPCOES_TIPO_RESERVA = [
    { texto: "🏨 Hospedagem", mensagem: "Hospedagem" },
    { texto: "🏖 Bangalô", mensagem: "Bangalô" },
    { texto: "🌴 Quiosque", mensagem: "Quiosque" }
];

const OPCOES_REGRAS = [
    { texto: "Alimentos e bebidas", mensagem: "Alimentos e bebidas" },
    { texto: "Trajes e atrações", mensagem: "Trajes e atrações" },
    { texto: "Crianças", mensagem: "Segurança das crianças" },
    { texto: "Formas de pagamento", mensagem: "Formas de pagamento" },
    { texto: "Chuva e raios", mensagem: "Chuva e raios" }
];

/* =========================================================
   MENU
   ========================================================= */

export function obterMenuPrincipal() {
    return MENU_PRINCIPAL.map(item => ({ ...item }));
}

export function criarRetornoMenu(nome = "") {
    const primeiroNome = limparTexto(nome);

    return {
        tratado: true,
        mensagem: primeiroNome
            ? `Claro, ${primeiroNome}! Escolha uma opção abaixo:`
            : "Claro! Escolha uma opção abaixo:",
        sugestoes: obterMenuPrincipal(),
        contexto: criarContextoLimpo(),
        finalizado: true
    };
}

/* =========================================================
   PROCESSAMENTO PRINCIPAL
   ========================================================= */

export function processarFluxo(mensagem, base = {}, contexto = {}) {
    const texto = limparTexto(mensagem);
    const textoNormalizado = normalizarTexto(texto);

    if (!textoNormalizado) {
        return { tratado: false };
    }

    if (solicitouMenu(textoNormalizado)) {
        return criarRetornoMenu();
    }

    const fluxoIdentificado =
        identificarFluxo(textoNormalizado);

    const existeFluxoAtivo = Boolean(
        contexto?.objetivo ||
        contexto?.etapa ||
        contexto?.aguardando
    );

    if (existeFluxoAtivo) {
        const mudouDeAssunto =
            fluxoIdentificado &&
            fluxoIdentificado !== contexto.objetivo;

        if (mudouDeAssunto) {
            return iniciarFluxo(
                fluxoIdentificado,
                texto,
                base
            );
        }

        return continuarFluxo(
            texto,
            base,
            contexto
        );
    }

    if (!fluxoIdentificado) {
        return { tratado: false };
    }

    return iniciarFluxo(
        fluxoIdentificado,
        texto,
        base
    );
}

/* =========================================================
   IDENTIFICAÇÃO INICIAL
   ========================================================= */

function identificarFluxo(texto) {
    /*
     * Primeiro identificamos assuntos específicos.
     * Isso evita que palavras genéricas como "valor"
     * ou "quanto custa" levem tudo para ingressos.
     */

    if (contemAlgum(texto, [
        "reserva",
        "reservar",
        "hospedagem",
        "hotel",
        "chale",
        "chales",
        "bangalo",
        "bangalos",
        "quiosque",
        "diaria",
        "dormir",
        "pernoite"
    ])) {
        return FLUXOS.RESERVAS;
    }

    if (contemAlgum(texto, [
        "onde fica",
        "endereco",
        "localizacao",
        "como chegar",
        "mapa",
        "rota"
    ])) {
        return FLUXOS.LOCALIZACAO;
    }

    if (contemAlgum(texto, [
        "horario",
        "horarios",
        "funcionamento",
        "abre",
        "abrir",
        "fecha",
        "fechar",
        "aberto",
        "fechado",
        "dias e horarios",
        "que horas"
    ])) {
        return FLUXOS.FUNCIONAMENTO;
    }

    if (contemAlgum(texto, [
        "socio",
        "socios",
        "associado",
        "associados",
        "associacao",
        "associe se",
        "carteirinha",
        "convidado de socio"
    ])) {
        return FLUXOS.ASSOCIACAO;
    }

    if (contemAlgum(texto, [
        "regra",
        "regras",
        "permitido",
        "proibido",
        "pode levar",
        "pode entrar",
        "nao pode",
        "comida",
        "alimento",
        "bebida",
        "agua",
        "refrigerante",
        "cerveja",
        "terere",
        "chimarrao",
        "traje",
        "roupa",
        "jeans",
        "ziper",
        "rebite",
        "corrente",
        "colar",
        "joia",
        "acessorio",
        "celular",
        "filmar",
        "fumar",
        "cigarro",
        "vape",
        "pet",
        "cachorro",
        "animal",
        "chuva",
        "raio",
        "pagamento",
        "pix",
        "cartao",
        "dinheiro",
        "pulseira"
    ])) {
        return FLUXOS.REGRAS;
    }

    /*
     * Ingressos ficam depois dos assuntos específicos.
     * "Valor", "preço" e "quanto custa" continuam sendo
     * aceitos quando nenhum outro produto foi identificado.
     */

    if (contemAlgum(texto, [
        "ingresso",
        "ingressos",
        "entrada",
        "entradas",
        "bilheteria",
        "bilhete",
        "adulto",
        "kids",
        "melhor idade",
        "idoso",
        "meia entrada",
        "estudante",
        "quanto custa",
        "valor",
        "preco"
    ])) {
        return FLUXOS.INGRESSOS;
    }

    return "";
}

/* =========================================================
   INICIAR FLUXO
   ========================================================= */

function iniciarFluxo(fluxo, mensagem, base) {
    switch (fluxo) {
        case FLUXOS.INGRESSOS:
            return iniciarFluxoIngressos(mensagem);

        case FLUXOS.RESERVAS:
            return iniciarFluxoReservas(mensagem, base);

        case FLUXOS.FUNCIONAMENTO:
            return responderConhecimentoDireto(
                base,
                ["funcionamento", "dias horarios", mensagem],
                "Para informar corretamente, consulte o calendário de funcionamento disponível no site oficial."
            );

        case FLUXOS.REGRAS:
            return iniciarFluxoRegras(mensagem, base);

        case FLUXOS.ASSOCIACAO:
            return responderConhecimentoDireto(
                base,
                ["associacao", "associe se", "socio", mensagem],
                "Posso explicar como funciona a associação e encaminhar você para a equipe responsável."
            );

        case FLUXOS.LOCALIZACAO:
            return responderConhecimentoDireto(
                base,
                ["localizacao", "como chegar", "endereco", mensagem],
                "Você pode abrir a localização do Curupy no mapa pelo botão abaixo.",
                [
                    {
                        texto: "📍 Abrir localização",
                        link: obterLinkLocalizacao(base)
                    }
                ]
            );

        default:
            return { tratado: false };
    }
}

/* =========================================================
   CONTINUAR FLUXO
   ========================================================= */

function continuarFluxo(mensagem, base, contexto) {
    switch (contexto.objetivo) {
        case FLUXOS.INGRESSOS:
            return continuarFluxoIngressos(mensagem, base, contexto);

        case FLUXOS.RESERVAS:
            return continuarFluxoReservas(mensagem, base, contexto);

        case FLUXOS.REGRAS:
            return continuarFluxoRegras(mensagem, base, contexto);

        default:
            return { tratado: false };
    }
}

/* =========================================================
   FLUXO DE INGRESSOS
   ========================================================= */

function iniciarFluxoIngressos(mensagem) {
    const categoria = identificarCategoriaIngresso(mensagem);

    if (categoria) {
        return perguntarDataIngresso(categoria);
    }

    return {
        tratado: true,
        mensagem: [
            "Os valores variam conforme a categoria e a data da visita 😊",
            "",
            "Qual ingresso você deseja consultar?"
        ].join("\n"),
        sugestoes: OPCOES_CATEGORIA_INGRESSO,
        contexto: {
            objetivo: FLUXOS.INGRESSOS,
            assunto: "ingressos",
            etapa: ETAPAS.CATEGORIA_INGRESSO,
            aguardando: "categoriaIngresso"
        }
    };
}

function continuarFluxoIngressos(mensagem, base, contexto) {
    if (contexto.etapa === ETAPAS.CATEGORIA_INGRESSO) {
        const categoria = identificarCategoriaIngresso(mensagem);

        if (!categoria) {
            return {
                tratado: true,
                mensagem: "Escolha uma das categorias abaixo 😊",
                sugestoes: OPCOES_CATEGORIA_INGRESSO,
                contexto
            };
        }

        return perguntarDataIngresso(categoria);
    }

    if (contexto.etapa === ETAPAS.DATA_VISITA) {
        const mensagemNormalizada = normalizarTexto(mensagem);

        if (mensagemNormalizada === "outra data") {
            return {
                tratado: true,
                mensagem: [
                    "Digite a data da visita 😊",
                    "",
                    "Exemplos: 18/08 ou 18 de agosto."
                ].join("\n"),
                sugestoes: [],
                contexto
            };
        }

        const data = interpretarDataVisita(mensagem);

        if (!data.valida) {
            return {
                tratado: true,
                mensagem: [
                    "Não consegui identificar a data 😊",
                    "",
                    "Digite, por exemplo: 18/08 ou 18 de agosto."
                ].join("\n"),
                sugestoes: [
                    {
                        texto: "Hoje",
                        mensagem: "Hoje"
                    },
                    {
                        texto: "Amanhã",
                        mensagem: "Amanhã"
                    },
                    {
                        texto: "Outra data",
                        mensagem: "Outra data"
                    }
                ],
                contexto
            };
        }

        const categoria =
            contexto.categoriaIngresso ||
            contexto.categoria;

        const resposta = buscarRespostaIngresso(
            base,
            categoria,
            data
        );

        return {
            tratado: true,
            mensagem: resposta || [
                `Certo! Você procura ingresso ${categoria} para ${data.descricao}.`,
                "",
                "Não encontrei o tarifário correspondente na base. Consulte o site oficial ou fale com nossa equipe."
            ].join("\n"),
            sugestoes: criarSugestoesFimIngresso(base),
            contexto: {
                ...criarContextoLimpo(),
                assunto: "ingressos",
                categoriaIngresso: categoria,
                dataVisita: data.valor
            },
            finalizado: true
        };
    }

    return iniciarFluxoIngressos(mensagem);
}

function perguntarDataIngresso(categoria) {
    return {
        tratado: true,
        mensagem: [
            `Certo, ingresso ${categoria} 😊`,
            "",
            "Qual dia você pretende visitar o parque?"
        ].join("\n"),
        sugestoes: [
            {
                texto: "Hoje",
                mensagem: "Hoje"
            },
            {
                texto: "Amanhã",
                mensagem: "Amanhã"
            },
            {
                texto: "Outra data",
                mensagem: "Outra data"
            }
        ],
        contexto: {
            objetivo: FLUXOS.INGRESSOS,
            assunto: "ingressos",
            categoria,
            categoriaIngresso: categoria,
            etapa: ETAPAS.DATA_VISITA,
            aguardando: "dataVisita"
        }
    };
}

function buscarRespostaIngresso(base, categoria, data) {
    const termos = [
        "ingresso",
        categoria,
        data.tipo,
        data.descricao,
        data.valor,
        "site",
        "bilheteria",
        "valor"
    ];

    const itens = buscarConhecimento(
        base,
        termos,
        1
    );

    if (itens.length === 0) {
        return "";
    }

    return extrairResposta(itens[0]);
}

function criarSugestoesFimIngresso(base) {
    const sugestoes = [];

    const site = obterLink(
        base,
        ["site", "ingresso", "comprar"]
    );

    if (site) {
        sugestoes.push({
            texto: "🎟 Comprar pelo site",
            link: site
        });
    }

    sugestoes.push(
        {
            texto: "Consultar outra categoria",
            mensagem: "Ingressos"
        },
        {
            texto: "🏠 Menu principal",
            mensagem: "Menu principal"
        }
    );

    return sugestoes;
}

/* =========================================================
   FLUXO DE RESERVAS
   ========================================================= */

function iniciarFluxoReservas(mensagem, base) {
    const tipo = identificarTipoReserva(mensagem);

    /*
     * Quando existe um tipo de reserva e o cliente
     * está apenas buscando informações, respondemos
     * sem iniciar o formulário de reserva.
     */
    if (
        tipo &&
        mensagemConsultaInformacaoReserva(mensagem)
    ) {
        return responderInformacaoReserva(
            base,
            tipo,
            mensagem
        );
    }

    /*
     * Quando o cliente demonstra intenção de reservar,
     * seguimos para a escolha da data.
     */
    if (tipo) {
        return perguntarDataReserva(tipo);
    }

    return {
        tratado: true,
        mensagem: "Qual tipo de reserva você deseja consultar?",
        sugestoes: OPCOES_TIPO_RESERVA,
        contexto: {
            objetivo: FLUXOS.RESERVAS,
            assunto: "reservas",
            etapa: ETAPAS.TIPO_RESERVA,
            aguardando: "tipoReserva"
        }
    };
}


/* =========================================================
   IDENTIFICAR CONSULTA DE INFORMAÇÃO
   ========================================================= */

function mensagemConsultaInformacaoReserva(mensagem) {
    const texto = normalizarTexto(mensagem);

    return contemAlgum(texto, [
        "quanto custa",
        "qual o valor",
        "valor",
        "preco",
        "o que inclui",
        "o que esta incluso",
        "o que tem",
        "como funciona",
        "quantas pessoas",
        "capacidade",
        "check in",
        "check out",
        "horario",
        "crianca paga",
        "tem cafe",
        "cafe da manha",
        "quero saber",
        "informacao",
        "informacoes",
        "como e",
        "me fale",
        "quero conhecer",
        "explica"
    ]);
}


/* =========================================================
   RESPONDER INFORMAÇÃO DE RESERVA
   ========================================================= */

function responderInformacaoReserva(
    base,
    tipo,
    mensagem
) {
    const itens = buscarConhecimento(
        base,
        [
            tipo,
            mensagem
        ],
        1
    );

    const resposta =
        itens.length > 0
            ? extrairResposta(itens[0])
            : "";

    return {
        tratado: true,
        mensagem:
            resposta ||
            `Não encontrei essa informação sobre ${tipo} na base de conhecimento.`,
        sugestoes: [
            {
                texto: `📅 Reservar ${tipo}`,
                mensagem: `Quero reservar ${tipo}`
            },
            {
                texto: "🏠 Menu principal",
                mensagem: "Menu principal"
            }
        ],
        contexto: criarContextoLimpo(),
        finalizado: true
    };
}


/* =========================================================
   CONTINUAR FLUXO DE RESERVAS
   ========================================================= */

function continuarFluxoReservas(
    mensagem,
    base,
    contexto
) {
    if (
        contexto.etapa ===
        ETAPAS.TIPO_RESERVA
    ) {
        const tipo =
            identificarTipoReserva(
                mensagem
            );

        if (!tipo) {
            return {
                tratado: true,
                mensagem:
                    "Escolha qual reserva você deseja consultar:",
                sugestoes:
                    OPCOES_TIPO_RESERVA,
                contexto
            };
        }

        return perguntarDataReserva(
            tipo
        );
    }

    if (
        contexto.etapa ===
        ETAPAS.DATA_RESERVA
    ) {
        const data =
            limparTexto(mensagem);

        if (data.length < 3) {
            return {
                tratado: true,
                mensagem:
                    "Informe a data desejada, por exemplo: 15/08/2026.",
                sugestoes: [],
                contexto
            };
        }

        return {
            tratado: true,
            mensagem:
                "Quantas pessoas participarão da reserva?",
            sugestoes: [],
            contexto: {
                ...contexto,
                dataVisita: data,
                etapa:
                    ETAPAS.QUANTIDADE_PESSOAS,
                aguardando:
                    "quantidadePessoas",
                dadosTemporarios: {
                    ...(contexto.dadosTemporarios || {}),
                    dataReserva: data
                }
            }
        };
    }

    if (
        contexto.etapa ===
        ETAPAS.QUANTIDADE_PESSOAS
    ) {
        const quantidade =
            extrairNumero(mensagem);

        if (!quantidade) {
            return {
                tratado: true,
                mensagem:
                    "Digite a quantidade de pessoas usando um número, por exemplo: 4.",
                sugestoes: [],
                contexto
            };
        }

        const tipo =
            contexto.tipoReserva;

        const data =
            contexto?.dadosTemporarios
                ?.dataReserva ||
            contexto.dataVisita;

        const conhecimento =
            buscarConhecimento(
                base,
                [
                    tipo,
                    "reserva",
                    "valor",
                    "informacoes"
                ],
                2
            );

        const informacao =
            conhecimento
                .map(extrairResposta)
                .filter(Boolean)
                .join("\n\n");

        const whatsapp =
            obterLink(
                base,
                [
                    "whatsapp",
                    tipo,
                    "reserva"
                ]
            );

        const resumo = [
            `Perfeito! Anotei sua consulta de ${tipo}:`,
            `Data: ${data}`,
            `Quantidade: ${quantidade} pessoa${quantidade > 1 ? "s" : ""}.`,
            informacao
                ? `\n${informacao}`
                : "",
            "",
            "A disponibilidade precisa ser confirmada pela equipe responsável."
        ]
            .filter(Boolean)
            .join("\n");

        const sugestoes = [];

        if (whatsapp) {
            sugestoes.push({
                texto:
                    "💬 Consultar disponibilidade",
                link:
                    adicionarTextoWhatsApp(
                        whatsapp,
                        `Olá! Quero consultar ${tipo} para ${data}, para ${quantidade} pessoa${quantidade > 1 ? "s" : ""}.`
                    )
            });
        }

        sugestoes.push({
            texto:
                "🏠 Menu principal",
            mensagem:
                "Menu principal"
        });

        return {
            tratado: true,
            mensagem: resumo,
            sugestoes,
            contexto:
                criarContextoLimpo(),
            finalizado: true
        };
    }

    return iniciarFluxoReservas(
        mensagem,
        base
    );
}


/* =========================================================
   PERGUNTAR DATA DA RESERVA
   ========================================================= */

function perguntarDataReserva(tipo) {
    return {
        tratado: true,
        mensagem:
            `Certo! Para qual data você deseja consultar ${tipo}?`,
        sugestoes: [],
        contexto: {
            objetivo:
                FLUXOS.RESERVAS,
            assunto:
                "reservas",
            tipoReserva:
                tipo,
            etapa:
                ETAPAS.DATA_RESERVA,
            aguardando:
                "dataReserva"
        }
    };
}

/* =========================================================
   FLUXO DE REGRAS
   ========================================================= */

function iniciarFluxoRegras(mensagem, base) {
    const assunto = identificarAssuntoRegra(mensagem);

    if (assunto) {
        return responderRegra(base, assunto);
    }

    return {
        tratado: true,
        mensagem: "Sobre qual regra você precisa de informação?",
        sugestoes: OPCOES_REGRAS,
        contexto: {
            objetivo: FLUXOS.REGRAS,
            assunto: "regras",
            etapa: ETAPAS.ASSUNTO_REGRA,
            aguardando: "assuntoRegra"
        }
    };
}

function continuarFluxoRegras(mensagem, base, contexto) {
    const assunto = identificarAssuntoRegra(mensagem) || mensagem;
    const retorno = responderRegra(base, assunto);

    if (retorno.mensagem) {
        return retorno;
    }

    return {
        tratado: true,
        mensagem: "Não encontrei essa regra na base. Escolha um assunto abaixo ou fale com nossa equipe.",
        sugestoes: OPCOES_REGRAS,
        contexto
    };
}

function responderRegra(base, assunto) {
    const resultado = buscarConhecimento(base, ["regra", assunto], 2);
    const resposta = resultado.map(extrairResposta).filter(Boolean).join("\n\n");

    return {
        tratado: true,
        mensagem: resposta || "Não encontrei essa orientação na base de conhecimento.",
        sugestoes: [
            { texto: "Consultar outra regra", mensagem: "Regras do parque" },
            { texto: "🏠 Menu principal", mensagem: "Menu principal" }
        ],
        contexto: criarContextoLimpo(),
        finalizado: true
    };
}

/* =========================================================
   CONHECIMENTO DA PLANILHA
   ========================================================= */

function responderConhecimentoDireto(base, termos, fallback, sugestoesExtras = []) {
    const itens = buscarConhecimento(base, termos, 3);
    const resposta = itens.map(extrairResposta).filter(Boolean).join("\n\n");
    const sugestoes = sugestoesExtras.filter(item => item?.link);

    sugestoes.push({ texto: "🏠 Menu principal", mensagem: "Menu principal" });

    return {
        tratado: true,
        mensagem: resposta || fallback,
        sugestoes,
        contexto: criarContextoLimpo(),
        finalizado: true
    };
}

function buscarConhecimento(base, termos, limite = 3) {
    const colecoes = obterColecoesConhecimento(base);
    const termosNormalizados = termos
        .map(normalizarTexto)
        .filter(Boolean);

    return colecoes
        .map(item => ({
            item,
            pontos: pontuarItem(item, termosNormalizados)
        }))
        .filter(resultado => resultado.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, limite)
        .map(resultado => resultado.item);
}

function obterColecoesConhecimento(base) {
    const itens = [];

    Object.entries(base || {}).forEach(([nome, valor]) => {
        if (Array.isArray(valor)) {
            valor.forEach(item => {
                if (item && typeof item === "object") {
                    itens.push({ ...item, __colecao: nome });
                }
            });
            return;
        }

        if (valor && typeof valor === "object" && !["configuracoes"].includes(nome)) {
            itens.push({ ...valor, __colecao: nome });
        }
    });

    return itens;
}

function pontuarItem(item, termos) {
    const identificacao = normalizarTexto([
        item.__colecao,
        item.id,
        item.intencao,
        item.assunto,
        item.categoria,
        item.titulo,
        item.nome,
        item.perguntas,
        item.exemplos,
        item.palavras_chave,
        item.termos
    ].filter(Boolean).join(" "));

    let pontos = 0;

    termos.forEach(termo => {
        if (!termo) return;
        if (identificacao === termo) pontos += 10;
        else if (identificacao.includes(termo)) pontos += termo.includes(" ") ? 6 : 3;

        termo.split(" ").forEach(palavra => {
            if (palavra.length >= 3 && identificacao.split(" ").includes(palavra)) {
                pontos += 1;
            }
        });
    });

    return pontos;
}

function extrairResposta(item) {
    return limparTexto(
        item?.resposta ||
        item?.mensagem ||
        item?.conteudo ||
        item?.descricao ||
        item?.informacoes ||
        item?.texto ||
        ""
    );
}

/* =========================================================
   INTERPRETAÇÕES
   ========================================================= */

function identificarCategoriaIngresso(texto) {
    const valor = normalizarTexto(texto);

    if (
        contemAlgum(valor, [
            "convidado de socio",
            "convidado socio"
        ])
    ) {
        return "Convidado de sócio";
    }

    if (
        contemAlgum(valor, [
            "melhor idade",
            "idoso",
            "idosa",
            "terceira idade"
        ])
    ) {
        return "Melhor idade";
    }

    /*
     * A meia-entrada continua sendo reconhecida somente
     * quando o cliente perguntar ou mencionar diretamente.
     * Ela não deve aparecer nos botões de categoria.
     */
    if (
        contemAlgum(valor, [
            "meia entrada",
            "estudante",
            "professor",
            "doador"
        ])
    ) {
        return "Meia-entrada";
    }

    if (
        contemAlgum(valor, [
            "kids",
            "crianca",
            "infantil",
            "meu filho",
            "minha filha"
        ])
    ) {
        const idade = extrairIdadeInformada(valor);

        if (idade >= 5 && idade <= 11) {
            return "Kids";
        }

        /*
         * Não classificamos automaticamente crianças
         * de 0 a 4 anos como Kids, pois elas possuem
         * regra própria de gratuidade.
         */
        if (idade >= 0 && idade <= 4) {
            return "";
        }

        if (idade >= 12) {
            return "Adulto";
        }

        return "Kids";
    }

    if (
        contemAlgum(valor, [
            "adulto",
            "adulta",
            "inteira"
        ])
    ) {
        return "Adulto";
    }

    return "";
}


/* =========================================================
   EXTRAIR IDADE INFORMADA
   ========================================================= */

function extrairIdadeInformada(texto) {
    const valor = normalizarTexto(texto);

    /*
     * Só considera o número como idade quando houver
     * a palavra "ano" ou "anos".
     *
     * Assim:
     * "meu filho tem 5 anos" → idade 5
     * "somos 5 adultos" → não interpreta como idade
     */
    const correspondencia = valor.match(
        /\b(\d{1,2})\s*anos?\b/
    );

    if (!correspondencia) {
        return -1;
    }

    const idade = Number(correspondencia[1]);

    return Number.isFinite(idade)
        ? idade
        : -1;
}


/* =========================================================
   IDENTIFICAR TIPO DE RESERVA
   ========================================================= */

function identificarTipoReserva(texto) {
    const valor = normalizarTexto(texto);

    if (
        contemAlgum(valor, [
            "hospedagem",
            "hotel",
            "chale",
            "chales",
            "diaria",
            "pernoite",
            "dormir"
        ])
    ) {
        return "Hospedagem";
    }

    if (
        contemAlgum(valor, [
            "bangalo",
            "bangalos",
            "cabana"
        ])
    ) {
        return "Bangalô";
    }

    if (
        contemAlgum(valor, [
            "quiosque",
            "quiosques"
        ])
    ) {
        return "Quiosque";
    }

    return "";
}


/* =========================================================
   IDENTIFICAR ASSUNTO DA REGRA
   ========================================================= */

function identificarAssuntoRegra(texto) {
    const valor = normalizarTexto(texto);

    /*
     * Assuntos específicos são verificados antes
     * dos assuntos genéricos.
     */

    if (
        contemAlgum(valor, [
            "refrigerante",
            "cerveja",
            "bebida",
            "agua",
            "terere",
            "chimarrao"
        ])
    ) {
        return "entrada de bebidas";
    }

    if (
        contemAlgum(valor, [
            "alimento",
            "comida",
            "lanche",
            "bolo",
            "carne",
            "restaurante"
        ])
    ) {
        return "entrada de alimentos";
    }

    if (
        contemAlgum(valor, [
            "fumar",
            "cigarro",
            "vape",
            "pod",
            "cigarro eletronico"
        ])
    ) {
        return "fumar no parque";
    }

    if (
        contemAlgum(valor, [
            "cachorro",
            "cao",
            "pet",
            "animal"
        ])
    ) {
        return "entrada de animais";
    }

    if (
        contemAlgum(valor, [
            "jeans",
            "ziper",
            "rebite"
        ])
    ) {
        return "roupas permitidas nas atrações";
    }

    if (
        contemAlgum(valor, [
            "corrente",
            "colar",
            "joia",
            "joias",
            "acessorio",
            "acessorios"
        ])
    ) {
        return "acessórios nas atrações";
    }

    if (
        contemAlgum(valor, [
            "celular",
            "camera",
            "filmar",
            "filmagem",
            "fotografar"
        ])
    ) {
        return "celular nas atrações";
    }

    if (
        contemAlgum(valor, [
            "traje",
            "roupa",
            "atracao",
            "atracoes",
            "toboagua",
            "objeto"
        ])
    ) {
        return "trajes e atrações";
    }

    if (
        contemAlgum(valor, [
            "crianca",
            "filho",
            "filha",
            "menor",
            "bebe"
        ])
    ) {
        return "segurança das crianças";
    }

    if (
        contemAlgum(valor, [
            "pagamento",
            "pix",
            "cartao",
            "dinheiro",
            "pulseira"
        ])
    ) {
        return "formas de pagamento";
    }

    if (
        contemAlgum(valor, [
            "chuva",
            "raio",
            "tempestade",
            "tempo"
        ])
    ) {
        return "chuva e raios";
    }

    return "";
}


/* =========================================================
   INTERPRETAR DATA DA VISITA
   ========================================================= */

function interpretarDataVisita(texto) {
    const textoOriginal = limparTexto(texto);
    const valor = normalizarTexto(textoOriginal);

    if (!valor) {
        return {
            valida: false
        };
    }

    const hoje = criarDataSemHorario(new Date());

    /*
     * Datas relativas.
     */

    if (valor === "hoje") {
        return criarRetornoDataVisita(
            hoje,
            "hoje"
        );
    }

    if (valor === "amanha") {
        const amanha = adicionarDias(
            hoje,
            1
        );

        return criarRetornoDataVisita(
            amanha,
            "amanhã"
        );
    }

    if (
        valor === "depois de amanha" ||
        valor === "depois da amanha"
    ) {
        const depoisDeAmanha = adicionarDias(
            hoje,
            2
        );

        return criarRetornoDataVisita(
            depoisDeAmanha,
            "depois de amanhã"
        );
    }

    /*
     * Dias da semana.
     * Retorna a próxima ocorrência do dia informado.
     */

    const diasSemana = {
        domingo: 0,
        segunda: 1,
        "segunda feira": 1,
        terca: 2,
        "terca feira": 2,
        quarta: 3,
        "quarta feira": 3,
        quinta: 4,
        "quinta feira": 4,
        sexta: 5,
        "sexta feira": 5,
        sabado: 6
    };

    for (const [nomeDia, numeroDia] of Object.entries(diasSemana)) {
        if (
            valor === nomeDia ||
            valor === `proximo ${nomeDia}` ||
            valor === `proxima ${nomeDia}`
        ) {
            const dataDiaSemana =
                obterProximoDiaSemana(
                    hoje,
                    numeroDia,
                    valor.startsWith("proxim")
                );

            return criarRetornoDataVisita(
                dataDiaSemana,
                formatarData(dataDiaSemana)
            );
        }
    }

    /*
     * Opção genérica para dias úteis.
     */

    if (
        contemAlgum(valor, [
            "durante a semana",
            "dia de semana"
        ])
    ) {
        return {
            valida: true,
            tipo: "semana",
            valor: textoOriginal,
            descricao: "um dia de semana"
        };
    }

    /*
     * Formatos numéricos:
     * 18/08
     * 18-08
     * 18.08
     * 18/08/2026
     */

    const dataNumerica = textoOriginal.match(
        /\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/
    );

    if (dataNumerica) {
        const dia = Number(dataNumerica[1]);
        const mes = Number(dataNumerica[2]);
        const anoInformado = Boolean(dataNumerica[3]);

        let ano = anoInformado
            ? Number(dataNumerica[3])
            : hoje.getFullYear();

        if (ano < 100) {
            ano += 2000;
        }

        let data = criarDataValidada(
            ano,
            mes,
            dia
        );

        if (!data) {
            return {
                valida: false
            };
        }

        /*
         * Se o cliente não informou o ano e a data
         * já passou, considera o próximo ano.
         */
        if (
            !anoInformado &&
            data < hoje
        ) {
            data = criarDataValidada(
                ano + 1,
                mes,
                dia
            );
        }

        if (!data) {
            return {
                valida: false
            };
        }

        return criarRetornoDataVisita(
            data,
            formatarData(data)
        );
    }

    /*
     * Formatos escritos:
     * 18 de agosto
     * 18 agosto
     * dia 18 de agosto
     * 18 de agosto de 2026
     */

    const meses = {
        janeiro: 1,
        fevereiro: 2,
        marco: 3,
        abril: 4,
        maio: 5,
        junho: 6,
        julho: 7,
        agosto: 8,
        setembro: 9,
        outubro: 10,
        novembro: 11,
        dezembro: 12
    };

    const nomesMeses =
        Object.keys(meses).join("|");

    const expressaoDataEscrita = new RegExp(
        `\\b(?:dia\\s+)?(\\d{1,2})\\s+(?:de\\s+)?(${nomesMeses})(?:\\s+de\\s+(\\d{2,4}))?\\b`
    );

    const dataEscrita = valor.match(
        expressaoDataEscrita
    );

    if (dataEscrita) {
        const dia = Number(dataEscrita[1]);
        const mes = meses[dataEscrita[2]];
        const anoInformado = Boolean(dataEscrita[3]);

        let ano = anoInformado
            ? Number(dataEscrita[3])
            : hoje.getFullYear();

        if (ano < 100) {
            ano += 2000;
        }

        let data = criarDataValidada(
            ano,
            mes,
            dia
        );

        if (!data) {
            return {
                valida: false
            };
        }

        if (
            !anoInformado &&
            data < hoje
        ) {
            data = criarDataValidada(
                ano + 1,
                mes,
                dia
            );
        }

        if (!data) {
            return {
                valida: false
            };
        }

        return criarRetornoDataVisita(
            data,
            formatarData(data)
        );
    }

    return {
        valida: false
    };
}


/* =========================================================
   AUXILIARES DE DATA
   ========================================================= */

function criarDataSemHorario(data) {
    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate(),
        12,
        0,
        0,
        0
    );
}


function adicionarDias(data, quantidade) {
    const novaData =
        criarDataSemHorario(data);

    novaData.setDate(
        novaData.getDate() + quantidade
    );

    return novaData;
}


function criarDataValidada(
    ano,
    mes,
    dia
) {
    const data = new Date(
        ano,
        mes - 1,
        dia,
        12,
        0,
        0,
        0
    );

    const valida =
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia;

    return valida
        ? data
        : null;
}


function obterProximoDiaSemana(
    dataInicial,
    diaSemanaDesejado,
    forcarProximaSemana = false
) {
    const data =
        criarDataSemHorario(dataInicial);

    let diferenca =
        (diaSemanaDesejado - data.getDay() + 7) % 7;

    if (
        diferenca === 0 &&
        forcarProximaSemana
    ) {
        diferenca = 7;
    }

    data.setDate(
        data.getDate() + diferenca
    );

    return data;
}


function criarRetornoDataVisita(
    data,
    descricao
) {
    const diaSemana =
        data.getDay();

    const tipo =
        diaSemana === 0
            ? "domingo"
            : diaSemana === 6
                ? "sabado"
                : "semana";

    return {
        valida: true,
        tipo,
        valor: formatarData(data),
        descricao:
            descricao ||
            formatarData(data)
    };
}


function formatarData(data) {
    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(data);
}

/* =========================================================
   LINKS
   ========================================================= */

function obterLink(base, termos) {
    const itens = buscarConhecimento(base, termos, 5);

    for (const item of itens) {
        const candidatos = [item.link, item.url, item.site, item.whatsapp, item.contato];
        const encontrado = candidatos.find(ehLink);
        if (encontrado) return limparTexto(encontrado);
    }

    return "";
}

function obterLinkLocalizacao(base) {
    return obterLink(base, ["localizacao", "mapa", "como chegar"]);
}

function adicionarTextoWhatsApp(link, mensagem) {
    if (!link || !mensagem || !/(wa\.me|api\.whatsapp\.com)/i.test(link)) {
        return link;
    }

    return `${link}${link.includes("?") ? "&" : "?"}text=${encodeURIComponent(mensagem)}`;
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function criarContextoLimpo() {
    return {
        objetivo: "",
        assunto: "",
        intencao: "",
        categoria: "",
        etapa: "",
        aguardando: "",
        categoriaIngresso: "",
        dataVisita: "",
        canalCompra: "",
        tipoReserva: "",
        beneficio: "",
        setorEncaminhamento: "",
        dadosTemporarios: {}
    };
}

function solicitouMenu(texto) {
    return contemAlgum(texto, [
        "menu", "menu principal", "voltar ao menu", "inicio", "comecar de novo"
    ]);
}

function contemAlgum(texto, termos) {
    return termos.some(termo => texto.includes(normalizarTexto(termo)));
}

function extrairNumero(texto) {
    const numero = Number(limparTexto(texto).match(/\d+/)?.[0]);
    return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

function removerTextosDuplicados(lista) {
    const vistos = new Set();

    return lista.filter(texto => {
        const chave = normalizarTexto(texto);
        if (!chave || vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
    });
}

function ehLink(valor) {
    return /^(https?:\/\/|mailto:|tel:)/i.test(limparTexto(valor));
}

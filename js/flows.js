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
    { texto: "📋 Regras do parque", mensagem: "Regras do parque" },
    { texto: "💎 Associe-se", mensagem: "Associe-se" },
    { texto: "📍 Como chegar", mensagem: "Como chegar" }
];

const OPCOES_CATEGORIA_INGRESSO = [
    { texto: "Adulto", mensagem: "Adulto" },
    { texto: "Kids", mensagem: "Kids" },
    { texto: "Melhor idade", mensagem: "Melhor idade" },
    { texto: "Meia-entrada", mensagem: "Meia-entrada" },
    { texto: "Convidado de sócio", mensagem: "Convidado de sócio" }
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

    if (contexto?.objetivo || contexto?.etapa || contexto?.aguardando) {
        return continuarFluxo(texto, base, contexto);
    }

    const fluxo = identificarFluxo(textoNormalizado);

    if (!fluxo) {
        return { tratado: false };
    }

    return iniciarFluxo(fluxo, texto, base);
}

/* =========================================================
   IDENTIFICAÇÃO INICIAL
   ========================================================= */

function identificarFluxo(texto) {
    if (contemAlgum(texto, [
        "ingresso", "ingressos", "entrada", "bilheteria",
        "quanto custa", "valor", "preco", "meia entrada",
        "adulto", "kids", "melhor idade"
    ])) {
        return FLUXOS.INGRESSOS;
    }

    if (contemAlgum(texto, [
        "reserva", "reservar", "hospedagem", "hotel", "chale",
        "bangalo", "quiosque", "diaria", "dormir"
    ])) {
        return FLUXOS.RESERVAS;
    }

    if (contemAlgum(texto, [
        "horario", "horarios", "funcionamento", "abre", "fecha",
        "aberto", "dias e horarios"
    ])) {
        return FLUXOS.FUNCIONAMENTO;
    }

    if (contemAlgum(texto, [
        "regra", "regras", "permitido", "proibido", "pode levar",
        "comida", "bebida", "traje", "roupa", "chuva", "raio",
        "pagamento", "pix", "cartao", "dinheiro"
    ])) {
        return FLUXOS.REGRAS;
    }

    if (contemAlgum(texto, [
        "socio", "associado", "associacao", "associe se", "carteirinha"
    ])) {
        return FLUXOS.ASSOCIACAO;
    }

    if (contemAlgum(texto, [
        "onde fica", "endereco", "localizacao", "como chegar", "mapa", "rota"
    ])) {
        return FLUXOS.LOCALIZACAO;
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
            return iniciarFluxoReservas(mensagem);

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
                [{ texto: "📍 Abrir localização", link: obterLinkLocalizacao(base) }]
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
            "Primeiro, qual ingresso você procura?"
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
                mensagem: "Não consegui identificar a categoria. Escolha uma das opções abaixo:",
                sugestoes: OPCOES_CATEGORIA_INGRESSO,
                contexto
            };
        }

        return perguntarDataIngresso(categoria);
    }

    if (contexto.etapa === ETAPAS.DATA_VISITA) {
        const data = interpretarDataVisita(mensagem);

        if (!data.valida) {
            return {
                tratado: true,
                mensagem: [
                    "Não consegui identificar o dia da visita 😊",
                    "",
                    "Você pode informar a data, por exemplo: 10/08, sábado ou domingo."
                ].join("\n"),
                sugestoes: [
                    { texto: "Durante a semana", mensagem: "Durante a semana" },
                    { texto: "Sábado", mensagem: "Sábado" },
                    { texto: "Domingo", mensagem: "Domingo" }
                ],
                contexto
            };
        }

        const categoria = contexto.categoriaIngresso || contexto.categoria;
        const resposta = buscarRespostaIngresso(base, categoria, data);

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
            { texto: "Durante a semana", mensagem: "Durante a semana" },
            { texto: "Sábado", mensagem: "Sábado" },
            { texto: "Domingo", mensagem: "Domingo" }
        ],
        contexto: {
            objetivo: FLUXOS.INGRESSOS,
            assunto: "ingressos",
            categoria: categoria,
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

    const itens = buscarConhecimento(base, termos, 4);

    if (itens.length === 0) {
        return "";
    }

    const respostas = itens
        .map(extrairResposta)
        .filter(Boolean);

    return removerTextosDuplicados(respostas).join("\n\n");
}

function criarSugestoesFimIngresso(base) {
    const sugestoes = [];
    const site = obterLink(base, ["site", "ingresso", "comprar"]);

    if (site) {
        sugestoes.push({
            texto: "🎟 Comprar pelo site",
            link: site
        });
    }

    sugestoes.push(
        { texto: "Consultar outra categoria", mensagem: "Ingressos" },
        { texto: "🏠 Menu principal", mensagem: "Menu principal" }
    );

    return sugestoes;
}

/* =========================================================
   FLUXO DE RESERVAS
   ========================================================= */

function iniciarFluxoReservas(mensagem) {
    const tipo = identificarTipoReserva(mensagem);

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

function continuarFluxoReservas(mensagem, base, contexto) {
    if (contexto.etapa === ETAPAS.TIPO_RESERVA) {
        const tipo = identificarTipoReserva(mensagem);

        if (!tipo) {
            return {
                tratado: true,
                mensagem: "Escolha qual reserva você deseja consultar:",
                sugestoes: OPCOES_TIPO_RESERVA,
                contexto
            };
        }

        return perguntarDataReserva(tipo);
    }

    if (contexto.etapa === ETAPAS.DATA_RESERVA) {
        const data = limparTexto(mensagem);

        if (data.length < 3) {
            return {
                tratado: true,
                mensagem: "Informe a data desejada, por exemplo: 15/08/2026.",
                sugestoes: [],
                contexto
            };
        }

        return {
            tratado: true,
            mensagem: "Quantas pessoas participarão da reserva?",
            sugestoes: [],
            contexto: {
                ...contexto,
                dataVisita: data,
                etapa: ETAPAS.QUANTIDADE_PESSOAS,
                aguardando: "quantidadePessoas",
                dadosTemporarios: {
                    ...(contexto.dadosTemporarios || {}),
                    dataReserva: data
                }
            }
        };
    }

    if (contexto.etapa === ETAPAS.QUANTIDADE_PESSOAS) {
        const quantidade = extrairNumero(mensagem);

        if (!quantidade) {
            return {
                tratado: true,
                mensagem: "Digite a quantidade de pessoas usando um número, por exemplo: 4.",
                sugestoes: [],
                contexto
            };
        }

        const tipo = contexto.tipoReserva;
        const data = contexto?.dadosTemporarios?.dataReserva || contexto.dataVisita;
        const conhecimento = buscarConhecimento(base, [tipo, "reserva", "valor", "informacoes"], 2);
        const informacao = conhecimento.map(extrairResposta).filter(Boolean).join("\n\n");
        const whatsapp = obterLink(base, ["whatsapp", tipo, "reserva"]);

        const resumo = [
            `Perfeito! Anotei sua consulta de ${tipo}:`,
            `Data: ${data}`,
            `Quantidade: ${quantidade} pessoa${quantidade > 1 ? "s" : ""}.`,
            informacao ? `\n${informacao}` : "",
            "",
            "A disponibilidade precisa ser confirmada pela equipe responsável."
        ].filter(Boolean).join("\n");

        const sugestoes = [];

        if (whatsapp) {
            sugestoes.push({
                texto: "💬 Consultar disponibilidade",
                link: adicionarTextoWhatsApp(
                    whatsapp,
                    `Olá! Quero consultar ${tipo} para ${data}, para ${quantidade} pessoa${quantidade > 1 ? "s" : ""}.`
                )
            });
        }

        sugestoes.push({ texto: "🏠 Menu principal", mensagem: "Menu principal" });

        return {
            tratado: true,
            mensagem: resumo,
            sugestoes,
            contexto: criarContextoLimpo(),
            finalizado: true
        };
    }

    return iniciarFluxoReservas(mensagem);
}

function perguntarDataReserva(tipo) {
    return {
        tratado: true,
        mensagem: `Certo! Para qual data você deseja consultar ${tipo}?`,
        sugestoes: [],
        contexto: {
            objetivo: FLUXOS.RESERVAS,
            assunto: "reservas",
            tipoReserva: tipo,
            etapa: ETAPAS.DATA_RESERVA,
            aguardando: "dataReserva"
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

    if (contemAlgum(valor, ["convidado de socio", "convidado socio"])) return "Convidado de sócio";
    if (contemAlgum(valor, ["melhor idade", "idoso", "terceira idade"])) return "Melhor idade";
    if (contemAlgum(valor, ["meia entrada", "estudante", "professor", "doador"])) return "Meia-entrada";
    if (contemAlgum(valor, ["kids", "crianca", "infantil"])) return "Kids";
    if (contemAlgum(valor, ["adulto", "inteira"])) return "Adulto";

    return "";
}

function identificarTipoReserva(texto) {
    const valor = normalizarTexto(texto);

    if (contemAlgum(valor, ["hospedagem", "hotel", "chale", "diaria", "dormir"])) return "Hospedagem";
    if (contemAlgum(valor, ["bangalo", "cabana"])) return "Bangalô";
    if (contemAlgum(valor, ["quiosque"])) return "Quiosque";

    return "";
}

function identificarAssuntoRegra(texto) {
    const valor = normalizarTexto(texto);

    if (contemAlgum(valor, ["alimento", "comida", "bebida", "restaurante"])) return "alimentos e bebidas";
    if (contemAlgum(valor, ["traje", "roupa", "atracao", "toboagua", "objeto", "celular"])) return "trajes e atrações";
    if (contemAlgum(valor, ["crianca", "filho", "menor", "bebe"])) return "segurança das crianças";
    if (contemAlgum(valor, ["pagamento", "pix", "cartao", "dinheiro", "pulseira"])) return "formas de pagamento";
    if (contemAlgum(valor, ["chuva", "raio", "tempestade", "tempo"])) return "chuva e raios";

    return "";
}

function interpretarDataVisita(texto) {
    const valor = normalizarTexto(texto);

    if (contemAlgum(valor, ["segunda", "terca", "quarta", "quinta", "sexta", "semana", "dia de semana"])) {
        return { valida: true, tipo: "semana", valor: limparTexto(texto), descricao: "um dia de semana" };
    }

    if (valor.includes("sabado")) {
        return { valida: true, tipo: "sabado", valor: limparTexto(texto), descricao: "sábado" };
    }

    if (valor.includes("domingo")) {
        return { valida: true, tipo: "domingo", valor: limparTexto(texto), descricao: "domingo" };
    }

    const correspondencia = limparTexto(texto).match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);

    if (!correspondencia) {
        return { valida: false };
    }

    const dia = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);
    let ano = correspondencia[3] ? Number(correspondencia[3]) : new Date().getFullYear();

    if (ano < 100) ano += 2000;

    const data = new Date(ano, mes - 1, dia);
    const valida = data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;

    if (!valida) {
        return { valida: false };
    }

    const diaSemana = data.getDay();
    const tipo = diaSemana === 0 ? "domingo" : diaSemana === 6 ? "sabado" : "semana";

    return {
        valida: true,
        tipo,
        valor: correspondencia[0],
        descricao: correspondencia[0]
    };
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

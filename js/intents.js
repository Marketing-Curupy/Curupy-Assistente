/* =========================================================
   ACQUA
   MOTOR DE INTENÇÕES
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES DO MOTOR
   ========================================================= */

const CONFIG_INTENCOES = {
    pontuacaoMinimaPadrao: 5,

    similaridadeMinima: 0.72,

    tamanhoMinimoPalavra: 3,

    limiteResultados: 10
};


/* =========================================================
   PALAVRAS IGNORADAS
   ========================================================= */

const PALAVRAS_IGNORADAS = new Set([
    "a",
    "ao",
    "aos",
    "as",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "eu",
    "me",
    "meu",
    "minha",
    "na",
    "nas",
    "no",
    "nos",
    "o",
    "os",
    "para",
    "por",
    "pra",
    "pro",
    "que",
    "se",
    "um",
    "uma"
]);


/* =========================================================
   GRUPOS DE INTENÇÃO
   ========================================================= */

const GRUPOS_INTENCAO = {
    valores: [
        "valor",
        "valores",
        "preco",
        "precos",
        "quanto custa",
        "quanto e",
        "qual o valor",
        "qual preco",
        "tarifa",
        "tarifario"
    ],

    compra: [
        "comprar",
        "compra",
        "site",
        "link",
        "adquirir",
        "garantir ingresso",
        "comprar ingresso",
        "ingresso online",
       "quero ir",
"vou visitar",
"pretendo visitar",
"quero conhecer",
"quero passar o dia",
"vou amanhã",
"vou hoje",
"vou domingo",
"vou sábado",
    ],

    horario: [
        "horario",
        "horarios",
        "abre",
        "aberto",
        "fecha",
        "fechado",
        "funcionamento",
        "que horas",
        "hora de abrir",
        "hora de fechar"
    ],

    reserva: [
        "reservar",
        "reserva",
        "disponibilidade",
        "disponivel",
        "agendar",
        "agendamento",
        "fazer reserva"
    ],

    localizacao: [
        "onde fica",
        "endereco",
        "localizacao",
        "mapa",
        "rota",
        "como chegar",
        "chegar ao parque"
    ],

    pagamento: [
        "pagamento",
        "pagar",
        "pix",
        "cartao",
        "dinheiro",
        "pulseira",
        "forma de pagamento",
        "formas de pagamento"
    ],

    contato: [
        "telefone",
        "whatsapp",
        "contato",
        "falar com",
        "atendimento",
        "falar com atendente",
        "falar com uma pessoa"
    ],

    ingresso: [
        "ingresso",
        "ingressos",
        "entrada",
        "entradas",
        "bilhete",
        "bilheteria"
    ],

    hospedagem: [
        "hospedagem",
        "hotel",
        "chale",
        "chales",
        "quarto",
        "pernoite",
        "dormir",
        "diaria"
    ],

    bangalo: [
        "bangalo",
        "bangalos",
        "cabana",
        "espaco privativo"
    ],

    quiosque: [
        "quiosque",
        "quiosques",
        "espaco para festa",
        "espaco reservado"
    ],

    socio: [
        "socio",
        "socios",
        "associado",
        "associados",
        "carteirinha",
        "convidado de socio"
    ],

    crianca: [
        "crianca",
        "criancas",
        "kids",
        "infantil",
        "idade",
        "quantos anos"
   "aninho",
"aninhos",
"anos",
"idade",
"meu filho",
"minha filha",
"meu menino",
"minha menina",
"bebê",
"bebe"
    ],

    idoso: [
        "idoso",
        "idosos",
        "melhor idade",
        "terceira idade"
    ],

    regras: [
        "regra",
        "regras",
        "permitido",
        "proibido",
        "pode levar",
        "nao pode",
        "orientacao"
       "pet",
"cachorro",
"gato",
"animal",
"vape",
"cigarro eletrônico",
"eletrônico",
"fumar",
    ],

    alimentacao: [
        "comida",
        "alimento",
        "alimentacao",
        "bebida",
        "restaurante",
        "lanche",
        "levar comida"
       "cerveja",
"refrigerante",
"água",
"agua",
"tereré",
"chimarrão",
"cooler",
"isopor",
    ],

    estacionamento: [
        "estacionamento",
        "estacionar",
        "carro",
        "vaga"
    ],

    clima: [
        "chuva",
        "chovendo",
        "tempo",
        "raio",
        "tempestade"
    ],

    menu: [
        "menu",
        "inicio",
        "voltar",
        "menu principal",
        "voltar ao menu"
    ]
};


/* =========================================================
   ENCONTRAR MELHOR INTENÇÃO
   ========================================================= */

export function encontrarIntencao(
    mensagem,
    intencoes,
    contexto = {}
) {
    const texto =
        normalizarTexto(mensagem);

    if (
        !texto ||
        !Array.isArray(intencoes) ||
        intencoes.length === 0
    ) {
        return null;
    }

    const resultados =
        intencoes
            .filter(item => {
                return (
                    item &&
                    typeof item === "object" &&
                    intencaoEstaAtiva(item)
                );
            })
            .map(item => {
                return {
                    item,

                    pontuacao:
                        calcularPontuacao(
                            texto,
                            item,
                            contexto
                        )
                };
            })
            .filter(resultado => {
                return resultado.pontuacao > 0;
            })
            .sort((a, b) => {
                if (
                    b.pontuacao !==
                    a.pontuacao
                ) {
                    return (
                        b.pontuacao -
                        a.pontuacao
                    );
                }

                return (
                    obterPrioridade(
                        b.item
                    ) -
                    obterPrioridade(
                        a.item
                    )
                );
            })
            .slice(
                0,
                CONFIG_INTENCOES
                    .limiteResultados
            );

    if (resultados.length === 0) {
        return null;
    }

    const melhorResultado =
        resultados[0];

    const pontuacaoMinima =
        obterPontuacaoMinima(
            melhorResultado.item
        );

    if (
        melhorResultado.pontuacao <
        pontuacaoMinima
    ) {
        return null;
    }

    return prepararIntencao(
        melhorResultado.item,
        melhorResultado.pontuacao
    );
}


/* =========================================================
   CALCULAR PONTUAÇÃO TOTAL
   ========================================================= */

function calcularPontuacao(
    texto,
    item,
    contexto
) {
    let pontuacao = 0;

    pontuacao +=
        calcularPontosExemplos(
            texto,
            item
        );

    pontuacao +=
        calcularPontosIntencao(
            texto,
            item
        );

    pontuacao +=
        calcularPontosCampos(
            texto,
            item
        );

    pontuacao +=
        calcularPontosContexto(
            item,
            contexto
        );

    pontuacao +=
        obterPrioridade(item);

    return pontuacao;
}


/* =========================================================
   PONTOS PELOS EXEMPLOS E PALAVRAS-CHAVE
   ========================================================= */

function calcularPontosExemplos(
    texto,
    item
) {
    let pontos = 0;

    const exemplos =
        obterExemplosIntencao(item);

    const palavrasTexto =
        obterPalavrasRelevantes(texto);

    exemplos.forEach(exemplo => {
        const termo =
            normalizarTexto(exemplo);

        if (!termo) {
            return;
        }

        if (texto === termo) {
            pontos += 25;

            return;
        }

        if (
            texto.startsWith(termo) ||
            texto.endsWith(termo)
        ) {
            pontos +=
                possuiMaisDeUmaPalavra(termo)
                    ? 15
                    : 8;
        } else if (
            texto.includes(termo)
        ) {
            pontos +=
                possuiMaisDeUmaPalavra(termo)
                    ? 12
                    : 7;
        }

        const palavrasTermo =
            obterPalavrasRelevantes(termo);

        const quantidadeIguais =
            contarPalavrasIguais(
                palavrasTexto,
                palavrasTermo
            );

        pontos +=
            quantidadeIguais * 2;

        const cobertura =
            calcularCoberturaPalavras(
                palavrasTexto,
                palavrasTermo
            );

        if (cobertura === 1) {
            pontos += 5;
        } else if (cobertura >= 0.7) {
            pontos += 3;
        } else if (cobertura >= 0.5) {
            pontos += 1;
        }

        const similaridade =
            calcularSimilaridade(
                texto,
                termo
            );

        if (
            similaridade >=
            CONFIG_INTENCOES
                .similaridadeMinima
        ) {
            pontos += Math.round(
                similaridade * 6
            );
        }
    });

    return pontos;
}


/* =========================================================
   OBTER EXEMPLOS DA INTENÇÃO
   ========================================================= */

function obterExemplosIntencao(item) {
    const campos = [
        item.exemplos,
        item.termos,
        item.palavras_chave,
        item.palavras,
        item.sinonimos,
        item.perguntas
    ];

    const exemplos = [];

    campos.forEach(campo => {
        exemplos.push(
            ...obterListaDoCampo(campo)
        );
    });

    return removerDuplicados(
        exemplos
    );
}


/* =========================================================
   PONTOS PELOS CAMPOS DA INTENÇÃO
   ========================================================= */

function calcularPontosCampos(
    texto,
    item
) {
    let pontos = 0;

    const campos = [
        {
            valor:
                item.intencao ||
                item.id,

            pontos:
                6
        },

        {
            valor:
                item.assunto,

            pontos:
                4
        },

        {
            valor:
                item.categoria,

            pontos:
                4
        },

        {
            valor:
                item.titulo,

            pontos:
                3
        }
    ];

    campos.forEach(campo => {
        const valor =
            normalizarTexto(
                campo.valor
            );

        if (!valor) {
            return;
        }

        if (texto === valor) {
            pontos +=
                campo.pontos + 4;

            return;
        }

        if (texto.includes(valor)) {
            pontos +=
                campo.pontos;

            return;
        }

        const similaridade =
            calcularSimilaridade(
                texto,
                valor
            );

        if (similaridade >= 0.75) {
            pontos += Math.round(
                campo.pontos *
                similaridade
            );
        }
    });

    return pontos;
}


/* =========================================================
   CONTEXTO DA CONVERSA
   ========================================================= */

function calcularPontosContexto(
    item,
    contexto
) {
    if (
        !contexto ||
        typeof contexto !== "object"
    ) {
        return 0;
    }

    let pontos = 0;

    const assuntoItem =
        normalizarTexto(
            item.assunto
        );

    const categoriaItem =
        normalizarTexto(
            item.categoria
        );

    const intencaoItem =
        normalizarTexto(
            item.intencao ||
            item.id
        );

    const assuntoContexto =
        normalizarTexto(
            contexto.assunto
        );

    const categoriaContexto =
        normalizarTexto(
            contexto.categoria
        );

    const intencaoContexto =
        normalizarTexto(
            contexto.intencao
        );

    if (
        assuntoContexto &&
        assuntoItem &&
        assuntoItem ===
        assuntoContexto
    ) {
        pontos += 4;
    }

    if (
        categoriaContexto &&
        categoriaItem &&
        categoriaItem ===
        categoriaContexto
    ) {
        pontos += 5;
    }

    if (
        intencaoContexto &&
        intencaoItem &&
        intencaoItem ===
        intencaoContexto
    ) {
        pontos += 2;
    }

    return pontos;
}


/* =========================================================
   PALAVRAS DE INTENÇÃO
   ========================================================= */

function calcularPontosIntencao(
    texto,
    item
) {
    let pontos = 0;

    const identificacaoItem =
        normalizarTexto(
            [
                item.intencao,
                item.id,
                item.assunto,
                item.categoria,
                item.titulo
            ]
                .filter(Boolean)
                .join(" ")
        );

    Object.entries(
        GRUPOS_INTENCAO
    ).forEach(
        ([nomeGrupo, termos]) => {
            const encontrouTermo =
                termos.some(termo => {
                    return textoContemTermo(
                        texto,
                        termo
                    );
                });

            if (!encontrouTermo) {
                return;
            }

            const itemPertenceAoGrupo =
                identificacaoItem.includes(
                    normalizarTexto(
                        nomeGrupo
                    )
                ) ||
                termos.some(termo => {
                    const termoNormalizado =
                        normalizarTexto(
                            termo
                        );

                    return (
                        termoNormalizado &&
                        identificacaoItem.includes(
                            termoNormalizado
                        )
                    );
                });

            if (itemPertenceAoGrupo) {
                pontos += 6;
            }
        }
    );

    return pontos;
}


/* =========================================================
   PREPARAR RESPOSTA
   ========================================================= */

function prepararIntencao(
    item,
    pontuacao
) {
    return {
        id:
            limparValor(
                item.id ||
                item.intencao
            ),

        assunto:
            limparValor(
                item.assunto
            ),

        categoria:
            limparValor(
                item.categoria
            ),

        intencao:
            limparValor(
                item.intencao ||
                item.id
            ),

        resposta:
            limparValor(
                item.resposta ||
                item.mensagem ||
                item.conteudo
            ),

        sugestoes:
            prepararSugestoes(
                item
            ),

        contato:
            limparValor(
                item.contato ||
                item.encaminhamento
            ),

        restrito:
            converterParaBooleano(
                item.restrito
            ),

        pontuacao,

        original:
            item
    };
}


/* =========================================================
   PREPARAR SUGESTÕES
   ========================================================= */

function prepararSugestoes(item) {
    const sugestoesRecebidas =
        item.sugestoesRapidas ??
        item.sugestoes ??
        item.sugestoes_rapidas ??
        item.botoes ??
        item.respostas_rapidas ??
        "";

    if (
        Array.isArray(
            sugestoesRecebidas
        )
    ) {
        return sugestoesRecebidas
            .map(normalizarSugestao)
            .filter(Boolean);
    }

    const campo =
        sugestoesRecebidas;

    if (!campo) {
        return [];
    }

   return obterListaDoCampo(campo)
        .map(valor => {
            return valor.trim();
        })
        .filter(Boolean)
        .map(valor => {
            const partes =
                valor
                    .split("|")
                    .map(parte => {
                        return parte.trim();
                    });

            const texto =
                partes[0] || "";

            const destino =
                partes
                    .slice(1)
                    .join("|")
                    .trim() ||
                texto;

            if (!texto) {
                return null;
            }

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
        })
        .filter(Boolean);
}

/* =========================================================
   NORMALIZAR SUGESTÃO
   ========================================================= */

function normalizarSugestao(sugestao) {
    if (
        typeof sugestao === "string"
    ) {
        const texto =
            sugestao.trim();

        if (!texto) {
            return null;
        }

        return {
            texto,

            mensagem:
                texto
        };
    }

    if (
        !sugestao ||
        typeof sugestao !== "object"
    ) {
        return null;
    }

    const texto =
        limparValor(
            sugestao.texto ||
            sugestao.titulo ||
            sugestao.nome
        );

    if (!texto) {
        return null;
    }

    const link =
        limparValor(
            sugestao.link ||
            sugestao.url
        );

    if (
        link &&
        ehLink(link)
    ) {
        return {
            ...sugestao,

            texto,

            link
        };
    }

    return {
        ...sugestao,

        texto,

        mensagem:
            limparValor(
                sugestao.mensagem ||
                sugestao.destino ||
                sugestao.pergunta ||
                texto
            )
    };
}


/* =========================================================
   ATIVO OU INATIVO
   ========================================================= */

function intencaoEstaAtiva(item) {
    if (
        item.ativo === undefined ||
        item.ativo === null ||
        item.ativo === ""
    ) {
        return true;
    }

    return converterParaBooleano(
        item.ativo
    );
}


/* =========================================================
   PRIORIDADE
   ========================================================= */

function obterPrioridade(item) {
    const valor =
        Number(
            item.prioridade ||
            item.peso ||
            0
        );

    if (
        Number.isFinite(valor) &&
        valor > 0
    ) {
        return Math.min(
            valor,
            10
        );
    }

    return 0;
}


/* =========================================================
   PONTUAÇÃO MÍNIMA
   ========================================================= */

function obterPontuacaoMinima(item) {
    const valor =
        Number(
            item.pontuacao_minima ||
            item.pontuacaoMinima
        );

    if (
        Number.isFinite(valor) &&
        valor > 0
    ) {
        return valor;
    }

    return (
        CONFIG_INTENCOES
            .pontuacaoMinimaPadrao
    );
}


/* =========================================================
   SUBSTITUIR VARIÁVEIS
   ========================================================= */

export function substituirVariaveis(
    texto,
    variaveis = {}
) {
    if (
        texto === undefined ||
        texto === null
    ) {
        return "";
    }

    return String(texto).replace(
        /\{([a-zA-Z0-9_]+)\}/g,
        (resultado, chave) => {
            const valor =
                variaveis?.[chave];

            if (
                valor === undefined ||
                valor === null
            ) {
                return resultado;
            }

            return String(valor);
        }
    );
}


/* =========================================================
   EXTRAIR PRIMEIRO NOME
   ========================================================= */

export function extrairPrimeiroNome(
    texto
) {
    const nomeLimpo =
        String(texto || "")
            .trim()
            .replace(/\s+/g, " ")
            .replace(
                /[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g,
                ""
            )
            .trim();

    if (!nomeLimpo) {
        return "";
    }

    const partes =
        nomeLimpo
            .split(" ")
            .filter(Boolean);

    if (partes.length === 0) {
        return "";
    }

    let primeiroNome =
        partes[0];

    const apresentacoes = [
        "sou",
        "meu",
        "nome",
        "chamo",
        "chama"
    ];

    if (
        apresentacoes.includes(
            normalizarTexto(
                primeiroNome
            )
        ) &&
        partes.length > 1
    ) {
        primeiroNome =
            partes[partes.length - 1];
    }

    return formatarNome(
        primeiroNome
    );
}


/* =========================================================
   VALIDAR NOME
   ========================================================= */

export function nomePareceValido(
    texto
) {
    const nome =
        extrairPrimeiroNome(
            texto
        );

    if (
        nome.length < 2 ||
        nome.length > 30
    ) {
        return false;
    }

    if (
        !/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/.test(
            nome
        )
    ) {
        return false;
    }

    const respostasInvalidas = [
        "sim",
        "nao",
        "oi",
        "ola",
        "bom",
        "boa",
        "dia",
        "tarde",
        "noite",
        "ingresso",
        "ingressos",
        "ajuda",
        "duvida",
        "teste",
        "menu",
        "preco",
        "valor",
        "horario",
        "parque",
        "curupy",
        "acqua",
        "quero"
    ];

    return !respostasInvalidas.includes(
        normalizarTexto(nome)
    );
}


/* =========================================================
   LISTAS DA PLANILHA
   ========================================================= */

export function obterListaDoCampo(
    valor
) {
    if (Array.isArray(valor)) {
        return valor
            .map(item => {
                return limparValor(item);
            })
            .filter(Boolean);
    }

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return [];
    }

    return String(valor)
        .split(/\||;|\r?\n/)
        .map(item => {
            return item.trim();
        })
        .filter(Boolean);
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

export function normalizarTexto(
    texto
) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9\s]/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


/* =========================================================
   PALAVRAS RELEVANTES
   ========================================================= */

function obterPalavrasRelevantes(
    texto
) {
    return normalizarTexto(texto)
        .split(" ")
        .filter(palavra => {
            return (
                palavra.length >=
                CONFIG_INTENCOES
                    .tamanhoMinimoPalavra &&
                !PALAVRAS_IGNORADAS.has(
                    palavra
                )
            );
        });
}


/* =========================================================
   CONTAR PALAVRAS IGUAIS
   ========================================================= */

function contarPalavrasIguais(
    palavrasA,
    palavrasB
) {
    if (
        palavrasA.length === 0 ||
        palavrasB.length === 0
    ) {
        return 0;
    }

    const conjuntoB =
        new Set(palavrasB);

    return palavrasA.reduce(
        (total, palavra) => {
            return (
                total +
                (
                    conjuntoB.has(palavra)
                        ? 1
                        : 0
                )
            );
        },
        0
    );
}


/* =========================================================
   COBERTURA DE PALAVRAS
   ========================================================= */

function calcularCoberturaPalavras(
    palavrasTexto,
    palavrasTermo
) {
    if (
        palavrasTexto.length === 0 ||
        palavrasTermo.length === 0
    ) {
        return 0;
    }

    const conjuntoTexto =
        new Set(palavrasTexto);

    const iguais =
        palavrasTermo.filter(
            palavra => {
                return conjuntoTexto.has(
                    palavra
                );
            }
        ).length;

    return (
        iguais /
        palavrasTermo.length
    );
}


/* =========================================================
   SIMILARIDADE ENTRE TEXTOS
   ========================================================= */

function calcularSimilaridade(
    textoA,
    textoB
) {
    const palavrasA =
        new Set(
            obterPalavrasRelevantes(
                textoA
            )
        );

    const palavrasB =
        new Set(
            obterPalavrasRelevantes(
                textoB
            )
        );

    if (
        palavrasA.size === 0 ||
        palavrasB.size === 0
    ) {
        return 0;
    }

    let palavrasIguais = 0;

    palavrasA.forEach(palavra => {
        if (
            palavrasB.has(palavra)
        ) {
            palavrasIguais += 1;
        }
    });

    const totalPalavras =
        new Set([
            ...palavrasA,
            ...palavrasB
        ]).size;

    if (totalPalavras === 0) {
        return 0;
    }

    return (
        palavrasIguais /
        totalPalavras
    );
}


/* =========================================================
   VERIFICAR TERMO NO TEXTO
   ========================================================= */

function textoContemTermo(
    texto,
    termo
) {
    const textoNormalizado =
        normalizarTexto(texto);

    const termoNormalizado =
        normalizarTexto(termo);

    if (
        !textoNormalizado ||
        !termoNormalizado
    ) {
        return false;
    }

    if (
        textoNormalizado ===
        termoNormalizado
    ) {
        return true;
    }

    if (
        termoNormalizado.includes(" ")
    ) {
        return textoNormalizado.includes(
            termoNormalizado
        );
    }

    return textoNormalizado
        .split(" ")
        .includes(
            termoNormalizado
        );
}


/* =========================================================
   REMOVER DUPLICADOS
   ========================================================= */

function removerDuplicados(lista) {
    const vistos =
        new Set();

    return lista.filter(item => {
        const normalizado =
            normalizarTexto(item);

        if (
            !normalizado ||
            vistos.has(normalizado)
        ) {
            return false;
        }

        vistos.add(normalizado);

        return true;
    });
}


/* =========================================================
   CONVERSÕES
   ========================================================= */

function converterParaBooleano(valor) {
    if (
        typeof valor === "boolean"
    ) {
        return valor;
    }

    if (
        typeof valor === "number"
    ) {
        return valor === 1;
    }

    const texto =
        normalizarTexto(valor);

    return [
        "sim",
        "s",
        "true",
        "1",
        "ativo",
        "ativado",
        "verdadeiro"
    ].includes(texto);
}


/* =========================================================
   LINK
   ========================================================= */

function ehLink(valor) {
    return /^(https?:\/\/|mailto:|tel:)/i.test(
        String(valor || "").trim()
    );
}


/* =========================================================
   FORMATAÇÃO DO NOME
   ========================================================= */

function formatarNome(nome) {
    if (!nome) {
        return "";
    }

    return String(nome)
        .toLowerCase()
        .split(/([-'])/)
        .map(parte => {
            if (
                parte === "-" ||
                parte === "'"
            ) {
                return parte;
            }

            return (
                parte.charAt(0)
                    .toUpperCase() +
                parte.slice(1)
            );
        })
        .join("");
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function limparValor(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return "";
    }

    return String(valor).trim();
}


function possuiMaisDeUmaPalavra(
    texto
) {
    return normalizarTexto(texto)
        .split(" ")
        .filter(Boolean)
        .length > 1;
}

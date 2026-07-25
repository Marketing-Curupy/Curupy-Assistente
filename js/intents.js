/* =========================================================
   ACQUA — MOTOR DE INTENÇÕES
   ========================================================= */


/* =========================================================
   ENCONTRAR MELHOR RESPOSTA
   ========================================================= */

export function encontrarIntencao(
  mensagem,
  intencoes,
  contexto = {}
) {
  const texto = normalizarTexto(mensagem);

  if (
    !texto ||
    !Array.isArray(intencoes) ||
    intencoes.length === 0
  ) {
    return null;
  }

  const resultados = intencoes
    .filter(intencaoEstaAtiva)
    .map(item => {
      return {
        item,
        pontuacao: calcularPontuacao(
          texto,
          item,
          contexto
        )
      };
    })
    .filter(resultado => resultado.pontuacao > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao);

  if (resultados.length === 0) {
    return null;
  }

  const melhorResultado = resultados[0];

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
   CALCULAR PONTUAÇÃO
   ========================================================= */

function calcularPontuacao(
  texto,
  item,
  contexto
) {
  let pontuacao = 0;

  const exemplos =
    obterListaDoCampo(
      item.exemplos ||
      item.termos ||
      item.palavras_chave ||
      item.palavras
    );

  exemplos.forEach(exemplo => {
    const termo =
      normalizarTexto(exemplo);

    if (!termo) {
      return;
    }

    if (texto === termo) {
      pontuacao += 20;
      return;
    }

    if (texto.includes(termo)) {
      pontuacao +=
        termo.split(" ").length > 1
          ? 12
          : 7;

      return;
    }

    const palavras =
      termo
        .split(" ")
        .filter(palavra => palavra.length >= 3);

    palavras.forEach(palavra => {
      if (
        texto.split(" ").includes(palavra)
      ) {
        pontuacao += 2;
      }
    });

    const similaridade =
      calcularSimilaridade(texto, termo);

    if (similaridade >= 0.72) {
      pontuacao += Math.round(
        similaridade * 5
      );
    }
  });

  pontuacao += calcularPontosContexto(
    item,
    contexto
  );

  pontuacao += calcularPontosIntencao(
    texto,
    item
  );

  return pontuacao;
}


/* =========================================================
   CONTEXTO DA CONVERSA
   ========================================================= */

function calcularPontosContexto(
  item,
  contexto
) {
  let pontos = 0;

  const assuntoItem =
    normalizarTexto(item.assunto);

  const categoriaItem =
    normalizarTexto(item.categoria);

  const intencaoItem =
    normalizarTexto(
      item.intencao || item.id
    );

  const assuntoContexto =
    normalizarTexto(contexto.assunto);

  const categoriaContexto =
    normalizarTexto(contexto.categoria);

  const intencaoContexto =
    normalizarTexto(contexto.intencao);

  if (
    assuntoContexto &&
    assuntoItem === assuntoContexto
  ) {
    pontos += 3;
  }

  if (
    categoriaContexto &&
    categoriaItem === categoriaContexto
  ) {
    pontos += 4;
  }

  if (
    intencaoContexto &&
    intencaoItem === intencaoContexto
  ) {
    pontos += 1;
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

  const intencao =
    normalizarTexto(
      item.intencao || item.id
    );

  const grupos = {
    valores: [
      "valor",
      "valores",
      "preco",
      "quanto custa",
      "quanto e"
    ],

    compra: [
      "comprar",
      "compra",
      "site",
      "link",
      "adquirir"
    ],

    horario: [
      "horario",
      "abre",
      "fecha",
      "funcionamento",
      "que horas"
    ],

    reserva: [
      "reservar",
      "reserva",
      "disponibilidade",
      "agendar"
    ],

    localizacao: [
      "onde fica",
      "endereco",
      "localizacao",
      "mapa",
      "rota",
      "como chegar"
    ],

    pagamento: [
      "pagamento",
      "pagar",
      "pix",
      "cartao",
      "dinheiro",
      "pulseira"
    ],

    contato: [
      "telefone",
      "whatsapp",
      "contato",
      "falar com",
      "atendimento"
    ]
  };

  Object.entries(grupos).forEach(
    ([nomeGrupo, termos]) => {
      const encontrouTermo =
        termos.some(termo =>
          texto.includes(
            normalizarTexto(termo)
          )
        );

      const itemPertenceAoGrupo =
        intencao.includes(nomeGrupo);

      if (
        encontrouTermo &&
        itemPertenceAoGrupo
      ) {
        pontos += 5;
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
      item.id ||
      item.intencao ||
      "",

    assunto:
      item.assunto ||
      "",

    categoria:
      item.categoria ||
      "",

    intencao:
      item.intencao ||
      item.id ||
      "",

    resposta:
      item.resposta ||
      item.mensagem ||
      "",

    sugestoes:
      prepararSugestoes(item),

    contato:
      item.contato ||
      item.encaminhamento ||
      "",

    restrito:
      converterParaBooleano(
        item.restrito
      ),

    pontuacao,

    original: item
  };
}


/* =========================================================
   PREPARAR SUGESTÕES
   ========================================================= */

function prepararSugestoes(item) {
  if (
    Array.isArray(item.sugestoes)
  ) {
    return item.sugestoes;
  }

  const campo =
    item.sugestoes ||
    item.botoes ||
    item.respostas_rapidas ||
    "";

  if (!campo) {
    return [];
  }

  /*
    Formato aceito na planilha:

    Criança paga?|Criança paga?
    Comprar ingresso|https://curupy.com.br

    Cada sugestão pode ser separada por:
    - quebra de linha
    - ponto e vírgula

    Dentro de cada sugestão:
    TEXTO|MENSAGEM OU LINK
  */

  return String(campo)
    .split(/\n|;/)
    .map(valor => valor.trim())
    .filter(Boolean)
    .map(valor => {
      const partes =
        valor
          .split("|")
          .map(parte => parte.trim());

      const texto =
        partes[0] || "";

      const destino =
        partes[1] || texto;

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

  return 5;
}


/* =========================================================
   SUBSTITUIR VARIÁVEIS
   ========================================================= */

export function substituirVariaveis(
  texto,
  variaveis = {}
) {
  if (!texto) {
    return "";
  }

  return String(texto).replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    (resultado, chave) => {
      const valor =
        variaveis[chave];

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
      );

  if (!nomeLimpo) {
    return "";
  }

  const primeiroNome =
    nomeLimpo.split(" ")[0];

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
    extrairPrimeiroNome(texto);

  if (nome.length < 2) {
    return false;
  }

  const respostasInvalidas = [
    "sim",
    "nao",
    "oi",
    "ola",
    "bom",
    "boa",
    "ingresso",
    "ajuda",
    "duvida",
    "teste"
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
      .map(item => String(item).trim())
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
    .split(/\||;|\n/)
    .map(item => item.trim())
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
   SIMILARIDADE ENTRE TEXTOS
   ========================================================= */

function calcularSimilaridade(
  textoA,
  textoB
) {
  const palavrasA =
    new Set(
      normalizarTexto(textoA)
        .split(" ")
        .filter(Boolean)
    );

  const palavrasB =
    new Set(
      normalizarTexto(textoB)
        .split(" ")
        .filter(Boolean)
    );

  if (
    palavrasA.size === 0 ||
    palavrasB.size === 0
  ) {
    return 0;
  }

  let palavrasIguais = 0;

  palavrasA.forEach(palavra => {
    if (palavrasB.has(palavra)) {
      palavrasIguais += 1;
    }
  });

  const totalPalavras =
    new Set([
      ...palavrasA,
      ...palavrasB
    ]).size;

  return palavrasIguais / totalPalavras;
}


/* =========================================================
   CONVERSÕES
   ========================================================= */

function converterParaBooleano(valor) {
  if (typeof valor === "boolean") {
    return valor;
  }

  const texto =
    normalizarTexto(valor);

  return [
    "sim",
    "s",
    "true",
    "1",
    "ativo"
  ].includes(texto);
}


function ehLink(valor) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(
    String(valor || "")
  );
}


function formatarNome(nome) {
  if (!nome) {
    return "";
  }

  return (
    nome.charAt(0).toUpperCase() +
    nome.slice(1).toLowerCase()
  );
}

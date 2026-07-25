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


/* =========================================================
   ESTADO DA CONVERSA
   ========================================================= */

const estado = {
  iniciado: false,
  processando: false,
  aguardandoNome: false,

  visitante: {
    nome: ""
  },

  contexto: {
    assunto: "",
    categoria: "",
    intencao: ""
  },

  historico: [],

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

export function configurarBaseConhecimento(
  dados
) {
  estado.base = {
    intencoes:
      Array.isArray(dados?.intencoes)
        ? dados.intencoes
        : [],

    configuracoes:
      dados?.configuracoes || {},

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
      dados?.hospedagem || {},

    bangalo:
      dados?.bangalo || {},

    quiosque:
      dados?.quiosque || {}
  };
}


/* =========================================================
   INICIAR CONVERSA
   ========================================================= */

export async function iniciarConversa() {
  if (estado.processando) {
    return;
  }

  estado.iniciado = true;
  estado.processando = true;

  limparMensagens();
  limparSugestoes();
  limparCampo();

  redefinirContexto();
  redefinirVisitante();

  bloquearCampo(true);

  await esperarDigitacao();

  const devePerguntarNome =
    obterConfiguracaoBooleana(
      "perguntar_nome",
      true
    );

  if (devePerguntarNome) {
    estado.aguardandoNome = true;

    const mensagem =
      obterConfiguracao(
        "mensagem_pedir_nome",
        "Olá! 👋\nSou o Acqua, assistente virtual do Curupy.\n\nAntes de começarmos, como posso chamar você?"
      );

    adicionarMensagemAssistente(
      mensagem
    );
  } else {
    await apresentarMenuInicial();
  }

  estado.processando = false;

  bloquearCampo(false);
  focarCampo();
}


/* =========================================================
   REINICIAR CONVERSA
   ========================================================= */

export async function reiniciarConversa() {
  estado.processando = false;
  estado.aguardandoNome = false;
  estado.historico = [];

  redefinirContexto();
  redefinirVisitante();

  await iniciarConversa();
}


/* =========================================================
   PROCESSAR MENSAGEM
   ========================================================= */

export async function processarMensagem(
  mensagem
) {
  const texto =
    String(mensagem || "").trim();

  if (
    !texto ||
    estado.processando
  ) {
    return;
  }

  estado.processando = true;

  bloquearCampo(true);
  limparCampo();
  limparSugestoes();

  adicionarMensagemUsuario(texto);

  adicionarAoHistorico(
    "usuario",
    texto
  );

  if (estado.aguardandoNome) {
    await processarNome(texto);

    estado.processando = false;

    bloquearCampo(false);
    focarCampo();

    return;
  }

  await esperarDigitacao();

  const resultado =
    encontrarIntencao(
      texto,
      estado.base.intencoes,
      estado.contexto
    );

  if (resultado) {
    responderIntencao(resultado);
  } else {
    responderFallback(texto);
  }

  estado.processando = false;

  bloquearCampo(false);
  focarCampo();
}


/* =========================================================
   PROCESSAR NOME
   ========================================================= */

async function processarNome(
  mensagem
) {
  await esperarDigitacao();

  if (!nomePareceValido(mensagem)) {
    const mensagemInvalida =
      obterConfiguracao(
        "mensagem_nome_invalido",
        "Não consegui identificar seu nome 😊\n\nDigite apenas o seu primeiro nome."
      );

    adicionarMensagemAssistente(
      mensagemInvalida
    );

    estado.aguardandoNome = true;

    return;
  }

  const nome =
    extrairPrimeiroNome(mensagem);

  estado.visitante.nome = nome;
  estado.aguardandoNome = false;

  const mensagemBoasVindas =
    obterConfiguracao(
      "mensagem_boas_vindas",
      "Prazer, {nome}! 😊\n\nComo posso ajudar você hoje?"
    );

  const mensagemFormatada =
    substituirVariaveis(
      mensagemBoasVindas,
      obterVariaveis()
    );

  adicionarMensagemAssistente(
    mensagemFormatada
  );

  adicionarAoHistorico(
    "assistente",
    mensagemFormatada
  );

  mostrarMenuInicial();
}


/* =========================================================
   APRESENTAR MENU INICIAL
   ========================================================= */

async function apresentarMenuInicial() {
  await esperarDigitacao();

  const mensagem =
    obterConfiguracao(
      "mensagem_inicial",
      "Olá! 👋\nSou o Acqua, assistente virtual do Curupy.\n\nComo posso ajudar você hoje?"
    );

  const mensagemFormatada =
    substituirVariaveis(
      mensagem,
      obterVariaveis()
    );

  adicionarMensagemAssistente(
    mensagemFormatada
  );

  adicionarAoHistorico(
    "assistente",
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
  const fluxo =
    estado.base.fluxoInicial
      .filter(item => itemEstaAtivo(item))
      .sort((a, b) => {
        return (
          Number(a.ordem || 0) -
          Number(b.ordem || 0)
        );
      });

  if (fluxo.length > 0) {
    return fluxo.map(item => {
      const texto =
        item.texto ||
        item.titulo ||
        item.botao ||
        item.nome ||
        "Opção";

      const destino =
        item.mensagem ||
        item.pergunta ||
        item.destino ||
        texto;

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

  return [
    {
      texto: "🎟 Ingressos",
      mensagem:
        "Quero informações sobre ingressos"
    },
    {
      texto: "📅 Funcionamento",
      mensagem:
        "Quero saber o funcionamento"
    },
    {
      texto: "🏨 Hospedagem",
      mensagem:
        "Quero saber sobre hospedagem"
    },
    {
      texto: "💎 Sócios",
      mensagem:
        "Quero informações para sócios"
    },
    {
      texto: "📋 Regras",
      mensagem:
        "Quero conhecer as regras"
    },
    {
      texto: "📍 Como chegar",
      mensagem:
        "Como chegar ao Curupy?"
    }
  ];
}


/* =========================================================
   RESPONDER INTENÇÃO
   ========================================================= */

function responderIntencao(
  resultado
) {
  atualizarContexto(resultado);

  const resposta =
    substituirVariaveis(
      resultado.resposta,
      obterVariaveis()
    );

  if (!resposta) {
    responderFallback("");
    return;
  }

  adicionarMensagemAssistente(
    resposta
  );

  adicionarAoHistorico(
    "assistente",
    resposta
  );

  const sugestoes =
    prepararSugestoesComVariaveis(
      resultado.sugestoes
    );

  if (sugestoes.length > 0) {
    atualizarSugestoes(
      sugestoes,
      processarMensagem
    );
  } else {
    atualizarSugestoes(
      [
        {
          texto: "🏠 Menu principal",
          mensagem:
            "Quero voltar ao menu principal"
        }
      ],
      processarAcaoEspecial
    );
  }
}


/* =========================================================
   FALLBACK
   ========================================================= */

function responderFallback(
  mensagemOriginal
) {
  const mensagem =
    obterConfiguracao(
      "mensagem_fallback",
      CONFIG.fallback.mensagem
    );

  const mensagemFormatada =
    substituirVariaveis(
      mensagem,
      obterVariaveis()
    );

  adicionarMensagemAssistente(
    mensagemFormatada
  );

  adicionarAoHistorico(
    "assistente",
    mensagemFormatada
  );

  const sugestoes = [
    {
      texto: "🎟 Ingressos",
      mensagem:
        "Quero informações sobre ingressos"
    },
    {
      texto: "📅 Funcionamento",
      mensagem:
        "Quero saber o funcionamento"
    },
    {
      texto: "🏨 Hospedagem",
      mensagem:
        "Quero saber sobre hospedagem"
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
    processarMensagem
  );
}


/* =========================================================
   AÇÕES ESPECIAIS
   ========================================================= */

async function processarAcaoEspecial(
  mensagem
) {
  const texto =
    String(mensagem || "")
      .toLowerCase();

  if (
    texto.includes(
      "menu principal"
    )
  ) {
    adicionarMensagemUsuario(
      "Voltar ao menu principal"
    );

    limparSugestoes();

    await esperarDigitacao();

    const mensagemMenu =
      substituirVariaveis(
        obterConfiguracao(
          "mensagem_menu",
          "Claro, {nome}! Escolha uma opção abaixo:"
        ),
        obterVariaveis()
      );

    adicionarMensagemAssistente(
      mensagemMenu
    );

    mostrarMenuInicial();

    bloquearCampo(false);
    focarCampo();

    return;
  }

  await processarMensagem(mensagem);
}


/* =========================================================
   CONTEXTO
   ========================================================= */

function atualizarContexto(
  resultado
) {
  if (resultado.assunto) {
    estado.contexto.assunto =
      resultado.assunto;
  }

  if (resultado.categoria) {
    estado.contexto.categoria =
      resultado.categoria;
  }

  if (resultado.intencao) {
    estado.contexto.intencao =
      resultado.intencao;
  }
}


function redefinirContexto() {
  estado.contexto = {
    assunto: "",
    categoria: "",
    intencao: ""
  };
}


function redefinirVisitante() {
  estado.visitante = {
    nome: ""
  };
}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function adicionarAoHistorico(
  remetente,
  mensagem
) {
  estado.historico.push({
    remetente,
    mensagem,
    horario: Date.now()
  });

  if (
    estado.historico.length >
    CONFIG.limiteHistorico
  ) {
    estado.historico =
      estado.historico.slice(
        -CONFIG.limiteHistorico
      );
  }
}


export function obterHistorico() {
  return [...estado.historico];
}


/* =========================================================
   CONFIGURAÇÕES DA PLANILHA
   ========================================================= */

function obterConfiguracao(
  chave,
  valorPadrao = ""
) {
  const configuracoes =
    estado.base.configuracoes;

  if (
    configuracoes &&
    !Array.isArray(configuracoes) &&
    configuracoes[chave] !== undefined
  ) {
    return configuracoes[chave];
  }

  if (Array.isArray(configuracoes)) {
    const item =
      configuracoes.find(config => {
        const nome =
          config.chave ||
          config.configuracao ||
          config.nome;

        return nome === chave;
      });

    if (item) {
      return (
        item.valor ??
        item.conteudo ??
        item.mensagem ??
        valorPadrao
      );
    }
  }

  return valorPadrao;
}


function obterConfiguracaoBooleana(
  chave,
  valorPadrao
) {
  const valor =
    obterConfiguracao(
      chave,
      valorPadrao
    );

  if (typeof valor === "boolean") {
    return valor;
  }

  const texto =
    String(valor)
      .toLowerCase()
      .trim();

  if (
    [
      "sim",
      "true",
      "1",
      "ativo"
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
      "inativo"
    ].includes(texto)
  ) {
    return false;
  }

  return Boolean(valorPadrao);
}


/* =========================================================
   SUGESTÕES
   ========================================================= */

function prepararSugestoesComVariaveis(
  sugestoes
) {
  if (!Array.isArray(sugestoes)) {
    return [];
  }

  return sugestoes
    .filter(Boolean)
    .map(sugestao => {
      return {
        ...sugestao,

        texto:
          substituirVariaveis(
            sugestao.texto,
            obterVariaveis()
          ),

        mensagem:
          substituirVariaveis(
            sugestao.mensagem,
            obterVariaveis()
          ),

        link:
          substituirVariaveis(
            sugestao.link,
            obterVariaveis()
          )
      };
    });
}


/* =========================================================
   VARIÁVEIS
   ========================================================= */

function obterVariaveis() {
  return {
    nome:
      estado.visitante.nome ||
      "visitante",

    nome_assistente:
      CONFIG.nomeAssistente,

    site:
      CONFIG.linksEmergencia.site,

    whatsapp:
      CONFIG.linksEmergencia
        .whatsappGeral,

    localizacao:
      CONFIG.linksEmergencia
        .localizacao
  };
}


/* =========================================================
   DIGITAÇÃO
   ========================================================= */

async function esperarDigitacao() {
  mostrarDigitando();

  const minimo =
    Number(
      CONFIG.tempoDigitando.minimo
    ) || 600;

  const maximo =
    Number(
      CONFIG.tempoDigitando.maximo
    ) || 1200;

  const duracao =
    Math.floor(
      Math.random() *
      (maximo - minimo + 1)
    ) + minimo;

  await esperar(duracao);

  removerDigitando();
}


function esperar(tempo) {
  return new Promise(resolve => {
    window.setTimeout(
      resolve,
      tempo
    );
  });
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function obterLinkWhatsAppFallback(
  mensagemOriginal
) {
  const linkConfigurado =
    obterConfiguracao(
      "whatsapp_geral",
      CONFIG.linksEmergencia
        .whatsappGeral
    );

  if (!linkConfigurado) {
    return "";
  }

  const texto =
    mensagemOriginal
      ? `Olá! Preciso de ajuda com esta dúvida: ${mensagemOriginal}`
      : "Olá! Preciso de ajuda com uma informação do Curupy.";

  if (
    linkConfigurado.includes(
      "wa.me"
    )
  ) {
    const separador =
      linkConfigurado.includes("?")
        ? "&"
        : "?";

    return (
      linkConfigurado +
      separador +
      `text=${encodeURIComponent(texto)}`
    );
  }

  return linkConfigurado;
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function itemEstaAtivo(item) {
  if (
    item.ativo === undefined ||
    item.ativo === null ||
    item.ativo === ""
  ) {
    return true;
  }

  const valor =
    String(item.ativo)
      .toLowerCase()
      .trim();

  return [
    "sim",
    "true",
    "1",
    "ativo"
  ].includes(valor);
}


function ehLink(valor) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(
    String(valor || "")
  );
}


/* =========================================================
   CONSULTAS DE ESTADO
   ========================================================= */

export function conversaFoiIniciada() {
  return estado.iniciado;
}


export function conversaEstaProcessando() {
  return estado.processando;
}


export function obterEstadoConversa() {
  return {
    iniciado:
      estado.iniciado,

    processando:
      estado.processando,

    aguardandoNome:
      estado.aguardandoNome,

    visitante: {
      ...estado.visitante
    },

    contexto: {
      ...estado.contexto
    }
  };
}

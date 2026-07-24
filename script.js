/* =========================================================
   ASSISTENTE CURUPY
   SCRIPT COMPLETO
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const chat =
  document.getElementById("chat");

const chatBotaoFlutuante =
  document.getElementById("chatBotaoFlutuante");

const abrirChatTeste =
  document.getElementById("abrirChatTeste");

const fecharChat =
  document.getElementById("fecharChat");

const reiniciarChat =
  document.getElementById("reiniciarChat");

const chatMensagens =
  document.getElementById("chatMensagens");

const chatRespostasRapidas =
  document.getElementById("chatRespostasRapidas");

const chatFormulario =
  document.getElementById("chatFormulario");

const chatCampo =
  document.getElementById("chatCampo");


/* =========================================================
   VERIFICAÇÃO DO HTML
   ========================================================= */

const elementosObrigatorios = [
  chat,
  chatBotaoFlutuante,
  fecharChat,
  reiniciarChat,
  chatMensagens,
  chatRespostasRapidas,
  chatFormulario,
  chatCampo
];

const existemElementosAusentes =
  elementosObrigatorios.some(
    elemento => !elemento
  );

if (existemElementosAusentes) {
  console.error(
    "Assistente Curupy: alguns elementos do HTML não foram encontrados."
  );
}


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CONFIGURACOES = {
  whatsapp: "6630151337",

  links: {
    site: "https://curupy.com.br",
    ingressos: "https://curupy.com.br",
    hospedagem: "https://marketing-curupy.github.io/Reservas/#hospedagem",
    localizacao:
      "https://maps.app.goo.gl/fKZki9NEw4o3drdH7"
  },

  tempoDigitando: 700
};


/* =========================================================
   ESTADO
   ========================================================= */

const estado = {
  iniciado: false,
  processando: false,

  contexto: {
    assunto: null,
    categoria: null,
    intencao: null
  }
};


/* =========================================================
   BASE DE RESPOSTAS
   ========================================================= */

const base = [
  {
    id: "ingressos-geral",

    assunto: "ingressos",

    categoria: null,

    intencao: "geral",

    termos: [
      "ingresso",
      "ingressos",
      "entrada",
      "bilheteria",
      "comprar ingresso"
    ],

    resposta:
      "Claro 😊\n\nTemos ingressos nas categorias Adulto, Kids e Melhor Idade.\n\nA compra online deve ser realizada pelo site oficial com pelo menos 1 dia de antecedência.",

    sugestoes: [
      {
        texto: "👧 Criança paga?",
        mensagem: "Criança paga?"
      },
      {
        texto: "💰 Valores",
        mensagem: "Quero saber os valores"
      },
      {
        texto: "🛒 Como comprar",
        mensagem: "Como comprar ingresso?"
      },
      {
        texto: "🎟 Abrir site",
        link: CONFIGURACOES.links.ingressos
      }
    ]
  },

  {
    id: "kids-geral",

    assunto: "ingressos",

    categoria: "kids",

    intencao: "geral",

    termos: [
      "criança paga",
      "crianca paga",
      "ingresso kids",
      "ingresso infantil",
      "meu filho paga",
      "meu filho precisa pagar",
      "qual idade paga"
    ],

    resposta:
      "Crianças de 5 a 11 anos utilizam o ingresso da categoria Kids 😊\n\nÉ necessário apresentar um documento oficial na entrada.",

    sugestoes: [
      {
        texto: "💰 Ver valores",
        mensagem: "Qual o valor do ingresso Kids?"
      },
      {
        texto: "👶 Até 4 anos",
        mensagem: "Criança de até 4 anos paga?"
      },
      {
        texto: "🛒 Como comprar",
        mensagem: "Como comprar ingresso Kids?"
      }
    ]
  },

  {
    id: "kids-gratuidade",

    assunto: "ingressos",

    categoria: "kids",

    intencao: "gratuidade",

    termos: [
      "até 4 anos",
      "ate 4 anos",
      "criança de 4 anos",
      "crianca de 4 anos",
      "criança de 3 anos",
      "crianca de 3 anos",
      "bebê paga",
      "bebe paga",
      "menor de 5 anos"
    ],

    resposta:
      "Crianças de 0 a 4 anos não pagam 😊\n\nÉ necessário apresentar um documento oficial para comprovar a idade.",

    sugestoes: [
      {
        texto: "👧 Ingresso Kids",
        mensagem: "Como funciona o ingresso Kids?"
      },
      {
        texto: "🎟 Comprar ingresso",
        link: CONFIGURACOES.links.ingressos
      }
    ]
  },

  {
    id: "kids-valores",

    assunto: "ingressos",

    categoria: "kids",

    intencao: "valores",

    termos: [
      "valor kids",
      "valor do ingresso kids",
      "preço kids",
      "preco kids",
      "quanto custa para criança",
      "quanto custa para crianca",
      "valor para criança",
      "valor para crianca"
    ],

    resposta:
      "O valor do ingresso Kids pode variar conforme a data e o canal de compra 😊\n\nNo site oficial, escolha a data da visita para consultar o valor disponível.\n\nA compra online deve ser feita com pelo menos 1 dia de antecedência.",

    sugestoes: [
      {
        texto: "🎟 Consultar no site",
        link: CONFIGURACOES.links.ingressos
      },
      {
        texto: "📅 Funcionamento",
        mensagem: "Quero saber o funcionamento"
      }
    ]
  },

  {
    id: "compra-ingresso",

    assunto: "ingressos",

    categoria: null,

    intencao: "compra",

    termos: [
      "como comprar ingresso",
      "onde comprar ingresso",
      "quero comprar ingresso",
      "comprar pelo site",
      "link para comprar"
    ],

    resposta:
      "A compra pode ser feita pelo site oficial do Curupy 😊\n\nEscolha a data, selecione a categoria e finalize o pagamento.\n\nA compra online precisa ser realizada com pelo menos 1 dia de antecedência.",

    sugestoes: [
      {
        texto: "🎟 Comprar no site",
        link: CONFIGURACOES.links.ingressos
      },
      {
        texto: "💰 Ver valores",
        mensagem: "Quero saber os valores"
      }
    ]
  },

  {
    id: "funcionamento",

    assunto: "funcionamento",

    categoria: null,

    intencao: "horario",

    termos: [
      "funcionamento",
      "horário",
      "horario",
      "que horas abre",
      "que horas fecha",
      "abre hoje",
      "abre amanhã",
      "abre amanha",
      "dias de funcionamento"
    ],

    resposta:
      "Os dias e horários podem mudar conforme o calendário do parque 😊\n\nPor isso, consulte sempre o calendário oficial antes da visita.",

    sugestoes: [
      {
        texto: "📅 Consultar calendário",
        link: CONFIGURACOES.links.site
      },
      {
        texto: "🎟 Comprar ingresso",
        link: CONFIGURACOES.links.ingressos
      }
    ]
  },

  {
    id: "hospedagem",

    assunto: "hospedagem",

    categoria: null,

    intencao: "geral",

    termos: [
      "hospedagem",
      "hotel",
      "chalé",
      "chale",
      "reservar chalé",
      "reservar chale",
      "ficar hospedado"
    ],

    resposta:
      "O Curupy possui hospedagem em chalés 😊\n\nA hospedagem inclui café da manhã e acesso ao parque no dia da entrada e da saída, conforme as condições da reserva.",

    sugestoes: [
      {
        texto: "🕑 Check-in e check-out",
        mensagem: "Qual o horário de check-in e check-out?"
      },
      {
        texto: "🏨 Consultar hospedagem",
        link: CONFIGURACOES.links.hospedagem
      }
    ]
  },

  {
    id: "hospedagem-horario",

    assunto: "hospedagem",

    categoria: null,

    intencao: "horario",

    termos: [
      "check-in",
      "check in",
      "check-out",
      "check out",
      "horário do chalé",
      "horario do chale"
    ],

    resposta:
      "O check-in é realizado a partir das 14h e o check-out até as 11h 😊",

    sugestoes: [
      {
        texto: "🏨 Sobre os chalés",
        mensagem: "O que tem nos chalés?"
      },
      {
        texto: "📲 Fazer reserva",
        link: CONFIGURACOES.links.hospedagem
      }
    ]
  },

  {
    id: "socio",

    assunto: "socio",

    categoria: null,

    intencao: "geral",

    termos: [
      "sócio",
      "socio",
      "associado",
      "carteirinha",
      "convidado de sócio",
      "convidado de socio"
    ],

    resposta:
      "Associados devem apresentar a carteirinha vigente 😊\n\nPara informações sobre planos, convidados ou situação cadastral, fale com a equipe responsável.",

    sugestoes: [
      {
        texto: "💬 Falar no WhatsApp",
        link: criarLinkWhatsApp(
          "Olá! Preciso de informações sobre o Clube de Associados."
        )
      },
      {
        texto: "🎟 Ingressos",
        mensagem: "Quero informações sobre ingressos"
      }
    ]
  },

  {
    id: "regras",

    assunto: "regras",

    categoria: null,

    intencao: "geral",

    termos: [
      "regras",
      "regra do parque",
      "o que é proibido",
      "o que e proibido",
      "o que pode levar",
      "regras de acesso"
    ],

    resposta:
      "Para uma visita tranquila, siga as orientações dos monitores, mantenha as crianças acompanhadas e utilize trajes adequados para piscina 😊\n\nQual regra você deseja consultar?",

    sugestoes: [
      {
        texto: "🍕 Posso levar comida?",
        mensagem: "Posso levar comida?"
      },
      {
        texto: "🚭 Pode fumar?",
        mensagem: "Pode fumar no parque?"
      },
      {
        texto: "🩱 Trajes permitidos",
        mensagem: "Quais roupas são permitidas?"
      },
      {
        texto: "💳 Pagamentos",
        mensagem: "Como pagar dentro do parque?"
      }
    ]
  },

  {
    id: "alimentacao",

    assunto: "regras",

    categoria: "alimentacao",

    intencao: "geral",

    termos: [
      "posso levar comida",
      "pode levar comida",
      "pode entrar com alimento",
      "posso levar lanche",
      "comer na piscina",
      "alimentos"
    ],

    resposta:
      "Pode levar alimentos 😊\n\nEles devem ser consumidos nos espaços apropriados.\n\nNão é permitido consumir alimentos dentro das piscinas ou em suas bordas.",

    sugestoes: [
      {
        texto: "🥤 E bebidas?",
        mensagem: "Posso levar bebidas?"
      },
      {
        texto: "🍔 Onde comer?",
        mensagem: "Onde posso comer no parque?"
      }
    ]
  },

  {
    id: "fumo",

    assunto: "regras",

    categoria: "fumo",

    intencao: "geral",

    termos: [
      "pode fumar",
      "onde fumar",
      "vape",
      "cigarro eletrônico",
      "cigarro eletronico",
      "área de fumante",
      "area de fumante"
    ],

    resposta:
      "Não é permitido fumar nas áreas comuns, inclusive cigarros eletrônicos e vapes.\n\nUtilize somente o espaço destinado a fumantes, ao lado da Hamburgueria.",

    sugestoes: [
      {
        texto: "📋 Outras regras",
        mensagem: "Quero conhecer as regras"
      },
      {
        texto: "📍 Localização",
        mensagem: "Como chegar ao Curupy?"
      }
    ]
  },

  {
    id: "pagamentos",

    assunto: "regras",

    categoria: "pagamentos",

    intencao: "geral",

    termos: [
      "formas de pagamento",
      "aceita dinheiro",
      "aceita pix",
      "aceita cartão",
      "aceita cartao",
      "pulseira de consumo",
      "como pagar"
    ],

    resposta:
      "Nos pontos de venda, os pagamentos são feitos por cartão, PIX ou pulseira de consumo recarregável.\n\nNão é aceito dinheiro em espécie nos pontos de venda.",

    sugestoes: [
      {
        texto: "💳 Pulseira de consumo",
        mensagem: "Como funciona a pulseira de consumo?"
      },
      {
        texto: "📋 Outras regras",
        mensagem: "Quero conhecer as regras"
      }
    ]
  },

  {
    id: "localizacao",

    assunto: "localizacao",

    categoria: null,

    intencao: "geral",

    termos: [
      "como chegar",
      "onde fica",
      "localização",
      "localizacao",
      "endereço",
      "endereco",
      "abrir mapa",
      "abrir rota"
    ],

    resposta:
      "Posso abrir a localização para você 😊\n\nUse o botão abaixo para consultar a rota até o Curupy.",

    sugestoes: [
      {
        texto: "📍 Abrir mapa",
        link: CONFIGURACOES.links.localizacao
      },
      {
        texto: "📅 Funcionamento",
        mensagem: "Quero saber o funcionamento"
      }
    ]
  }
];


/* =========================================================
   SUGESTÕES INICIAIS
   ========================================================= */

const sugestoesIniciais = [
  {
    texto: "🎟 Ingressos",
    mensagem: "Quero informações sobre ingressos"
  },
  {
    texto: "📅 Funcionamento",
    mensagem: "Quero saber o funcionamento"
  },
  {
    texto: "🏨 Hospedagem",
    mensagem: "Quero saber sobre hospedagem"
  },
  {
    texto: "💎 Sócios",
    mensagem: "Quero informações para sócios"
  },
  {
    texto: "📋 Regras",
    mensagem: "Quero conhecer as regras"
  },
  {
    texto: "📍 Como chegar",
    mensagem: "Como chegar ao Curupy?"
  }
];


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  iniciarAplicacao
);

function iniciarAplicacao() {
  if (existemElementosAusentes) {
    return;
  }

  chat.setAttribute(
    "aria-hidden",
    "true"
  );

  chatBotaoFlutuante.setAttribute(
    "aria-expanded",
    "false"
  );

  adicionarEventos();
}


/* =========================================================
   EVENTOS
   ========================================================= */

function adicionarEventos() {
  chatBotaoFlutuante.addEventListener(
    "click",
    abrirChat
  );

  if (abrirChatTeste) {
    abrirChatTeste.addEventListener(
      "click",
      abrirChat
    );
  }

  fecharChat.addEventListener(
    "click",
    fecharJanelaChat
  );

  reiniciarChat.addEventListener(
    "click",
    reiniciarConversa
  );

  chatFormulario.addEventListener(
    "submit",
    enviarFormulario
  );

  document.addEventListener(
    "keydown",
    evento => {
      if (evento.key === "Escape") {
        fecharJanelaChat();
      }
    }
  );
}


/* =========================================================
   ABRIR E FECHAR
   ========================================================= */

function abrirChat() {
  chat.classList.add(
    "chat--aberto"
  );

  chat.setAttribute(
    "aria-hidden",
    "false"
  );

  chatBotaoFlutuante.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.classList.add(
    "chat-aberto"
  );

  if (!estado.iniciado) {
    estado.iniciado = true;
    iniciarConversa();
  }

  setTimeout(
    () => {
      chatCampo.focus();
    },
    300
  );
}

function fecharJanelaChat() {
  chat.classList.remove(
    "chat--aberto"
  );

  chat.setAttribute(
    "aria-hidden",
    "true"
  );

  chatBotaoFlutuante.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.classList.remove(
    "chat-aberto"
  );
}


/* =========================================================
   INICIAR E REINICIAR
   ========================================================= */

async function iniciarConversa() {
  limparMensagens();
  limparSugestoes();

  await mostrarDigitando();

  adicionarMensagemAssistente(
    "Olá! 👋\nSou o Assistente Curupy.\n\nPosso ajudar com informações sobre ingressos, funcionamento, hospedagem, regras e localização."
  );

  mostrarSugestoes(
    sugestoesIniciais
  );
}

function reiniciarConversa() {
  estado.contexto = {
    assunto: null,
    categoria: null,
    intencao: null
  };

  estado.processando = false;

  bloquearFormulario(false);

  iniciarConversa();
}


/* =========================================================
   ENVIO
   ========================================================= */

async function enviarFormulario(evento) {
  evento.preventDefault();

  const mensagem =
    chatCampo.value.trim();

  if (
    !mensagem ||
    estado.processando
  ) {
    return;
  }

  chatCampo.value = "";

  adicionarMensagemUsuario(
    mensagem
  );

  limparSugestoes();

  await processarMensagem(
    mensagem
  );
}


/* =========================================================
   PROCESSAMENTO
   ========================================================= */

async function processarMensagem(mensagem) {
  estado.processando = true;

  bloquearFormulario(true);

  const texto =
    normalizarTexto(mensagem);

  await mostrarDigitando();

  const item =
    encontrarResposta(texto);

  if (item) {
    responderComItem(item);
  } else {
    responderFallback(mensagem);
  }

  estado.processando = false;

  bloquearFormulario(false);

  chatCampo.focus();
}


/* =========================================================
   BUSCA DE RESPOSTA
   ========================================================= */

function encontrarResposta(texto) {
  const resultadoDireto =
    encontrarPorPontuacao(texto);

  if (
    resultadoDireto &&
    resultadoDireto.pontuacao >= 4
  ) {
    return resultadoDireto.item;
  }

  const resultadoContextual =
    encontrarPorContexto(texto);

  if (resultadoContextual) {
    return resultadoContextual;
  }

  return null;
}

function encontrarPorPontuacao(texto) {
  let melhor = null;

  base.forEach(item => {
    let pontuacao = 0;

    item.termos.forEach(termo => {
      const termoNormalizado =
        normalizarTexto(termo);

      if (texto === termoNormalizado) {
        pontuacao += 10;
      } else if (
        texto.includes(
          termoNormalizado
        )
      ) {
        pontuacao += 6;
      } else {
        const palavras =
          termoNormalizado
            .split(" ")
            .filter(
              palavra =>
                palavra.length >= 4
            );

        palavras.forEach(palavra => {
          if (
            texto.includes(palavra)
          ) {
            pontuacao += 1;
          }
        });
      }
    });

    if (
      estado.contexto.assunto &&
      item.assunto ===
        estado.contexto.assunto
    ) {
      pontuacao += 1;
    }

    if (
      estado.contexto.categoria &&
      item.categoria ===
        estado.contexto.categoria
    ) {
      pontuacao += 2;
    }

    if (
      !melhor ||
      pontuacao > melhor.pontuacao
    ) {
      melhor = {
        item,
        pontuacao
      };
    }
  });

  return melhor;
}

function encontrarPorContexto(texto) {
  if (!estado.contexto.assunto) {
    return null;
  }

  let intencao = null;

  if (
    possuiAlgumTermo(
      texto,
      [
        "valor",
        "valores",
        "preço",
        "preco",
        "quanto custa"
      ]
    )
  ) {
    intencao = "valores";
  }

  if (
    possuiAlgumTermo(
      texto,
      [
        "comprar",
        "compra",
        "site",
        "link"
      ]
    )
  ) {
    intencao = "compra";
  }

  if (
    possuiAlgumTermo(
      texto,
      [
        "horário",
        "horario",
        "funcionamento",
        "abre",
        "fecha"
      ]
    )
  ) {
    intencao = "horario";
  }

  if (!intencao) {
    return null;
  }

  return base.find(item => {
    const mesmoAssunto =
      item.assunto ===
      estado.contexto.assunto;

    const mesmaCategoria =
      !estado.contexto.categoria ||
      !item.categoria ||
      item.categoria ===
      estado.contexto.categoria;

    const mesmaIntencao =
      item.intencao ===
      intencao;

    return (
      mesmoAssunto &&
      mesmaCategoria &&
      mesmaIntencao
    );
  });
}


/* =========================================================
   RESPOSTAS
   ========================================================= */

function responderComItem(item) {
  atualizarContexto(item);

  adicionarMensagemAssistente(
    item.resposta
  );

  mostrarSugestoes(
    item.sugestoes || []
  );
}

function responderFallback(mensagem) {
  adicionarMensagemAssistente(
    "Ainda não consegui entender exatamente essa dúvida 😅\n\nEscolha um dos assuntos abaixo ou fale com nossa equipe pelo WhatsApp."
  );

  mostrarSugestoes([
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
      texto: "💬 Falar no WhatsApp",
      link: criarLinkWhatsApp(
        `Olá! Preciso de ajuda com esta dúvida: ${mensagem}`
      )
    }
  ]);
}


/* =========================================================
   CONTEXTO
   ========================================================= */

function atualizarContexto(item) {
  if (item.assunto) {
    estado.contexto.assunto =
      item.assunto;
  }

  if (item.categoria) {
    estado.contexto.categoria =
      item.categoria;
  }

  if (item.intencao) {
    estado.contexto.intencao =
      item.intencao;
  }
}


/* =========================================================
   MENSAGENS
   ========================================================= */

function adicionarMensagemAssistente(
  texto
) {
  adicionarMensagem(
    texto,
    "assistente"
  );
}

function adicionarMensagemUsuario(
  texto
) {
  adicionarMensagem(
    texto,
    "usuario"
  );
}

function adicionarMensagem(
  texto,
  remetente
) {
  const linha =
    document.createElement("div");

  linha.className =
    remetente === "usuario"
      ? "mensagem-linha mensagem-linha--usuario"
      : "mensagem-linha";

  const mensagem =
    document.createElement("div");

  mensagem.className =
    remetente === "usuario"
      ? "mensagem mensagem--usuario"
      : "mensagem mensagem--assistente";

  const conteudo =
    document.createElement("div");

  conteudo.innerHTML =
    transformarTexto(texto);

  const horario =
    document.createElement("span");

  horario.className =
    "mensagem__horario";

  horario.textContent =
    obterHorario();

  mensagem.appendChild(
    conteudo
  );

  mensagem.appendChild(
    horario
  );

  linha.appendChild(
    mensagem
  );

  chatMensagens.appendChild(
    linha
  );

  rolarParaFinal();
}


/* =========================================================
   DIGITANDO
   ========================================================= */

function mostrarDigitando() {
  return new Promise(resolve => {
    removerDigitando();

    const linha =
      document.createElement("div");

    linha.className =
      "mensagem-linha";

    linha.id =
      "linhaDigitando";

    linha.innerHTML = `
      <div
        class="chat__digitando"
        aria-label="Assistente digitando"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    chatMensagens.appendChild(
      linha
    );

    rolarParaFinal();

    setTimeout(
      () => {
        removerDigitando();
        resolve();
      },
      CONFIGURACOES.tempoDigitando
    );
  });
}

function removerDigitando() {
  const digitando =
    document.getElementById(
      "linhaDigitando"
    );

  if (digitando) {
    digitando.remove();
  }
}


/* =========================================================
   SUGESTÕES
   ========================================================= */

function mostrarSugestoes(sugestoes) {
  limparSugestoes();

  sugestoes.forEach(sugestao => {
    const botao =
      document.createElement("button");

    botao.type = "button";

    botao.className =
      "chat__resposta-rapida";

    botao.textContent =
      sugestao.texto;

    botao.addEventListener(
      "click",
      async () => {
        if (estado.processando) {
          return;
        }

        if (sugestao.link) {
          window.open(
            sugestao.link,
            "_blank",
            "noopener,noreferrer"
          );

          return;
        }

        const mensagem =
          sugestao.mensagem ||
          sugestao.texto;

        adicionarMensagemUsuario(
          mensagem
        );

        limparSugestoes();

        await processarMensagem(
          mensagem
        );
      }
    );

    chatRespostasRapidas.appendChild(
      botao
    );
  });
}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

function bloquearFormulario(
  bloquear
) {
  chatCampo.disabled =
    bloquear;

  const botao =
    chatFormulario.querySelector(
      "button[type='submit']"
    );

  if (botao) {
    botao.disabled =
      bloquear;
  }
}


/* =========================================================
   LIMPEZA
   ========================================================= */

function limparMensagens() {
  chatMensagens.innerHTML = "";
}

function limparSugestoes() {
  chatRespostasRapidas.innerHTML =
    "";
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function normalizarTexto(texto) {
  return texto
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

function possuiAlgumTermo(
  texto,
  termos
) {
  return termos.some(termo =>
    texto.includes(
      normalizarTexto(termo)
    )
  );
}

function transformarTexto(texto) {
  const elemento =
    document.createElement("div");

  elemento.textContent =
    texto;

  return elemento.innerHTML.replace(
    /\n/g,
    "<br>"
  );
}

function obterHorario() {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(new Date());
}

function rolarParaFinal() {
  requestAnimationFrame(() => {
    chatMensagens.scrollTop =
      chatMensagens.scrollHeight;
  });
}

function criarLinkWhatsApp(
  mensagem
) {
  return (
    `https://wa.me/${CONFIGURACOES.whatsapp}` +
    `?text=${encodeURIComponent(mensagem)}`
  );
}

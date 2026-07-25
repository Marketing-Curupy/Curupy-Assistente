/* =========================================================
   ACQUA
   ARQUIVO PRINCIPAL
   ========================================================= */

import {
  carregarBaseConhecimento
} from "./api.js";


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

const chatStatusTexto =
  document.getElementById("chatStatusTexto");

const chatCarregamento =
  document.getElementById("chatCarregamento");

const chatCarregamentoTexto =
  document.getElementById("chatCarregamentoTexto");

const chatMensagens =
  document.getElementById("chatMensagens");

const chatRespostasRapidas =
  document.getElementById("chatRespostasRapidas");

const chatErro =
  document.getElementById("chatErro");

const chatErroTexto =
  document.getElementById("chatErroTexto");

const tentarNovamente =
  document.getElementById("tentarNovamente");

const chatFormulario =
  document.getElementById("chatFormulario");

const chatCampo =
  document.getElementById("chatCampo");

const chatEnviar =
  document.getElementById("chatEnviar");


/* =========================================================
   ESTADO
   ========================================================= */

let baseConhecimento = null;


/* =========================================================
   CONTROLE DO CHAT
   ========================================================= */

function abrirChat() {
  chat.classList.add("chat--aberto");
  chat.setAttribute("aria-hidden", "false");

  chatBotaoFlutuante.setAttribute(
    "aria-expanded",
    "true"
  );

  if (!chatCampo.disabled) {
    setTimeout(() => {
      chatCampo.focus();
    }, 200);
  }
}


function fecharJanelaChat() {
  chat.classList.remove("chat--aberto");
  chat.setAttribute("aria-hidden", "true");

  chatBotaoFlutuante.setAttribute(
    "aria-expanded",
    "false"
  );
}


/* =========================================================
   MENSAGENS
   ========================================================= */

function adicionarMensagem(texto, autor = "acqua") {
  const mensagem = document.createElement("div");

  mensagem.className =
    `chat__mensagem chat__mensagem--${autor}`;

  mensagem.textContent = texto;

  chatMensagens.appendChild(mensagem);

  chatMensagens.scrollTop =
    chatMensagens.scrollHeight;
}


function mostrarMensagemInicial() {
  chatMensagens.innerHTML = "";

  adicionarMensagem(
    "Olá! Eu sou o Acqua, assistente virtual do Curupy Acqua Park. Como posso ajudar?"
  );
}


/* =========================================================
   RESPOSTAS RÁPIDAS
   ========================================================= */

function criarRespostasRapidas() {
  chatRespostasRapidas.innerHTML = "";

  const respostas = [
    "Horário de funcionamento",
    "Valores dos ingressos",
    "Hospedagem",
    "Falar com atendimento"
  ];

  respostas.forEach((texto) => {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;

    botao.addEventListener("click", () => {
      processarMensagem(texto);
    });

    chatRespostasRapidas.appendChild(botao);
  });
}


/* =========================================================
   PROCESSAMENTO INICIAL
   ========================================================= */

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


function procurarIntencao(mensagem) {
  if (!baseConhecimento?.intencoes) {
    return null;
  }

  const textoUsuario =
    normalizarTexto(mensagem);

  return baseConhecimento.intencoes.find(
    (intencao) => {
      const termos =
        intencao.palavrasChave ||
        intencao.palavras_chave ||
        intencao.PALAVRAS_CHAVE ||
        [];

      const listaTermos =
        Array.isArray(termos)
          ? termos
          : String(termos).split("|");

      return listaTermos.some((termo) => {
        const termoNormalizado =
          normalizarTexto(String(termo));

        return (
          termoNormalizado &&
          textoUsuario.includes(termoNormalizado)
        );
      });
    }
  );
}


function obterRespostaIntencao(intencao) {
  return (
    intencao.resposta ||
    intencao.RESPOSTA ||
    intencao.mensagem ||
    intencao.MENSAGEM ||
    null
  );
}


function processarMensagem(mensagem) {
  const texto = mensagem.trim();

  if (!texto) {
    return;
  }

  adicionarMensagem(texto, "usuario");

  chatCampo.value = "";

  const intencao =
    procurarIntencao(texto);

  setTimeout(() => {
    if (intencao) {
      const resposta =
        obterRespostaIntencao(intencao);

      adicionarMensagem(
        resposta ||
        "Encontrei essa informação, mas a resposta ainda não foi configurada."
      );
    } else {
      adicionarMensagem(
        "Ainda não encontrei uma resposta exata para essa pergunta. Tente perguntar sobre horários, ingressos, hospedagem, bangalôs ou quiosques."
      );
    }
  }, 350);
}


/* =========================================================
   ESTADOS DA INTERFACE
   ========================================================= */

function mostrarCarregamento() {
  chatErro.hidden = true;
  chatCarregamento.hidden = false;

  chatCarregamentoTexto.textContent =
    "Preparando o atendimento...";

  chatStatusTexto.textContent =
    "Carregando informações...";

  chatCampo.disabled = true;
  chatEnviar.disabled = true;

  chatCampo.placeholder = "Aguarde...";
}


function mostrarAplicacaoPronta() {
  chatCarregamento.hidden = true;
  chatErro.hidden = true;

  chatStatusTexto.textContent = "Online";

  chatCampo.disabled = false;
  chatEnviar.disabled = false;

  chatCampo.placeholder =
    "Digite sua mensagem";

  mostrarMensagemInicial();
  criarRespostasRapidas();
}


function mostrarErro(erro) {
  console.error(
    "Erro ao carregar a base:",
    erro
  );

  chatCarregamento.hidden = true;
  chatErro.hidden = false;

  chatStatusTexto.textContent = "Indisponível";

  chatErroTexto.textContent =
    erro.message ||
    "Não foi possível carregar as informações.";

  chatCampo.disabled = true;
  chatEnviar.disabled = true;
}


/* =========================================================
   CARREGAMENTO DA BASE
   ========================================================= */

async function iniciarApp() {
  mostrarCarregamento();

  try {
    baseConhecimento =
      await carregarBaseConhecimento();

    console.log(
      "Base carregada:",
      baseConhecimento
    );

    console.log(
      "Intenções:",
      baseConhecimento.intencoes || []
    );

    console.log(
      "Contatos:",
      baseConhecimento.contatos || []
    );

    console.log(
      "Funcionamento:",
      baseConhecimento.funcionamento || []
    );

    mostrarAplicacaoPronta();

  } catch (erro) {
    mostrarErro(erro);
  }
}


/* =========================================================
   EVENTOS
   ========================================================= */

chatBotaoFlutuante.addEventListener(
  "click",
  abrirChat
);

abrirChatTeste.addEventListener(
  "click",
  abrirChat
);

fecharChat.addEventListener(
  "click",
  fecharJanelaChat
);

reiniciarChat.addEventListener(
  "click",
  () => {
    mostrarMensagemInicial();
    criarRespostasRapidas();
  }
);

tentarNovamente.addEventListener(
  "click",
  iniciarApp
);

chatFormulario.addEventListener(
  "submit",
  (evento) => {
    evento.preventDefault();

    processarMensagem(
      chatCampo.value
    );
  }
);

document.addEventListener(
  "keydown",
  (evento) => {
    if (evento.key === "Escape") {
      fecharJanelaChat();
    }
  }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

iniciarApp();

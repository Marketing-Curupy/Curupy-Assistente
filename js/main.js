/* =========================================================
   ACQUA
   ARQUIVO PRINCIPAL
   ========================================================= */

import {
  carregarBaseConhecimento
} from "./api.js";

import {
  configurarBaseConhecimento,
  conversaFoiIniciada,
  iniciarConversa,
  processarMensagem,
  reiniciarConversa
} from "./chat.js";

import {
  abrirInterfaceChat,
  bloquearCampo,
  esconderCarregando,
  esconderErro,
  fecharInterfaceChat,
  iniciarUI,
  mostrarCarregando,
  mostrarErro,
  obterElementosUI,
  obterValorCampo
} from "./ui.js";


/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let aplicacaoPronta = false;

let carregandoBase = false;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  iniciarAplicacao
);


/* =========================================================
   INICIAR APLICAÇÃO
   ========================================================= */

async function iniciarAplicacao() {
  iniciarUI();

  registrarEventos();

  bloquearCampo(true);

  mostrarCarregando();

  esconderErro();

  await prepararAtendimento();
}


/* =========================================================
   PREPARAR ATENDIMENTO
   ========================================================= */

async function prepararAtendimento() {
  if (carregandoBase) {
    return;
  }

  carregandoBase = true;

  aplicacaoPronta = false;

  mostrarCarregando();

  esconderErro();

  bloquearCampo(true);

  atualizarStatus(
    "Carregando informações..."
  );

  try {
    const resultado =
      await carregarBaseConhecimento();

    configurarBaseConhecimento(
      resultado.dados
    );

    aplicacaoPronta = true;

    esconderCarregando();

    bloquearCampo(false);

    atualizarStatus(
      resultado.origem === "cache"
        ? "Informações salvas disponíveis"
        : "Online agora"
    );

    if (chatEstaAberto()) {
      await garantirConversaIniciada();
    }
  } catch (erro) {
    console.error(
      "Acqua: falha ao iniciar o atendimento.",
      erro
    );

    esconderCarregando();

    bloquearCampo(true);

    atualizarStatus(
      "Atendimento indisponível"
    );

    mostrarErro(
      "Não foi possível iniciar o atendimento.",
      "Verifique sua conexão com a internet e tente novamente.",
      "Tentar novamente",
      prepararAtendimento
    );
  } finally {
    carregandoBase = false;
  }
}


/* =========================================================
   REGISTRAR EVENTOS
   ========================================================= */

function registrarEventos() {
  const elementos =
    obterElementosUI();

  elementos.formulario?.addEventListener(
    "submit",
    enviarMensagemDoFormulario
  );

  document
    .getElementById(
      "chatBotaoFlutuante"
    )
    ?.addEventListener(
      "click",
      abrirChat
    );

  document
    .getElementById(
      "abrirChatTeste"
    )
    ?.addEventListener(
      "click",
      abrirChat
    );

  document
    .getElementById(
      "fecharChat"
    )
    ?.addEventListener(
      "click",
      fecharChat
    );

  document
    .getElementById(
      "reiniciarChat"
    )
    ?.addEventListener(
      "click",
      reiniciarAtendimento
    );

  document
    .getElementById(
      "tentarNovamente"
    )
    ?.addEventListener(
      "click",
      prepararAtendimento
    );
}


/* =========================================================
   ABRIR CHAT
   ========================================================= */

async function abrirChat() {
  abrirInterfaceChat();

  atualizarBotaoFlutuante(true);

  if (!aplicacaoPronta) {
    await prepararAtendimento();

    return;
  }

  await garantirConversaIniciada();
}


/* =========================================================
   FECHAR CHAT
   ========================================================= */

function fecharChat() {
  fecharInterfaceChat();

  atualizarBotaoFlutuante(false);
}


/* =========================================================
   GARANTIR CONVERSA
   ========================================================= */

async function garantirConversaIniciada() {
  if (conversaFoiIniciada()) {
    return;
  }

  await iniciarConversa();
}


/* =========================================================
   REINICIAR CONVERSA
   ========================================================= */

async function reiniciarAtendimento() {
  if (!aplicacaoPronta) {
    await prepararAtendimento();

    return;
  }

  await reiniciarConversa();
}


/* =========================================================
   ENVIAR MENSAGEM
   ========================================================= */

async function enviarMensagemDoFormulario(
  evento
) {
  evento.preventDefault();

  if (!aplicacaoPronta) {
    return;
  }

  const mensagem =
    obterValorCampo();

  if (!mensagem) {
    return;
  }

  await processarMensagem(
    mensagem
  );
}


/* =========================================================
   VERIFICAR SE O CHAT ESTÁ ABERTO
   ========================================================= */

function chatEstaAberto() {
  const chat =
    document.getElementById(
      "chat"
    );

  if (!chat) {
    return false;
  }

  return (
    chat.getAttribute(
      "aria-hidden"
    ) === "false"
  );
}


/* =========================================================
   BOTÃO FLUTUANTE
   ========================================================= */

function atualizarBotaoFlutuante(
  aberto
) {
  const botao =
    document.getElementById(
      "chatBotaoFlutuante"
    );

  if (!botao) {
    return;
  }

  botao.setAttribute(
    "aria-expanded",
    String(Boolean(aberto))
  );
}


/* =========================================================
   STATUS DO CHAT
   ========================================================= */

function atualizarStatus(
  texto
) {
  const status =
    document.getElementById(
      "chatStatusTexto"
    );

  if (!status) {
    return;
  }

  status.textContent = texto;
}

/* =========================================================
   ACQUA
   INTERFACE DO CHAT
   ========================================================= */

const elementos = {};

let digitandoAtual = null;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

export function iniciarUI() {
  elementos.chat =
    document.getElementById("chat");

  elementos.mensagens =
    document.getElementById("chatMensagens");

  elementos.respostas =
    document.getElementById("chatRespostasRapidas");

  elementos.formulario =
    document.getElementById("chatFormulario");

  elementos.campo =
    document.getElementById("chatCampo");

  elementos.carregamento =
    document.getElementById("chatCarregamento");

  elementos.erro =
    document.getElementById("chatErro");

  elementos.botaoEnviar =
    elementos.formulario?.querySelector(
      "button[type='submit']"
    );

  validarElementos();
}


/* =========================================================
   VALIDAÇÃO
   ========================================================= */

function validarElementos() {
  const obrigatorios = [
    elementos.chat,
    elementos.mensagens,
    elementos.respostas,
    elementos.formulario,
    elementos.campo,
    elementos.botaoEnviar
  ];

  const possuiElementoAusente =
    obrigatorios.some(elemento => !elemento);

  if (possuiElementoAusente) {
    console.error(
      "Acqua: alguns elementos obrigatórios não foram encontrados no HTML."
    );
  }
}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

export function mostrarCarregando() {
  if (!elementos.carregamento) {
    return;
  }

  elementos.carregamento.hidden = false;
}

export function esconderCarregando() {
  if (!elementos.carregamento) {
    return;
  }

  elementos.carregamento.hidden = true;
}


/* =========================================================
   ERROS
   ========================================================= */

export function mostrarErro(
  titulo,
  mensagem,
  textoBotao = "",
  aoClicar = null
) {
  if (!elementos.erro) {
    return;
  }

  elementos.erro.innerHTML = "";

  const tituloElemento =
    document.createElement("strong");

  tituloElemento.textContent =
    titulo || "Não foi possível carregar";

  const mensagemElemento =
    document.createElement("span");

  mensagemElemento.textContent =
    mensagem || "Tente novamente em alguns instantes.";

  elementos.erro.appendChild(
    tituloElemento
  );

  elementos.erro.appendChild(
    mensagemElemento
  );

  if (
    textoBotao &&
    typeof aoClicar === "function"
  ) {
    const botao =
      document.createElement("button");

    botao.type = "button";
    botao.textContent = textoBotao;

    botao.addEventListener(
      "click",
      aoClicar
    );

    elementos.erro.appendChild(
      botao
    );
  }

  elementos.erro.hidden = false;
}

export function esconderErro() {
  if (!elementos.erro) {
    return;
  }

  elementos.erro.hidden = true;
  elementos.erro.innerHTML = "";
}


/* =========================================================
   MENSAGENS
   ========================================================= */

export function adicionarMensagemAssistente(
  texto
) {
  adicionarMensagem(
    texto,
    "assistente"
  );
}

export function adicionarMensagemUsuario(
  texto
) {
  adicionarMensagem(
    texto,
    "usuario"
  );
}

function adicionarMensagem(
  texto,
  tipo
) {
  if (!elementos.mensagens) {
    return;
  }

  const linha =
    document.createElement("div");

  linha.className =
    tipo === "usuario"
      ? "mensagem-linha mensagem-linha--usuario"
      : "mensagem-linha";

  const balao =
    document.createElement("div");

  balao.className =
    tipo === "usuario"
      ? "mensagem mensagem--usuario"
      : "mensagem mensagem--assistente";

  const conteudo =
    document.createElement("div");

  conteudo.innerHTML =
    converterTexto(texto);

  const horario =
    document.createElement("span");

  horario.className =
    "mensagem__horario";

  horario.textContent =
    horaAtual();

  balao.appendChild(conteudo);
  balao.appendChild(horario);

  linha.appendChild(balao);

  elementos.mensagens.appendChild(
    linha
  );

  rolarFinal();
}


/* =========================================================
   INDICADOR DE DIGITAÇÃO
   ========================================================= */

export function mostrarDigitando() {
  if (!elementos.mensagens) {
    return;
  }

  removerDigitando();

  digitandoAtual =
    document.createElement("div");

  digitandoAtual.className =
    "mensagem-linha";

  digitandoAtual.id =
    "linhaDigitando";

  digitandoAtual.innerHTML = `
    <div
      class="chat__digitando"
      role="status"
      aria-label="Acqua está digitando"
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  elementos.mensagens.appendChild(
    digitandoAtual
  );

  rolarFinal();
}

export function removerDigitando() {
  if (!digitandoAtual) {
    return;
  }

  digitandoAtual.remove();
  digitandoAtual = null;
}


/* =========================================================
   RESPOSTAS RÁPIDAS
   ========================================================= */

export function atualizarSugestoes(
  sugestoes = [],
  aoSelecionar = null
) {
  limparSugestoes();

  if (
    !elementos.respostas ||
    !Array.isArray(sugestoes)
  ) {
    return;
  }

  sugestoes.forEach(sugestao => {
    if (!sugestao?.texto) {
      return;
    }

    const botao =
      document.createElement("button");

    botao.type = "button";

    botao.className =
      "chat__resposta-rapida";

    botao.textContent =
      sugestao.texto;

    botao.addEventListener(
      "click",
      () => {
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

        if (
          typeof aoSelecionar ===
          "function"
        ) {
          aoSelecionar(
            mensagem,
            sugestao
          );
        }
      }
    );

    elementos.respostas.appendChild(
      botao
    );
  });
}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

export function bloquearCampo(
  bloquear
) {
  if (elementos.campo) {
    elementos.campo.disabled =
      bloquear;
  }

  if (elementos.botaoEnviar) {
    elementos.botaoEnviar.disabled =
      bloquear;
  }
}

export function limparCampo() {
  if (!elementos.campo) {
    return;
  }

  elementos.campo.value = "";
}

export function obterValorCampo() {
  return elementos.campo?.value.trim() || "";
}

export function focarCampo() {
  if (
    !elementos.campo ||
    elementos.campo.disabled
  ) {
    return;
  }

  elementos.campo.focus();
}


/* =========================================================
   LIMPEZA
   ========================================================= */

export function limparMensagens() {
  if (!elementos.mensagens) {
    return;
  }

  removerDigitando();

  elementos.mensagens.innerHTML = "";
}

export function limparSugestoes() {
  if (!elementos.respostas) {
    return;
  }

  elementos.respostas.innerHTML = "";
}


/* =========================================================
   ABRIR E FECHAR CHAT
   ========================================================= */

export function abrirInterfaceChat() {
  if (!elementos.chat) {
    return;
  }

  elementos.chat.classList.add(
    "chat--aberto"
  );

  elementos.chat.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "chat-aberto"
  );
}

export function fecharInterfaceChat() {
  if (!elementos.chat) {
    return;
  }

  elementos.chat.classList.remove(
    "chat--aberto"
  );

  elementos.chat.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "chat-aberto"
  );
}


/* =========================================================
   ACESSO AOS ELEMENTOS
   ========================================================= */

export function obterElementosUI() {
  return {
    ...elementos
  };
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function rolarFinal() {
  if (!elementos.mensagens) {
    return;
  }

  requestAnimationFrame(() => {
    elementos.mensagens.scrollTop =
      elementos.mensagens.scrollHeight;
  });
}

function horaAtual() {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(new Date());
}

function converterTexto(texto) {
  const div =
    document.createElement("div");

  div.textContent =
    String(texto || "");

  return div.innerHTML.replace(
    /\n/g,
    "<br>"
  );
}

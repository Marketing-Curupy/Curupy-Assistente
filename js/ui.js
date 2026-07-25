/* =========================================================
   ACQUA
   INTERFACE DO CHAT
   ========================================================= */

import {
    limparTexto,
    scrollFinal
} from "./utils.js";


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

const elementos = {
    chat: null,

    mensagens: null,

    respostas: null,

    formulario: null,

    campo: null,

    carregamento: null,

    erro: null,

    botaoEnviar: null
};

let digitandoAtual = null;

let uiIniciada = false;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

export function iniciarUI() {
    elementos.chat =
        document.getElementById(
            "chat"
        );

    elementos.mensagens =
        document.getElementById(
            "chatMensagens"
        );

    elementos.respostas =
        document.getElementById(
            "chatRespostasRapidas"
        );

    elementos.formulario =
        document.getElementById(
            "chatFormulario"
        );

    elementos.campo =
        document.getElementById(
            "chatCampo"
        );

    elementos.carregamento =
        document.getElementById(
            "chatCarregamento"
        );

    elementos.erro =
        document.getElementById(
            "chatErro"
        );

    elementos.botaoEnviar =
        elementos.formulario
            ?.querySelector(
                "button[type='submit']"
            ) || null;

    uiIniciada =
        validarElementos();

    configurarAcessibilidade();

    return uiIniciada;
}


/* =========================================================
   VALIDAÇÃO
   ========================================================= */

function validarElementos() {
    const obrigatorios = {
        chat:
            elementos.chat,

        mensagens:
            elementos.mensagens,

        respostas:
            elementos.respostas,

        formulario:
            elementos.formulario,

        campo:
            elementos.campo,

        botaoEnviar:
            elementos.botaoEnviar
    };

    const ausentes =
        Object.entries(obrigatorios)
            .filter(([, elemento]) => {
                return !elemento;
            })
            .map(([nome]) => nome);

    if (ausentes.length > 0) {
        console.error(
            "Acqua: elementos obrigatórios não encontrados no HTML:",
            ausentes
        );

        return false;
    }

    return true;
}


/* =========================================================
   ACESSIBILIDADE
   ========================================================= */

function configurarAcessibilidade() {
    elementos.mensagens?.setAttribute(
        "aria-live",
        "polite"
    );

    elementos.mensagens?.setAttribute(
        "aria-relevant",
        "additions"
    );

    elementos.respostas?.setAttribute(
        "aria-label",
        "Sugestões de resposta"
    );

    elementos.carregamento?.setAttribute(
        "aria-live",
        "polite"
    );

    elementos.erro?.setAttribute(
        "aria-live",
        "assertive"
    );
}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

export function mostrarCarregando() {
    if (!elementos.carregamento) {
        return;
    }

    elementos.carregamento.hidden =
        false;

    elementos.carregamento.setAttribute(
        "aria-hidden",
        "false"
    );
}


export function esconderCarregando() {
    if (!elementos.carregamento) {
        return;
    }

    elementos.carregamento.hidden =
        true;

    elementos.carregamento.setAttribute(
        "aria-hidden",
        "true"
    );
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
        console.error(
            titulo || "Erro no atendimento",
            mensagem || ""
        );

        return;
    }

    elementos.erro.innerHTML = "";

    const tituloElemento =
        document.createElement(
            "strong"
        );

    tituloElemento.className =
        "chat__erro-titulo";

    tituloElemento.textContent =
        limparTexto(titulo) ||
        "Não foi possível carregar";

    const mensagemElemento =
        document.createElement(
            "span"
        );

    mensagemElemento.className =
        "chat__erro-mensagem";

    mensagemElemento.textContent =
        limparTexto(mensagem) ||
        "Tente novamente em alguns instantes.";

    elementos.erro.appendChild(
        tituloElemento
    );

    elementos.erro.appendChild(
        mensagemElemento
    );

    if (
        limparTexto(textoBotao) &&
        typeof aoClicar === "function"
    ) {
        const botao =
            document.createElement(
                "button"
            );

        botao.type =
            "button";

        botao.className =
            "chat__erro-botao";

        botao.textContent =
            limparTexto(textoBotao);

        botao.addEventListener(
            "click",
            async () => {
                botao.disabled =
                    true;

                try {
                    await aoClicar();
                } catch (erro) {
                    console.error(
                        "Acqua: erro ao executar nova tentativa.",
                        erro
                    );
                } finally {
                    botao.disabled =
                        false;
                }
            }
        );

        elementos.erro.appendChild(
            botao
        );
    }

    elementos.erro.hidden =
        false;

    elementos.erro.setAttribute(
        "aria-hidden",
        "false"
    );
}


export function esconderErro() {
    if (!elementos.erro) {
        return;
    }

    elementos.erro.hidden =
        true;

    elementos.erro.setAttribute(
        "aria-hidden",
        "true"
    );

    elementos.erro.innerHTML =
        "";
}


/* =========================================================
   MENSAGENS
   ========================================================= */

export function adicionarMensagemAssistente(
    texto
) {
    return adicionarMensagem(
        texto,
        "assistente"
    );
}


export function adicionarMensagemUsuario(
    texto
) {
    return adicionarMensagem(
        texto,
        "usuario"
    );
}


function adicionarMensagem(
    texto,
    tipo
) {
    if (!elementos.mensagens) {
        return null;
    }

    const mensagem =
        String(texto ?? "");

    if (!mensagem.trim()) {
        return null;
    }

    removerDigitando();

    const linha =
        document.createElement(
            "div"
        );

    linha.className =
        tipo === "usuario"
            ? "mensagem-linha mensagem-linha--usuario"
            : "mensagem-linha mensagem-linha--assistente";

    const balao =
        document.createElement(
            "div"
        );

    balao.className =
        tipo === "usuario"
            ? "mensagem mensagem--usuario"
            : "mensagem mensagem--assistente";

    const conteudo =
        document.createElement(
            "div"
        );

    conteudo.className =
        "mensagem__conteudo";

    inserirTextoComQuebras(
        conteudo,
        mensagem
    );

    const horario =
        document.createElement(
            "span"
        );

    horario.className =
        "mensagem__horario";

    horario.textContent =
        horaAtual();

    balao.appendChild(
        conteudo
    );

    balao.appendChild(
        horario
    );

    linha.appendChild(
        balao
    );

    elementos.mensagens.appendChild(
        linha
    );

    rolarFinal();

    return linha;
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
        document.createElement(
            "div"
        );

    digitandoAtual.className =
        "mensagem-linha mensagem-linha--assistente";

    digitandoAtual.id =
        "linhaDigitando";

    const indicador =
        document.createElement(
            "div"
        );

    indicador.className =
        "chat__digitando";

    indicador.setAttribute(
        "role",
        "status"
    );

    indicador.setAttribute(
        "aria-label",
        "Acqua está digitando"
    );

    indicador.setAttribute(
        "aria-live",
        "polite"
    );

    for (
        let indice = 0;
        indice < 3;
        indice += 1
    ) {
        indicador.appendChild(
            document.createElement(
                "span"
            )
        );
    }

    digitandoAtual.appendChild(
        indicador
    );

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

    digitandoAtual =
        null;
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

    sugestoes.forEach(
        sugestao => {
            criarBotaoSugestao(
                sugestao,
                aoSelecionar
            );
        }
    );

    rolarFinal();
}


function criarBotaoSugestao(
    sugestao,
    aoSelecionar
) {
    const texto =
        limparTexto(
            sugestao?.texto
        );

    if (!texto) {
        return;
    }

    const botao =
        document.createElement(
            "button"
        );

    botao.type =
        "button";

    botao.className =
        "chat__resposta-rapida";

    botao.textContent =
        texto;

    if (sugestao?.link) {
        botao.setAttribute(
            "aria-label",
            `${texto}. Abre em uma nova guia.`
        );
    }

    botao.addEventListener(
        "click",
        async () => {
            if (botao.disabled) {
                return;
            }

            if (sugestao?.link) {
                abrirLinkSeguro(
                    sugestao.link
                );

                return;
            }

            const mensagem =
                limparTexto(
                    sugestao?.mensagem
                ) || texto;

            if (
                typeof aoSelecionar !==
                "function"
            ) {
                return;
            }

            bloquearSugestoes(
                true
            );

            try {
                await aoSelecionar(
                    mensagem,
                    sugestao
                );
            } catch (erro) {
                console.error(
                    "Acqua: erro ao processar sugestão.",
                    erro
                );
            } finally {
                bloquearSugestoes(
                    false
                );
            }
        }
    );

    elementos.respostas.appendChild(
        botao
    );
}


function bloquearSugestoes(
    bloquear
) {
    if (!elementos.respostas) {
        return;
    }

    const botoes =
        elementos.respostas
            .querySelectorAll(
                "button"
            );

    botoes.forEach(botao => {
        botao.disabled =
            Boolean(bloquear);
    });
}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

export function bloquearCampo(
    bloquear
) {
    const bloqueado =
        Boolean(bloquear);

    if (elementos.campo) {
        elementos.campo.disabled =
            bloqueado;

        elementos.campo.setAttribute(
            "aria-disabled",
            String(bloqueado)
        );
    }

    if (elementos.botaoEnviar) {
        elementos.botaoEnviar.disabled =
            bloqueado;

        elementos.botaoEnviar.setAttribute(
            "aria-disabled",
            String(bloqueado)
        );
    }
}


export function limparCampo() {
    if (!elementos.campo) {
        return;
    }

    elementos.campo.value =
        "";
}


export function obterValorCampo() {
    return limparTexto(
        elementos.campo?.value
    );
}


export function definirValorCampo(
    valor
) {
    if (!elementos.campo) {
        return;
    }

    elementos.campo.value =
        String(valor ?? "");
}


export function focarCampo() {
    if (
        !elementos.campo ||
        elementos.campo.disabled
    ) {
        return;
    }

    requestAnimationFrame(() => {
        elementos.campo?.focus({
            preventScroll: true
        });
    });
}


/* =========================================================
   LIMPEZA
   ========================================================= */

export function limparMensagens() {
    if (!elementos.mensagens) {
        return;
    }

    removerDigitando();

    elementos.mensagens.innerHTML =
        "";
}


export function limparSugestoes() {
    if (!elementos.respostas) {
        return;
    }

    elementos.respostas.innerHTML =
        "";
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

    requestAnimationFrame(() => {
        rolarFinal();

        focarCampo();
    });
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
   CONSULTAS DA INTERFACE
   ========================================================= */

export function interfaceFoiIniciada() {
    return uiIniciada;
}


export function interfaceEstaAberta() {
    if (!elementos.chat) {
        return false;
    }

    return (
        elementos.chat.getAttribute(
            "aria-hidden"
        ) === "false"
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
   UTILITÁRIOS INTERNOS
   ========================================================= */

function rolarFinal() {
    if (!elementos.mensagens) {
        return;
    }

    requestAnimationFrame(() => {
        scrollFinal(
            elementos.mensagens,
            true
        );
    });
}


function horaAtual() {
    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    ).format(
        new Date()
    );
}


function inserirTextoComQuebras(
    elemento,
    texto
) {
    const linhas =
        String(texto ?? "")
            .split(/\r?\n/);

    linhas.forEach(
        (linha, indice) => {
            elemento.appendChild(
                document.createTextNode(
                    linha
                )
            );

            if (
                indice <
                linhas.length - 1
            ) {
                elemento.appendChild(
                    document.createElement(
                        "br"
                    )
                );
            }
        }
    );
}


function abrirLinkSeguro(
    endereco
) {
    const link =
        limparTexto(endereco);

    if (!link) {
        return;
    }

    if (
        !/^(https?:\/\/|mailto:|tel:)/i.test(
            link
        )
    ) {
        console.warn(
            "Acqua: link bloqueado por formato inválido.",
            link
        );

        return;
    }

    if (
        /^(mailto:|tel:)/i.test(link)
    ) {
        window.location.href =
            link;

        return;
    }

    const novaJanela =
        window.open(
            link,
            "_blank",
            "noopener,noreferrer"
        );

    if (novaJanela) {
        novaJanela.opener =
            null;
    }
}

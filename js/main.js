/* ========================================================= ACQUA
ARQUIVO PRINCIPAL
========================================================= */

import { carregarBaseConhecimento } from “./api.js”;

import { configurarBaseConhecimento, conversaFoiIniciada,
iniciarConversa, processarMensagem, reiniciarConversa } from
“./chat.js”;

import { abrirInterfaceChat, bloquearCampo, esconderCarregando,
esconderErro, fecharInterfaceChat, focarCampo, iniciarUI,
mostrarCarregando, mostrarErro, obterElementosUI, obterValorCampo } from
“./ui.js”;

/* ========================================================= ESTADO DA
APLICAÇÃO ========================================================= */

const estadoAplicacao = { uiIniciada: false, eventosRegistrados: false,
aplicacaoPronta: false, carregandoBase: false, chatAberto: false };

/* =========================================================
INICIALIZAÇÃO =========================================================
*/

if (document.readyState === “loading”) { document.addEventListener(
“DOMContentLoaded”, iniciarAplicacao, { once: true } ); } else {
iniciarAplicacao(); }

async function iniciarAplicacao() { try { const interfaceIniciada =
iniciarUI();

        if (!interfaceIniciada) {
            throw new Error(
                "Não foi possível iniciar a interface do Acqua."
            );
        }

        estadoAplicacao.uiIniciada =
            true;

        registrarEventos();

        bloquearCampo(true);
        mostrarCarregando();
        esconderErro();

        atualizarStatus(
            "Carregando informações..."
        );

        await prepararAtendimento();
    } catch (erro) {
        tratarErroInicializacao(
            erro
        );
    }

}

/* ========================================================= CARREGAR
BASE DE CONHECIMENTO
========================================================= */

async function prepararAtendimento() { if ( !estadoAplicacao.uiIniciada
|| estadoAplicacao.carregandoBase ) { return; }

    estadoAplicacao.carregandoBase =
        true;

    estadoAplicacao.aplicacaoPronta =
        false;

    mostrarCarregando();
    esconderErro();
    bloquearCampo(true);

    atualizarStatus(
        "Carregando informações..."
    );

    try {
        /*
         * O api.js já devolve a base normalizada.
         *
         * Portanto, não use resultado.dados aqui.
         */
        const baseConhecimento =
            await carregarBaseConhecimento();

        configurarBaseConhecimento(
            baseConhecimento
        );

        estadoAplicacao.aplicacaoPronta =
            true;

        esconderCarregando();
        esconderErro();
        bloquearCampo(false);

        atualizarStatus(
            "Online agora"
        );

        if (chatEstaAberto()) {
            await garantirConversaIniciada();
        }
    } catch (erro) {
        console.error(
            "Acqua: falha ao preparar o atendimento.",
            erro
        );

        estadoAplicacao.aplicacaoPronta =
            false;

        esconderCarregando();
        bloquearCampo(true);

        atualizarStatus(
            "Atendimento indisponível"
        );

        mostrarErro(
            "Não foi possível iniciar o atendimento.",
            obterMensagemErro(erro),
            "Tentar novamente",
            prepararAtendimento
        );
    } finally {
        estadoAplicacao.carregandoBase =
            false;
    }

}

/* ========================================================= REGISTRO DE
EVENTOS ========================================================= */

function registrarEventos() { if (estadoAplicacao.eventosRegistrados) {
return; }

    const elementos =
        obterElementosUI();

    elementos.formulario?.addEventListener(
        "submit",
        enviarMensagemDoFormulario
    );

    obterElemento("chatBotaoFlutuante")
        ?.addEventListener(
            "click",
            abrirChat
        );

    obterElemento("abrirChatTeste")
        ?.addEventListener(
            "click",
            abrirChat
        );

    obterElemento("fecharChat")
        ?.addEventListener(
            "click",
            fecharChat
        );

    obterElemento("reiniciarChat")
        ?.addEventListener(
            "click",
            reiniciarAtendimento
        );

    document.addEventListener(
        "keydown",
        tratarTeclado
    );

    estadoAplicacao.eventosRegistrados =
        true;

}

/* ========================================================= ABRIR CHAT
========================================================= */

async function abrirChat() { if (!estadoAplicacao.uiIniciada) { return;
}

    abrirInterfaceChat();

    estadoAplicacao.chatAberto =
        true;

    atualizarBotaoFlutuante(
        true
    );

    if (
        !estadoAplicacao.aplicacaoPronta
    ) {
        await prepararAtendimento();

        return;
    }

    await garantirConversaIniciada();

    focarCampo();

}

/* ========================================================= FECHAR CHAT
========================================================= */

function fecharChat() { if (!estadoAplicacao.uiIniciada) { return; }

    fecharInterfaceChat();

    estadoAplicacao.chatAberto =
        false;

    atualizarBotaoFlutuante(
        false
    );

    devolverFocoAoBotao();

}

/* ========================================================= GARANTIR
CONVERSA INICIADA
========================================================= */

async function garantirConversaIniciada() { if (
!estadoAplicacao.aplicacaoPronta || conversaFoiIniciada() ) { return; }

    await iniciarConversa();

}

/* ========================================================= REINICIAR
ATENDIMENTO ========================================================= */

async function reiniciarAtendimento() { if (
estadoAplicacao.carregandoBase ) { return; }

    if (
        !estadoAplicacao.aplicacaoPronta
    ) {
        await prepararAtendimento();

        if (
            !estadoAplicacao.aplicacaoPronta
        ) {
            return;
        }
    }

    esconderErro();

    await reiniciarConversa();

}

/* ========================================================= ENVIAR
MENSAGEM ========================================================= */

async function enviarMensagemDoFormulario( evento ) {
evento.preventDefault();

    if (
        !estadoAplicacao.aplicacaoPronta ||
        estadoAplicacao.carregandoBase
    ) {
        return;
    }

    const mensagem =
        obterValorCampo();

    if (!mensagem) {
        focarCampo();

        return;
    }

    await processarMensagem(
        mensagem
    );

}

/* ========================================================= TECLADO E
ACESSIBILIDADE =========================================================
*/

function tratarTeclado(evento) { if ( evento.key !== “Escape” ||
!chatEstaAberto() ) { return; }

    fecharChat();

}

/* ========================================================= CONSULTAR
ESTADO VISUAL =========================================================
*/

function chatEstaAberto() { const chat = obterElemento(“chat”);

    if (!chat) {
        return false;
    }

    return (
        chat.getAttribute(
            "aria-hidden"
        ) === "false" ||
        chat.classList.contains(
            "chat--aberto"
        ) ||
        chat.classList.contains(
            "esta-aberto"
        ) ||
        chat.classList.contains(
            "is-open"
        )
    );

}

/* ========================================================= BOTÃO
FLUTUANTE ========================================================= */

function atualizarBotaoFlutuante( aberto ) { const botao =
obterElemento( “chatBotaoFlutuante” );

    if (!botao) {
        return;
    }

    botao.setAttribute(
        "aria-expanded",
        String(Boolean(aberto))
    );

}

function devolverFocoAoBotao() { const botao = obterElemento(
“chatBotaoFlutuante” );

    window.setTimeout(
        () => {
            botao?.focus();
        },
        0
    );

}

/* ========================================================= STATUS DO
ATENDIMENTO ========================================================= */

function atualizarStatus(texto) { const status = obterElemento(
“chatStatusTexto” );

    if (!status) {
        return;
    }

    status.textContent =
        String(texto || "");

}

/* ========================================================= TRATAMENTO
DE ERROS ========================================================= */

function tratarErroInicializacao( erro ) { console.error( “Acqua: erro
ao iniciar a aplicação.”, erro );

    estadoAplicacao.aplicacaoPronta =
        false;

    atualizarStatus(
        "Atendimento indisponível"
    );

    /*
     * Caso a UI tenha iniciado parcialmente,
     * apresenta o erro dentro do próprio chat.
     */
    if (estadoAplicacao.uiIniciada) {
        esconderCarregando();
        bloquearCampo(true);

        mostrarErro(
            "Não foi possível abrir o assistente.",
            obterMensagemErro(erro),
            "Tentar novamente",
            iniciarAplicacao
        );

        return;
    }

    /*
     * Último recurso para falhas estruturais,
     * como IDs ausentes no HTML.
     */
    console.error(
        obterMensagemErro(erro)
    );

}

function obterMensagemErro(erro) { const mensagem = String(
erro?.message || “” ).trim();

    if (mensagem) {
        return mensagem;
    }

    return (
        "Verifique sua conexão e tente novamente."
    );

}

/* ========================================================= UTILITÁRIOS
========================================================= */

function obterElemento(id) { return document.getElementById( id ); }

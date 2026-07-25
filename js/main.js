/* =========================================================
   ACQUA
   ARQUIVO PRINCIPAL
   ========================================================= */

import { iniciarUI } from "./ui.js";

import {
    adicionarMensagem,
    mostrarMenuPrincipal,
    processarRespostaRapida,
    processarMensagemUsuario
} from "./chat.js";

import {
    enviarMensagem
} from "./api.js";


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacao
);


/* =========================================================
   APLICAÇÃO
   ========================================================= */

function iniciarAplicacao() {

    iniciarUI();

    registrarEventos();

    iniciarChat();

}


/* =========================================================
   CHAT
   ========================================================= */

function iniciarChat() {

    adicionarMensagem(
        "bot",
        "Olá! 👋 Seja bem-vindo ao Curupy Acqua Park."
    );

    mostrarMenuPrincipal();

}


/* =========================================================
   EVENTOS
   ========================================================= */

function registrarEventos() {

    registrarFormulario();

    registrarRespostasRapidas();

}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

function registrarFormulario() {

    const formulario =
        document.getElementById("chatFormulario");

    const campo =
        document.getElementById("chatCampo");

    formulario.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();

            const mensagem =
                campo.value.trim();

            if (!mensagem) return;

            campo.value = "";

            await processarMensagemUsuario(
                mensagem
            );

        }
    );

}


/* =========================================================
   RESPOSTAS RÁPIDAS
   ========================================================= */

function registrarRespostasRapidas() {

    const respostas =
        document.getElementById("chatRespostasRapidas");

    respostas.addEventListener(
        "click",
        async (evento) => {

            const botao =
                evento.target.closest("button");

            if (!botao) return;

            const texto =
                botao.dataset.valor;

            await processarRespostaRapida(
                texto
            );

        }
    );

}

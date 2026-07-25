/* =========================================================
   ACQUA
   ESTADO DA CONVERSA
   ========================================================= */

let historico = [];

let contexto = {};

let visitante = null;

let conversaIniciada = false;


/* =========================================================
   HISTÓRICO
   ========================================================= */

export function adicionarMensagem(mensagem) {

    historico.push(mensagem);

}

export function obterHistorico() {

    return [...historico];

}

export function limparHistorico() {

    historico = [];

}


/* =========================================================
   CONTEXTO
   ========================================================= */

export function definirContexto(chave, valor) {

    contexto[chave] = valor;

}

export function obterContexto(chave) {

    return contexto[chave];

}

export function obterTodosContextos() {

    return { ...contexto };

}

export function limparContexto() {

    contexto = {};

}


/* =========================================================
   VISITANTE
   ========================================================= */

export function definirVisitante(dados) {

    visitante = dados;

}

export function obterVisitante() {

    return visitante;

}

export function limparVisitante() {

    visitante = null;

}


/* =========================================================
   CONVERSA
   ========================================================= */

export function definirConversaIniciada(valor) {

    conversaIniciada = Boolean(valor);

}

export function conversaFoiIniciada() {

    return conversaIniciada;

}


/* =========================================================
   RESET
   ========================================================= */

export function limparEstado() {

    historico = [];

    contexto = {};

    visitante = null;

    conversaIniciada = false;

}

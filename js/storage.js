/* =========================================================
   ACQUA
   ESTADO DA CONVERSA
   ========================================================= */

let historico = [];

let contexto = {};


/* =========================================================
   HISTÓRICO
   ========================================================= */

export function adicionarMensagem(mensagem) {

    historico.push(mensagem);

}

export function obterHistorico() {

    return historico;

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

export function limparContexto() {

    contexto = {};

}

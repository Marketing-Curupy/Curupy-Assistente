/* =========================================================
   ACQUA
   ESTADO DA CONVERSA
   ========================================================= */

const CONTEXTO_INICIAL = {
    objetivo: "",
    assunto: "",
    intencao: "",
    categoria: "",
    etapa: "",
    aguardando: "",

    categoriaIngresso: "",
    dataVisita: "",
    canalCompra: "",

    tipoReserva: "",
    beneficio: "",
    setorEncaminhamento: "",

    dadosTemporarios: {}
};


let historico = [];

let contexto = criarContextoInicial();

let visitante = null;

let conversaIniciada = false;


/* =========================================================
   CONTEXTO INICIAL
   ========================================================= */

function criarContextoInicial() {
    return {
        ...CONTEXTO_INICIAL,

        dadosTemporarios: {
            ...CONTEXTO_INICIAL.dadosTemporarios
        }
    };
}


/* =========================================================
   HISTÓRICO
   ========================================================= */

export function adicionarMensagem(mensagem) {
    if (
        !mensagem ||
        typeof mensagem !== "object"
    ) {
        return;
    }

    historico.push({
        ...mensagem
    });
}


export function obterHistorico() {
    return historico.map(mensagem => ({
        ...mensagem
    }));
}


export function limparHistorico() {
    historico = [];
}


/* =========================================================
   CONTEXTO
   ========================================================= */

export function definirContexto(chave, valor) {
    const nomeChave =
        String(chave || "").trim();

    if (!nomeChave) {
        return;
    }

    contexto[nomeChave] = valor;
}


export function atualizarContexto(dados = {}) {
    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        return;
    }

    contexto = {
        ...contexto,
        ...dados,

        dadosTemporarios: {
            ...(contexto.dadosTemporarios || {}),
            ...(dados.dadosTemporarios || {})
        }
    };
}


export function obterContexto(chave) {
    return contexto[chave];
}


export function obterTodosContextos() {
    return {
        ...contexto,

        dadosTemporarios: {
            ...(contexto.dadosTemporarios || {})
        }
    };
}


export function existeFluxoAtivo() {
    return Boolean(
        contexto.objetivo ||
        contexto.etapa ||
        contexto.aguardando
    );
}


export function definirEtapa(
    etapa,
    aguardando = ""
) {
    atualizarContexto({
        etapa:
            String(etapa || "").trim(),

        aguardando:
            String(aguardando || "").trim()
    });
}


export function limparEtapa() {
    atualizarContexto({
        etapa: "",
        aguardando: ""
    });
}


export function finalizarFluxo() {
    const assuntoAnterior =
        contexto.assunto;

    const intencaoAnterior =
        contexto.intencao;

    contexto = criarContextoInicial();

    contexto.assunto =
        assuntoAnterior || "";

    contexto.intencao =
        intencaoAnterior || "";
}


export function limparContexto() {
    contexto = criarContextoInicial();
}


/* =========================================================
   VISITANTE
   ========================================================= */

export function definirVisitante(dados = {}) {
    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        return;
    }

    visitante = {
        ...(visitante || {}),
        ...dados
    };
}


export function obterVisitante() {
    if (!visitante) {
        return null;
    }

    return {
        ...visitante
    };
}


export function limparVisitante() {
    visitante = null;
}


/* =========================================================
   CONVERSA
   ========================================================= */

export function definirConversaIniciada(valor) {
    conversaIniciada =
        Boolean(valor);
}


export function conversaFoiIniciada() {
    return conversaIniciada;
}


/* =========================================================
   RESET
   ========================================================= */

export function limparEstado() {
    historico = [];

    contexto =
        criarContextoInicial();

    visitante = null;

    conversaIniciada = false;
}

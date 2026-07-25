/* =========================================================
   ACQUA
   FUNÇÕES AUXILIARES
   ========================================================= */


/* =========================================================
   ESPERA
   ========================================================= */

/**
 * Aguarda o tempo informado.
 *
 * @param {number} milissegundos
 * @returns {Promise<void>}
 */
export function esperar(milissegundos = 0) {
    const tempo = Number(milissegundos);

    return new Promise((resolve) => {
        setTimeout(
            resolve,
            Number.isFinite(tempo) && tempo > 0
                ? tempo
                : 0
        );
    });
}


/* =========================================================
   ID ÚNICO
   ========================================================= */

/**
 * Gera um identificador único para mensagens e elementos.
 *
 * @param {string} prefixo
 * @returns {string}
 */
export function gerarId(prefixo = "acqua") {
    const data = Date.now().toString(36);

    const aleatorio = Math.random()
        .toString(36)
        .slice(2, 10);

    return `${prefixo}-${data}-${aleatorio}`;
}


/* =========================================================
   LIMPEZA DE TEXTO
   ========================================================= */

/**
 * Remove espaços desnecessários do texto.
 *
 * @param {*} texto
 * @returns {string}
 */
export function limparTexto(texto = "") {
    return String(texto)
        .replace(/\s+/g, " ")
        .trim();
}


/**
 * Normaliza um texto para comparação.
 *
 * Remove acentos, converte para letras minúsculas
 * e elimina espaços duplicados.
 *
 * @param {*} texto
 * @returns {string}
 */
export function normalizarTexto(texto = "") {
    return limparTexto(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}


/**
 * Verifica se existe conteúdo válido no texto.
 *
 * @param {*} texto
 * @returns {boolean}
 */
export function textoValido(texto) {
    return limparTexto(texto).length > 0;
}


/* =========================================================
   SEGURANÇA DE HTML
   ========================================================= */

/**
 * Escapa caracteres especiais para evitar a inserção
 * indevida de HTML.
 *
 * @param {*} texto
 * @returns {string}
 */
export function escaparHtml(texto = "") {
    const caracteres = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };

    return String(texto).replace(
        /[&<>"']/g,
        (caractere) => caracteres[caractere]
    );
}


/* =========================================================
   SCROLL
   ========================================================= */

/**
 * Move um elemento para o final do conteúdo.
 *
 * @param {HTMLElement|null} elemento
 * @param {boolean} suave
 */
export function scrollFinal(
    elemento,
    suave = true
) {
    if (!elemento) {
        return;
    }

    if (
        typeof elemento.scrollTo === "function"
    ) {
        elemento.scrollTo({
            top: elemento.scrollHeight,
            behavior: suave
                ? "smooth"
                : "auto"
        });

        return;
    }

    elemento.scrollTop =
        elemento.scrollHeight;
}


/* =========================================================
   LIMITES
   ========================================================= */

/**
 * Mantém um número entre os limites informados.
 *
 * @param {number} valor
 * @param {number} minimo
 * @param {number} maximo
 * @returns {number}
 */
export function limitarNumero(
    valor,
    minimo,
    maximo
) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return minimo;
    }

    return Math.min(
        Math.max(numero, minimo),
        maximo
    );
}


/* =========================================================
   OBJETOS
   ========================================================= */

/**
 * Verifica se o valor é um objeto simples.
 *
 * @param {*} valor
 * @returns {boolean}
 */
export function objetoValido(valor) {
    return (
        valor !== null &&
        typeof valor === "object" &&
        !Array.isArray(valor)
    );
}


/**
 * Cria uma cópia simples de um valor.
 *
 * @param {*} valor
 * @returns {*}
 */
export function copiarValor(valor) {
    if (
        Array.isArray(valor)
    ) {
        return [...valor];
    }

    if (
        objetoValido(valor)
    ) {
        return { ...valor };
    }

    return valor;
}


/* =========================================================
   DATA E HORA
   ========================================================= */

/**
 * Retorna a data e hora atual no formato ISO.
 *
 * @returns {string}
 */
export function obterDataHoraAtual() {
    return new Date().toISOString();
}

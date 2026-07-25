/* =========================================================
   ACQUA
   FUNÇÕES AUXILIARES
   ========================================================= */


/* =========================================================
   ESPERA
   ========================================================= */

export function esperar(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}


/* =========================================================
   ID ÚNICO
   ========================================================= */

export function gerarId() {

    return Date.now().toString(36) +
           Math.random().toString(36).slice(2);

}


/* =========================================================
   TEXTO
   ========================================================= */

export function limparTexto(texto) {

    return texto.trim();

}


/* =========================================================
   SCROLL
   ========================================================= */

export function scrollFinal(elemento) {

    elemento.scrollTop = elemento.scrollHeight;

}

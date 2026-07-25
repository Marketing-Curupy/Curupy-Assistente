/* =========================================================
   ACQUA
   CONFIGURAÇÕES GERAIS
   ========================================================= */

export const CONFIG = {

    /* =====================================================
       API
       ===================================================== */

    apiUrl:
        "https://script.google.com/macros/s/AKfycbybLIp5yXVxlzeE0n41WHXxKgpHtfx0UNh3LCb1Ew0tCKZTbNa3jpMbGldPvAXV68jC/exec",

    tempoLimiteApi: 10000,


    /* =====================================================
       ASSISTENTE
       ===================================================== */

    nomeAssistente: "Acqua",

    idioma: "pt-BR",


    /* =====================================================
       DIGITAÇÃO
       ===================================================== */

    tempoDigitando: {

        minimo: 600,

        maximo: 1200

    },


    /* =====================================================
       CONVERSA
       ===================================================== */

    limiteHistorico: 20,

    limiteMensagem: 500,


    /* =====================================================
       CACHE
       ===================================================== */

    cache: {

        chave:
            "acqua_base_conhecimento",

        validadeMinutos: 30

    },


    /* =====================================================
       FALLBACK
       ===================================================== */

    fallback: {

        mensagem:
            "Ainda não consegui entender exatamente essa dúvida. 😊\n\nVocê pode escrever de outra forma ou escolher um dos assuntos abaixo."

    },


    /* =====================================================
       LINKS
       ===================================================== */

    linksEmergencia: {

        site:
            "https://curupy.com.br",

        whatsappGeral:
            "https://wa.me/556630151337",

        localizacao:
            "https://maps.app.goo.gl/fKZki9NEw4o3drdH7"

    },


    /* =====================================================
       MENSAGENS PADRÃO
       ===================================================== */

    mensagens: {

        erroGenerico:
            "Ocorreu um erro inesperado.",

        erroApi:
            "Não foi possível conectar ao servidor.",

        carregando:
            "Carregando informações...",

        digitando:
            "Acqua está digitando..."

    },


    /* =====================================================
       LOG
       ===================================================== */

    debug: false

};


/* =========================================================
   CONFIGURAÇÕES IMUTÁVEIS
   ========================================================= */

Object.freeze(CONFIG);

Object.freeze(CONFIG.cache);

Object.freeze(CONFIG.fallback);

Object.freeze(CONFIG.linksEmergencia);

Object.freeze(CONFIG.tempoDigitando);

Object.freeze(CONFIG.mensagens);

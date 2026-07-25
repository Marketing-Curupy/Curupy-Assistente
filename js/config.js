/* =========================================================
   ACQUA — CONFIGURAÇÕES GERAIS
   ========================================================= */

export const CONFIG = {
  apiUrl:
    "https://script.google.com/macros/s/AKfycbzIZOlrc_7e-ReVRsIBRukTE0P5bwoxIKXckOi6zsc6I3PtdXhG87Oz0iKVfJnnGZ46Bw/exec",

  nomeAssistente: "Acqua",

  idioma: "pt-BR",

  tempoDigitando: {
    minimo: 600,
    maximo: 1200
  },

  limiteHistorico: 20,

  tempoLimiteApi: 10000,

  cache: {
    chave: "acqua_base_conhecimento",
    validadeMinutos: 30
  },

  fallback: {
    mensagem:
      "Ainda não consegui entender exatamente essa dúvida 😅\n\nVocê pode escrever de outra forma ou escolher um dos assuntos abaixo."
  },

  linksEmergencia: {
    site: "https://curupy.com.br",

    localizacao:
      "https://maps.app.goo.gl/fKZki9NEw4o3drdH7",

    whatsappGeral:
      "https://wa.me/556630151337"
  }
};

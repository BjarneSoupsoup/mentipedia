export type Examen = PreguntaExamen[]

export interface PreguntaExamen {
    enunciado: string,
    respuesta: RespuestaTexto | RespuestaListaTextos | RespuestaNumerico
}

export type RespuestaT = RespuestaTexto | RespuestaListaTextos | RespuestaNumerico

interface RespuestaTexto {
    tipo: "texto",
    textosValidosEsperados: string[]
}

interface RespuestaListaTextos {
    tipo: "listaTexto"
    listaTextosValidosEsperados: string[][]
}

interface RespuestaNumerico {
    tipo: "numérico"
    numeroEsperado: number
    variacionAceptadaAbsoluta: number
}
export type Examen = PreguntaExamen[]

export interface PreguntaExamen {
    enunciado: string,
    respuesta: RespuestaTexto | RespuestaListaTextos | RespuestaNumerico
}

export type RespuestaT = RespuestaTexto | RespuestaListaTextos | RespuestaNumerico

export interface RespuestaTexto {
    tipo: "texto",
    textosValidosEsperados: string[]
}

export interface RespuestaListaTextos {
    tipo: "listaTexto"
    listaTextosValidosEsperados: string[][]
}

export interface RespuestaNumerico {
    tipo: "numérico"
    numeroEsperado: number
    variacionAceptadaAbsoluta: number
}
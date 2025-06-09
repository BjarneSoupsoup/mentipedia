"use server"

import { log } from "../system"
import { PREGUNTAS } from "./examen"
import { RespuestaListaTextos, RespuestaNumerico, RespuestaT, RespuestaTexto } from "./types"

interface checkResponseType {
    isOk: boolean,
    failureReason ?: string
}

function compareStringToList(userInput: string, possibleExpectedValues: string[]): boolean {
    for (let i = 0; i < possibleExpectedValues.length; ++i) {
        if (userInput.toLowerCase().includes(possibleExpectedValues[i].toLowerCase())) {
            return true
        }
    }
    return false
}

function checkRespuestaMultiTexto(respuestaEsperada: RespuestaListaTextos, respuestaMentirologo: string[]): checkResponseType {
    // Some level of sanitazion is needed. Sometimes the form input can be empty
    const respuestaMentirologosSanitized = Array.from(respuestaMentirologo).filter((x) => x !== "")

    if (respuestaMentirologosSanitized.length !== respuestaEsperada.listaTextosValidosEsperados.length) {
        return { isOk: false, failureReason: "Se esperaba un número distinto de respuestas"}
    }

    for (let i = 0; i < respuestaMentirologosSanitized.length; ++i) {
        // Multi-valued string answers can be answered in whatever order
        let failingExpectedAnswer: string[] | undefined = undefined
        for (let j = 0; j < respuestaEsperada.listaTextosValidosEsperados.length; ++j) {
            // When comparing, remove from the list of possible expected values via splice
            if (compareStringToList(respuestaMentirologosSanitized[i], respuestaEsperada.listaTextosValidosEsperados[j])) {
                failingExpectedAnswer = respuestaEsperada.listaTextosValidosEsperados.splice(j, 1)[0]
                break
            }
        }
        if (failingExpectedAnswer === undefined) {
            return { isOk: false, failureReason: `Respuesta incorrecta. Se esperaba una de ${failingExpectedAnswer}. Se redactó ${respuestaMentirologosSanitized[i]}` }
        }
    }

    return { isOk: true }
}

function checkRespuestaTexto(respuestaEsperada: RespuestaTexto, respuestaMentirologo: string[]): checkResponseType {
    if (respuestaMentirologo.length !== 1 || respuestaMentirologo[0] === "") {
        return { isOk: false, failureReason: "Se esperaba una única respuesta" }
    }
    const respuestaUnicaMentirologo = respuestaMentirologo[0]
    if (!compareStringToList(respuestaUnicaMentirologo, respuestaEsperada.textosValidosEsperados)) {
        return { isOk: false, failureReason: `Respuesta incorrecta. Se esperaba ${respuestaEsperada.textosValidosEsperados}. Se redactó ${respuestaUnicaMentirologo}` }
    }
    return { isOk: true }
}

function checkRespuestaNumerica(respuestaEsperada: RespuestaNumerico, respuestaMentirologo: string[]): checkResponseType {
    if (respuestaMentirologo.length !== 1 || respuestaMentirologo[0] === "") {
        return { isOk: false, failureReason: "Se esperaba una única respuesta" }
    }
    const respuestaNumeroMentirologo = parseFloat(respuestaMentirologo[0])
    if (Number.isNaN(respuestaNumeroMentirologo)) {
        return { isOk: false, failureReason: `Formato de número incorrecto: ${respuestaMentirologo[0]}` }        
    }
    if (Math.abs(respuestaNumeroMentirologo - respuestaEsperada.numeroEsperado) > respuestaEsperada.variacionAceptadaAbsoluta) {
        return { isOk: false, failureReason: `Número esperado incorrecto. Se esperaba ${respuestaEsperada.numeroEsperado} +- ${respuestaEsperada.variacionAceptadaAbsoluta}. Se redactó ${respuestaNumeroMentirologo}` }        
    }
    return { isOk: true }
}

function checkPregunta(respuestaEsperada: RespuestaT, respuestaMentirologo: string[]): checkResponseType {
    switch (respuestaEsperada.tipo) {
        case "listaTexto":
            return checkRespuestaMultiTexto(respuestaEsperada, respuestaMentirologo)
        case "numérico":
            return checkRespuestaNumerica(respuestaEsperada, respuestaMentirologo)
        case "texto":
            return checkRespuestaTexto(respuestaEsperada, respuestaMentirologo)
        default:
            throw new Error(`Unknown pregunta type: ${respuestaEsperada}`)
    }
}

export interface CheckExamResponseType {
    checkOk: boolean,
    originalRequest?: FormData
}

export async function checkExam(_, formData: FormData): Promise<CheckExamResponseType> {
    const formDataNonSensitive = formData.entries().filter((x => !new Set(["nombreMentirologo", "emailMentirologo"]).has(x[0]))).toArray()

    log({ level: "INFO", msg: { formData: formDataNonSensitive }, unit: "checkExamen"})

    let allChecksOk = true    
    try {
        // For each expected answer, look for it in the user request and check the validity
        PREGUNTAS.forEach((preguntaExamen, i) => {
            const respuestaMentirologo = [...formData.getAll(`respuesta_${i}`)] as string[]
            if (!respuestaMentirologo || respuestaMentirologo.length == 0) {
                throw new Error(`Missing respuesta to ${preguntaExamen.enunciado}`)
            }
            const checkResult = checkPregunta(preguntaExamen.respuesta, respuestaMentirologo)
            if (!checkResult.isOk) {
                log({ level: "WARN", msg: { formData: formDataNonSensitive, errCode: "HANDLED_ERR_CHECK", errMsg: checkResult.failureReason }, unit: "checkExamen" })         
                allChecksOk = false
            }
        })
    } catch (e) {
        log({ level: "WARN", msg: { formData: formDataNonSensitive, errCode: "UNHANDLED_ERR_CHECK", errMsg: e }, unit: "checkExamen" }) 
        allChecksOk = false
    }
    return { checkOk: allChecksOk, originalRequest: formData }
}
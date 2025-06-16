import { checkExam } from "@/lib/examen/checker";
import { PREGUNTAS } from "@/lib/examen/examen";
import { RespuestaT } from "@/lib/examen/types";
import DepresseableButton from "@/lib/ui/DepresseableButton";
import Form from "next/form";
import React, { useActionState, useEffect, useRef, useState } from "react";

function InputField({ name, type, required = true, ...rest }: { name: string, type: string, required?: boolean, [key: string]: any }) {
    return <input required={required} className="pl-1 border-1 border-black w-48" name={name} type={type} { ...rest }/>
}

function MultiTextField({ multiTextInputName, originalRequest }: { multiTextInputName: string, originalRequest: FormData }) {
    const [ inputFields, setInputFields ] = useState<any[]>([])
    const lastInputIdx = useRef(0)

    useEffect(() => {
        const makeInputFieldData = function(idx: number) {
            return {
                required: idx === 0, name: `${multiTextInputName}_${idx}`, idx: idx, onInput: (x: React.ChangeEvent<HTMLInputElement>) => {
                    if (lastInputIdx.current === idx) {
                        if (x.target.value && x.target.value !== "") {
                            lastInputIdx.current = lastInputIdx.current + 1
                            setInputFields((oldInputFields) => {
                                const oldInputFieldsCopy = oldInputFields.slice()
                                if (idx === 0) {
                                    return oldInputFieldsCopy.concat(makeInputFieldData(idx + 1))    
                                } else {
                                    const lastOldField = oldInputFieldsCopy.pop()
                                    lastOldField.required = true
                                    return oldInputFieldsCopy.concat(lastOldField, makeInputFieldData(idx + 1))
                                }
                            })
                        }
                    } else if (lastInputIdx.current - 1 === idx) {
                        if (!x.target.value || x.target.value === "") {
                            lastInputIdx.current = lastInputIdx.current - 1
                            setInputFields((oldInputFields) => {
                                const oldInputFieldsCopy = oldInputFields.slice()
                                oldInputFieldsCopy[oldInputFieldsCopy.length - 2].required = false
                                return oldInputFieldsCopy.slice(0, -1)
                            })
                        }
                    }
                }
            }
        }

        setInputFields([makeInputFieldData(0)])
    }, [])

    return(
        <div className="flex flex-col justify-start items-start gap-1">
             { inputFields.map((x) => { return(
                <InputField 
                    name={x.name} type="text" key={x.idx} onInput = {x.onInput} placeholder = "( . . . )" required = {x.required}
                    defaultValue = { getDefaultValueBackFromOriginalRequest(originalRequest, x.name) }
                />
             ) }) }
        </div>
    )
}

function getDefaultValueBackFromOriginalRequest(originalRequest: FormData, inputName: string): string {
    if (originalRequest) {
        const x = originalRequest.get(inputName)
        if (x) {
            return x.toString()
        }
    }
    return ""
}

// Depending on the expected answer, render the input a way or another
function renderPreguntaInput(pregunta_idx: number, respuesta: RespuestaT, originalRequest: FormData) {
    const inputName = `respuesta_${pregunta_idx}`
    const defaultValue = getDefaultValueBackFromOriginalRequest(originalRequest, inputName)

    if (respuesta.tipo == "texto") {
        return <InputField name={ inputName } type="text" defaultValue = { defaultValue } />
    } else if (respuesta.tipo == "listaTexto") {
        return <MultiTextField multiTextInputName= { inputName } originalRequest={ originalRequest }/>
    } else if (respuesta.tipo == "numérico") {
        return <InputField name={ inputName } type="number" defaultValue = { defaultValue } />
    }
}

export default function Examen({ onSuccessfulExamenFinish }: { onSuccessfulExamenFinish: (nombreMentirologo: string, emailMentirologo: string) => void }) {
    const [ checkExamFormState, checkExamFormAction ] = useActionState(checkExam, undefined)

    useEffect(() => {
        if (checkExamFormState?.checkOk! === true) {
            onSuccessfulExamenFinish(
                checkExamFormState?.originalRequest?.get("nombreMentirologo")?.toString()!, 
                checkExamFormState?.originalRequest?.get("emailMentirologo")?.toString()!
            )
        }
    }, [checkExamFormState])

    const testFailDiv = <div className="flex flex-col items-center justify-start gap-2 w-full">
        <section className="flex flex-col items-center justify-start gap-2 w-3/4 mt-5 border-2 p-1">
            <div className="relative w-1/4 h-auto">
                <img src="/pictures/zapatero.webp" alt="zapatero" className="w-full h-full object-fill" />
            </div>
            <p className="text-center"> Tu examen aún presenta <b>errores</b>. <span className="text-red-700 underline">Corrígelo. No eres digno.</span></p>
        </section>
    </div>

    const examForm = <Form 
            action={ checkExamFormAction } className="flex flex-col justify-start items-start gap-8">
            <div className="text-xl flex flex-col w-60">
                <div>
                    <p><b>Nombre del solicitante:</b></p>
                    <InputField 
                        name="nombreMentirologo" type="text" 
                        defaultValue={getDefaultValueBackFromOriginalRequest(checkExamFormState?.originalRequest!, "nombreMentirologo") } 
                    />
                </div>
                <div>
                    <p><b>Correo electrónico:</b></p>
                    <InputField 
                        name="emailMentirologo" type="email"
                        defaultValue={getDefaultValueBackFromOriginalRequest(checkExamFormState?.originalRequest!, "emailMentirologo") } 
                    />
                </div>
            </div>
            { PREGUNTAS.map((x, idx) => {return(
                <div key={idx} className="flex flex-col gap-2">
                    <p> <b>{idx + 1}</b>º  { x.enunciado }: </p>
                    { renderPreguntaInput(idx, x.respuesta, checkExamFormState?.originalRequest!) }
                </div>
            )}) }
            <div className="flex flex-col w-full items-center justify-start">
                <DepresseableButton submit={ true }>
                    Presentar examen
                </DepresseableButton>
            </div>
        </Form>
    
    return(
        <div className="flex flex-col w-6/7 gap-5">
            { examForm }
            { checkExamFormState?.checkOk === false && testFailDiv }
        </div>
    )
}
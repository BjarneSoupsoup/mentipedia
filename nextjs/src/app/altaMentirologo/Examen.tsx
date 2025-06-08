import { checkExam } from "@/lib/examen/checker";
import { PREGUNTAS } from "@/lib/examen/examen";
import { RespuestaT } from "@/lib/examen/types";
import DepresseableButton from "@/lib/ui/DepresseableButton";
import Form from "next/form";
import React, { useEffect, useRef, useState } from "react";

function InputField({ name, type, required = true, ...rest }: { name: string, type: string, required?: boolean, [key: string]: any }) {
    return <input required={required} className="pl-1 border-1 border-black w-48" name={name} type={type} { ...rest }/>
}

function MultiTextField({ multiTextInputName }: { multiTextInputName: string }) {
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
                <InputField name={x.name} type="text" key={x.idx} onInput = {x.onInput} placeholder = "( . . . )" required = {x.required}></InputField>
             ) }) }
        </div>
    )
}


// Depending on the expected answer, render the input a way or another
function renderPreguntaInput(pregunta_idx: number, respuesta: RespuestaT) {
    const inputName = `respuesta_${pregunta_idx}`

    if (respuesta.tipo == "texto") {
        return <InputField name={ inputName } type="text"/>
    } else if (respuesta.tipo == "listaTexto") {
        return <MultiTextField multiTextInputName= { inputName }/>
    } else if (respuesta.tipo == "numérico") {
        return <InputField name={ inputName } type="number"/>
    }
}

export default function Examen({ onSubmit }: { onSubmit: (x: React.FormEvent<HTMLFormElement>) => void }) {
    return (
        <Form action={ checkExam } onSubmit={ onSubmit } className="w-6/7 flex flex-col justify-start items-start gap-8">
            <div className="text-xl flex flex-col w-60">
                <div>
                    <p><b>Nombre del solicitante:</b></p>
                    <InputField name="nombreMentirologo" type="text"></InputField>
                </div>
                <div>
                    <p><b>Correo electrónico:</b></p>
                    <InputField name="emailMentirologo" type="email"></InputField>
                </div>
            </div>
            { PREGUNTAS.map((x, idx) => {return(
                <div key={idx} className="flex flex-col gap-2">
                    <p> <b>{idx + 1}</b>º  { x.enunciado }: </p>
                    { renderPreguntaInput(idx, x.respuesta) }
                </div>
            )}) }
            <div className="flex flex-col w-full items-center justify-start">
                <DepresseableButton submit={ true }>
                    Presentar examen
                </DepresseableButton>
            </div>
        </Form>
    )
}
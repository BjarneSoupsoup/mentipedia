"use client"

import { useState } from "react";
import Introduccion from "./Introduccion";
import Examen from "./Examen";
import { Link } from "@/lib/ui/Link";

export default function AltaMentirologo() {
    const [ realizandoExamen, setRealizandoExamen ] = useState(false)
    const [ nombreMentirologo, setNombreMentirologo ] = useState("")
    const [ emailMentirologo, setEmailMentirologo ] = useState("")

    const examenFinalizado = nombreMentirologo !== "" && emailMentirologo !== ""

    return(
        <div className="w-full flex flex-col items-center mt-5">
            { !realizandoExamen && <Introduccion onClickRealizandoExamenButton={ () => setRealizandoExamen(true) }/> }
            { !examenFinalizado && realizandoExamen && <Examen onSubmit={ (x) => {
                setNombreMentirologo((
                    x.currentTarget.elements.namedItem("nombreMentirologo") as HTMLInputElement
                ).value)
                setEmailMentirologo((
                    x.currentTarget.elements.namedItem("emailMentirologo") as HTMLInputElement
                ).value)
            } }/> }
            { 
                examenFinalizado && 
                <div className="flex flex-col items-center justify-start gap-2">
                    <section className="w-3/4 mt-5 border-1 p-1">
                        <p>Gracias, {nombreMentirologo}, por tomarte la molestia de rellenar el formulario. Recibirá los resultados de su solicitud dentro de una semana,
                            en la dirección de correo: { emailMentirologo }.
                        </p>
                    </section>
                    <Link href="/">Volver a mentipedia</Link>
                </div>
            }
        </div>
    ) 
}
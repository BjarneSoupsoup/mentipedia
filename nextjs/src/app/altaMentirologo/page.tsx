"use client"

import { useState } from "react";
import Introduccion from "./Introduccion";
import Examen from "./Examen";
import { MuestraResultados } from "./MuestraResultados";

type ExamState = "PANTALLA_PRESENTACION" | "REALIZANDO_EXAMEN" | "EXAMEN_FINALIZADO_OK"

export default function AltaMentirologo() {
    const [ examState, setExamState ] = useState<ExamState>("PANTALLA_PRESENTACION")
    const [ nombreMentirologo, setNombreMentirologo ] = useState("")
    const [ emailMentirologo, setEmailMentirologo ] = useState("")

    const renderContent = () => {
        switch(examState) {
            case "PANTALLA_PRESENTACION":
                return <Introduccion onClickRealizandoExamenButton={ () => { setExamState("REALIZANDO_EXAMEN") } }/>
            case "REALIZANDO_EXAMEN":
                return <Examen onSuccessfulExamenFinish={ (nombreMentirologo, emailMentirologo) => { 
                    setExamState("EXAMEN_FINALIZADO_OK")
                    setNombreMentirologo(nombreMentirologo)
                    setEmailMentirologo(emailMentirologo)
                 } }/>
            case "EXAMEN_FINALIZADO_OK":
                return <MuestraResultados emailMentirologo={ emailMentirologo } nombreMentirologo = { nombreMentirologo }></MuestraResultados>
        }
    }

    return(
        <div className="w-full flex flex-col items-center mt-5">
            { renderContent() }
        </div>
    ) 
}
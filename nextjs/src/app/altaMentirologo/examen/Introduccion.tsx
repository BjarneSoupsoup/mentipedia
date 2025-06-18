import DepresseableButton from "@/lib/ui/DepresseableButton";

export default function Introduccion({ onClickRealizandoExamenButton }: { onClickRealizandoExamenButton: () => void }) {
    return(
        <article className="w-6/7 flex flex-col justify-start items-start gap-4">
            <h1 className="text-2xl"><b>Solicitud de alta como mentirólogo</b></h1>
            <p>
                La misión de Mentipedia es hacer del mundo un lugar menos torcido y enrevesado, sin vericuetos ni artimañas. Es por eso que
                este portal web ha de predicar con el ejemplo. Por ello, tratará de mantener a raya a embusteros, zelotas, agitadores, ignorantes, cizañeros
                y revuelvegallinas.
            </p>
            <p>
                Con este propósito, cualquier ciudadano que desee aportar contenido, siendo este nuevas mentiras o fuentes, o por el contrario, desee suprimir
                mentiras preexistentes, será sometido previamente a un <b><span className="italic">examen de conocimiento de cultura elemental española </span></b>
                en sus apartados social, político, histórico y económico.
            </p>
            <p>
                La duración aproximada del examen es de <b>diez minutos</b>.
            </p>
            <p>
                Una vez presentado el examen, será corregido automáticamente. El proceso de corrección es relativamente laxo. La mayoría de las preguntas aceptan
                datos aproximados. Las respuestas que requieran redacción serán valoradas según su grado de similitud con la respuesta esperada, permitiendo una gran 
                holgura. El propósito del examen no es certificar un alto grado de concomiento en ningún campo; simplemente sirve de excusa para forzar
                a los interesados en aportar contenido a ceder una minúscula parte de su tiempo. De esta manera se demuestra el grado de involucración del mentirólogo,
                aunque sea mínimo. Se puede aprobar aún respondiendo una pregunta de manera incorrecta.
            </p>
            <p> Una vez corregido el examen se le enviará un correo electrónico para finalizar el alta. El proceso es instantáneo; sin embargo, <b>su nueva área de mentirólogo
                se mantendrá inhabilitada (temporalmente) durante una semana</b>. Una vez más, esto se hace para corroborar que los usuarios tienen cierto sentido de la responsabilidad
                y un mínimo grado de interés por el buen funcionamiento del portal web.
            </p>

            <div className="flex flex-row justify-center items-center w-full mt-5">
                <DepresseableButton onClick={ onClickRealizandoExamenButton }>
                    Realizar el examen
                </DepresseableButton>
            </div>
        </article>
    )
}
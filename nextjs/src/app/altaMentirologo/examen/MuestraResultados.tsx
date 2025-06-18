import { Link } from "@/lib/ui/Link"

interface MuestraResultadosPropsType {
    nombreMentirologo: string,
    emailMentirologo: string,
}
export function MuestraResultados(props: MuestraResultadosPropsType) {
    return(
        <div className = "flex flex-col items-center justify-start gap-2" >
            <section className="w-3/4 mt-5 border-1 border-gray-400 p-3 flex flex-col gap-2 items-start bg-gray-200">
                <p> Ha completado el examen satisfactoriamente!</p>
                <p>
                    Gracias, {props.nombreMentirologo}, por tomarte la molestia de rellenar el formulario. En breves momentos recibirá un correo electrónico con
                    la información necesaria para completar su registro en la dirección de correo 
                    que proveyó: <span className="italic">{props.emailMentirologo}</span>.
                </p>
            </section>
            <div className="h-auto w-1/2">
                <img src="/pictures/rajoy_muchas_gracias_buenas_tardes.webp" className="w-full h-full object-fill"></img>
            </div>
            <Link href="/">Volver a mentipedia</Link>
        </div >
    )
}
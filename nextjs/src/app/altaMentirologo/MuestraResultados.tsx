import { Link } from "@/lib/ui/Link"

interface MuestraResultadosPropsType {
    nombreMentirologo: string,
    emailMentirologo: string,
}
export function MuestraResultados(props: MuestraResultadosPropsType) {
    return(
        <div className = "flex flex-col items-center justify-start gap-2" >
            <section className="w-3/4 mt-5 border-1 p-1 flex flex-col gap-2 items-start">
                <p> Ha completado el examen satisfactoriamente!</p>
                <p>
                    Gracias, {props.nombreMentirologo}, por tomarte la molestia de rellenar el formulario. Recibirá un correo electrónico con
                    la información necesaria para completar su registro dentro de una semana en la dirección de correo 
                    que proveyó: <span className="italic">{props.emailMentirologo}</span>.
                </p>
                <div className="h-auto w-3/4 self-center">
                    <img src="/pictures/rajoy_muchas_gracias_buenas_tardes.webp" className="w-full h-full object-fill"></img>
                </div>
            </section>
            <Link href="/">Volver a mentipedia</Link>
        </div >
    )
}
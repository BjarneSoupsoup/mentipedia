import { getMentiraData } from "@/lib/dbFetching"
import { renderAliasText } from "@/lib/mentiroso"
import { BLUE_HYPERLINK_STYLE } from "@/lib/ui/Link"
import { formatDateLong } from "@/lib/ui/utils"
import { YoutubeVideo } from "@/lib/ui/YoutubeVideo"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const mentiraData = await getMentiraData(slug)

    return <div className="flex flex-col mt-5 px-6 pt-3 gap-5">
        <div className="flex flex-row h-[8vh]">
            <aside className="flex-1 flex flex-col items-center">
                <div className="relative flex-4 w-16 h-10">
                    <img className="object-fill h-full w-full" alt={mentiraData.mentiroso.nombre_completo} src={`${process.env.S3_ORIGIN}/public/${mentiraData.mentiroso.retrato_s3_key}`} />
                </div>
            </aside>
            <header className="flex justify-center gap-5 text-base items-center flex-col flex-2 text-center">
                <div>
                    <h1>El día {formatDateLong(mentiraData.mentira.fecha)} <b>{mentiraData.mentiroso.nombre_completo}</b>, {renderAliasText(mentiraData.mentiroso.alias, false) } dijo: </h1>
                </div>
            </header>
        </div>
        <h2 className="italic relative">
            <img className="absolute bottom-2 right-15 w-1/2 opacity-30 h-auto rotate-330" src="/pictures/mentira_estampa.webp" alt="mentira_estampa"></img>
            <img className="absolute bottom-2 left-15 w-1/4 opacity-75 h-auto rotate-10" src="/pictures/sello_mentipedia.webp" alt="sello_mentipedia"></img>
            <span className="text-xl">&ldquo;</span>
            { mentiraData.mentira.mentira }
            <span className="text-xl">&rdquo;</span>
        </h2>
        <section>
            <h2 className="text-2xl"><b>Contexto</b></h2>
            <p>{ mentiraData.mentira.contexto }</p>
        </section>
        <section>
            <h2 className="text-2xl"><b>Proclamación</b></h2>
            <h3 className="text-base">(manos en la masa) &#x1F633;</h3>
            <div className="flex flex-col items-center">
                <div className="relative h-44 w-8/9 mt-4">
                    <YoutubeVideo
                        hash_id={mentiraData.mentira.youtube_video_hash}
                        start={mentiraData.mentira.youtube_video_start_time}
                        end={mentiraData.mentira.youtube_video_end_time}
                    />
                </div>
            </div>
        </section>
        <section>
            <h2 className="text-2xl"><b>Fuentes</b></h2>
            <ul className="flex flex-col mt-2 gap-2">
                { mentiraData.fuentes.map((x) => {
                    return (
                        <li key={x.id} className="flex">
                            <span className="mr-1">&ndash;</span>
                            <a className={BLUE_HYPERLINK_STYLE} href={x.hyperlink}>{x.texto}</a>
                        </li>
                    )
                })}
            </ul>
        </section>
    </div>
}
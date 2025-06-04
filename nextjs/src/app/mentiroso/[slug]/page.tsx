import { getMentirosoLandingPageData } from "@/lib/dbFetching";
import { CourierPrime_class } from "@/lib/fonts";
import { computeThreatLevel, renderAliasText } from "@/lib/mentiroso";
import { notFound } from "next/navigation"
import MentirasFeed from "@/app/mentiroso/[slug]/MentirasFeed"
import { Link } from "@/lib/ui/Link";


export default async function Page({ params }: { params: Promise<{ slug: string }>}) {
    const { slug } = await params
    const mentirosoLandingPageData = await getMentirosoLandingPageData(slug)
    const mentirosoData = mentirosoLandingPageData.mentirosoData
    if (!mentirosoLandingPageData.mentirosoData) {
        return notFound()
    }

    return(
        <div className="flex flex-col mt-5 p-4">
            <div className="flex flex-row h-[20vh]">
                <aside className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="relative flex-4 w-2/3">
                        <img className="object-fill h-full w-full" alt={mentirosoData.nombre_completo} src={`${process.env.S3_ORIGIN}/public/${mentirosoData.retrato_s3_key}`} />
                    </div>
                    <div className={`flex-3 text-sm ${CourierPrime_class} text-center`}>
                        <p> Nivel de amenaza: </p>
                        <p>&quot;{computeThreatLevel(mentirosoLandingPageData.numMentiras)}&quot;</p>
                    </div>
                </aside>
                <header className="flex justify-center gap-5 text-base items-center flex-col flex-1 text-center">
                    <div>
                        <h1><b>{mentirosoData.nombre_completo}</b>,</h1>
                        <h2>{renderAliasText(mentirosoData.alias, false)}</h2>
                        <Link href="404">(cambiar)</Link>
                    </div>
                    <div>
                        <h2>{ mentirosoLandingPageData.numMentiras } mentiras (de momento)</h2>
                    </div>
                </header>
            </div>
            <section className="mt-5 ms-2">
                <MentirasFeed mentiras={mentirosoLandingPageData.mentiras} nombreMentiroso={mentirosoData.nombre_completo}/>
            </section>
        </div>
    )
}
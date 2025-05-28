import { getMentiraData } from "@/lib/dbFetching"
import { renderAliasText } from "@/lib/mentiroso"
import { Link } from "@/lib/ui/Link"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const mentiraData = await getMentiraData(slug)

    return <div className="flex flex-col mt-5 p-4">
            <div className="flex flex-row h-[20vh]">
                <aside className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="relative flex-4 w-2/3">
                        <img className="object-fill h-full w-full" alt={mentiraData.mentiroso.nombre_completo} src={`${process.env.S3_ORIGIN}/public/${mentiraData.mentiroso.retrato_s3_key}`} />
                    </div>
                </aside>
                <header className="flex justify-center gap-5 text-base items-center flex-col flex-1 text-center">
                    <div>
                        <h1><b>{mentiraData.mentiroso.nombre_completo}</b>,</h1>
                        <h2>{renderAliasText(mentiraData.mentiroso, false)}</h2>
                        <Link href="404">(cambiar)</Link>
                    </div>
                </header>
            </div>
    </div>
}
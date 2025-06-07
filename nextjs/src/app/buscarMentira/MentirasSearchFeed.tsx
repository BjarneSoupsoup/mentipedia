"use client"

import { cachedSearchMentira } from "@/lib/mentiraQuery"
import { useInfiScroll } from "@/lib/ui/infiScroll"
import { Link } from "@/lib/ui/Link"
import LoadingHamster from "@/lib/ui/LoadingHamster"
import { formatDateddmmYY } from "@/lib/ui/utils"
import { useEffect } from "react"


// Better to render straight from the browser, as it will have probably pre-fetched the query results while
// the user was typing the search.
export default function MentirasSearchFeed({ mentiraQuery }: { mentiraQuery: string }): React.ReactNode {
    const { itemsCollection: searchResults, isFetchingNewContent, resetState: resetInfiScrollState } = useInfiScroll(async (page) => {
        return (await cachedSearchMentira(mentiraQuery, page))!
    })

    useEffect(() => {
        resetInfiScrollState()
    }, [mentiraQuery])

    const loadingHamsterDiv = <div className="pt-5 w-2/7 h-4/7">
        <LoadingHamster />
    </div>

    let content = <div className="flex flex-col w-full gap-2 justify-start items-center">
        <p>No existen mentiras relacionadas con: <span className="italic">{mentiraQuery}</span> (de momento)</p>
        <div className="w-20 h-30 relative">
            <img src="/pictures/zapatero.webp" alt="notFound" className="object-fill w-full h-full"/>
        </div>
    </div>

    if (isFetchingNewContent) {
        content = <></>
    }

    if (searchResults && searchResults.length > 0) {
        content = <div className="w-full flex flex-col gap-1.5 justify-start items-center divide-y divide-gray-400">
            { searchResults.map((x) => {
                return(
                    <div key={x.id} className="w-full flex flex-row justify-between">
                        <div className="flex-2 flex flex-col justify-center">
                            <div className="w-12 aspect-[4/5]">
                                <img className="object-fill h-full w-full" alt={x.mentiroso.webp} src={`${process.env.NEXT_PUBLIC_S3_ORIGIN}/public/${x.retrato_s3_key}`} />
                            </div>
                            <p className="text-xs"><b>{ x.mentiroso }</b></p>
                        </div>
                        <div className="flex-5 text-right text-xs flex flex-col justify-center">
                            <Link href={`/mentira/${x.slug}`} className="italic">
                                <span>&ldquo;</span> {x.mentira} <span>&rdquo;</span>
                            </Link>
                            <p> &mdash; { formatDateddmmYY(x.fecha) } </p>
                        </div>
                    </div>
                )
            }) }
        </div>
    }

    return <section className="w-full px-4 pt-4 flex flex-col gap-1 justify-start items-center">
        { content }
        { isFetchingNewContent && loadingHamsterDiv }
    </section>
}

"use client"

import { pagedMentirosoMentirasFetch } from "@/lib/db"
import { MentiraSummaryDAO } from "@/lib/mentiras"
import { useInfiScroll } from "@/lib/ui/infiScroll"
import { Link } from "@/lib/ui/Link"
import LoadingHamster from "@/lib/ui/LoadingHamster"
import { formatDateLong } from "@/lib/ui/utils"

// Initially renders the top X mentiras, then relies on client data fetching for further data consumption.
export default function MentirasFeed({ initialMentiras, nombreMentiroso, mentirosoId }: { initialMentiras: MentiraSummaryDAO[], nombreMentiroso: string, mentirosoId: number }) {
    const {itemsCollection: mentirasList, isFetchingNewContent} = useInfiScroll((x) => {
        return pagedMentirosoMentirasFetch(mentirosoId, x)
    }, initialMentiras)

    const loadingHamsterDiv = <div className="pt-5 w-2/7 h-4/7">
        <LoadingHamster/>
    </div>

    const mentirasListComponent = <ul className="flex flex-col gap-5 divide-y divide-gray-300">{ mentirasList.map((x) => {
            return <li key = {x.id} className="pb-5">
                <p className="italic">
                    <Link href={`/mentira/${x.slug}`}>
                        <span className="text-xl">&ldquo;</span>
                        { x.mentira }
                        <span className="text-xl">&rdquo;</span>
                    </Link>
                </p>
                <p className="text-right mr-[10%]">&mdash; { nombreMentiroso }, a  { formatDateLong(x.fecha) } </p>
            </li>
        }) }</ul>

    return(
        <div className="flex flex-col gap-2 justify-start items-center">
            { mentirasListComponent }
            { isFetchingNewContent && loadingHamsterDiv}
        </div>
    )
}
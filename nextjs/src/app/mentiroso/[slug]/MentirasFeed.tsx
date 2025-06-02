import { MentiraSummaryDAO } from "@/lib/mentiras"
import { Link } from "@/lib/ui/Link"
import { formatDateLong } from "@/lib/ui/utils"

// Initially renders the top X mentiras, then relies on client data fetching for further data consumption.
export default async function MentirasFeed({ mentiras, nombreMentiroso } : { mentiras: MentiraSummaryDAO[], nombreMentiroso: string }) {
    return (
        <ul className="flex flex-col gap-10">{ mentiras.map((x) => {
            return <li key = {x.id}>
                <p className="italic">
                    <Link href={`/mentira/${x.slug}`}>
                        <span className="text-xl">&ldquo;</span>
                        {x.mentira}
                        <span className="text-xl">&rdquo;</span>
                    </Link>
                </p>
                <p className="text-right mr-[10%]">&mdash; { nombreMentiroso }, a  { formatDateLong(x.fecha) } </p>
            </li>
        }) }</ul>
    )
}
import { getTopMentirososView } from "@/lib/dbFetching"
import { renderAliasText } from "@/lib/mentiroso"
import Link from "next/link"
import { BLUE_HYPERLINK_STYLE } from "@/lib/ui/Link"

export default async function TopMentirosos() {
    return <ul className="flex flex-col gap-2 items-start w-9/10">
        {(await getTopMentirososView()).map((x) => {
            return <li className="w-full" key={x.id}>
              <Link href={`/mentiroso/${x.slug}`} className="flex flex-row justify-start gap-2">
                <div className="relative w-[20%] aspect-square shrink-0">
                    <img className="object-fill" alt={x.nombre_completo} src={`${process.env.S3_ORIGIN}/public/${x.retrato_s3_key}`} />
                </div>
                <div className="flex flex-col justify-center">
                    <div className="text-xs flex-3 flex flex-row justify-start items-center">
                        <p>
                            <b>{x.nombre_completo}</b>
                            {renderAliasText(x.alias)}
                        </p>
                    </div>
                    <div className="flex-1"></div>
                    <p className={`text-xs flex-3  flex flex-row justify-start items-center ${BLUE_HYPERLINK_STYLE}`}>
                      {`${x.num_of_mentiras} mentiras`}
                    </p>
                </div>
              </Link>
            </li>
        })}
    </ul>
}
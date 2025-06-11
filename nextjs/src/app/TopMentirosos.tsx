"use client"

import { renderAliasText } from "@/lib/mentiroso"
import Link from "next/link"
import { BLUE_HYPERLINK_STYLE } from "@/lib/ui/Link"
import { useInfiScroll } from "@/lib/ui/infiScroll"
import { pagedTopMentirososSearch } from "@/lib/db"
import LoadingHamster from "@/lib/ui/LoadingHamster"

export default function TopMentirosos({ topMentirososInit }: { topMentirososInit: any[] }) {
    const { itemsCollection: mentirososList, isFetchingNewContent } = useInfiScroll(pagedTopMentirososSearch, topMentirososInit)

    const mentirososListRender = <ul className="flex flex-col gap-2 items-start w-full">
        {mentirososList.map((x) => {
            return <li className="w-full" key={x.id}>
              <Link href={`/mentiroso/${x.slug}`} className="flex flex-row justify-start gap-2">
                    <div className="relative w-1/6 aspect-[4/5]">
                        <img className="object-fill w-full h-full" alt={x.nombre_completo} src={`${process.env.NEXT_PUBLIC_S3_ORIGIN}/public/${x.retrato_s3_key}`} />
                        <div style = {{
                            clipPath: "inset(10px 0px 84px 0px)",
                            position: "absolute",
                            top: "25px",
                            right: "-65px",
                            width: "100px",
                            zIndex: "1"
                        }}>
                            <img style={{width: "500px"}} src="/pictures/nose_job_tilemap.webp" alt="nose"/>
                        </div>
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
                      {`${x.num_of_mentiras} mentira${x.num_of_mentiras === '1' ? '' : 's'}`}
                    </p>
                </div>
              </Link>
            </li>
        })}
    </ul>

    const loadingHamsterDiv = <div className="w-full flex flex-col justify-start items-center">
        <div className="pt-5 w-2/7 h-4/7"><LoadingHamster /></div>
    </div>

    return(<div className="flex flex-col w-9/10">
        { mentirososListRender }
        { isFetchingNewContent && loadingHamsterDiv }
    </div>)
}
import Image from "next/image"
import * as fonts from "@/lib/fonts"
import TopMentirosos from "@/app/TopMentirosos"
import { getTopMentirososView, getTotalNumberOfMentirosos } from "@/lib/dbFetching"

export default async function Page() {
  // Further mentirosos can be fetched by the browser via infi-scroll
  const initialTopMentirosos = await getTopMentirososView()
  const totalMentirosos = await getTotalNumberOfMentirosos()

  return (
    <div>
      <header className="flex justify-center items-center flex-col mt-3">
        <h1 className="w-9/10 aspect-10/1 relative">
          <Image alt="Mentipedia" src="/pictures/mentipedia_main_title.svg" fill/>
        </h1>
        <h2 className={`${fonts.Vollkorn_SC_class} md:text-6xl text-l text-center`}>
          La enciclopedia de las mentiras
        </h2>
      </header>
      <section className="mt-[2%] flex flex-col items-center justify-center gap-3">
        <p className="text-xs"> {totalMentirosos} mentirosos merodean España (de momento) </p>
        <h2 className="h-36 w-6/7 self-end mr-2 relative">
          <Image alt="Mentipedia" src="/pictures/pinochometro_mobile.svg" fill/>
        </h2>
        <TopMentirosos topMentirososInit={initialTopMentirosos}/>
      </section>
    </div>
  )
}

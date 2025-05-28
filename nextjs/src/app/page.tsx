import Image from "next/image"
import * as fonts from "@/lib/fonts"
import TopMentirosos from "@/app/TopMentirosos"

export default async function Page() {
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
      <section className="mt-[2%] flex flex-col items-center justify-center gap-2">
        <p className={`${fonts.Limelight_class} text-base`}>El pinochómetro</p>
        <TopMentirosos/>
      </section>
    </div>
  )
}

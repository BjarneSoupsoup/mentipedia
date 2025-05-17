import Image from "next/image"
import {Vollkorn_SC as fontImport }  from "next/font/google"

const font = fontImport({
  subsets: ["latin"],
  weight: "400"
})

export default function page() {
  return (
    <div>
      <header className="flex justify-center items-center flex-col mt-3">
        <h1 className="w-9/10 aspect-10/1 relative">
          <Image alt="Mentipedia" src="/pictures/mentipedia_main_title.svg" fill/>
        </h1>
        <h2 className={`${font.className} md:text-6xl text-l text-center`}>
          La enciclopedia de las mentiras
        </h2>
      </header>
      <main>
      </main>
      <footer>

      </footer>
    </div>
  )
}

import Image from "next/image"
import * as fonts from "@/lib/fonts"
import { get_pgsql_db_con } from "@/lib/connectors"

export const revalidate = 60

async function getTopMentirosos() {
  const pgsql_con = await get_pgsql_db_con()
  const pgsql_query_res = await pgsql_con.query("SELECT * FROM TopMentirosos LIMIT 10;")
  return pgsql_query_res.rows;
}

function renderAliasText(mentiroso: any) {
  if (mentiroso.alias == null) {
    return ""
  }
  return <>
    { ", alias " }
    <span className="italic">{mentiroso.alias}</span>
  </>
}

export default async function Page() {
  return (
    <div>
      <main>
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
          <ul className="flex flex-col gap-2 items-start w-9/10">
          { (await getTopMentirosos()).map((x, i) => {
            return <li className="flex flex-row justify-start w-full gap-2" key={i}>
              <div className="relative w-[20%] aspect-square shrink-0">
                <img className="object-fill" alt={x.nombre_completo} src={`${process.env.S3_ORIGIN}/public/${x.retrato_s3_key}`} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs flex-3 flex flex-row justify-start items-center">
                  <p className="font-[TimesNewRoman]">
                    <b>{x.nombre_completo}</b>
                    {renderAliasText(x)}
                  </p>
                </div>
                <div className="flex-1"></div>
                <p className="text-xs flex-3  flex flex-row justify-start items-center font-[TimesNewRoman]">{`${x.num_of_mentiras} mentiras`}</p>
              </div>
            </li>
          }) }
          </ul>
        </section>
      </main>
      <footer>

      </footer>
    </div>
  )
}

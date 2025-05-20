import Link from "next/link";
import Image from "next/image";
import Form from "next/form";

export default function Navbar() {
    return <div className="border-b-3 flex flex-row justify-start items-center">
        <div className="flex flex-row justify-items-start items-center grow">
            <Link className="ml-[15%] pb-2 pt-2 underline text-sm text-blue-700" href="/altaMentirologo">
                Date de alta como mentirólogo
            </Link>
        </div>
        <Form action="/search" className="flex flex-row-reverse justify-items-start items-center grow">
            <button type="submit" className="md:w-1/12 w-1/4 aspect-12/10 ml-0.5 mr-[5%] md:mt-[1%] relative cursor-pointer">
                <Image alt="Buscador perro" src="/pictures/dog_search.png" fill className=""/>
            </button>
            <input className="md:w-1/4 w-3/4 text-sm ms-0.5 border-1 ps-2" name="mentiraQuery" placeholder="Buscar mentira"/>
        </Form>
    </div>
}
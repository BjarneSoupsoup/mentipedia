"use client"

import { Link } from "@/lib/ui/Link";
import Form from "next/form";
import { usePathname } from "next/navigation";

function homePageImageLink(): React.ReactNode {
    return <Link href="/">
        <div className="relative h-[2vh]">
            <img alt="Mentipedia" src="/pictures/mentipedia_main_title.svg" className="h-full w-full object-fill" />
        </div>
    </Link> 
}

function isOnLandingPage(): boolean {
    return usePathname() === "/"
}

export default function Navbar() {
    return <nav className="flex flex-col items-center mt-[1vh] border-b-3 ">
        { !isOnLandingPage() ? homePageImageLink() : null }
        <div className="flex flex-row justify-start items-center">
            <div className="flex flex-row justify-items-start items-center flex-1">
                <div className="ml-[15%] pb-2 pt-2 text-sm">
                    <Link href="/altaMentirologo">
                        Date de alta como mentirólogo
                    </Link>
                </div>
            </div>
            <Form action="/search" className="gap-2 flex flex-row items-center flex-1 mr-1.5">
                <input className="flex-3 w-full text-sm border-2 p-0.4 pl-0.5" name="mentiraQuery" placeholder="Buscar mentira"/>
                <button type="submit" className="flex-1 h-11 relative cursor-pointer">
                    <img src='/pictures/dog_search.webp' className="object-fill w-full h-full" alt= "perroLupa"/>
                </button>
            </Form>
        </div>
    </nav> 
}
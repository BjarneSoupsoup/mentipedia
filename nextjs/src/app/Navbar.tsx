"use client"

import { webSearchMentira } from "@/lib/dbFetching";
import { Link } from "@/lib/ui/Link";
import Form from "next/form";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { debounce } from 'throttle-debounce'
import { useOnClickOutside } from "usehooks-ts";

const BACKEND_TEXT_SEARCH_THROTTLE_MS = 500

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

const onUserTypeSearchThrottled = debounce(
    BACKEND_TEXT_SEARCH_THROTTLE_MS,
    async (inputSearch: string, setter: (data: any[]) => void) => {
        const res = await webSearchMentira(inputSearch)
        console.log(`Called service, got: ${res}`)
        setter(res)
})

export default function Navbar() {
    const [enlargedModeActive, setEnlargedModeActive] = useState(false)
    const [searchResultsPreview, setSearchResultsPreview] = useState<any[]>([])
    const [searchBarUserInputText, setSearchBarUserInputText] = useState("")

    const pathname = usePathname()

    useEffect(() => {
        cleanSearchBar()
    }, [pathname])

    function cleanSearchBar() {
        setEnlargedModeActive(false)
        setSearchResultsPreview([])
        setSearchBarUserInputText("")
    }

    const formHTMLRef = useRef<HTMLFormElement>(null)
    useOnClickOutside(formHTMLRef as React.RefObject<HTMLFormElement>, cleanSearchBar)

    return <nav className="flex flex-col items-center mt-[1vh] border-b-3">
        { !isOnLandingPage() ? homePageImageLink() : null }
        <div className="flex flex-row justify-start items-center w-8/9 gap-2">
            <div className={`flex flex-row justify-items-start items-center flex-5 ${enlargedModeActive ? 'hidden' : ''}`}>
                <div className="pb-2 pt-2 text-sm">
                    <Link href="/altaMentirologo">
                        Date de alta como mentirólogo
                    </Link>
                </div>
            </div>
            <Form 
                ref={formHTMLRef} onFocus={() => { setEnlargedModeActive(true)}} action="/search" 
                className="flex-4 flex-col relative"
            >
                <div className="flex flex-row items-center">
                    <input
                        onInput={(x: React.ChangeEvent<HTMLInputElement>) => {
                            onUserTypeSearchThrottled(x.target.value, setSearchResultsPreview)
                            setSearchBarUserInputText(x.target.value)
                        }} 
                        type="text" className="text-sm border-2 min-w-0 w-full" name="mentiraQuery" placeholder="Buscar mentira" value={searchBarUserInputText}
                    />
                    <button type="submit" className="w-12 aspect-square relative cursor-pointer">
                        <img src='/pictures/dog_search.webp' className="object-fill w-full h-full" alt="perroLupa"/>
                    </button>
                </div>
                {
                searchResultsPreview != undefined && enlargedModeActive === true && 
                    <div className="flex flex-col gap-0 w-full absolute z-1">
                    { searchResultsPreview.map((x, idx) => {
                        return(
                        <Link href={`/mentira/${x.slug}`} key={idx} className="flex justify-between w-full ring-1 bg-gray-200 py-1 text-xs px-2">
                            <p> <span>&ldquo;</span> {x.mentira} <span>&rdquo;</span></p>
                            <p className="italic"> { x.mentiroso } </p>
                        </Link>
                        )
                    }) }
                </div>
                }
            </Form>
        </div>
    </nav> 
}
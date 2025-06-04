import { notFound } from "next/navigation"
import MentirasSearchFeed from "./MentirasSearchFeed"

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) {
    const mentiraQuery = (await searchParams).mentira as string
    if (!mentiraQuery || mentiraQuery.length < 3) {
        return notFound()
    }
    return <MentirasSearchFeed mentiraQuery={mentiraQuery} />
}
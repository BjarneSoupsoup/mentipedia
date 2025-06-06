import { useEffect, useRef, useState } from "react"
import { throttle } from "throttle-debounce"
import { uniq } from "lodash"

const THROTTLE_INFISCROLL_FETCH_MS = 2000

// The signature that fetching functions should have. They have to integrate with paginated fetching of resources
// (usually via PGSQL LIMIT and OFFSET). The function must take as argument the initial index from where to start fetching data.
// It must also return a boolean stating if more pages should be fetched, or the process has finished.
interface PagedFetcher {
    (page: number): Promise<{
        isLastPage: boolean,
        pageItems: any[]
    }>
}

function hasReachedDocumentBottom() {
    return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
}

export default function useInfiScroll(pageFetchingFun: PagedFetcher, initResults: any[] = []) {
    const [itemsCollection, setItemsCollection] = useState<any[]>(initResults)
    // Start fetching content by default, so the "not found" message does not show
    const [isFetchingNewContent, setIsFetchingNewContent] = useState(true)
    // Need a mutable reference so that it's updated immediately
    const isFetchingRef = useRef(false)
    const keepFetching = useRef(true)
    const page = useRef(0)

    // Infi-scroll handler
    const throttledScrollHandler = throttle(THROTTLE_INFISCROLL_FETCH_MS, () => {
        if (keepFetching.current && !isFetchingRef.current && hasReachedDocumentBottom()) {
            setIsFetchingNewContent(true);
            isFetchingRef.current = true;
            (async () => {
                // Do not re-fetch the results that are already displayed
                await new Promise(r => setTimeout(r, 2000))
                const newPage = await pageFetchingFun(page.current)
                // Just in case, also remove duplicates, in case the new page contains old values.
                setItemsCollection((x) => uniq(x.concat(newPage.pageItems)))
                setIsFetchingNewContent(false)
                isFetchingRef.current = false;
                page.current = page.current + newPage.pageItems.length
                if (newPage.isLastPage) {
                    keepFetching.current = false
                }
            })();
        }
    }, {
        // This debounce mode makes fetching instantaneous, but rejects fetch calls during the specified time intervals
        debounceMode: true, noLeading: false, noTrailing: true
    });

    useEffect(() => {
        // Inject the listener only once the component has been mounted on the browser
        window.addEventListener('scroll', throttledScrollHandler);
    }, [])

    return [itemsCollection, isFetchingNewContent, keepFetching]
}

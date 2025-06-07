import { useEffect, useRef, useState } from "react"
import { throttle } from "throttle-debounce"
import { uniq } from "lodash"

const THROTTLE_INFISCROLL_FETCH_MS = 2000

export interface PageDAO {
    pageItems: any[],
    isLastPage: boolean
}

// The signature that fetching functions should have. They have to integrate with paginated fetching of resources
// (usually via PGSQL LIMIT and OFFSET). The function must take as argument the initial index from where to start fetching data.
// It must also return a boolean stating if more pages should be fetched, or the process has finished.
interface PagedFetcher {
    (page: number): Promise<PageDAO>
}

function hasReachedDocumentBottom() {
    return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
}

export function useInfiScroll(pageFetchingFun: PagedFetcher, initResults: any[] = []) {
    const [itemsCollection, setItemsCollection] = useState<any[]>(initResults)
    // Start fetching content by default, so the "not found" message does not show
    const [isFetchingNewContent, setIsFetchingNewContent] = useState(true)
    // Need a mutable reference so that it's updated immediately
    const isFetchingRef = useRef(false)
    const page = useRef(0)

    const scrollHandler = () => {
        setIsFetchingNewContent(true);
        isFetchingRef.current = true;
        (async () => {
            // Do not re-fetch the results that are already displayed
            const newPage = await pageFetchingFun(page.current)
            // Just in case, also remove duplicates, in case the new page contains old values.
            setItemsCollection((x) => uniq(x.concat(newPage.pageItems)))
            setIsFetchingNewContent(false)
            isFetchingRef.current = false;
            page.current = page.current + newPage.pageItems.length
            // If no more items to render, remove the even listener altogether
            if (newPage.isLastPage) {
                window.removeEventListener('scroll', throttledScrollHandler)
            }
        })();
    }

    // Infi-scroll handler
    const throttledScrollHandler = throttle(THROTTLE_INFISCROLL_FETCH_MS, () => {
        if (!isFetchingRef.current && hasReachedDocumentBottom()) {
            scrollHandler()
        }
    }, {
        // This debounce mode makes fetching instantaneous, but rejects fetch calls during the specified time intervals
        debounceMode: true, noLeading: false, noTrailing: true
    });

    useEffect(() => {
        // Inject the listener only once the component has been mounted on the browser
        window.addEventListener('scroll', throttledScrollHandler);

        return () => {
            window.removeEventListener('scroll', throttledScrollHandler)
        }
    }, [])

    function resetState() {
        // re-attaching event listener twice is safe
        window.addEventListener('scroll', throttledScrollHandler)
        setItemsCollection(initResults)
        page.current = 0
        // For better user interaction, trigger a re-fetch of the initial fetch.
        // Otherwise, the user would have to manually scroll to bottom.
        scrollHandler()
    }

    return { itemsCollection, isFetchingNewContent, resetState }
}

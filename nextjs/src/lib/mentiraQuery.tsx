import { webSearchMentira } from "./db"
import { isEqual } from "lodash"
import { PageDAO } from "./ui/infiScroll";

const LAST_QUERY_RES_CACHE: {
    query: {
        query: string,
        minRank: number
    } | undefined;
    response: PageDAO | undefined;
} = {
    query: undefined,
    response: undefined
};

// Caches the last user input. Good when handling redirects from the search bar to the search page.
export async function cachedSearchMentira(inputSearch: string, minRank = 0) {
    // Shorter queries are ridiculous
    if (inputSearch.length <= 3) {
        return undefined
    }
    // Only cache if the query string and the minRank (offset) were both used previously, in conjunction.
    const inputSearchCacheKey = {
        query: inputSearch,
        minRank: minRank
    }
    if (isEqual(LAST_QUERY_RES_CACHE.query, inputSearchCacheKey) && LAST_QUERY_RES_CACHE.response) {
        return LAST_QUERY_RES_CACHE.response
    }
    const response = await webSearchMentira(inputSearch, minRank)
    LAST_QUERY_RES_CACHE.query = inputSearchCacheKey
    LAST_QUERY_RES_CACHE.response = response
    return response
}

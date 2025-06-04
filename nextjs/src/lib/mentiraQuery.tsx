import { webSearchMentira } from "./dbFetching"

const LAST_QUERY_RES_CACHE: {
    query: string | undefined;
    response: any[] | undefined;
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
    if (LAST_QUERY_RES_CACHE.query === inputSearch && LAST_QUERY_RES_CACHE.response) {
        return LAST_QUERY_RES_CACHE.response
    }
    const response = await webSearchMentira(inputSearch, minRank)
    LAST_QUERY_RES_CACHE.query = inputSearch
    LAST_QUERY_RES_CACHE.response = response
    return response
}

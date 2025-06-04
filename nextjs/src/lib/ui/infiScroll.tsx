export function hasReachedDocumentBottom() {
    return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
}
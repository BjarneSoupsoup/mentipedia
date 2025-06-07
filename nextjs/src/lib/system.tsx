export function isDevMode() {
    if (process.env.DEV_MODE) {
        if (process.env.DEV_MODE === "TRUE")
            return true
    }
    return false
}
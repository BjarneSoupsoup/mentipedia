export function isDevMode() {
    if (process.env.DEV_MODE) {
        if (process.env.DEV_MODE === "TRUE")
            return true
    }
    return false
}

interface LogMessage {
    level: "WARN" | "INFO" | "ERROR",
    unit: string
    msg: object
}

export function log(msg: LogMessage) {
    console.dir({
        timestamp: new Date().toISOString(),
        message: msg
    }, {
        depth: null
    })
}
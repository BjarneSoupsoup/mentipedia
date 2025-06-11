import { registerDelayedTask } from "./db"
import { log } from "./system"

// Simple task queue based on cron. Necessary for persistent tasks (tasks should execute even if the deadline was reached while the server was down).

function enqueueTask(registerTime: Date, deadline: Date, endpoint: string) {
    (async () => {
        const registeredTaskId = registerDelayedTask(endpoint, deadline, registerTime)
        if (registeredTaskId === null || registeredTaskId === undefined) {
            log({level: "ERROR", unit: "QueueTaskExecutor", msg: { errCode: "ERR_REGISTERING_TASK" } })
        }
    })()
}
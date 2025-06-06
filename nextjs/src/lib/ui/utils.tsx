export function formatDateLong(dateStr: string): string {
    const date = new Date(dateStr)
    return `${date.getDate()} de ${date.toLocaleString('es-ES', { month: "long" })} de ${date.getFullYear()}`
}

export function formatDateddmmYY(dateStr: string) {
    const date = new Date(dateStr)
    return date.getDate().toString() + " / " + date.getMonth().toString() + " / " + date.getFullYear().toString()
}

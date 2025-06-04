export function formatDateLong(date_str: string): string {
    const date = new Date(date_str)
    return `${date.getDate()} de ${date.toLocaleString('es-ES', { month: "long" })} de ${date.getFullYear()}`
}

export function formatDateddmmYY(date: Date) {
    return date.getDate().toString() + " / " + date.getMonth().toString() + " / " + date.getFullYear().toString()
}

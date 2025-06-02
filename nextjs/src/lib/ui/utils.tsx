export function formatDateLong(date_str: string): string {
    const date = new Date(date_str)
    return `${date.getDate()} de ${date.toLocaleString('es-ES', { month: "long" })} de ${date.getFullYear()}`
}
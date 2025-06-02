import { default as NextLink } from "next/link"
import { PropsWithChildren } from "react"

export const BLUE_HYPERLINK_STYLE = "underline text-blue-700"

export function Link({ href, children, className }: PropsWithChildren<{href: string, className? }>) {
    return <NextLink className={className + " " + BLUE_HYPERLINK_STYLE} href={href}>{children}</NextLink>
}
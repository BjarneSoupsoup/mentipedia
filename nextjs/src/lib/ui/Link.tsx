import { default as NextLink } from "next/link"
import { PropsWithChildren } from "react"

export const BLUE_HYPERLINK_STYLE = "underline text-blue-700"

export async function Link({ href, children }: PropsWithChildren<{href: string}>) {
    return <NextLink className={BLUE_HYPERLINK_STYLE} href={href}>{children}</NextLink>
}
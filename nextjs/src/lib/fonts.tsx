import { existsSync } from "fs"
import { Vollkorn_SC } from "next/font/google"
import { Limelight } from "next/font/google"
import localFont from "next/font/local"

const Vollkorn_SC_loader = Vollkorn_SC({
    subsets: ["latin"],
    weight: "400"
})

const Limelight_loader = Limelight({
    subsets: ["latin"],
    weight: "400"
})

export const Limelight_class = Limelight_loader.className
export const Vollkorn_SC_class = Vollkorn_SC_loader.className

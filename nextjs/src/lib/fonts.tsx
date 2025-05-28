import { Courier_Prime, Vollkorn_SC } from "next/font/google"
import { Limelight } from "next/font/google"

const Vollkorn_SC_loader = Vollkorn_SC({
    subsets: ["latin"],
    weight: "400"
})

const Limelight_loader = Limelight({
    subsets: ["latin"],
    weight: "400"
})

const CourierPrime_loader = Courier_Prime({
    subsets: ["latin"],
    weight: "400"
})

export const CourierPrime_class = CourierPrime_loader.className
export const Limelight_class = Limelight_loader.className
export const Vollkorn_SC_class = Vollkorn_SC_loader.className

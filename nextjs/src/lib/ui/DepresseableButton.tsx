import { PropsWithChildren } from "react";

export default function DepresseableButton({ children, submit = false, ...rest }: PropsWithChildren<{ submit?: boolean, [key: string]: any }>) {
    return(
        <button
            className="
                border-1 bg-gray-200 px-3 text-center
                active:shadow-inner active:shadow-gray-400 active:translate-y-0.5 active:translate-x-0.5
            "
            type= { submit ? "submit" : "button" }
            { ...rest }
        >
            { children }
        </button>
    )
}
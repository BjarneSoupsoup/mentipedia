import Link from "next/link";

export default function Navbar() {
    return <div className="h-5 bg-amber-400 flex flex-row justify-start items-center">
        <Link className="pl-10" href="/altaMentirologo">Date de alta como mentirólogo</Link>
    </div>
}
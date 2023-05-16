import Head from "next/head";
import { LinkButton } from "../components/LinkButton";
import { TextLogo } from "../components/Logos";

function HomePage() {
    return (
        <>
            <Head>
                <title>GarbGarb</title>
            </Head>
            <main className="flex-1">
                <div className="flex h-full flex-col items-center justify-center gap-6 px-2 pb-8">
                    <div className="w-[min(95%,500px)]">
                        <TextLogo />
                    </div>
                    <LinkButton
                        minWidth={120}
                        className="border border-slate-500 bg-black text-xl shadow-sm shadow-slate-500 transition-none hover:animate-hop hover:bg-slate-200 hover:text-black sm:text-2xl"
                        href="/products"
                    >
                        Shop
                    </LinkButton>
                </div>
            </main>
        </>
    );
}

export default HomePage;

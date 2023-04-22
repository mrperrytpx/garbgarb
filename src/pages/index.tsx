import { LinkButton } from "../components/LinkButton";
import { TextLogo } from "../components/Logos";

function HomePage() {
    return (
        <main className="flex-1">
            <div className="flex h-full flex-col items-center justify-center gap-6 pb-8">
                <div className="w-[min(95%,500px)]">
                    <TextLogo />
                </div>
                <LinkButton
                    minWidth={120}
                    className="text-xl shadow-md shadow-slate-500 transition-none hover:animate-hop hover:bg-slate-200 hover:text-black sm:text-2xl"
                    href="/products"
                >
                    Shop
                </LinkButton>
            </div>
        </main>
    );
}

export default HomePage;

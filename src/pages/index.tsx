import { LinkButton } from "../components/LinkButton";

function HomePage() {
    return (
        <main className="flex-1">
            <div className="flex h-full flex-col items-center justify-center gap-6 pb-8">
                <h1 className="bg-gradient-to-r from-slate-300 to-white bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
                    GarbGarb™
                </h1>
                <LinkButton
                    minWidth={120}
                    className="text-xl shadow-md shadow-slate-500 sm:text-2xl"
                    href="/products"
                >
                    Shop
                </LinkButton>
            </div>
        </main>
    );
}

export default HomePage;

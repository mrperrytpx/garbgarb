import { LinkButton } from "../components/LinkButton";

function HomePage() {
  return (
    <main className="flex-1">
      <div className="flex h-full flex-col items-center justify-center gap-6 pb-8">
        <h1 className="bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-4xl font-extrabold text-transparent">
          GarbGarb™
        </h1>
        <LinkButton
          className="rounded-lg border py-2 px-4 text-2xl font-medium uppercase shadow-lg transition-all hover:bg-slate-200"
          href="/products"
        >
          Shop
        </LinkButton>
      </div>
    </main>
  );
}

export default HomePage;

import Link from "next/link";

function HomePage() {
  return (
    <main className="h-[calc(max(600px,100vh)-60px)] w-full">
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-gray-500 pb-8">
        <h1 className="text-4xl">GarbGarb™</h1>
        <Link className="text-3xl text-white" href="/products">
          Shop
        </Link>
      </div>
    </main>
  );
}

export default HomePage;

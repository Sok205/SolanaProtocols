import Link from "next/link";
import { protocols } from "@/protocols";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Learn Solana Protocol Economics
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Interactive learning platform for understanding DeFi protocol
            mechanics on Solana. See the math, try it live on devnet.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Protocols</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => (
            <Link
              key={protocol.id}
              href={`/protocols/${protocol.id}`}
              className="group bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
            >
              <div className="text-4xl mb-4">{protocol.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                {protocol.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{protocol.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  protocol.difficulty === "beginner"
                    ? "bg-green-900/50 text-green-400"
                    : protocol.difficulty === "intermediate"
                    ? "bg-yellow-900/50 text-yellow-400"
                    : "bg-red-900/50 text-red-400"
                }`}>
                  {protocol.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {protocol.concepts.slice(0, 3).map((concept) => (
                  <span
                    key={concept}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                  >
                    {concept}
                  </span>
                ))}
                {protocol.concepts.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{protocol.concepts.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {protocols.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No protocols available yet.
          </div>
        )}
      </main>
    </div>
  );
}

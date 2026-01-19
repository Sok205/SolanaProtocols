import Link from "next/link";
import { protocols } from "@/protocols";
import { Navbar } from "@/components/layout/Navbar";

const ASCII_LOGO = `
███████╗ ██████╗ ██╗      █████╗ ███╗   ██╗ █████╗
██╔════╝██╔═══██╗██║     ██╔══██╗████╗  ██║██╔══██╗
███████╗██║   ██║██║     ███████║██╔██╗ ██║███████║
╚════██║██║   ██║██║     ██╔══██║██║╚██╗██║██╔══██║
███████║╚██████╔╝███████╗██║  ██║██║ ╚████║██║  ██║
╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
`;

function DifficultyBar({ level }: { level: string }) {
  const bars = {
    beginner: "[■□□]",
    intermediate: "[■■□]",
    advanced: "[■■■]",
  };
  return <span className="text-terminal">{bars[level as keyof typeof bars] || "[...]"}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-terminal">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Boot Screen Header */}
        <div className="border border-terminal mb-8">
          <div className="p-4 text-center">
            <pre className="text-terminal glow-strong text-xs sm:text-sm leading-tight inline-block text-left">
              {ASCII_LOGO}
            </pre>
            <div className="mt-4 text-terminal-muted">
              PROTOCOL ECONOMICS TERMINAL v1.0.0
            </div>
            <div className="text-terminal glow mt-1">
              Learn DeFi mechanics on Solana devnet
              <span className="animate-blink">_</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mb-6 text-sm">
          <span className="text-terminal-muted">system status: </span>
          <span className="text-terminal glow">[OK]</span>
          <span className="text-terminal-muted ml-4">network: </span>
          <span className="text-terminal-amber glow-amber">devnet</span>
          <span className="text-terminal-muted ml-4">protocols loaded: </span>
          <span className="text-terminal">{protocols.length}</span>
        </div>

        {/* Protocols Section */}
        <div className="border border-terminal">
          <div className="border-b border-terminal px-4 py-2">
            <span className="text-terminal uppercase text-sm glow">
              +--- AVAILABLE PROTOCOLS ---+
            </span>
          </div>

          <div className="p-4">
            <div className="text-terminal-muted mb-4">
              &gt; ls -la ./protocols
            </div>

            {/* Protocol List */}
            <div className="space-y-4">
              {protocols.map((protocol, index) => (
                <Link
                  key={protocol.id}
                  href={`/protocols/${protocol.id}`}
                  className="block group hover:no-underline"
                >
                  <div className="flex items-start gap-4 py-2 px-2 hover:bg-[#33ff00] hover:bg-opacity-10 transition-colors">
                    <span className="text-terminal-muted">
                      [{String(index + 1).padStart(2, "0")}]
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-terminal glow uppercase font-bold">
                          {protocol.name}
                        </span>
                        <span className="text-terminal-muted text-sm">
                          ─────────────────────
                        </span>
                        <span className="text-terminal-muted text-sm">DIFFICULTY:</span>
                        <DifficultyBar level={protocol.difficulty} />
                      </div>
                      <div className="text-terminal-muted text-sm mt-1 pl-0">
                        {protocol.description}
                      </div>
                      <div className="text-terminal-muted text-xs mt-2">
                        tags: {protocol.concepts.slice(0, 3).join(", ")}
                        {protocol.concepts.length > 3 && ` +${protocol.concepts.length - 3} more`}
                      </div>
                    </div>
                    <span className="text-terminal group-hover:glow">
                      [OK]
                    </span>
                  </div>
                </Link>
              ))}

              {protocols.length === 0 && (
                <div className="text-terminal-muted py-4 text-center">
                  [...]  No protocols found
                </div>
              )}

              {/* Coming Soon placeholder */}
              <div className="flex items-start gap-4 py-2 px-2 opacity-50">
                <span className="text-terminal-muted">
                  [{String(protocols.length + 1).padStart(2, "0")}]
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="text-terminal-muted uppercase">
                      COMING SOON
                    </span>
                    <span className="text-terminal-muted text-sm">
                      ─────────────────────
                    </span>
                    <span className="text-terminal-muted text-sm">DIFFICULTY:</span>
                    <span className="text-terminal-muted">[...]</span>
                  </div>
                  <div className="text-terminal-muted text-sm mt-1">
                    More protocols in development...
                  </div>
                </div>
                <span className="text-terminal-muted">[...]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer prompt */}
        <div className="mt-8 text-terminal-muted text-sm">
          <span>&gt; Select a protocol to begin learning</span>
          <span className="animate-blink">_</span>
        </div>
      </main>
    </div>
  );
}

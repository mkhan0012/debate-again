import DebateCard from "@/components/DebateCard";

export default function HistoryPage() {
  const historyData = [
    {
      topic: "Artificial Intelligence Regulation",
      position: "For" as const,
      date: "2023-10-12",
      outcome: "Consensus reached on safety protocols, divergence on open source restrictions."
    },
    {
      topic: "Remote Work vs Office Culture",
      position: "Against" as const,
      date: "2023-09-28",
      outcome: "Acknowledged productivity gains but conceded on loss of serendipitous collaboration."
    },
    {
      topic: "Nuclear Energy Expansion",
      position: "For" as const,
      date: "2023-09-15",
      outcome: "Successfully argued that waste management risks are lower than fossil fuel impact."
    },
    {
      topic: "Social Media Algorithmic Transparency",
      position: "For" as const,
      date: "2023-08-30",
      outcome: "Opponent conceded that current black-box models pose a systemic risk to democracy."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Debate History</h1>
        <p className="text-zinc-500">A record of your past arguments and their outcomes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {historyData.map((debate, index) => (
          <DebateCard 
            key={index}
            topic={debate.topic}
            position={debate.position}
            date={debate.date}
            outcome={debate.outcome}
          />
        ))}
      </div>
    </div>
  );
}
import { RoadmapList } from "@/components/RoadmapList";

export default function RoadmapPage() {
  return (
    <main className="px-6 pt-10">
      <p className="text-xs uppercase tracking-wide text-rose">Roadmap</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-plum-dark">
        Timeline Persiapan
      </h1>
      <RoadmapList />
    </main>
  );
}

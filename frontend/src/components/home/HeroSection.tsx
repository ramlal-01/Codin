// src/components/home/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="flex-1">
      <h1 className="text-3xl md:text-4xl font-bold">
        Code together in real time.
      </h1>
      <p className="mt-3 text-slate-300 text-sm md:text-base">
        Collaborative code editor with live chat for peer learning.
        Create a room, share the link, and solve problems together.
      </p>

      <div className="mt-6 space-y-2 text-sm text-slate-300">
        <p>Perfect for:</p>
        <ul className="list-disc list-inside space-y-1-1">
          <li>Pair programming and mock interviews</li>
          <li>Group problem-solving sessions</li>
          <li>Peer learning with friends or classmates</li>
        </ul>
      </div>
    </section>
  );
}
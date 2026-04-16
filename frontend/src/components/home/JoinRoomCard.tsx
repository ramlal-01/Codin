// src/components/home/JoinRoomCard.tsx
type JoinRoomCardProps = {
  roomId: string;
  username: string;
  setRoomId: (value: string) => void;
  setUsername: (value: string) => void;
  onJoin: (e: React.FormEvent) => void;
};

export function JoinRoomCard({
  roomId,
  username,
  setRoomId,
  setUsername,
  onJoin,
}: JoinRoomCardProps) {
  return (
    <section className="flex-1">
      <div className="bg-slate-900 rounded-lg shadow-xl p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Start a session
        </h2>
        <form onSubmit={onJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Room ID (or create one)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Join room
          </button>
        </form>
      </div>
    </section>
  );
}
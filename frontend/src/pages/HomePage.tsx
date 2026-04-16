// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import CollaborativeRoom from "../components/CollaborativeRoom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/home/HeroSection";
import { JoinRoomCard } from "../components/home/JoinRoomCard";

export function HomePage() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && username) {
      setJoined(true);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) setRoomId(room);
  }, []);

  if (joined) {
    return <CollaborativeRoom roomId={roomId} username={username} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-10 md:flex-row md:items-center">
        <HeroSection />
        <JoinRoomCard
          roomId={roomId}
          username={username}
          setRoomId={setRoomId}
          setUsername={setUsername}
          onJoin={handleJoin}
        />
      </main>

      <Footer />
    </div>
  );
}
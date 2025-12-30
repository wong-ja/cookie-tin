"use client";
import { useState, useEffect, useMemo } from "react";
import { TinSession } from "@/lib/types";
import Dashboard from "@/components/Dashboard";
import { Trash2 } from "lucide-react";

export default function CookieTinApp() {
  const [sessions, setSessions] = useState<TinSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isHasMounted, setIsHasMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cookie-tin-v1");
    if (saved) {
      try {
        const parsed: TinSession[] = JSON.parse(saved);
        setSessions(parsed);
        const active = parsed.find((s) => !s.isClosed);
        if (active) setActiveId(active.id);
      } catch (e) {
        console.error("Data error", e);
      }
    }
    setIsHasMounted(() => true);
  }, []);

  const saveAndSync = (updated: TinSession[]) => {
    setSessions(updated);
    localStorage.setItem("cookie-tin-v1", JSON.stringify(updated));
  };

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeId), 
    [sessions, activeId]
  );

  if (!isHasMounted) return <div className="min-h-screen bg-[#FFF9F0]" />;

  if (!activeSession) {
    return (
      <main className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center p-6 text-[#3D2B1F]">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-rose-50 w-full max-w-md text-center">
          <h1 className="text-5xl mb-2">🍪</h1>
          <h2 className="text-3xl font-black text-rose-600 mb-6 tracking-tight">Cookie Tin</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const name = d.get("name") as string;
            const newSession: TinSession = {
              id: `${name.toLowerCase()}-${Date.now()}`,
              holidayName: name,
              year: new Date().getFullYear(),
              budget: Number(d.get("budget")),
              calorieLimit: Number(d.get("calories")),
              items: [],
              isClosed: false
            };
            const updatedSessions = [...sessions, newSession];
            saveAndSync(updatedSessions);
            setActiveId(newSession.id);
          }} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Holiday Name</label>
              <input name="name" placeholder="e.g. Christmas 2025" required className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-rose-400 bg-orange-50/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Budget ($)</label>
                <input name="budget" type="number" placeholder="100" required className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-rose-400 bg-orange-50/20" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Calories</label>
                <input name="calories" type="number" placeholder="2000" required className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-rose-400 bg-orange-50/20" />
              </div>
            </div>
            <button className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest text-sm">Open the Tin ✨</button>
          </form>

          {sessions.length > 0 && (
            <div className="mt-10 pt-6 border-t-2 border-dashed border-orange-50">
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Past Sessions</p>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div key={s.id} className="flex gap-2 group">
                    <button 
                      onClick={() => setActiveId(s.id)} 
                      className="flex-1 flex justify-between p-3 bg-orange-50/50 rounded-xl text-sm font-bold text-gray-600 hover:bg-orange-100 transition"
                    >
                      <span>{s.holidayName} {s.year}</span>
                      <span>{s.isClosed ? '🔒' : '🔓'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("Delete this entire session?")) {
                          const updated = sessions.filter(sess => sess.id !== s.id);
                          saveAndSync(updated);
                        }
                      }}
                      className="p-3 text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <Dashboard 
      session={activeSession} 
      onUpdate={(updated) => saveAndSync(sessions.map(s => s.id === updated.id ? updated : s))}
      onBack={() => setActiveId(null)}
    />
  );
}
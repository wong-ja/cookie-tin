"use client";
import { useState, useEffect, useMemo } from "react";
import { TinSession } from "@/lib/types";
import Dashboard from "@/components/Dashboard";
import { Trash2, Cookie, Gift, Sparkles } from "lucide-react";

const getNextDate = (month: number, day: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  let date = new Date(year, month - 1, day);
  if (date < now) date = new Date(year + 1, month - 1, day);
  return date.toISOString().split('T')[0];
};

const HOLIDAY_REGISTRY = [
  { name: "New Year's Day", date: getNextDate(1, 1) },
  { name: "Lunar New Year", date: "2026-02-17" }, 
  { name: "Valentine's Day", date: getNextDate(2, 14) },
  { name: "Eid al-Fitr", date: "2026-03-20" },
  { name: "Easter", date: "2026-04-05" },
  { name: "Independence Day", date: getNextDate(7, 4) },
  { name: "Halloween", date: getNextDate(10, 31) },
  { name: "Diwali", date: "2026-11-08" },
  { name: "Thanksgiving", date: "2026-11-26" },
  { name: "Hanukkah", date: "2026-12-04" },
  { name: "Christmas", date: getNextDate(12, 25) },
  { name: "Kwanzaa", date: getNextDate(12, 26) },
  { name: "Other Celebration", date: new Date().toISOString().split('T')[0] }
];

export default function CookieTinApp() {
  const [sessions, setSessions] = useState<TinSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isHasMounted, setIsHasMounted] = useState(false);

  const sortedHolidays = useMemo(() => {
    return [...HOLIDAY_REGISTRY].sort((a, b) => {
      if (a.name === "Other Celebration") return 1;
      if (b.name === "Other Celebration") return -1;
      return a.date.localeCompare(b.date);
    });
  }, []);

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
    setIsHasMounted(true);
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
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-orange-50 w-full max-w-md text-center">
          <div className="inline-block p-4 bg-orange-100 rounded-full text-orange-600 mb-4">
            <Cookie size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black italic text-gray-900 mb-8 uppercase tracking-tight">New Session</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const holidayName = d.get("holiday") as string;
            const tinName = d.get("tinName") as string;
            const selected = HOLIDAY_REGISTRY.find(h => h.name === holidayName);

            const nowTimestamp = Date.now();

            const newSession: TinSession = {
              id: `tin-${nowTimestamp}`,
              holidayName: holidayName,
              customName: tinName.trim() || undefined,
              date: selected?.date || new Date().toISOString().split('T')[0],
              currency: "$",
              budget: Number(d.get("budget")),
              calorieLimit: Number(d.get("calories")),
              items: [],
              timestamp: nowTimestamp,
              isClosed: false
            };

            const updatedSessions = [newSession, ...sessions];
            saveAndSync(updatedSessions);
            setActiveId(newSession.id);
          }} className="space-y-5 text-left">
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-3 tracking-widest">Holiday *</label>
              <div className="relative">
                <select name="holiday" required className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-none focus:border-rose-400 bg-orange-50/20 font-bold appearance-none">
                  <option value="" disabled selected>What are you celebrating?</option>
                  {sortedHolidays.map(h => (
                    <option key={h.name} value={h.name}>
                        {h.name} ({new Date(h.date).getFullYear()})
                    </option>
                  ))}
                </select>
                <Gift className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-3 tracking-widest">Cookie-Tin Name (Optional)</label>
              <input name="tinName" placeholder="e.g. Candy Shopping Spree" className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-none focus:border-rose-400 bg-orange-50/20 font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-3 tracking-widest">Budget Amount</label>
                <input name="budget" type="number" defaultValue="100" required className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-none focus:border-rose-400 bg-orange-50/20 font-mono font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-3 tracking-widest">Calorie Limit</label>
                <input name="calories" type="number" defaultValue="2000" required className="w-full p-4 rounded-2xl border-2 border-orange-50 outline-none focus:border-rose-400 bg-orange-50/20 font-mono font-bold" />
              </div>
            </div>

            <button type="submit" className="w-full bg-rose-500 text-white font-black py-5 rounded-4xl shadow-xl hover:bg-rose-600 transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
              Open the Tin <Sparkles size={18} />
            </button>
          </form>

          {sessions.length > 0 && (
            <div className="mt-10 pt-8 border-t-2 border-dashed border-orange-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Saved Tins</p>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {sessions.map((s) => (
                  <div key={s.id} className="flex gap-2">
                    <button 
                      onClick={() => setActiveId(s.id)} 
                      className="flex-1 flex flex-col items-start p-4 bg-orange-50/50 rounded-2xl text-sm hover:bg-orange-100 transition border border-transparent hover:border-orange-200"
                    >
                      <span className="font-black text-gray-700 leading-none">{s.customName || s.holidayName}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">{s.date}</span>
                    </button>
                    <button 
                      onClick={() => {
                        saveAndSync(sessions.filter(sess => sess.id !== s.id));
                      }}
                      className="p-4 text-gray-400 hover:text-rose-500 transition-colors"
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
"use client";
import { useState } from "react";
import { TinSession, Expense } from "@/lib/types";
import { ChevronLeft, Plus, Archive, Camera } from "lucide-react";
import Scanner from "./Scanner";

export default function Dashboard({ session, onUpdate, onBack }: { 
    session: TinSession, 
    onUpdate: (s: TinSession) => void, 
    onBack: () => void 
}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    const total = session.items.reduce((sum, i) => sum + i.amount, 0);
    const ratio = total / session.budget;
    
    const vibe = ratio >= 1 
        ? { color: "bg-rose-600", text: "CODE RED! 🚨", sub: "Tin is full!" }
        : ratio >= 0.8 
        ? { color: "bg-amber-500", text: "TRICKY... ⚠️", sub: "Watch the crumbs!" }
        : { color: "bg-emerald-500", text: "IN THE CLEAR ✨", sub: "Sweet savings!" };

    const addItem = (e?: React.FormEvent, manualName?: string, manualAmount?: number) => {
        e?.preventDefault();
        const finalName = manualName || name;
        const finalAmount = manualAmount || parseFloat(amount);
        if (!finalName || isNaN(finalAmount)) return;

        const newItem: Expense = { id: Date.now().toString(), name: finalName, amount: finalAmount, timestamp: Date.now() };
        onUpdate({ ...session, items: [newItem, ...session.items] });
        setName(""); setAmount("");
    };

    const handleScan = async (barcode: string) => {
        setIsScanning(false);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1) {
                const pName = data.product.product_name;
                const pPrice = prompt(`Found ${pName}! How much was it?`, "0");
                if (pPrice) addItem(undefined, pName, parseFloat(pPrice));
            } else { alert("Item not found"); }
        } catch (err) { 
            alert("Scanner error"); 
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F0] pb-24">
            <div className={`${vibe.color} text-white p-8 pt-12 rounded-b-[3.5rem] shadow-2xl transition-colors duration-700`}>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="bg-white/20 p-2 rounded-full"><ChevronLeft /></button>
                    <span className="font-black uppercase tracking-widest text-xs">{session.holidayName} {session.year}</span>
                    <button onClick={() => onUpdate({...session, isClosed: true})} className="bg-white/20 p-2 rounded-full"><Archive size={18}/></button>
                </div>
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-1 italic tracking-tight">{vibe.text}</h1>
                    <p className="opacity-90 font-medium text-sm mb-6">{vibe.sub}</p>
                    <div className="max-w-xs mx-auto h-3 bg-black/10 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-white h-full transition-all duration-1000" style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
                    </div>
                    <div className="mt-4 font-mono text-2xl font-bold">${total.toFixed(2)} / ${session.budget}</div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">
                {!session.isClosed && (
                    <form onSubmit={addItem} className="bg-white p-4 rounded-3xl shadow-sm flex gap-2 border-2 border-orange-50">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item..." className="flex-1 bg-gray-50 p-3 rounded-2xl outline-none focus:bg-white transition" />
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="$" className="w-20 bg-gray-50 p-3 rounded-2xl outline-none" />
                        <button type="submit" className="bg-rose-500 text-white p-3 rounded-2xl shadow-md"><Plus /></button>
                    </form>
                )}

                <div className="space-y-3">
                    {session.items.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-b-2 border-orange-100">
                        <span className="font-bold text-gray-700">{item.name}</span>
                        <span className="font-mono font-black text-rose-500">-${item.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={() => setIsScanning(true)} className="fixed bottom-8 right-8 bg-orange-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
                <Camera size={28} />
            </button>

            {isScanning && <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
        </div>
    );
}
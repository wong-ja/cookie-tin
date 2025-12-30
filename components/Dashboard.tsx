"use client";
import { useState, useMemo } from "react";
import { TinSession, Expense } from "@/lib/types";
import { ChevronLeft, Plus, Camera, Settings, Trash2, Search, X } from "lucide-react";
import Scanner from "./Scanner";

export default function Dashboard({ session, onUpdate, onBack }: { 
    session: TinSession, 
    onUpdate: (s: TinSession) => void, 
    onBack: () => void 
}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [manualCals, setManualCals] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const filteredItems = useMemo(() => {
        return session.items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [session.items, searchTerm]);

    const totalSpent = session.items.reduce((sum, i) => sum + i.amount, 0);
    const totalCals = session.items.reduce((sum, i) => sum + (i.calories || 0), 0);
    const spendRatio = totalSpent / session.budget;
    const calRatio = totalCals / session.calorieLimit;

    const addItem = (e?: React.FormEvent, manualName?: string, manualAmount?: number, cals?: number) => {
        e?.preventDefault();
        const finalName = manualName || name;
        const finalAmount = manualAmount || parseFloat(amount);
        const finalCals = cals || (manualCals ? parseInt(manualCals) : undefined);
        if (!finalName || isNaN(finalAmount)) return;

        const newItem: Expense = { 
            id: Date.now().toString(), 
            name: finalName, 
            amount: finalAmount, 
            calories: finalCals,
            timestamp: Date.now() 
        };
        onUpdate({ ...session, items: [newItem, ...session.items] });
        setName(""); setAmount(""); setManualCals("");
    };

    const handleScan = async (barcode: string) => {
        setIsScanning(false);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1) {
                const pName = data.product.product_name;
                const pCals = Math.round(data.product.nutriments['energy-kcal_100g'] || 0);
                const pPrice = prompt(`🍪 Found: ${pName}\nCalories: ${pCals} kcal\nHow much was it?`, "0");
                if (pPrice) addItem(undefined, pName, parseFloat(pPrice), pCals);
            } else { alert("Not in database! Use manual entry."); }
        } catch (err) { 
            alert("Scanner error"); 
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F0] pb-24 font-sans text-[#3D2B1F]">
            <div className={`p-8 pt-12 rounded-b-[3.5rem] shadow-2xl bg-white border-b-8 transition-colors ${spendRatio > 1 || calRatio > 1 ? 'border-rose-500' : 'border-emerald-500'}`}>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="bg-orange-50 p-2 rounded-full"><ChevronLeft size={20}/></button>
                    <span className="font-black uppercase tracking-widest text-[10px] opacity-40">{session.holidayName}</span>
                    <button onClick={() => setIsSettingsOpen(true)} className="bg-orange-50 p-2 rounded-full"><Settings size={18}/></button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Total Spent</p>
                        <div className="text-2xl font-black">${totalSpent.toFixed(0)}</div>
                        <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="bg-rose-500 h-full transition-all" style={{ width: `${Math.min(spendRatio * 100, 100)}%` }} /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Calories</p>
                        <div className="text-2xl font-black">{totalCals}</div>
                        <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(calRatio * 100, 100)}%` }} /></div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">
                <form onSubmit={addItem} className="bg-white p-5 rounded-[2.5rem] shadow-sm space-y-3 border-2 border-orange-50">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name..." className="w-full bg-gray-50 p-4 rounded-2xl text-sm outline-none" />
                    <div className="flex gap-2">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="$ Price" className="w-1/2 bg-gray-50 p-4 rounded-2xl text-sm outline-none" />
                        <input type="number" value={manualCals} onChange={e => setManualCals(e.target.value)} placeholder="kcal" className="w-1/2 bg-gray-50 p-4 rounded-2xl text-sm outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"><Plus size={18} /> Add to Tin</button>
                </form>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search your items..." className="w-full bg-white pl-12 pr-4 py-3 rounded-full text-sm border-2 border-orange-50 outline-none" />
                </div>

                <div className="space-y-3">
                    {filteredItems.map(item => (
                        <div key={item.id} className={`bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-l-4 ${item.calories ? 'border-l-emerald-400' : 'border-l-rose-400'}`}>
                            <div><p className="font-bold">{item.name}</p>{item.calories && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{item.calories} kcal</p>}</div>
                            <div className="flex items-center gap-4"><span className="font-mono font-black text-rose-500">${item.amount}</span><button onClick={() => onUpdate({ ...session, items: session.items.filter(i => i.id !== item.id) })} className="text-gray-200 hover:text-rose-500"><Trash2 size={16} /></button></div>
                        </div>
                    ))}
                </div>
            </div>

            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[3rem] w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black italic">Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)}><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Budget ($)</label><input type="number" value={session.budget} onChange={e => onUpdate({...session, budget: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl mt-1" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Calorie Goal</label><input type="number" value={session.calorieLimit} onChange={e => onUpdate({...session, calorieLimit: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl mt-1" /></div>
                        </div>
                        <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-8 bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase text-xs">Update Tin</button>
                    </div>
                </div>
            )}

            <button onClick={() => setIsScanning(true)} className="fixed bottom-8 right-8 bg-orange-500 text-white p-5 rounded-full shadow-2xl z-40 active:scale-90 transition-transform"><Camera size={28} /></button>
            {isScanning && <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
        </div>
    );
}
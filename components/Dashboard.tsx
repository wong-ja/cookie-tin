"use client";
import { useState, useMemo, useEffect } from "react";
import { TinSession, Expense } from "@/lib/types";
import { 
    ChevronLeft, Plus, Camera, Settings, Trash2, 
    Search, X, Share2, Sparkles, Calendar, Ghost, 
    Cookie as CookieIcon, AlertTriangle
} from "lucide-react";
import confetti from 'canvas-confetti';
import Scanner from "./Scanner";

const CURRENCIES = [
    { symbol: "$", name: "USD/CAD/AUD" },
    { symbol: "£", name: "GBP" },
    { symbol: "€", name: "EUR" },
    { symbol: "¥", name: "JPY/CNY" },
    { symbol: "₹", name: "INR" },
    { symbol: "₩", name: "KRW" },
    { symbol: "฿", name: "THB" },
    { symbol: "Rp", name: "IDR" },
    { symbol: "R$", name: "BRL" }
];

export default function Dashboard({ session, onUpdate, onBack }: { 
    session: TinSession, 
    onUpdate: (s: TinSession) => void, 
    onBack: () => void 
}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [manualCals, setManualCals] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSaying, setCurrentSaying] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    
    const [showPuzzle, setShowPuzzle] = useState<{item: Expense} | null>(null);
    const [puzzleAnswer, setPuzzleAnswer] = useState("");
    const [puzzleChallenge, setPuzzleChallenge] = useState({ q: "", a: 0 });

    const totalSpent = session.items.reduce((sum, i) => sum + i.amount, 0);
    const totalCals = session.items.reduce((sum, i) => sum + (i.calories || 0), 0);
    const remainingBudget = session.budget - totalSpent;
    const spendRatio = totalSpent / session.budget;
    const calRatio = totalCals / session.calorieLimit;

    const countdown = useMemo(() => {
        const target = new Date(session.date).getTime();
        const now = new Date().getTime();
        const diff = target - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today!";
        if (days < 0) return `${Math.abs(days)} days ago`;
        return `${days} days to go!`;
    }, [session.date]);

    const filteredItems = useMemo(() => {
        return session.items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [session.items, searchTerm]);

    // pattern: [Duration On, Duration Off, Duration On]
    const triggerHaptic = (type: 'success' | 'warning') => {
        if (typeof window !== 'undefined' && window.navigator.vibrate) {
            if (type === 'success') {
                window.navigator.vibrate(50);
            } else {
                window.navigator.vibrate([100, 50, 100]);
            }
        }
    };

    const handleShare = async () => {
        const text = `🍪 Tin Update: ${session.holidayName}\n💰 Spent: ${session.currency}${totalSpent}\n🔥 Calories: ${totalCals}kcal\nRemaining: ${session.currency}${remainingBudget.toFixed(2)}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'My Cookie Tin', text }); } catch (e) { console.log(e); }
        } else {
            alert("Summary copied to clipboard!");
            navigator.clipboard.writeText(text);
        }
    };

    const triggerCelebration = () => {
        if (showCelebration) return;
        const randomSaying = CELEBRATION_SAYINGS[Math.floor(Math.random() * CELEBRATION_SAYINGS.length)];
        setCurrentSaying(randomSaying);
        setShowCelebration(true);
        triggerHaptic('success');
        setTimeout(() => setShowCelebration(false), 2000);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showCelebration) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 201 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);
        }

        return () => clearInterval(interval);
    }, [showCelebration]);

    const generatePuzzle = () => {
        const n1 = Math.floor(Math.random() * 10) + 2;
        const n2 = Math.floor(Math.random() * 10) + 2;
        setPuzzleChallenge({ q: `${n1} + ${n2}`, a: n1 + n2 });
        setPuzzleAnswer("");
    };

    const addItem = (e?: React.FormEvent, manualName?: string, manualAmount?: number, cals?: number) => {
        e?.preventDefault();
        const finalName = manualName || name;
        const finalAmount = manualAmount || parseFloat(amount);
        const finalCals = cals || (manualCals ? parseInt(manualCals) : undefined);
        
        if (!finalName || isNaN(finalAmount)) return;

        const currentTime = Date.now(); 
        const uniqueId = currentTime.toString();

        const pendingItem: Expense = { 
            id: uniqueId, 
            name: finalName, 
            amount: finalAmount, 
            calories: finalCals,
            timestamp: currentTime 
        };

        if (totalSpent + finalAmount > session.budget) {
            triggerHaptic('warning');
            generatePuzzle();
            setShowPuzzle({ item: pendingItem });
            return;
        }
        executeAdd(pendingItem);
    };

    const executeAdd = (item: Expense) => {
        onUpdate({ ...session, items: [item, ...session.items] });
        triggerHaptic('success');
        setName(""); setAmount(""); setManualCals("");
        setShowPuzzle(null);
    };

    const handleScan = async (barcode: string) => {
        setIsScanning(false);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1) {
                const pName = data.product.product_name || "Unknown Treat";
                const pCals = Math.round(data.product.nutriments['energy-kcal_100g'] || 0);
                const pPrice = prompt(`🍪 Found: ${pName}\nCalories: ${pCals} kcal\nEnter price:`, "0");
                if (pPrice) addItem(undefined, pName, parseFloat(pPrice), pCals);
            }
        } catch (err) { console.error(err); }
    };

    const getBarColor = (ratio: number) => {
        if (ratio >= 1.0) return "bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.9)]";
        if (ratio >= 0.8) return "bg-amber-400";
        return "bg-emerald-400";
    };

    const headerBg =
        spendRatio >= 1.0
            ? 'bg-gradient-to-r from-rose-900 via-red-600 to-rose-700'
        : spendRatio >= 0.9
            ? 'bg-gradient-to-r from-rose-800 via-orange-600 to-rose-600'
        : spendRatio >= 0.80
            ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-rose-500'
        : spendRatio >= 0.65
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-lime-500'
        : spendRatio >= 0.45
            ? 'bg-gradient-to-r from-lime-600 via-amber-700 to-emerald-500'
        : spendRatio >= 0.25
            ? 'bg-gradient-to-r from-lime-600 via-teal-700 to-emerald-500'
        : spendRatio >= 0.15
            ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-500'
            : 'bg-gradient-to-r from-teal-800 via-emerald-700 to-emerald-500';

    const patterns = [
        'bg-[radial-gradient(circle_at_15%_25%,rgba(244,63,94,0.25)_3px,transparent_0),radial-gradient(circle_at_75%_35%,rgba(59,130,246,0.25)_4px,transparent_0),radial-gradient(circle_at_45%_75%,rgba(251,191,36,0.3)_3px,transparent_0)] ' +
        'bg-[length:40px_40px] border-amber-200/50',

        'bg-[radial-gradient(circle_at_30%_15%,rgba(168,85,247,0.2)_4px,transparent_0),radial-gradient(circle_at_80%_60%,rgba(20,184,166,0.2)_3px,transparent_0),radial-gradient(circle_at_20%_80%,rgba(249,115,22,0.25)_4px,transparent_0)] ' +
        'bg-[length:45px_45px] border-rose-200/50',

        'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2)_3px,transparent_0),radial-gradient(circle_at_10%_10%,rgba(251,191,36,0.3)_2px,transparent_0),radial-gradient(circle_at_90%_90%,rgba(251,191,36,0.3)_2px,transparent_0)] ' +
        'bg-[length:35px_35px] border-blue-200/50',

        'bg-[radial-gradient(circle_at_15%_25%,rgba(244,63,94,0.25)_3px,transparent_0),radial-gradient(circle_at_75%_35%,rgba(59,130,246,0.25)_4px,transparent_0),radial-gradient(circle_at_45%_75%,rgba(251,191,36,0.3)_3px,transparent_0)] ' +
        'bg-[length:40px_40px] border-amber-200/50',

        'bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.2)_5px,transparent_0),radial-gradient(circle_at_80%_80%,rgba(251,146,60,0.2)_4px,transparent_0),radial-gradient(circle_at_50%_10%,rgba(251,113,133,0.2)_3px,transparent_0)] ' +
        'bg-[length:60px_60px] border-emerald-100/50',

        'bg-[radial-gradient(circle_at_10%_10%,rgba(251,191,36,0.3)_3px,transparent_0),radial-gradient(circle_at_90%_10%,rgba(217,119,6,0.15)_5px,transparent_0),radial-gradient(circle_at_50%_90%,rgba(254,243,199,0.5)_4px,transparent_0)] ' +
        'bg-[length:45px_45px] border-yellow-300/40',
    ];

    const key = session.holidayName ?? 'default';
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash + key.charCodeAt(i)) % 1000;
    }
    const index = hash % patterns.length;
    const borderBg = patterns[index];

    const CELEBRATION_SAYINGS = [
        "Perfectly Balanced!",
        "You're a smart cookie!",
        "On track for spending!",
        "Festive & Focused!",
        "Budget Master!",
        "Sweet Success!",
        "Baking it look easy!",
        "Batching it like a pro!",
        "Tin-tastic progress!",
        "A treat-wise choice!",
        "The perfect portion!"
    ];

    return (
        <div className={`min-h-screen pb-32 ${borderBg} transition-colors duration-700 overflow-x-hidden relative`}>
            
            {/* CELEBRATION */}
            {showCelebration && (
                <div className="fixed inset-0 z-201 pointer-events-none flex items-center justify-center bg-white/10 backdrop-blur-[1px] animate-in fade-in duration-100">
                    <div className="text-center scale-110">
                        <h2 className="text-5xl font-black italic text-amber-500 drop-shadow-2xl uppercase tracking-tighter">
                            ✨{currentSaying}✨
                        </h2>
                    </div>
                </div>
            )}

            {/* PUZZLE - WARNING */}
            {showPuzzle && (
                <div className="fixed inset-0 z-110 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
                        <div className="bg-rose-100 text-rose-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic mb-2">Budget Breach!</h3>
                        <p className="text-gray-500 text-sm mb-6">Solve this treat tax to continue:</p>
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                            <p className="text-3xl font-mono font-black text-gray-800 mb-4">{puzzleChallenge.q} = ?</p>
                            <input autoFocus type="number" value={puzzleAnswer} onChange={(e) => setPuzzleAnswer(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-center text-xl font-black focus:border-rose-500 outline-none" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPuzzle(null)} className="flex-1 py-4 font-black uppercase text-xs text-gray-400">Cancel</button>
                            <button onClick={() => parseInt(puzzleAnswer) === puzzleChallenge.a ? executeAdd(showPuzzle.item) : (triggerHaptic('warning'), generatePuzzle())} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-120 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-t-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 h-[85vh] flex flex-col">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50">
                            <h3 className="text-xl font-black uppercase italic tracking-widest">Cookie-Tin Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="bg-gray-100 hover:bg-red-400 hover:text-white p-2 rounded-full"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                            Budget ({session.currency})
                                        </label>
                                        <input 
                                            type="number" 
                                            value={session.budget} 
                                            onChange={e => onUpdate({...session, budget: Number(e.target.value)})} 
                                            className="w-full bg-transparent font-black text-lg outline-none" 
                                        />
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                            Calorie Limit (kcal)
                                        </label>
                                        <input 
                                            type="number" 
                                            value={session.calorieLimit} 
                                            onChange={e => onUpdate({...session, calorieLimit: Number(e.target.value)})} 
                                            className="w-full bg-transparent font-black text-lg outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Currency</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CURRENCIES.map(c => (
                                        <button 
                                            key={c.symbol}
                                            onClick={() => onUpdate({ ...session, currency: c.symbol })}
                                            className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 hover:text-orange-500 ${session.currency === c.symbol ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                                        >
                                            <span className="text-xl">{c.symbol}</span>
                                            <span className="text-[8px] opacity-60 font-black uppercase">{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Export Options</label>
                                <button onClick={handleShare} className="w-full flex items-center justify-between p-5 bg-indigo-400 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <Share2 size={20} />
                                        <div className="text-left">
                                            <p className="text-xs font-bold uppercase">Post to Social Media</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 pt-0">
                            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                                Update Tin 🪄
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10">
                <div className={`p-8 pt-12 rounded-b-[3.5rem] shadow-2xl text-white transition-all duration-700 ${headerBg} backdrop-blur-xl`}>
                    <div className="flex justify-between items-start mb-8">
                        <button onClick={onBack} className="bg-white/10 p-2 rounded-full active:scale-90"><ChevronLeft size={20}/></button>
                        <div className="text-center">
                            <span className="font-black uppercase tracking-widest text-[10px] opacity-60 block mb-1">
                                {session.customName ? "Cookie Tin" : "Holiday Session"}
                            </span>
                            <h2 className="font-black italic text-xl uppercase leading-none mb-2">{session.customName || session.holidayName}</h2>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                                <Calendar size={10} className="text-orange-300" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{countdown}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={triggerCelebration} className={`p-2 rounded-full active:scale-90 transition-all ${showCelebration ? 'bg-orange-500 text-white scale-110' : 'bg-white/10 text-orange-300'}`}>
                                <Sparkles size={18}/>
                            </button>
                            <button onClick={() => setIsSettingsOpen(true)} className="bg-white/10 p-2 rounded-full active:scale-90 transition-transform"><Settings size={18}/></button>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">
                            {remainingBudget < 0 ? "Over Limit" : "Remaining to Spend"}
                        </p>
                        <div className={`text-6xl font-black tabular-nums transition-colors duration-500 ${remainingBudget < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                            {remainingBudget >= 0 ? "+" : "-"}{session.currency}{Math.abs(remainingBudget).toFixed(2)}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="opacity-70">Budget Limit</span>
                                <span>{session.currency}{totalSpent.toFixed(0)} / {session.currency}{session.budget}</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                                <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(spendRatio)}`} style={{ width: `${Math.min(spendRatio * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="opacity-70">Total Calories</span>
                                <span>{totalCals} / {session.calorieLimit} kcal</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                                <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(calRatio)}`} style={{ width: `${Math.min(calRatio * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto p-6 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white/50">
                        <form onSubmit={addItem} className="space-y-3">
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="What are you buying?" className="w-full bg-gray-100/50 p-4 rounded-2xl text-sm outline-none focus:ring-2 ring-orange-200" />
                            <div className="flex gap-2">
                                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`${session.currency} Price`} className="w-1/2 bg-gray-100/50 p-4 rounded-2xl text-sm outline-none" />
                                <input type="number" value={manualCals} onChange={e => setManualCals(e.target.value)} placeholder="kcal (opt)" className="w-1/2 bg-gray-100/50 p-4 rounded-2xl text-sm outline-none" />
                            </div>
                            <button type="submit" className="w-full bg-rose-400 hover:bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                <Plus size={16} strokeWidth={3} /> Add to Tin
                            </button>
                        </form>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search items..." className="w-full bg-white pl-14 pr-6 py-4 rounded-full text-sm outline-none shadow-sm transition-all" />
                    </div>

                    <div className="space-y-3 pb-20">
                        {session.items.length === 0 ? (
                            <div className="text-center py-20 bg-white/40 rounded-[3rem] border-4 border-dashed border-orange-100">
                                <CookieIcon size={40} className="mx-auto text-orange-200 mb-4" />
                                <p className="text-sm font-black text-gray-600 uppercase tracking-widest">There are no items in the tin</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Start adding treats above</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-20">
                                <Ghost size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Nothing Found</p>
                                <p className="text-[10px] text-gray-300 font-bold uppercase mt-1">No items match your search</p>
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div key={item.id} className={`bg-white p-5 rounded-4xl flex justify-between items-center shadow-sm border-l-8 transition-all hover:translate-x-1 ${item.calories ? 'border-l-emerald-400' : 'border-l-orange-300'}`}>
                                    <div className="flex flex-col">
                                        <p className="font-bold text-base text-[#3D2B1F] leading-tight">{item.name}</p>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">{item.calories ? `${item.calories} kcal` : 'Custom Entry'}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-black text-lg text-rose-500">-{session.currency}{item.amount.toFixed(2)}</span>
                                        <button onClick={() => onUpdate({ ...session, items: session.items.filter(i => i.id !== item.id) })} className="p-2 bg-rose-50 text-rose-400 rounded-full active:scale-75 transition-transform"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-10 left-0 right-0 flex justify-center z-40 pointer-events-none">
                <button onClick={() => setIsScanning(true)} className="pointer-events-auto bg-orange-500 text-white p-6 rounded-full shadow-2xl active:scale-75 transition-all ring-8 ring-white/20">
                    <Camera size={32} strokeWidth={2.5} />
                </button>
            </div>
            
            {isScanning && <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
        </div>
    );
}
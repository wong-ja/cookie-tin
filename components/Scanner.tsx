"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Zap } from "lucide-react";

export default function Scanner({ onScan, onClose }: { onScan: (res: string) => void, onClose: () => void }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 20,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                formatsToSupport: [ 
                    Html5QrcodeSupportedFormats.EAN_13, 
                    Html5QrcodeSupportedFormats.EAN_8, 
                    Html5QrcodeSupportedFormats.UPC_A, 
                    Html5QrcodeSupportedFormats.UPC_E 
                ]
            },
            false
        );
        scanner.render((decodedText) => {
            onScan(decodedText);
            scanner.clear();
        }, () => {});
        return () => { scanner.clear(); };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white p-2 rounded-[3rem] w-full max-w-sm relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                {/* header */}
                <div className="flex justify-between items-center p-5">
                    <div>
                        <h3 className="font-black text-rose-600 text-lg leading-none">COOKIE SCAN</h3>
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Nutrition Tracker</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

            {/* scanner */}
                <div className="relative mx-4">
                    <div id="reader" className="overflow-hidden rounded-3xl border-4 border-gray-50 shadow-inner"></div>
                    <div className="absolute inset-0 pointer-events-none border-20 border-transparent">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-rose-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-rose-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-rose-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-rose-500 rounded-br-lg"></div>
                    </div>
                </div>

            {/* torch */}
                <div className="p-6 flex flex-col items-center gap-4">
                    <p className="text-xs font-medium text-gray-400 text-center px-4">
                        Align the barcode within the frame to automatically log your holiday treats.
                    </p>
                    
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                            <Zap size={12} fill="currentColor" />
                            Auto-Focus Active
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mt-8 text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">
                Cookie Tin v1.0 • Dec 2025
            </p>
        </div>
    );
}
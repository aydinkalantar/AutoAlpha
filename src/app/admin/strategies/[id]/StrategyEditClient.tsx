"use client";

import { useState } from "react";
import { updateStrategyDetails, uploadStrategyBacktestData } from "../actions";
import Papa from "papaparse";
import { Save, UploadCloud, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StrategyEditClient({ initialStrategy }: { initialStrategy: any }) {
    const [description, setDescription] = useState(initialStrategy.description || "");
    const [winRate, setWinRate] = useState(initialStrategy.winRatePercentage || "");
    const [drawdown, setDrawdown] = useState(initialStrategy.drawdownPercentage || "");
    const [profitFactor, setProfitFactor] = useState(initialStrategy.profitFactor || "");
    
    // Parse JSON array back into mutable objects
    const [riskParams, setRiskParams] = useState<{ id: number, text: string }[]>(
        initialStrategy.riskParameters 
            ? (initialStrategy.riskParameters as string[]).map((text, i) => ({ id: i, text }))
            : []
    );

    const [isSaving, setIsSaving] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "parsing" | "uploading" | "success" | "error">("idle");
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const addRiskParam = () => setRiskParams([...riskParams, { id: Date.now(), text: "" }]);
    const removeRiskParam = (id: number) => setRiskParams(riskParams.filter(p => p.id !== id));
    const updateRiskParam = (id: number, text: string) => {
        setRiskParams(riskParams.map(p => p.id === id ? { ...p, text } : p));
    };

    const handleSaveDetails = async () => {
        setIsSaving(true);
        setSaveStatus("idle");

        const data = {
            description,
            riskParameters: riskParams.filter(p => p.text.trim() !== "").map(p => p.text),
            winRatePercentage: winRate ? parseFloat(winRate as string) : null,
            drawdownPercentage: drawdown ? parseFloat(drawdown as string) : null,
            profitFactor: profitFactor ? parseFloat(profitFactor as string) : null,
        };

        const result = await updateStrategyDetails(initialStrategy.id, data);
        if (result.success) {
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } else {
            setSaveStatus("error");
        }
        setIsSaving(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus("parsing");

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                setUploadStatus("uploading");
                
                // Map generic TV columns (Date/Time + Equity/Balance) into clean dataset
                const parsedData = results.data.map((row: any) => {
                    const dateVal = row["Time"] || row["Date"] || Object.values(row)[0];
                    const equityVal = row["Equity"] || row["Balance"] || Object.values(row).find((val: any) => !isNaN(parseFloat(val)) && parseFloat(val) > 100);
                    
                    return {
                        date: dateVal as string,
                        equity: parseFloat(equityVal as string)
                    };
                }).filter(point => !isNaN(point.equity) && point.date);

                if (parsedData.length === 0) {
                    setUploadStatus("error");
                    alert("Could not parse Equity/Time data. Ensure it's a valid TradingView List of Trades CSV.");
                    return;
                }

                const uploadRes = await uploadStrategyBacktestData(initialStrategy.id, parsedData);
                if (uploadRes.success) {
                    setUploadStatus("success");
                    setTimeout(() => setUploadStatus("idle"), 3000);
                } else {
                    setUploadStatus("error");
                    alert("Failed to save to database.");
                }
            },
            error: (err) => {
                console.error("CSV Parse Error", err);
                setUploadStatus("error");
            }
        });
    };

    return (
        <div className="w-full">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <Link href="/admin/strategies" className="text-sm font-bold text-foreground/50 hover:text-foreground flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Deployments
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Edit Strategy</h1>
                    <p className="text-foreground/50 font-medium">{initialStrategy.name} ({initialStrategy.targetExchange})</p>
                </div>
                <button 
                    onClick={handleSaveDetails}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Details"}
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Visual Settings Form */}
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-8 rounded-3xl shadow-lg space-y-8">
                    <div>
                        <h2 className="text-lg font-bold mb-1">Public Description</h2>
                        <p className="text-sm text-foreground/50 mb-4">Explain how this algorithm generates returns. Supports Markdown.</p>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-48 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 font-medium resize-none focus:outline-none focus:ring-2 ring-purple-500/50"
                            placeholder="This strategy utilizes momentum clustering..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold mb-1">Risk Parameters</h2>
                                <p className="text-sm text-foreground/50">Bullet points outlining specific risk tolerances.</p>
                            </div>
                            <button onClick={addRiskParam} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {riskParams.map((param) => (
                                <div key={param.id} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
                                    <input 
                                        value={param.text}
                                        onChange={(e) => updateRiskParam(param.id, e.target.value)}
                                        placeholder="e.g. Strict 2% Stop Loss per trade"
                                        className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 ring-purple-500/50"
                                    />
                                    <button title="Remove Parameter" onClick={() => removeRiskParam(param.id)} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {riskParams.length === 0 && (
                                <p className="text-sm text-center italic text-foreground/40 py-4">No parameters added. Click + to add.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-black/5 dark:border-white/10">
                         <h2 className="text-lg font-bold mb-4">Static KPIs</h2>
                         <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-foreground/50 mb-2 block tracking-wider">Win Rate (%)</label>
                                <input type="number" step="0.01" value={winRate} onChange={(e) => setWinRate(e.target.value)} placeholder="64.5" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 ring-purple-500/50" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-foreground/50 mb-2 block tracking-wider">Max Drawdown (%)</label>
                                <input type="number" step="0.01" value={drawdown} onChange={(e) => setDrawdown(e.target.value)} placeholder="-12.3" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 ring-purple-500/50" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-foreground/50 mb-2 block tracking-wider">Profit Factor</label>
                                <input type="number" step="0.01" value={profitFactor} onChange={(e) => setProfitFactor(e.target.value)} placeholder="1.85" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 ring-purple-500/50" />
                            </div>
                         </div>
                    </div>
                </div>

                {/* Backtesting CSV Uploader */}
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-8 rounded-3xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-2">Backtest Data Import</h2>
                    <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                        Upload a TradingView 'List of Trades' CSV export here. We will parse the equity curve and override the live chart for users inspecting this strategy before they subscribe.
                    </p>

                    <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-black/10 dark:border-white/20 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="mb-2 text-lg font-bold text-foreground">Click to upload Strategy CSV</p>
                            <p className="text-sm text-foreground/50">TradingView Exports Only (Time & Equity columns)</p>
                        </div>
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </label>

                    {uploadStatus === "parsing" && <p className="mt-6 text-center font-bold animate-pulse text-cyan-600">Parsing CSV rows...</p>}
                    {uploadStatus === "uploading" && <p className="mt-6 text-center font-bold animate-pulse text-purple-600">Saving sequence to secure blob storage...</p>}
                    {uploadStatus === "success" && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-center">
                            ✅ Parsed and injected into Strategy Graph perfectly!
                        </motion.div>
                    )}
                    {uploadStatus === "error" && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-center">
                            ❌ Upload Failed. Check the CSV format and try again.
                        </div>
                    )}

                    {saveStatus === "success" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 bg-foreground text-background font-bold px-6 py-4 rounded-xl shadow-2xl z-50">
                            Strategy Settings Saved
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

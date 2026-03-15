"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Zap, Send, Sparkles } from "lucide-react";
import { getTopPerformingStrategy, publishToTwitter } from './actions';

export function SocialProofCard() {
    const [draftText, setDraftText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [lastGeneratedStrategy, setLastGeneratedStrategy] = useState<{name: string, roi: string} | null>(null);

    const handleGenerateDraft = async () => {
        setIsGenerating(true);
        try {
            const strategy = await getTopPerformingStrategy();
            
            if (!strategy) {
                toast.error("No profitable strategy found to showcase.");
                setDraftText("");
                setLastGeneratedStrategy(null);
                return;
            }

            const roi = strategy.expectedRoiPercentage ? strategy.expectedRoiPercentage.toFixed(2) : "0.00";
            
            const draft = `🤖 📈 Our ${strategy.name} algorithm just secured +${roi}% profit for users this week! Institutional-grade trading, 100% non-custodial. Deploy it today: https://autoalpha.trade/marketplace`;
            
            setDraftText(draft);
            setLastGeneratedStrategy({ name: strategy.name, roi });
            toast.success("Draft generated based on latest data!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate draft.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!draftText.trim()) {
            toast.error("Cannot publish an empty tweet.");
            return;
        }

        setIsPublishing(true);
        try {
            const result = await publishToTwitter(draftText);
            
            if (result.success) {
                toast.success("Successfully posted to X!");
                setDraftText(""); // clear after posting
                setLastGeneratedStrategy(null);
            } else {
                toast.error(result.error || "Failed to publish tweet.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred while publishing.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <Card className="w-full bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden border-border">
            <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Automated Social Proof
                </CardTitle>
                <CardDescription>
                    Automatically query the database for the top-performing strategy and draft a tweet to showcase it.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                
                {/* Action Section */}
                <div className="flex flex-col gap-2">
                     <p className="text-sm font-semibold text-foreground">AI Generation Options</p>
                     <Button 
                        variant="outline" 
                        onClick={handleGenerateDraft} 
                        disabled={isGenerating || isPublishing}
                        className="w-full md:w-auto self-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium transition-all"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {isGenerating ? "Querying Database..." : "Generate Draft Tweet"}
                    </Button>
                </div>

                {/* Composer Section */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground">
                            Tweet Composer (Editable)
                        </label>
                        {lastGeneratedStrategy && (
                             <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                                Detected: {lastGeneratedStrategy.name} ({lastGeneratedStrategy.roi}% ROI)
                             </span>
                        )}
                    </div>
                    
                    <Textarea 
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Click 'Generate Draft Tweet' above or start typing..."
                        className="min-h-[120px] bg-background border-input resize-y focus-visible:ring-blue-500/30"
                        disabled={isPublishing}
                    />
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Markdown and emojis supported</span>
                        <span className={draftText.length > 280 ? "text-red-500 font-bold" : ""}>
                            {draftText.length} / 280
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border/40 bg-muted/20 pt-6">
                 <Button 
                    variant="ghost" 
                    onClick={() => { setDraftText(""); setLastGeneratedStrategy(null); }}
                    disabled={!draftText.trim() || isPublishing}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Clear
                </Button>
                <Button 
                    onClick={handlePublish} 
                    disabled={!draftText.trim() || isPublishing || draftText.length > 280}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                    {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Post to X (Twitter)
                </Button>
            </CardFooter>
        </Card>
    );
}

"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Zap, Send } from "lucide-react";
import { getTopPerformingStrategy, publishToTwitter } from './actions';

export function SocialProofCard() {
    const [draftText, setDraftText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleGenerateDraft = async () => {
        setIsGenerating(true);
        try {
            const strategy = await getTopPerformingStrategy();
            
            if (!strategy) {
                toast.error("No profitable strategy found to showcase.");
                setDraftText("");
                return;
            }

            const roi = strategy.expectedRoiPercentage ? strategy.expectedRoiPercentage.toFixed(2) : "0.00";
            
            const draft = `🤖 📈 Our ${strategy.name} algorithm just secured +${roi}% profit for users this week! Institutional-grade trading, 100% non-custodial. Deploy it today: https://autoalpha.trade/marketplace`;
            
            setDraftText(draft);
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
        <Card className="border border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Automated Social Proof
                </CardTitle>
                <CardDescription>
                    Automatically query the database for the top-performing strategy and draft a tweet to showcase it.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                    variant="secondary" 
                    onClick={handleGenerateDraft} 
                    disabled={isGenerating || isPublishing}
                    className="w-full md:w-auto"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isGenerating ? "Querying Database..." : "Generate Draft Tweet"}
                </Button>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">
                        Tweet Composer (Editable)
                    </label>
                    <Textarea 
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Click 'Generate Draft Tweet' or start typing..."
                        className="min-h-[120px] bg-white/5 border-white/10 resize-y"
                        disabled={isPublishing}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Markdown and emojis supported</span>
                        <span className={draftText.length > 280 ? "text-red-500" : ""}>
                            {draftText.length} / 280
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button 
                    onClick={handlePublish} 
                    disabled={!draftText.trim() || isPublishing || draftText.length > 280}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Post to X (Twitter)
                </Button>
            </CardFooter>
        </Card>
    );
}

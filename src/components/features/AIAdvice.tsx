"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, BrainCircuit, HeartPulse, Dumbbell, Zap, Printer, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerRecommendation, type PlayerRecommendationOutput } from '@/ai/flows/player-recommendation';

export function AIAdvice({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [language, setLanguage] = useState("Marathi");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<PlayerRecommendationOutput | null>(null);

  const getAdvice = async () => {
    if (!selectedPlayerId) {
      toast({ title: "Select a player", description: "Please pick a player to analyze.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const p = store.data.players.find((player: any) => player.id === selectedPlayerId);
      const fit = store.data.fitness[selectedPlayerId] || {};
      const primarySport = p.sports[0];
      const skill = store.data.sportSkills[`${selectedPlayerId}_${primarySport}`] || {};
      
      const incidents = store.data.healthIncidents
        .filter((inc: any) => inc.playerId === selectedPlayerId)
        .map((inc: any) => `${inc.date}: ${inc.description}`)
        .join("; ");

      const input = {
        id: p.id,
        name: p.name,
        gender: p.gender,
        std: p.std,
        age: p.age.toString(),
        height: p.height,
        weight: p.weight,
        bmi: p.bmi,
        sports: p.sports,
        history: p.history,
        histDetail: p.histDetail || "None",
        medical: p.medical || "None",
        language: language,
        // Granular Fitness Data
        fitnessShuttleRun: fit.shuttleRun || "N/A",
        fitnessRun50m: fit.run50m || "N/A",
        fitnessRun600m: fit.run600m || "N/A",
        fitnessSitAndReach: fit.sitAndReach || "N/A",
        fitnessBoardJump: fit.boardJump || "N/A",
        fitnessSitUps: fit.sitUps || "N/A",
        fitnessScore: fit.score || "N/A",
        fitnessStatus: fit.status || "N/A",
        // Skill Data
        sportSkill1: skill.skill1 || "N/A",
        sportSkill2: skill.skill2 || "N/A",
        sportSkillScore: skill.score || "N/A",
        detailedKabaddiSkills: primarySport === 'Kabaddi' ? skill.detailedSkills : undefined,
        detailedVolleyballSkills: primarySport === 'Volleyball' ? skill.detailedSkills : undefined,
        detailedHandballSkills: primarySport === 'Handball' ? skill.detailedSkills : undefined,
        detailedKhoKhoSkills: primarySport === 'Kho Kho' ? skill.detailedSkills : undefined,
        detailedRunningSkills: primarySport === 'Running' ? skill.detailedSkills : undefined,
        detailedShotPutSkills: primarySport === 'Shot Put' ? skill.detailedSkills : undefined,
        detailedJavlineSkills: primarySport === 'Javline' ? skill.detailedSkills : undefined,
        detailedLongJumpSkills: primarySport === 'Long Jump' ? skill.detailedSkills : undefined,
        detailedHighJumpSkills: primarySport === 'High Jump' ? skill.detailedSkills : undefined,
        pastHealthIncidents: incidents || "No incidents recorded"
      };

      const result = await playerRecommendation(input);
      setAdvice(result);
    } catch (error) {
      console.error(error);
      toast({ title: "AI Error", description: "Could not generate advice at this time.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!advice) return;
    const player = store.data.players.find((p: any) => p.id === selectedPlayerId);
    
    const printContent = `
      <html>
        <head>
          <title>AI Performance Advice - ${player?.name}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #235C36; border-bottom: 4px solid #8AF075; margin-bottom: 20px; }
            h2 { color: #1b4b3a; margin-top: 30px; border-left: 5px solid #8AF075; padding-left: 15px; }
            .summary { background: #f4fcf6; padding: 20px; border-radius: 10px; font-style: italic; font-weight: 500; }
            section { margin-bottom: 40px; }
            .player-info { background: #eee; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Performance Strategy: ${player?.name}</h1>
          <div class="player-info">
            Std: ${player?.std} | Age: ${player?.age} | Sports: ${player?.sports.join(', ')}
          </div>
          
          <section>
            <h2>Executive Summary</h2>
            <div class="summary">${advice.summary}</div>
          </section>

          <section>
            <h2>Training Blueprint</h2>
            <div style="white-space: pre-wrap;">${advice.trainingPlan}</div>
          </section>

          <section>
            <h2>Performance Boosters</h2>
            <div style="white-space: pre-wrap;">${advice.performanceSuggestions}</div>
          </section>

          <section>
            <h2>Health & Recovery Protocol</h2>
            <div style="white-space: pre-wrap;">${advice.healthAdvice}</div>
          </section>

          <footer style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 10px; color: #888;">
            AI generated report from Waghamba Sports Hub.
          </footer>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-accent" /> AI Performance Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Get personalized training plans and health advice powered by institutional AI analysis.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-80 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                <Languages className="w-3 h-3" /> Select Language
              </label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger className="rounded-2xl border-2 h-12 text-md font-bold bg-white">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase">Select Player</label>
              <Select onValueChange={setSelectedPlayerId} value={selectedPlayerId}>
                <SelectTrigger className="rounded-2xl border-2 h-12 text-md font-bold bg-white">
                  <SelectValue placeholder="Pick a student" />
                </SelectTrigger>
                <SelectContent>
                  {store.data.players.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              disabled={loading || !selectedPlayerId} 
              onClick={getAdvice}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-14 font-black text-lg shadow-lg uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Sparkles className="w-6 h-6 mr-2" />}
              Generate Advice
            </Button>
          </div>
        </div>
      </div>

      {advice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="md:col-span-2 border-4 border-accent shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-accent/10 border-b-2 border-accent/20 flex flex-row justify-between items-center">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" /> EXECUTIVE SUMMARY
              </CardTitle>
              <Button variant="outline" onClick={handlePrint} className="rounded-xl font-bold border-accent text-primary h-10">
                <Printer className="w-4 h-4 mr-2" /> Print Full Report
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-xl font-medium leading-relaxed text-foreground/90 italic">
                "{advice.summary}"
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg font-black text-primary uppercase flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> Training Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-green prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {advice.trainingPlan}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] bg-white">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg font-black text-primary uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Performance Boosters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-green prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {advice.performanceSuggestions}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-2 border-destructive/20 shadow-xl rounded-[2rem] bg-destructive/[0.02]">
            <CardHeader className="bg-destructive/5">
              <CardTitle className="text-lg font-black text-destructive uppercase flex items-center gap-2">
                <HeartPulse className="w-5 h-5" /> Health & Recovery Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-red prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {advice.healthAdvice}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

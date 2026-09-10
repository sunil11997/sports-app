
"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, LayoutGrid, Users, BookOpen, Wand2, Sparkles, Loader2 } from 'lucide-react';
import { StandardRegistry } from './StandardRegistry';
import { MarathiStudentDirectoryModal } from './MarathiStudentDirectoryModal';
import { useToast } from '@/hooks/use-toast';

export function ClassesHub({ store }: { store: any }) {
  const { toast } = useToast();
  const [selectedStd, setSelectedStd] = useState<string | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const classSummaries = React.useMemo(() => {
    const summary: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) {
      summary[i.toString()] = 0;
    }
    (store.data?.players || []).forEach((p: any) => {
      if (summary[p.std] !== undefined) summary[p.std]++;
    });
    return summary;
  }, [store.data?.players]);

  const handleSyncAllStudents = async () => {
    try {
      setIsSyncing(true);
      const res = await store.importSchoolStudentsDatabase();
      toast({
        title: "विद्यार्थी डेटा यशस्वीरित्या सिंक झाला! ✅",
        description: `शासकीय आश्रमशाळा वाघंबा मधील ${res.added} नवीन विद्यार्थी जोडले व ${res.updated} विद्यार्थी माहिती अपडेट केली.`,
        className: "bg-emerald-600 text-white font-black"
      });
    } catch (e) {
      toast({
        title: "Sync Error",
        description: "Could not sync school students.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (selectedStd) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStd(null)}
          className="font-black uppercase text-xs tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-10 border border-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classes Hub
        </Button>
        <StandardRegistry store={store} std={selectedStd} />
      </div>
    );
  }

  const totalRegistered = (store.data?.players || []).length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-primary/5 p-8 sm:p-12 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden space-y-6">
        <div className="relative z-10 space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">Institutional Classes Hub</h2>
          <p className="text-sm sm:text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
            शासकीय माध्यमिक आश्रम शाळा, वाघंबा &bull; इयत्ता १ ली ते १० वी विद्यार्थी नोंदवही व प्रगती पत्रक
          </p>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => setIsRosterModalOpen(true)}
            className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active-scale flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> 📋 अधिकृत विद्यार्थी यादी व मराठी शुद्धलेखन
          </Button>

          <Button
            onClick={handleSyncAllStudents}
            disabled={isSyncing}
            className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active-scale flex items-center gap-2"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            ⚡ सर्व ४११ विद्यार्थी ॲपमध्ये सिंक करा
          </Button>
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(classSummaries).map(([std, count]) => (
          <Card 
            key={std} 
            onClick={() => setSelectedStd(std)}
            className="border-2 rounded-[2.5rem] p-8 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <GraduationCap className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <Badge className="bg-primary text-white font-black text-xl px-4 py-1 rounded-full">Std {std}</Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-end justify-between border-b border-dashed pb-2">
                  <span className="text-muted-foreground font-black text-[10px] uppercase">Enrolled</span>
                  <span className="text-3xl font-black text-primary">{count}</span>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase pt-2 tracking-widest flex items-center gap-1">
                  <Users className="w-3 h-3" /> View Registry
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* WAGHAMBA STUDENT DIRECTORY & MARATHI NAME CORRECTOR */}
      <MarathiStudentDirectoryModal
        open={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        mode="corrector"
      />
    </div>
  );
}

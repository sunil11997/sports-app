"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  ArrowLeft,
  LayoutGrid,
  Users,
  BookOpen,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  ClipboardList,
  UserCheck,
} from 'lucide-react';
import { StandardClassView } from './StandardClassView';
import { StandardRegistry } from './StandardRegistry';
import { MarathiStudentDirectoryModal } from './MarathiStudentDirectoryModal';
import { StudentExcelModal } from './StudentExcelModal';
import { useToast } from '@/hooks/use-toast';
import { isPlayerArchived } from '@/lib/student-audit-utils';
import { cn } from '@/lib/utils';

export function ClassesSection({ store, language = 'English' }: { store: any; language?: string }) {
  const { toast } = useToast();
  const [selectedStd, setSelectedStd] = useState<string | null>(null);
  const [stdViewMode, setStdViewMode] = useState<'profiles' | 'marks'>('profiles');
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showHigherStds, setShowHigherStds] = useState(false);

  const classSummaries = useMemo(() => {
    const summary: Record<string, { active: number; archived: number }> = {};
    for (let i = 1; i <= 12; i++) {
      summary[i.toString()] = { active: 0, archived: 0 };
    }
    (store.data?.players || []).forEach((p: any) => {
      if (summary[p.std] !== undefined) {
        if (isPlayerArchived(p)) summary[p.std].archived++;
        else summary[p.std].active++;
      }
    });
    return summary;
  }, [store.data?.players]);

  const visibleStds = useMemo(() => {
    return Object.entries(classSummaries).filter(([std, counts]) => {
      const num = parseInt(std, 10);
      if (num <= 10) return true;
      return showHigherStds || counts.active > 0 || counts.archived > 0;
    });
  }, [classSummaries, showHigherStds]);

  const handleSyncAllStudents = async () => {
    try {
      setIsSyncing(true);
      const res = await store.importSchoolStudentsDatabase();
      toast({
        title: "विद्यार्थी डेटा यशस्वीरित्या सिंक झाला! ✅",
        description: `शासकीय आश्रमशाळा वाघंबा मधील ${res.added} नवीन विद्यार्थी जोडले व ${res.updated} विद्यार्थी माहिती अपडेट केली.`,
        className: "bg-emerald-600 text-white font-black",
      });
    } catch {
      toast({
        title: "Sync Error",
        description: "Could not sync school students.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (selectedStd) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setSelectedStd(null)}
            className="font-black uppercase text-xs tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-10 border border-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classes Hub
          </Button>

          <div className="flex bg-muted/40 p-1 rounded-2xl border">
            <Button
              variant={stdViewMode === 'profiles' ? 'default' : 'ghost'}
              onClick={() => setStdViewMode('profiles')}
              className="h-9 px-4 text-xs font-black uppercase rounded-xl flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> Student Profiles
            </Button>
            <Button
              variant={stdViewMode === 'marks' ? 'default' : 'ghost'}
              onClick={() => setStdViewMode('marks')}
              className="h-9 px-4 text-xs font-black uppercase rounded-xl flex items-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5" /> Exam Marks
            </Button>
          </div>
        </div>

        {stdViewMode === 'profiles' ? (
          <StandardClassView store={store} std={selectedStd} language={language} />
        ) : (
          <StandardRegistry store={store} std={selectedStd} language={language} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-primary/5 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden space-y-5">
        <div className="relative z-10 space-y-3">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <LayoutGrid className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-primary uppercase tracking-tight">
            Institutional Classes Hub
          </h2>
          <p className="text-xs sm:text-base font-medium text-muted-foreground max-w-2xl mx-auto">
            शासकीय माध्यमिक आश्रम शाळा, वाघंबा &bull; इयत्ता १ ली ते १० वी विद्यार्थी नोंदवही, प्रगती पत्रक व परीक्षा गुण
          </p>
        </div>

        {/* Unified Action Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button
            onClick={() => setIsRosterModalOpen(true)}
            className="h-10 sm:h-11 px-4 sm:px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md active-scale flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> अधिकृत यादी व मराठी शुद्धलेखन
          </Button>

          <Button
            onClick={handleSyncAllStudents}
            disabled={isSyncing}
            className="h-10 sm:h-11 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md active-scale flex items-center gap-2"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            सर्व विद्यार्थी सिंक करा
          </Button>

          <Button
            onClick={() => setIsExcelModalOpen(true)}
            variant="outline"
            className="h-10 sm:h-11 px-4 sm:px-5 bg-white border-2 border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-sm active-scale flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel / CSV Import & Export
          </Button>
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Showing Std 1 – {showHigherStds ? '12' : '10'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHigherStds((prev) => !prev)}
          className="text-xs font-black uppercase text-primary rounded-xl"
        >
          {showHigherStds ? 'Hide Std 11–12' : 'Show Std 11–12'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {visibleStds.map(([std, counts]) => (
          <Card
            key={std}
            onClick={() => {
              setStdViewMode('profiles');
              setSelectedStd(std);
            }}
            className="border-2 rounded-2xl sm:rounded-[2.5rem] p-3.5 sm:p-7 hover:border-primary transition-all cursor-pointer group active:scale-95 shadow-xl bg-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4 sm:space-y-5">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-primary group-hover:text-white" />
                </div>
                <Badge className="bg-primary text-white font-black text-xs sm:text-lg px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full">
                  Std {std}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-end justify-between border-b border-dashed pb-1.5 sm:pb-2">
                  <span className="text-muted-foreground font-black text-[9px] sm:text-[10px] uppercase">
                    Active Students
                  </span>
                  <span className="text-xl sm:text-3xl font-black text-primary">{counts.active}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" /> Profiles & Marks
                  </p>
                  {counts.archived > 0 && (
                    <Badge variant="outline" className={cn("text-[8px] font-black px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-50")}>
                      {counts.archived} TC/Left
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <MarathiStudentDirectoryModal
        open={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        mode="corrector"
      />

      <StudentExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        store={store}
      />
    </div>
  );
}

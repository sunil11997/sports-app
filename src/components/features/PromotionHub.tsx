"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CircleArrowUp,
  ChevronRight,
  GraduationCap,
  CircleCheck,
  AlertCircle,
  Loader2,
  Archive,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isPlayerArchived } from '@/lib/student-audit-utils';
import type { Player } from '@/lib/types';

export function PromotionHub({
  store,
  section,
}: {
  store: any;
  section: 'sports' | 'general';
  language?: string;
}) {
  const { toast } = useToast();
  const [isPromoting, setIsPromoting] = useState<string | null>(null);
  const [reviewStd, setReviewStd] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [showHigherStds, setShowHigherStds] = useState(false);

  const students = useMemo(() => {
    const isGeneral = section === 'general';
    return (store.data.players || []).filter(
      (p: Player) => !isPlayerArchived(p) && (isGeneral ? true : p.category === 'athlete')
    );
  }, [store.data.players, section]);

  const statsByStd = useMemo(() => {
    const stats: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) stats[i.toString()] = 0;
    students.forEach((s: Player) => {
      if (stats[s.std] !== undefined) stats[s.std]++;
    });
    return stats;
  }, [students]);

  const visibleStds = useMemo(() => {
    return Object.entries(statsByStd).filter(([std, count]) => {
      const num = parseInt(std, 10);
      if (num <= 10) return true;
      return showHigherStds || count > 0;
    });
  }, [statsByStd, showHigherStds]);

  const reviewStudents = useMemo(() => {
    if (!reviewStd) return [];
    return students
      .filter((s: Player) => s.std === reviewStd)
      .sort(
        (a: Player, b: Player) =>
          (parseInt(a.serialNumber || '0', 10) || 0) -
          (parseInt(b.serialNumber || '0', 10) || 0)
      );
  }, [students, reviewStd]);

  const openReviewModal = (std: string) => {
    const list = students.filter((s: Player) => s.std === std);
    const initialMap: Record<string, boolean> = {};
    list.forEach((s: Player) => {
      initialMap[s.id] = true;
    });
    setSelectedIds(initialMap);
    setReviewStd(std);
  };

  const selectedCount = useMemo(
    () => reviewStudents.filter((s: Player) => selectedIds[s.id]).length,
    [reviewStudents, selectedIds]
  );

  const handleToggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    reviewStudents.forEach((s: Player) => {
      next[s.id] = checked;
    });
    setSelectedIds(next);
  };

  const handlePromoteSelected = () => {
    if (!reviewStd) return;
    const toPromote = reviewStudents.filter((s: Player) => selectedIds[s.id]);
    if (toPromote.length === 0) return;

    const currentNum = parseInt(reviewStd, 10);
    const isFinalStd = reviewStd === '10' || reviewStd === '12';
    const targetLabel =
      reviewStd === '12'
        ? 'Graduated / Alumni'
        : `Std ${currentNum + 1}`;

    setIsPromoting(reviewStd);
    toPromote.forEach((p: Player) => {
      if (currentNum < 12) {
        store.updatePlayer({ ...p, std: (currentNum + 1).toString() });
      } else {
        store.updatePlayer({
          ...p,
          status: 'alumni',
          tcDate: new Date().toISOString().slice(0, 10),
        });
      }
    });

    const heldBack = reviewStudents.length - toPromote.length;
    setTimeout(() => {
      setIsPromoting(null);
      setReviewStd(null);
      toast({
        title: isFinalStd ? 'Transition Complete' : 'Promotion Success',
        description: `Moved ${toPromote.length} students from Std ${reviewStd} to ${targetLabel}.${heldBack > 0 ? ` (${heldBack} held back in Std ${reviewStd})` : ''}`,
        className: 'bg-emerald-600 text-white font-bold',
      });
    }, 400);
  };

  const handleArchiveSelectedAsTC = () => {
    if (!reviewStd) return;
    const toArchive = reviewStudents.filter((s: Player) => selectedIds[s.id]);
    if (toArchive.length === 0) return;

    if (
      !confirm(
        `Mark ${toArchive.length} selected student(s) from Std ${reviewStd} as Left School / TC Issued? (Their G.R. history will be preserved in Archived records.)`
      )
    ) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    toArchive.forEach((p: Player) => {
      store.updatePlayer({ ...p, status: 'tc_issued', tcDate: today });
    });

    setReviewStd(null);
    toast({
      title: 'Students Archived (TC Issued)',
      description: `${toArchive.length} student(s) moved to TC / Left School archive.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 sm:p-10 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
            <CircleArrowUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-primary uppercase tracking-tight">
            Safe Standard Promotion & TC Archive
          </h2>
          <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-2xl mx-auto">
            Select individual students to promote, hold back specific students, or archive TC / Left-school records without losing G.R. history.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Active Standards (Std 1 – {showHigherStds ? '12' : '10'})
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStds.map(([std, count]) => {
          const nextStd = parseInt(std, 10) + 1;
          const isFinalStd = std === '12';

          return (
            <Card
              key={std}
              className="border-2 rounded-[2.5rem] overflow-hidden bg-white hover:border-primary/30 transition-all shadow-xl group"
            >
              <div className="p-7 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-primary uppercase tracking-tight">
                        Std {std}
                      </span>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {count} Active Students
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-black uppercase bg-muted/50">
                    Ready
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Current</p>
                    <Badge variant="outline" className="bg-white text-primary border-primary/10 text-xs px-4 py-1">
                      Std {std}
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30" />
                  <div className="text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Target</p>
                    <Badge className="bg-primary text-white text-xs px-4 py-1 shadow-sm">
                      {isFinalStd ? 'Alumni' : `Std ${nextStd}`}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => openReviewModal(std)}
                  disabled={count === 0 || isPromoting === std}
                  className={cn(
                    'w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active-scale',
                    isFinalStd
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'bg-primary text-white hover:bg-primary/90'
                  )}
                >
                  {isPromoting === std ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Review & Promote ({count})
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Per-Student Promotion & TC Review Dialog */}
      <Dialog open={Boolean(reviewStd)} onOpenChange={(open) => !open && setReviewStd(null)}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-2 p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase tracking-tight">
              Std {reviewStd} &rarr;{' '}
              {reviewStd === '12' ? 'Alumni / Graduated' : `Std ${parseInt(reviewStd || '0', 10) + 1}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={reviewStudents.length > 0 && selectedCount === reviewStudents.length}
                  onCheckedChange={(val) => handleToggleAll(Boolean(val))}
                />
                <span className="text-xs font-black uppercase text-slate-700">
                  Select All ({selectedCount} / {reviewStudents.length} selected)
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Uncheck students to hold back
              </span>
            </div>

            <ScrollArea className="h-72 rounded-xl border p-2">
              <div className="space-y-1.5">
                {reviewStudents.map((s: Player) => (
                  <label
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/5 cursor-pointer border border-transparent hover:border-primary/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={Boolean(selectedIds[s.id])}
                        onCheckedChange={(val) =>
                          setSelectedIds((prev) => ({ ...prev, [s.id]: Boolean(val) }))
                        }
                      />
                      <Badge variant="outline" className="font-black text-[10px] shrink-0">
                        #{s.serialNumber || '0'}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-primary uppercase truncate">
                          {s.nameMarathi || s.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          {s.name} &bull; G.R. {s.generalRegisterNumber || '---'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold shrink-0">
                      {s.gender}
                    </Badge>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={selectedCount === 0}
              onClick={handleArchiveSelectedAsTC}
              className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-black text-xs uppercase"
            >
              <Archive className="w-4 h-4 mr-1.5" /> Mark Left / TC ({selectedCount})
            </Button>
            <Button
              type="button"
              disabled={selectedCount === 0 || Boolean(isPromoting)}
              onClick={handlePromoteSelected}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase px-6"
            >
              <CircleArrowUp className="w-4 h-4 mr-1.5" /> Promote Selected ({selectedCount})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-2 border-dashed rounded-[3rem] bg-muted/10 p-10 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <h4 className="text-lg font-black text-muted-foreground uppercase tracking-tight">
            Institutional Transfer Logic
          </h4>
          <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed italic">
            Unchecked students remain in their current standard. Students marked as Left / TC Issued are safely archived with their G.R. history intact.
          </p>
          <div className="flex items-center justify-center gap-2 pt-3">
            <CircleCheck className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.25em]">
              Registry Synchronized
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

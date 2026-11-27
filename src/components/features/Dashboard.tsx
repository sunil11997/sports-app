"use client";

import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { isBirthdayToday, cn } from '@/lib/utils';
import { BirthdayBanner } from './dashboard/BirthdayBanner';
import { PlayerSearch } from './dashboard/PlayerSearch';
import { PlayerTable } from './dashboard/PlayerTable';
import { PlayerEditDialog } from './dashboard/PlayerEditDialog';
import { StudentExcelModal } from './StudentExcelModal';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import {
  type StudentAuditFilter,
  matchesAuditFilter,
  getAuditCounts,
  findDuplicateStudentIds,
  isPlayerArchived,
} from '@/lib/student-audit-utils';

export interface DashboardProps {
  store: any;
  section: string;
  searchTerm?: string;
  t?: any;
}

export function Dashboard({
  store,
  section,
  searchTerm: initialSearch = '',
}: DashboardProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [auditFilter, setAuditFilter] = useState<StudentAuditFilter>('all');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);

  const isGeneral = section === 'general';

  const sectionPlayers = useMemo(() => {
    return (store?.data?.players || []).filter((p: Player) =>
      isGeneral ? true : p.category === 'athlete'
    );
  }, [store?.data?.players, isGeneral]);

  const auditCounts = useMemo(() => getAuditCounts(sectionPlayers), [sectionPlayers]);

  const filteredPlayers = useMemo(() => {
    return sectionPlayers
      .filter((p: Player) => {
        if (!matchesAuditFilter(p, auditFilter)) return false;
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;

        return (
          p.name.toLowerCase().includes(query) ||
          (p.nameMarathi || '').includes(searchTerm) ||
          (p.aadharNumber || '').includes(searchTerm) ||
          (p.generalRegisterNumber || '').toLowerCase().includes(query) ||
          (p.saralId || '').toLowerCase().includes(query) ||
          (p.apaarId || '').toLowerCase().includes(query) ||
          String(p.std || '').includes(query)
        );
      })
      .sort(
        (a: any, b: any) =>
          (parseInt(a.serialNumber || '0', 10) || 0) -
          (parseInt(b.serialNumber || '0', 10) || 0)
      );
  }, [sectionPlayers, auditFilter, searchTerm]);

  const birthdaysToday = useMemo(() => {
    return sectionPlayers.filter((p: any) => !isPlayerArchived(p) && isBirthdayToday(p.dob));
  }, [sectionPlayers]);

  const handleSavePlayer = (updated: Player) => {
    const duplicates = findDuplicateStudentIds(store?.data?.players || [], updated, updated.id);
    if (duplicates.length > 0) {
      const first = duplicates[0];
      toast({
        title: `Duplicate ${first.field} Detected`,
        description: `${first.value} is already assigned to ${first.existingName} (Std ${first.existingStd}).`,
        variant: 'destructive',
      });
      return;
    }

    store.updatePlayer(updated);
    setEditingPlayer(null);
    toast({
      title: isMarathiView ? 'माहिती यशस्वीरित्या जतन झाली!' : 'Information Saved Successfully!',
      description: isMarathiView
        ? `${updated.nameMarathi || updated.name} ची माहिती यशस्वीरित्या अद्ययावत झाली.`
        : `${updated.name}'s profile has been successfully updated.`,
      className: 'bg-emerald-600 text-white font-bold',
    });
  };

  const handleArchivePlayer = (player: Player) => {
    const archived = isPlayerArchived(player);
    if (archived) {
      store.updatePlayer({ ...player, status: 'active', tcDate: '', tcReason: '' });
      toast({
        title: 'Student Restored',
        description: `${player.name} is active in Std ${player.std} again.`,
        className: 'bg-emerald-600 text-white font-bold',
      });
      return;
    }

    const msg = isMarathiView
      ? `${player.nameMarathi || player.name} ला "शाळा सोडली / TC" म्हणून संग्रहित (Archive) करायचे का? (G.R. इतिहास सुरक्षित राहील)`
      : `Archive ${player.name} as Left School / TC Issued? (Preserves G.R. history without permanent deletion)`;
    if (confirm(msg)) {
      store.updatePlayer({
        ...player,
        status: 'tc_issued',
        tcDate: new Date().toISOString().slice(0, 10),
      });
      toast({
        title: 'Student Archived (TC / Left)',
        description: `${player.name} moved to Archived / TC records.`,
      });
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    const msg = isMarathiView
      ? 'या विद्यार्थ्याची नोंद कायमस्वरूपी काढून टाकायची आहे का?'
      : 'Permanently delete this student from the institutional registry?';
    if (confirm(msg)) {
      store.deletePlayer(playerId);
      toast({
        title: isMarathiView ? 'नोंद हटवली' : 'Registry Purged',
        variant: 'destructive',
      });
    }
  };

  if (!store?.isLoaded) {
    return <TableSkeleton rows={10} cols={5} />;
  }

  const filterChips: Array<{ id: StudentAuditFilter; label: string; count: number; alert?: boolean }> = [
    { id: 'all', label: isMarathiView ? 'सर्व सक्रिय' : 'All Active', count: auditCounts.active },
    { id: 'boys', label: isMarathiView ? 'मुले' : 'Boys', count: auditCounts.boys },
    { id: 'girls', label: isMarathiView ? 'मुली' : 'Girls', count: auditCounts.girls },
    { id: 'missing-apaar', label: 'Missing APAAR', count: auditCounts.missingApaar, alert: auditCounts.missingApaar > 0 },
    { id: 'missing-pen-saral', label: 'Missing PEN/Saral', count: auditCounts.missingPenSaral, alert: auditCounts.missingPenSaral > 0 },
    { id: 'missing-photo', label: 'Missing Photo', count: auditCounts.missingPhoto, alert: auditCounts.missingPhoto > 0 },
    { id: 'missing-dob', label: 'Missing DOB', count: auditCounts.missingDob, alert: auditCounts.missingDob > 0 },
    { id: 'archived', label: 'TC / Left', count: auditCounts.archived },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <BirthdayBanner
        birthdays={birthdaysToday}
        isMarathiView={isMarathiView}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex-1">
          <PlayerSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isMarathiView={isMarathiView}
            onToggleLanguage={() => setIsMarathiView(!isMarathiView)}
            totalCount={filteredPlayers.length}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsExcelOpen(true)}
          className="h-11 px-4 rounded-xl border-2 border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Excel / CSV
        </Button>
      </div>

      {/* Data Completeness & Audit Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {filterChips.map((chip) => {
          const active = auditFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setAuditFilter(chip.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5',
                active
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : chip.alert
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40'
              )}
            >
              <span>{chip.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px]',
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      <PlayerTable
        players={filteredPlayers}
        isMarathiView={isMarathiView}
        onEditPlayer={(p) => setEditingPlayer(p)}
        onArchivePlayer={handleArchivePlayer}
        onDeletePlayer={handleDeletePlayer}
      />

      <PlayerEditDialog
        player={editingPlayer}
        isOpen={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        onSave={handleSavePlayer}
      />

      <StudentExcelModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        store={store}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { isBirthdayToday } from '@/lib/utils';
import { BirthdayBanner } from './dashboard/BirthdayBanner';
import { PlayerSearch } from './dashboard/PlayerSearch';
import { PlayerTable } from './dashboard/PlayerTable';
import { PlayerEditDialog } from './dashboard/PlayerEditDialog';

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
  t,
}: DashboardProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isMarathiView, setIsMarathiView] = useState(false);

  const isGeneral = section === 'general';

  const filteredPlayers = useMemo(() => {
    return (store?.data?.players || [])
      .filter((p: Player) => {
        const matchesSection = isGeneral ? true : p.category === 'athlete';
        const query = searchTerm.toLowerCase().trim();
        if (!query) return matchesSection;

        return (
          matchesSection &&
          (p.name.toLowerCase().includes(query) ||
            (p.nameMarathi || '').includes(searchTerm) ||
            (p.aadharNumber || '').includes(searchTerm) ||
            (p.generalRegisterNumber || '').toLowerCase().includes(query) ||
            String(p.std || '').includes(query))
        );
      })
      .sort(
        (a: any, b: any) =>
          (parseInt(a.serialNumber || '0', 10) || 0) -
          (parseInt(b.serialNumber || '0', 10) || 0)
      );
  }, [store?.data?.players, isGeneral, searchTerm]);

  const birthdaysToday = useMemo(() => {
    return (store?.data?.players || []).filter((p: any) => isBirthdayToday(p.dob));
  }, [store?.data?.players]);

  const handleSavePlayer = (updated: Player) => {
    store.updatePlayer(updated);
    setEditingPlayer(null);
    toast({
      title: isMarathiView ? 'माहिती अद्ययावत केली' : 'Registry Updated',
      description: `${updated.name}'s profile has been updated.`,
    });
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Birthday Banner Alert */}
      <BirthdayBanner
        birthdays={birthdaysToday}
        isMarathiView={isMarathiView}
      />

      {/* Search and Language Controls */}
      <PlayerSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isMarathiView={isMarathiView}
        onToggleLanguage={() => setIsMarathiView(!isMarathiView)}
        totalCount={filteredPlayers.length}
      />

      {/* Main Student Roster Table */}
      <PlayerTable
        players={filteredPlayers}
        isMarathiView={isMarathiView}
        onEditPlayer={(p) => setEditingPlayer(p)}
        onDeletePlayer={handleDeletePlayer}
      />

      {/* Modular Player Edit Dialog */}
      <PlayerEditDialog
        player={editingPlayer}
        isOpen={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        onSave={handleSavePlayer}
      />
    </div>
  );
}

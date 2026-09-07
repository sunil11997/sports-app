"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2 } from 'lucide-react';
import type { Player } from '@/lib/types';
import {
  getAgeValidation,
  getLocalizedAgeCategory,
  transliterateEnglishToMarathi,
} from '@/lib/utils';
import { maskAadhaar } from '@/lib/privacy-utils';

interface PlayerTableProps {
  players: Player[];
  isMarathiView: boolean;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export function PlayerTable({
  players,
  isMarathiView,
  onEditPlayer,
  onDeletePlayer,
}: PlayerTableProps) {
  return (
    <Card className="rounded-2xl sm:rounded-[2.5rem] border-2 border-primary/10 shadow-sm overflow-hidden bg-white">
      <div className="overflow-x-auto scrollbar-hide">
        <Table className="w-full min-w-[650px] sm:min-w-[750px]">
          <TableHeader className="bg-slate-50 border-b-2 border-primary/5">
            <TableRow className="h-12 sm:h-14">
              <TableHead className="px-4 sm:px-6 text-[10px] font-black uppercase tracking-wider text-slate-600">
                #
              </TableHead>
              <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase tracking-wider text-slate-600">
                {isMarathiView ? "खेळाडूचे नाव व वय" : "Athlete & Age"}
              </TableHead>
              <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-center tracking-wider text-slate-600">
                G.R. No.
              </TableHead>
              <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-center tracking-wider text-slate-600">
                {isMarathiView ? "इयत्ता" : "Standard"}
              </TableHead>
              <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-center tracking-wider text-slate-600">
                Aadhaar
              </TableHead>
              <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-center tracking-wider text-slate-600">
                HT / WT
              </TableHead>
              <TableHead className="px-4 sm:px-6 text-[10px] font-black uppercase text-right tracking-wider text-slate-600">
                {isMarathiView ? "कृती" : "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium text-xs sm:text-sm">
                  {isMarathiView
                    ? "कोणताही विद्यार्थी सापडला नाही."
                    : "No students found matching the query."}
                </TableCell>
              </TableRow>
            ) : (
              players.map((p: Player) => {
                const ageVal = getAgeValidation(p.dob);
                const age = ageVal ? ageVal.ageYears : parseInt(p.age as any, 10) || 0;
                const displayAge =
                  !age || age <= 0 || isNaN(age)
                    ? isMarathiView
                      ? "वय: अपूर्ण"
                      : "Age: Pending"
                    : `${isMarathiView ? "वय" : "Age"} ${age}`;
                const category = ageVal ? ageVal.category : p.ageCategory || "None";
                const displayName = isMarathiView
                  ? p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name
                  : p.name;

                return (
                  <TableRow key={p.id} className="h-16 sm:h-20 hover:bg-primary/5 transition-colors">
                    <TableCell className="px-4 sm:px-6">
                      <Badge variant="secondary" className="font-black text-xs">
                        {p.serialNumber || '0'}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 sm:px-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border shadow-sm shrink-0">
                          <AvatarImage src={p.photoUrl} className="object-cover" />
                          <AvatarFallback className="font-black uppercase text-xs">
                            {(p.name || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-black text-xs sm:text-sm uppercase text-primary leading-tight truncate max-w-[180px] sm:max-w-[240px]">
                            {displayName}
                          </p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">
                            {p.gender} &bull; {displayAge}
                            {category && category !== "None" && age > 0 && (
                              <> &bull; {getLocalizedAgeCategory(category, isMarathiView)}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 sm:px-4 text-center font-bold text-xs">
                      {p.generalRegisterNumber || '---'}
                    </TableCell>

                    <TableCell className="px-3 sm:px-4 text-center">
                      <Badge variant="outline" className="font-black text-[10px]">
                        Std {p.std}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 sm:px-4 text-center font-mono text-[10px] text-muted-foreground">
                      {maskAadhaar(p.aadharNumber)}
                    </TableCell>

                    <TableCell className="px-3 sm:px-4 text-center">
                      <div className="text-[10px] font-black text-primary/60 uppercase">
                        {p.height ? `${p.height}cm` : '--'} / {p.weight ? `${p.weight}kg` : '--'}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditPlayer(p)}
                          className="h-8 w-8 sm:h-9 sm:w-9 text-primary hover:bg-primary/10 rounded-lg"
                          title="Edit Profile"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeletePlayer(p.id)}
                          className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:bg-destructive/10 rounded-lg"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

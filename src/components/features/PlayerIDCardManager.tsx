"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  IdCard, 
  Printer, 
  UserCheck, 
  Filter, 
  GraduationCap, 
  Trophy, 
  Sparkles,
  RefreshCw,
  FileBadge
} from 'lucide-react';
import type { Player } from '@/lib/types';
import { PlayerIdentityModal } from './PlayerIdentityModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { transliterateEnglishToMarathi } from '@/lib/utils';

interface PlayerIDCardManagerProps {
  store: any;
  preselectedSport?: string;
  section?: 'sports' | 'general';
}

export function PlayerIDCardManager({ store, preselectedSport, section }: PlayerIDCardManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStd, setSelectedStd] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>(preselectedSport || 'all');
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null);
  const [fullPhotoPreview, setFullPhotoPreview] = useState<{ url: string; title: string } | null>(null);

  const allPlayers: Player[] = useMemo(() => store?.data?.players || store?.players || [], [store?.data?.players, store?.players]);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((player) => {
      // Section filter: sports vs general student
      if (section === 'sports') {
        const isAthlete = player.category === 'athlete' || (player.sports && player.sports.length > 0);
        if (!isAthlete) return false;
      } else if (section === 'general') {
        const isStudent = player.category === 'student' || (!player.category && (!player.sports || player.sports.length === 0));
        if (!isStudent) return false;
      }

      // Search term matching (name, Marathi name, G.R. No, Saral ID, sports)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = player.name?.toLowerCase().includes(query);
        const matchesMarathiName = player.nameMarathi?.toLowerCase().includes(query);
        const matchesGR = player.generalRegisterNumber?.toLowerCase().includes(query);
        const matchesSaral = player.saralId?.toLowerCase().includes(query);
        const matchesSport = player.sports?.some(s => s.toLowerCase().includes(query));

        if (!matchesName && !matchesMarathiName && !matchesGR && !matchesSaral && !matchesSport) {
          return false;
        }
      }

      // Class/Std filter
      if (selectedStd !== 'all') {
        if (player.std?.toString() !== selectedStd) return false;
      }

      // Gender filter
      if (selectedGender !== 'all') {
        if (player.gender !== selectedGender) return false;
      }

      // Sport filter
      if (selectedSport !== 'all') {
        const hasSport = player.sports?.some(s => s.toLowerCase() === selectedSport.toLowerCase());
        if (!hasSport) return false;
      }

      return true;
    });
  }, [allPlayers, section, searchTerm, selectedStd, selectedGender, selectedSport]);

  const stdList = ['5', '6', '7', '8', '9', '10'];

  return (
    <div className="space-y-6">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-2xl border-2 border-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
              <FileBadge className="w-4 h-4 text-amber-400" /> Official Player Identity Cards
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              खेळाडू ओळखपत्रे सेंटर (ID Cards Hub)
            </h1>
            <p className="text-blue-200 text-xs md:text-sm max-w-2xl font-bold">
              शासकीय क्रीडा स्पर्धांसाठी सर्व विद्यार्थ्यांची ओळखपत्रे, जन्मदाखले व वैद्यकीय प्रमाणपत्र १ क्लिकवर शोधा, संपादित करा आणि एका पानावर (Single A4 Page) प्रिंट करा.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shrink-0">
            <UserCheck className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-2xl font-black">{filteredPlayers.length} / {allPlayers.length}</div>
              <div className="text-[10px] font-black uppercase text-blue-200">विद्यार्थी सापडले</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <Card className="rounded-3xl border-2 shadow-lg p-5 bg-white space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="विद्यार्थ्याचे नाव, G.R. No, सरल ID, किंवा खेळ शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 h-12 rounded-2xl border-slate-200 text-sm font-bold bg-slate-50/50 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* GENDER FILTER */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1">
            <Button
              type="button"
              variant={selectedGender === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('all')}
              className="rounded-xl text-xs font-bold h-10 px-4"
            >
              सर्व लिंग
            </Button>
            <Button
              type="button"
              variant={selectedGender === 'Male' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('Male')}
              className="rounded-xl text-xs font-bold h-10 px-4"
            >
              मुलगे (Boys)
            </Button>
            <Button
              type="button"
              variant={selectedGender === 'Female' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGender('Female')}
              className="rounded-xl text-xs font-bold h-10 px-4"
            >
              मुली (Girls)
            </Button>
          </div>
        </div>

        {/* CLASS / STANDARD QUICK FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-2 border-t">
          <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1 shrink-0">
            <GraduationCap className="w-3.5 h-3.5" /> इयत्ता:
          </span>
          <Button
            type="button"
            variant={selectedStd === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedStd('all')}
            className="rounded-xl text-xs font-bold h-8 px-3 shrink-0"
          >
            सर्व इयत्ता
          </Button>
          {stdList.map((std) => (
            <Button
              key={std}
              type="button"
              variant={selectedStd === std ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStd(std)}
              className="rounded-xl text-xs font-bold h-8 px-3 shrink-0"
            >
              इयत्ता {std}वी
            </Button>
          ))}
        </div>
      </Card>

      {/* STUDENT CARDS GRID */}
      {filteredPlayers.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-2 border-dashed space-y-4 bg-slate-50/50">
          <div className="w-16 h-16 bg-slate-200/80 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-lg text-slate-800">कोणताही विद्यार्थी सापडला नाही</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              आपण शोधलेला नाव, G.R. Number किंवा फिल्टर जुळत नाही. शोध संज्ञा बदलून पुन्हा प्रयत्न करा.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => { setSearchTerm(''); setSelectedStd('all'); setSelectedGender('all'); setSelectedSport('all'); }}
            className="rounded-xl text-xs font-bold border-2 gap-2"
          >
            <RefreshCw className="w-4 h-4" /> फिल्टर रिसेट करा (Reset Filters)
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlayers.map((player) => {
            const hasPhoto = !!(player.photoUrl || player.aadharPhotoUrl);
            const displayPhoto = player.photoUrl || player.aadharPhotoUrl;

            return (
              <Card 
                key={player.id} 
                className="rounded-3xl border-2 hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl bg-white flex flex-col justify-between group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* CARD TOP INFO & PHOTO */}
                  <div className="flex items-start gap-4">
                    {/* PHOTO FRAME */}
                    <div 
                      onClick={() => {
                        if (displayPhoto) {
                          const nameToUse = (player.nameMarathi && player.nameMarathi.trim()) ? player.nameMarathi.trim() : (transliterateEnglishToMarathi(player.name) || player.name);
                          setFullPhotoPreview({ url: displayPhoto, title: nameToUse });
                        }
                      }}
                      className="w-16 h-20 rounded-2xl border-2 border-blue-900/30 overflow-hidden bg-slate-900 shrink-0 shadow-inner relative flex items-center justify-center text-slate-400 cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all group/photo"
                      title="फोटो मोठा पाहण्यासाठी क्लिक करा (Click to view full photo)"
                    >
                      {hasPhoto ? (
                        <img 
                          src={displayPhoto} 
                          alt={player.name} 
                          className="w-full h-full object-contain group-hover/photo:scale-105 transition-transform" 
                        />
                      ) : (
                        <div className="text-center p-1">
                          <div className="text-lg">📸</div>
                          <div className="text-[8px] font-bold uppercase leading-tight text-slate-400 mt-0.5">फोटो नाही</div>
                        </div>
                      )}
                    </div>

                    {/* NAME & DETAILS */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className="bg-blue-100 text-blue-900 font-bold text-[9px] hover:bg-blue-200">
                          इयत्ता {player.std}वी
                        </Badge>
                        <Badge variant="outline" className="text-[9px] font-bold">
                          {player.gender === 'Male' ? 'मुलगा' : 'मुलगी'}
                        </Badge>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-700 transition-colors">
                        {(player.nameMarathi && player.nameMarathi.trim()) ? player.nameMarathi.trim() : (transliterateEnglishToMarathi(player.name) || player.name)}
                      </h3>

                      <div className="text-[10px] font-bold text-slate-600 pt-1 space-y-0.5">
                        <div>G.R. No: <span className="font-mono text-slate-900">{player.generalRegisterNumber || '---'}</span></div>
                        <div>सरल ID: <span className="font-mono text-slate-900">{player.saralId || '---'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* SPORTS BADGES */}
                  {player.sports && player.sports.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-slate-100">
                      <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                      {player.sports.map((sport, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200/60">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* ACTION BUTTON */}
                <div className="p-3 bg-slate-50 border-t flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={() => setSelectedPlayerForModal(player)}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold h-10 gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-amber-400" /> आयडी कार्ड पहा / प्रिंट करा
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* PLAYER IDENTITY MODAL POPUP */}
      {selectedPlayerForModal && (
        <PlayerIdentityModal
          player={selectedPlayerForModal}
          schoolProfile={store?.data?.schoolProfile || store?.schoolProfile}
          store={store}
          onClose={() => setSelectedPlayerForModal(null)}
        />
      )}

      {/* FULL PHOTO LIGHTBOX DIALOG */}
      <Dialog open={!!fullPhotoPreview} onOpenChange={() => setFullPhotoPreview(null)}>
        <DialogContent className="sm:max-w-[550px] p-4 bg-slate-950 text-white border-2 border-amber-400/40 rounded-3xl shadow-2xl">
          <DialogHeader className="pb-2 border-b border-slate-800">
            <DialogTitle className="text-sm font-black text-amber-400 uppercase tracking-wide">
              🖼️ {fullPhotoPreview?.title || "खेळाडूचा संपूर्ण फोटो"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 max-h-[70vh] overflow-hidden bg-black/60 rounded-2xl">
            {fullPhotoPreview?.url && (
              <img 
                src={fullPhotoPreview.url} 
                alt={fullPhotoPreview.title} 
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setFullPhotoPreview(null)}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs rounded-xl"
            >
              बंद करा (Close)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

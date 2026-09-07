"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Printer, 
  Plus, 
  Trash2, 
  Medal, 
  Calendar, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Users,
  Shield,
  Activity,
  Award
} from 'lucide-react';
import { 
  cn, 
  getOfficialSchoolName, 
  getTeacherName 
} from '@/lib/utils';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  round: number; // 1 = R1, 2 = Quarters, 3 = Semis, 4 = Final
  roundName: string;
  team1: string;
  team2: string;
  score1: number | '';
  score2: number | '';
  winner?: string;
  isBye?: boolean;
}

interface TeamStanding {
  team: string;
  played: number;
  won: number;
  lost: number;
  draw: number;
  scoreFor: number;
  scoreAgainst: number;
  pointDiff: number;
  points: number;
}

const DEFAULT_TEAMS = [
  'वाघंबा टायगर्स (Waghamba Tigers)',
  'सह्याद्री वॉरियर्स (Sahyadri Warriors)',
  'शिवनेरी रायडर्स (Shivneri刑Raiders)',
  'सिंहगड चॅलेंजर्स (Sinhagad Challengers)',
  'कळसूबाई स्ट्रायकर्स (Kalsubai Strikers)',
  'तोरणा डिफेंडर्स (Torna Defenders)',
];

export function TournamentFixturesHub({ store, preselectedSport }: { store: any; preselectedSport?: string }) {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState(preselectedSport || 'Kabaddi');
  const [selectedCategory, setSelectedCategory] = useState('U14 (१४ वर्षांखालील)');
  const [selectedGender, setSelectedGender] = useState('मुले (Boys)');
  const [formatType, setFormatType] = useState<'knockout' | 'league'>('knockout');
  const [tournamentName, setTournamentName] = useState('वार्षिक शालेय क्रीडा स्पर्धा २०२६-२७');
  
  // Teams state
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [newTeamName, setNewTeamName] = useState('');

  // Knockout Matches State
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>(() => generateInitialKnockout(DEFAULT_TEAMS));
  
  // League Matches State
  const [leagueMatches, setLeagueMatches] = useState<Match[]>(() => generateInitialLeague(DEFAULT_TEAMS));

  const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
  const schoolName = getOfficialSchoolName(schoolProfile, true);
  const teacherName = getTeacherName(schoolProfile);

  // Helper to generate knockout bracket with byes
  function generateInitialKnockout(teamList: string[]): Match[] {
    const n = teamList.length;
    if (n < 2) return [];

    // Nearest power of 2
    let nextPowerOfTwo = 2;
    while (nextPowerOfTwo < n) nextPowerOfTwo *= 2;
    const byesCount = nextPowerOfTwo - n;

    const matches: Match[] = [];
    let matchIdx = 1;

    // First round pairings
    // Teams getting byes advance directly
    const teamsInR1 = teamList.slice(0, n - byesCount);
    const byeTeams = teamList.slice(n - byesCount);

    for (let i = 0; i < teamsInR1.length; i += 2) {
      matches.push({
        id: `r1_${matchIdx++}`,
        round: 1,
        roundName: n <= 4 ? 'उपांत्य फेरी (Semifinal)' : n <= 8 ? 'उपांत्यपूर्व फेरी (Quarterfinal)' : 'पहिली फेरी (Round 1)',
        team1: teamsInR1[i] || 'TBD',
        team2: teamsInR1[i + 1] || 'TBD',
        score1: '',
        score2: '',
      });
    }

    // Add bye matches (automatically resolved)
    byeTeams.forEach((team) => {
      matches.push({
        id: `r1_bye_${matchIdx++}`,
        round: 1,
        roundName: 'बाय फेरी (Bye)',
        team1: team,
        team2: 'BYE (पुढे सरकला)',
        score1: 1,
        score2: 0,
        winner: team,
        isBye: true,
      });
    });

    return matches;
  }

  // Helper to generate league round-robin fixtures
  function generateInitialLeague(teamList: string[]): Match[] {
    const matches: Match[] = [];
    let id = 1;
    for (let i = 0; i < teamList.length; i++) {
      for (let j = i + 1; j < teamList.length; j++) {
        matches.push({
          id: `league_${id++}`,
          round: 1,
          roundName: `सामना क्रमांक ${id - 1}`,
          team1: teamList[i],
          team2: teamList[j],
          score1: '',
          score2: '',
        });
      }
    }
    return matches;
  }

  // Regenerate fixtures when team list changes
  const handleRegenerate = (customTeams?: string[]) => {
    const list = customTeams || teams;
    setKnockoutMatches(generateInitialKnockout(list));
    setLeagueMatches(generateInitialLeague(list));
    toast({ title: "वेळापत्रक नव्याने तयार केले! ⚡", description: `${list.length} संघांसाठी सामने तयार झाले.` });
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const updated = [...teams, newTeamName.trim()];
    setTeams(updated);
    setNewTeamName('');
    handleRegenerate(updated);
  };

  const handleRemoveTeam = (idx: number) => {
    if (teams.length <= 2) {
      toast({ title: "किमान २ संघ आवश्यक आहेत", variant: "destructive" });
      return;
    }
    const updated = teams.filter((_, i) => i !== idx);
    setTeams(updated);
    handleRegenerate(updated);
  };

  // Update Score in Match
  const handleScoreChange = (matchId: string, teamNum: 1 | 2, val: string, isLeague = false) => {
    const num = val === '' ? '' : parseInt(val) || 0;
    const updater = isLeague ? setLeagueMatches : setKnockoutMatches;

    updater((prev: Match[]) =>
      prev.map(m => {
        if (m.id !== matchId) return m;
        const updated = {
          ...m,
          [teamNum === 1 ? 'score1' : 'score2']: num,
        };

        const s1 = teamNum === 1 ? num : updated.score1;
        const s2 = teamNum === 2 ? num : updated.score2;

        if (s1 !== '' && s2 !== '') {
          if (s1 > s2) updated.winner = updated.team1;
          else if (s2 > s1) updated.winner = updated.team2;
          else updated.winner = 'बरोबरी (Tie)';
        } else {
          updated.winner = undefined;
        }

        return updated;
      })
    );
  };

  // Compute League Points Table
  const leagueStandings = useMemo<TeamStanding[]>(() => {
    const statsMap: Record<string, TeamStanding> = {};

    teams.forEach(t => {
      statsMap[t] = {
        team: t,
        played: 0,
        won: 0,
        lost: 0,
        draw: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        pointDiff: 0,
        points: 0,
      };
    });

    leagueMatches.forEach(m => {
      if (m.score1 !== '' && m.score2 !== '') {
        const s1 = Number(m.score1);
        const s2 = Number(m.score2);
        const t1 = statsMap[m.team1];
        const t2 = statsMap[m.team2];

        if (t1 && t2) {
          t1.played++;
          t2.played++;
          t1.scoreFor += s1;
          t1.scoreAgainst += s2;
          t2.scoreFor += s2;
          t2.scoreAgainst += s1;

          if (s1 > s2) {
            t1.won++;
            t1.points += 2;
            t2.lost++;
          } else if (s2 > s1) {
            t2.won++;
            t2.points += 2;
            t1.lost++;
          } else {
            t1.draw++;
            t2.draw++;
            t1.points += 1;
            t2.points += 1;
          }

          t1.pointDiff = t1.scoreFor - t1.scoreAgainst;
          t2.pointDiff = t2.scoreFor - t2.scoreAgainst;
        }
      }
    });

    return Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.pointDiff - a.pointDiff;
    });
  }, [teams, leagueMatches]);

  // Print Official Tournament Fixture Sheet
  const handlePrintFixtures = () => {
    const isKO = formatType === 'knockout';
    const activeMatches = isKO ? knockoutMatches : leagueMatches;

    const matchesRows = activeMatches.map((m, idx) => {
      const winnerLabel = m.winner ? `<b style="color:#047857;">🏆 ${m.winner}</b>` : '<span style="color:#94a3b8;">प्रलंबित</span>';
      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td><b>${m.roundName}</b></td>
          <td style="font-weight: 800; font-size: 11px;">${m.team1}</td>
          <td style="text-align: center; font-weight: 900; font-size: 13px; color: #1e3a8a; background: #f8fafc;">
            ${m.score1 !== '' ? m.score1 : '-'} : ${m.score2 !== '' ? m.score2 : '-'}
          </td>
          <td style="font-weight: 800; font-size: 11px;">${m.team2}</td>
          <td style="text-align: center;">${winnerLabel}</td>
        </tr>
      `;
    }).join('');

    const leagueTableHtml = !isKO ? `
      <div style="background: #047857; color: white; font-weight: 900; padding: 4px 8px; font-size: 11px; margin-top: 15px; border-radius: 4px; text-transform: uppercase;">
        अधिकृत गुणतालिका (Official Points Standings)
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10px;">
        <thead>
          <tr style="background: #f1f5f9; border: 1px solid #64748b;">
            <th style="padding: 5px; border: 1px solid #64748b; width: 30px;">क्रमांक</th>
            <th style="padding: 5px; border: 1px solid #64748b; text-align: left;">संघ (Team)</th>
            <th style="padding: 5px; border: 1px solid #64748b;">सामने</th>
            <th style="padding: 5px; border: 1px solid #64748b;">विजय</th>
            <th style="padding: 5px; border: 1px solid #64748b;">पराभव</th>
            <th style="padding: 5px; border: 1px solid #64748b;">बरोबरी</th>
            <th style="padding: 5px; border: 1px solid #64748b;">फरक</th>
            <th style="padding: 5px; border: 1px solid #64748b; background: #e2e8f0; font-weight: 900;">एकूण गुण</th>
          </tr>
        </thead>
        <tbody>
          ${leagueStandings.map((s, i) => `
            <tr style="border: 1px solid #64748b;">
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center; font-weight: bold;">${i + 1}</td>
              <td style="padding: 4px; border: 1px solid #64748b; font-weight: 800;">${s.team}</td>
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center;">${s.played}</td>
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center; color: #047857; font-weight: bold;">${s.won}</td>
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center; color: #dc2626;">${s.lost}</td>
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center;">${s.draw}</td>
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center; font-weight: bold;">${s.pointDiff > 0 ? `+${s.pointDiff}` : s.pointDiff}</td>
              <td style="padding: 4px; border: 1px solid #64748b; text-align: center; font-weight: 900; background: #f8fafc; color: #1e3a8a;">${s.points}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tournament Fixtures & Standings - ${tournamentName}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @page { size: A4 portrait; margin: 0.8cm; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; background: white !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.35; font-size: 10px; background: #f8fafc; }
            .paper { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 6px; padding: 18px; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
            .header-table td { border: none; padding: 2px; }
            .school-title { font-size: 16px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .sub-title { font-size: 11px; font-weight: 800; text-align: center; color: #334155; margin: 2px 0; }
            .form-banner { background: #1e3a8a; color: white; text-align: center; font-size: 12px; font-weight: 900; padding: 5px; border-radius: 4px; margin: 6px 0 10px 0; text-transform: uppercase; }

            table.data-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9.5px; }
            table.data-table th, table.data-table td { border: 1px solid #64748b; padding: 5px; }
            table.data-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; }

            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 6px 14px; border-radius: 5px; font-weight: 800; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 25px; padding: 0 20px; font-size: 10.5px; font-weight: 800; }
            .sign-box { text-align: center; min-width: 180px; }
          </style>
        </head>
        <body style="padding-top: 55px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; बंद करा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ वेळापत्रक व निकाल तक्ता प्रिंट करा (A4 Sheet)</button>
          </div>

          <div class="paper">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" style="height: 50px;" />
                </td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 9px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन &bull; शालेय क्रीडा स्पर्धा अधिकृत सामना वेळापत्रक</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="sub-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                </td>
                <td style="width: 15%; text-align: center;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 45px;" />
                </td>
              </tr>
            </table>

            <div class="form-banner">
              ${tournamentName} &bull; ${selectedSport} (${selectedCategory})
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 800; font-size: 10px; background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">
              <div>खेळ: <span style="color: #1e3a8a;">${selectedSport}</span></div>
              <div>स्वरूप: <span style="color: #1e3a8a;">${isKO ? 'बाद फेरी (Knockout Bracket)' : 'साखळी फेरी (Round-Robin League)'}</span></div>
              <div>एकूण संघ: <span style="color: #1e3a8a;">${teams.length} संघ</span></div>
            </div>

            <div style="background: #1e3a8a; color: white; font-weight: 900; padding: 4px 8px; font-size: 10.5px; border-radius: 4px; text-transform: uppercase;">
              सामन्यांचे वेळापत्रक व निकाल (Match Fixtures & Scores)
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center;">अ.क्र.</th>
                  <th style="width: 110px;">फेरी (Round)</th>
                  <th>संघ १ (Team 1)</th>
                  <th style="width: 70px; text-align: center;">गुण (Score)</th>
                  <th>संघ २ (Team 2)</th>
                  <th style="width: 130px; text-align: center;">विजेता संघ (Winner)</th>
                </tr>
              </thead>
              <tbody>
                ${matchesRows}
              </tbody>
            </table>

            ${leagueTableHtml}

            <div class="footer-sign">
              <div class="sign-box">
                <br/><br/>
                <div>क्रीडा शिक्षक / मुख्य पंच</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">(${teacherName})</div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div>मुख्याध्यापक स्वाक्षरी व शिक्का</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">${schoolName}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-blue-800/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase tracking-wider">
                Fixtures & Brackets Engine
              </Badge>
              <Badge variant="outline" className="text-blue-200 border-blue-400/30 text-xs">
                {formatType === 'knockout' ? 'बाद फेरी (Knockout)' : 'साखळी फेरी (League)'} &bull; {teams.length} संघ
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
              स्पर्धा वेळापत्रक व गुणतालिका (Tournament Fixtures & Standings)
            </h2>
            <p className="text-xs md:text-sm text-blue-200/90 font-medium max-w-2xl">
              आंतरशालेय व तालुका क्रीडा स्पर्धांसाठी स्वयंचलित बाद फेरी (Knockout Bracket with Byes) व साखळी फेरी (Round-Robin Points Table) तयार करा व निकाल प्रिंट करा.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleRegenerate()}
              variant="outline"
              className="bg-blue-800/60 hover:bg-blue-800 text-white font-black text-xs rounded-xl border-blue-400/30 shadow-md gap-2 h-11 px-4"
            >
              <RotateCcw className="w-4 h-4" /> सामने री-शफल करा
            </Button>
            <Button
              onClick={handlePrintFixtures}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-5 border border-amber-300"
            >
              <Printer className="w-4 h-4" /> वेळापत्रक व निकाल प्रिंट (A4)
            </Button>
          </div>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <Card className="p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-white space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Format Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" /> स्पर्धा स्वरूप (Format)
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFormatType('knockout')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all",
                  formatType === 'knockout' ? "bg-blue-800 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
              >
                🥊 बाद फेरी (Knockout)
              </button>
              <button
                type="button"
                onClick={() => setFormatType('league')}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all",
                  formatType === 'league' ? "bg-blue-800 text-white shadow" : "text-slate-600 hover:text-slate-900"
                )}
              >
                📊 साखळी (League)
              </button>
            </div>
          </div>

          {/* Sport Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> खेळ (Sport)
            </label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="खेळ निवडा" />
              </SelectTrigger>
              <SelectContent>
                {['Kabaddi', 'Kho Kho', 'Volleyball', 'Athletics', 'Handball'].map(s => (
                  <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" /> वयोगट (Category)
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                <SelectValue placeholder="वयोगट निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="U14 (१४ वर्षांखालील)">U14 (१४ वर्षांखालील)</SelectItem>
                <SelectItem value="U17 (१७ वर्षांखालील)">U17 (१७ वर्षांखालील)</SelectItem>
                <SelectItem value="U19 (१९ वर्षांखालील)">U19 (१९ वर्षांखालील)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tournament Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" /> स्पर्धेचे नाव (Tournament Name)
            </label>
            <Input
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="font-bold text-xs rounded-xl h-11 border-2 border-primary/20"
            />
          </div>
        </div>

        {/* Participating Teams Management */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
              सहभागी संघ व्यवस्थापन ({teams.length} संघ)
            </span>
            <div className="flex items-center gap-2">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="नवीन संघाचे नाव टाका..."
                className="font-bold text-xs rounded-xl h-9 w-52"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
              />
              <Button
                size="sm"
                onClick={handleAddTeam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-3 gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> संघ जोडा
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {teams.map((t, idx) => (
              <Badge key={t} variant="secondary" className="pl-3 pr-1.5 py-1 text-xs font-bold bg-slate-100 border border-slate-300 flex items-center gap-1.5">
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTeam(idx)}
                  className="hover:bg-rose-100 hover:text-rose-700 rounded-full p-0.5 text-slate-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Fixtures & Results View */}
      {formatType === 'knockout' ? (
        /* KNOCKOUT BRACKET VIEW */
        <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm p-6 md:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase mb-1">बाद फेरी सामने</Badge>
              <h3 className="text-lg font-black text-slate-900">
                {selectedSport} बाद फेरी वेळापत्रक व स्कोअरकार्ड (Knockout Bracket)
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-bold">
              गुण नोंदवून थेट विजेता निश्चित करा
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knockoutMatches.map((m, idx) => (
              <div 
                key={m.id}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all space-y-3",
                  m.winner ? "bg-emerald-50/50 border-emerald-300" : "bg-slate-50 border-slate-200"
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-500">सामना #{idx + 1}</span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {m.roundName}
                  </Badge>
                </div>

                {/* Team 1 */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border">
                  <span className="font-black text-xs text-slate-900 truncate flex-1" title={m.team1}>
                    {m.team1}
                  </span>
                  <Input
                    type="number"
                    value={m.score1}
                    onChange={(e) => handleScoreChange(m.id, 1, e.target.value, false)}
                    placeholder="गुण"
                    disabled={m.isBye}
                    className="w-16 h-8 text-center font-mono font-black text-xs rounded-lg"
                  />
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border">
                  <span className="font-black text-xs text-slate-900 truncate flex-1" title={m.team2}>
                    {m.team2}
                  </span>
                  <Input
                    type="number"
                    value={m.score2}
                    onChange={(e) => handleScoreChange(m.id, 2, e.target.value, false)}
                    placeholder="गुण"
                    disabled={m.isBye}
                    className="w-16 h-8 text-center font-mono font-black text-xs rounded-lg"
                  />
                </div>

                {/* Winner Callout */}
                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">विजेता:</span>
                  <span className="font-black text-emerald-700 truncate max-w-[170px]">
                    {m.winner ? `🏆 ${m.winner}` : 'प्रलंबित'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* LEAGUE ROUND-ROBIN & POINTS TABLE */
        <div className="space-y-6">
          {/* Points Table */}
          <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm overflow-hidden bg-white">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase mb-1">लाईव्ह गुणतालिका</Badge>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedSport} साखळी फेरी गुणतालिका (League Standings)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-bold">
                विजय: २ गुण &bull; बरोबरी: १ गुण &bull; पराभव: ० गुण
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-[11px] font-black uppercase text-primary">
                  <tr>
                    <th className="py-3 px-4 text-center w-14">स्थान</th>
                    <th className="py-3 px-4">संघ (Team Name)</th>
                    <th className="py-3 px-4 text-center">खेळले (P)</th>
                    <th className="py-3 px-4 text-center">विजय (W)</th>
                    <th className="py-3 px-4 text-center">पराभव (L)</th>
                    <th className="py-3 px-4 text-center">बरोबरी (D)</th>
                    <th className="py-3 px-4 text-center">फरक (Diff)</th>
                    <th className="py-3 px-4 text-center bg-emerald-50 text-emerald-950 font-black">एकूण गुण (Pts)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {leagueStandings.map((s, idx) => (
                    <tr key={s.team} className={idx === 0 ? "bg-amber-50/60 font-black" : ""}>
                      <td className="py-3 px-4 text-center font-mono">
                        {idx === 0 ? '🥇 १' : idx === 1 ? '🥈 २' : idx === 2 ? '🥉 ३' : `${idx + 1}`}
                      </td>
                      <td className="py-3 px-4 text-slate-900">
                        {s.team} {idx === 0 && <span className="text-[10px] text-amber-600 font-black ml-1">(अव्वल)</span>}
                      </td>
                      <td className="py-3 px-4 text-center">{s.played}</td>
                      <td className="py-3 px-4 text-center text-emerald-700">{s.won}</td>
                      <td className="py-3 px-4 text-center text-rose-700">{s.lost}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{s.draw}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        {s.pointDiff > 0 ? `+${s.pointDiff}` : s.pointDiff}
                      </td>
                      <td className="py-3 px-4 text-center text-base font-black text-emerald-800 bg-emerald-50/70">
                        {s.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Match Fixture Scores for League */}
          <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm p-6 bg-white space-y-4">
            <h4 className="text-sm font-black uppercase text-primary tracking-wider">
              साखळी सामने व गुण नोंदणी ({leagueMatches.length} सामने)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leagueMatches.map((m) => (
                <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{m.roundName}</div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate flex-1">{m.team1}</span>
                    <Input
                      type="number"
                      value={m.score1}
                      onChange={(e) => handleScoreChange(m.id, 1, e.target.value, true)}
                      className="w-14 h-7 text-center font-mono font-bold text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate flex-1">{m.team2}</span>
                    <Input
                      type="number"
                      value={m.score2}
                      onChange={(e) => handleScoreChange(m.id, 2, e.target.value, true)}
                      className="w-14 h-7 text-center font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

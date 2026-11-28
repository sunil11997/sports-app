"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Printer,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Search,
  UserPlus,
  Save,
  CheckCircle2
} from 'lucide-react';
import {
  HostelPlayerRow,
  loadSavedHostelLists,
  saveHostelList,
  clearSavedHostelList
} from '@/lib/tournamentSheetStorage';
import { transliterateEnglishToMarathi } from '@/lib/utils';

interface HostelRowItemProps {
  row: HostelPlayerRow;
  index: number;
  totalRows: number;
  showGenderBadge?: boolean;
  onDraftChange: (index: number, updated: HostelPlayerRow) => void;
  onMoveRow: (index: number, direction: 'up' | 'down') => void;
  onDeleteRow: (index: number) => void;
}

const HostelRowItem = React.memo(function HostelRowItem({
  row,
  index,
  totalRows,
  showGenderBadge,
  onDraftChange,
  onMoveRow,
  onDeleteRow
}: HostelRowItemProps) {
  const [localRow, setLocalRow] = useState<HostelPlayerRow>(row);

  useEffect(() => {
    setLocalRow(row);
  }, [row]);

  const handleChange = (field: keyof HostelPlayerRow, value: string) => {
    const next = { ...localRow, [field]: value };
    setLocalRow(next);
    onDraftChange(index, next);
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-200">
      <td className="p-1.5 border-r text-center align-middle">
        <div className="flex items-center justify-center gap-1">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => onMoveRow(index, 'up')}
              disabled={index === 0}
              className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
              title="वर हलवा"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onMoveRow(index, 'down')}
              disabled={index === totalRows - 1}
              className="text-slate-400 hover:text-slate-900 disabled:opacity-20 p-0.5"
              title="खाली हलवा"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
          <Input
            value={localRow.srNo}
            onChange={(e) => handleChange('srNo', e.target.value)}
            className="h-8 w-12 text-center font-bold text-xs px-1 bg-amber-50 border-amber-300"
          />
        </div>
      </td>

      <td className="p-1.5 border-r">
        <div className="flex items-center gap-1.5">
          <Input
            value={localRow.studentName}
            onChange={(e) => handleChange('studentName', e.target.value)}
            className="h-8 text-xs font-semibold text-slate-900"
            placeholder="खेळाडूचे पूर्ण नाव"
          />
          {showGenderBadge && (
            <Badge
              className={`shrink-0 text-[10px] px-1.5 py-0.5 ${
                localRow.gender === 'Female'
                  ? 'bg-pink-100 text-pink-800 border-pink-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              {localRow.gender === 'Female' ? 'मुली' : 'मुले'}
            </Badge>
          )}
        </div>
      </td>

      <td className="p-1.5 border-r">
        <Input
          value={localRow.std}
          onChange={(e) => handleChange('std', e.target.value)}
          className="h-8 w-16 text-center text-xs mx-auto"
          placeholder="इयत्ता"
        />
      </td>

      <td className="p-1.5 border-r">
        <Input
          value={localRow.grNo}
          onChange={(e) => handleChange('grNo', e.target.value)}
          className="h-8 w-20 text-center text-xs font-mono mx-auto"
          placeholder="GR No"
        />
      </td>

      <td className="p-1.5 border-r">
        <Input
          value={localRow.ageCategoryLabel}
          onChange={(e) => handleChange('ageCategoryLabel', e.target.value)}
          className="h-8 text-center text-xs"
          placeholder="१४ वर्षांखालील"
        />
      </td>

      <td className="p-1.5 border-r">
        <Input
          value={localRow.sportOrEvent}
          onChange={(e) => handleChange('sportOrEvent', e.target.value)}
          className="h-8 text-center text-xs font-bold text-indigo-900 bg-indigo-50/40"
          placeholder="खेळ प्रकार"
        />
      </td>

      <td className="p-1.5 border-r">
        <Input
          value={localRow.parentMobile}
          onChange={(e) => handleChange('parentMobile', e.target.value)}
          className="h-8 text-center text-xs font-mono"
          placeholder="मोबाईल क्र."
        />
      </td>

      <td className="p-1.5 border-r">
        <Input
          value={localRow.roomOrSign}
          onChange={(e) => handleChange('roomOrSign', e.target.value)}
          className="h-8 text-center text-xs"
          placeholder="खोली क्र."
        />
      </td>

      <td className="p-1.5 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteRow(index)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
          title="यादीतून काढा (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
});

export interface HostelSheetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBoys: HostelPlayerRow[];
  defaultGirls: HostelPlayerRow[];
  allSchoolStudents: any[];
  getStudentAgeCategoryLabel: (student: any, gender: 'Male' | 'Female') => string;
  getStudentMobile: (student: any) => string;
  onPrintHostelSection: (section: 'boys' | 'girls' | 'all', overrideRows?: HostelPlayerRow[]) => void;
}

export function HostelSheetEditorModal({
  isOpen,
  onClose,
  defaultBoys,
  defaultGirls,
  allSchoolStudents,
  getStudentAgeCategoryLabel,
  getStudentMobile,
  onPrintHostelSection
}: HostelSheetEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'boys' | 'girls' | 'both'>('boys');
  const [boysRows, setBoysRows] = useState<HostelPlayerRow[]>([]);
  const [girlsRows, setGirlsRows] = useState<HostelPlayerRow[]>([]);
  const [bothRows, setBothRows] = useState<HostelPlayerRow[]>([]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const draftRef = useRef<HostelPlayerRow[]>([]);
  const hasUnsavedRef = useRef(false);

  // Initialize lists from localStorage or defaults when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const saved = loadSavedHostelLists();
    const initialBoys = saved.boys && saved.boys.length > 0 ? saved.boys : defaultBoys;
    const initialGirls = saved.girls && saved.girls.length > 0 ? saved.girls : defaultGirls;
    const initialBoth = saved.both && saved.both.length > 0
      ? saved.both
      : [...initialBoys, ...initialGirls].map((r, i) => ({ ...r, srNo: String(i + 1) }));

    setBoysRows(initialBoys);
    setGirlsRows(initialGirls);
    setBothRows(initialBoth);
    hasUnsavedRef.current = false;
    setHasUnsavedChanges(false);
  }, [isOpen, defaultBoys, defaultGirls]);

  const activeRows = useMemo(() => {
    if (activeTab === 'boys') return boysRows;
    if (activeTab === 'girls') return girlsRows;
    return bothRows;
  }, [activeTab, boysRows, girlsRows, bothRows]);

  useEffect(() => {
    draftRef.current = activeRows;
  }, [activeRows]);

  const setActiveSectionRows = useCallback((section: 'boys' | 'girls' | 'both', rows: HostelPlayerRow[], persist = true) => {
    draftRef.current = rows;
    hasUnsavedRef.current = false;
    setHasUnsavedChanges(false);

    if (section === 'boys') setBoysRows(rows);
    else if (section === 'girls') setGirlsRows(rows);
    else setBothRows(rows);

    if (persist) {
      saveHostelList(section, rows);
    }
  }, []);

  const commitCurrentDraft = useCallback(() => {
    if (!hasUnsavedRef.current) return;
    const rows = draftRef.current || activeRows;
    setActiveSectionRows(activeTab, rows, true);
  }, [activeTab, activeRows, setActiveSectionRows]);

  const handleSaveToBrowser = useCallback(() => {
    const rows = draftRef.current || activeRows;
    setActiveSectionRows(activeTab, rows, true);
    // Also persist other tabs if they haven't been persisted yet
    saveHostelList('boys', activeTab === 'boys' ? rows : boysRows);
    saveHostelList('girls', activeTab === 'girls' ? rows : girlsRows);
    saveHostelList('both', activeTab === 'both' ? rows : bothRows);

    setSaveMessage('✅ वसतिगृह यादी ब्राउझरमध्ये सुरक्षित सेव्ह झाली! (Saved in Browser)');
    setTimeout(() => setSaveMessage(null), 3500);
  }, [activeTab, activeRows, boysRows, girlsRows, bothRows, setActiveSectionRows]);

  const handleTabSwitch = (nextTab: 'boys' | 'girls' | 'both') => {
    commitCurrentDraft();
    setActiveTab(nextTab);
  };

  const handleDraftChange = useCallback((index: number, updated: HostelPlayerRow) => {
    const next = [...(draftRef.current || [])];
    next[index] = updated;
    draftRef.current = next;
    if (!hasUnsavedRef.current) {
      hasUnsavedRef.current = true;
      setHasUnsavedChanges(true);
    }
  }, []);

  const handleMoveRow = useCallback((index: number, direction: 'up' | 'down') => {
    const current = [...(draftRef.current || activeRows)];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    const renumbered = current.map((r, i) => ({ ...r, srNo: String(i + 1) }));
    setActiveSectionRows(activeTab, renumbered, true);
  }, [activeTab, activeRows, setActiveSectionRows]);

  const handleDeleteRow = useCallback((index: number) => {
    const current = [...(draftRef.current || activeRows)];
    const filtered = current.filter((_, i) => i !== index).map((r, i) => ({ ...r, srNo: String(i + 1) }));
    setActiveSectionRows(activeTab, filtered, true);
  }, [activeTab, activeRows, setActiveSectionRows]);

  const handleAddBlankRow = () => {
    const current = [...(draftRef.current || activeRows)];
    const isGirl = activeTab === 'girls';
    const newRow: HostelPlayerRow = {
      id: `hostel-custom-${Date.now()}`,
      srNo: String(current.length + 1),
      studentName: '',
      std: 'इ. ८ वी',
      grNo: '',
      ageCategoryLabel: isGirl ? '१४ वर्षाखालील मुली' : '१४ वर्षाखालील मुले',
      sportOrEvent: 'कबड्डी',
      parentMobile: '-',
      roomOrSign: '',
      gender: isGirl ? 'Female' : 'Male'
    };
    setActiveSectionRows(activeTab, [...current, newRow], true);
  };

  const handleAddFromRoster = (student: any) => {
    const current = [...(draftRef.current || activeRows)];
    const isGirl = student.gender === 'Female' || student.gender === 'मुली';
    const gender: 'Male' | 'Female' = isGirl ? 'Female' : 'Male';
    const displayName = student.nameMarathi?.trim() || transliterateEnglishToMarathi(student.name) || student.name || '';
    const gr = String(student.generalRegisterNumber || student.rollNo || student.serialNumber || '-').trim();
    const stdVal = student.std ? (String(student.std).includes('इ.') ? String(student.std) : `इ. ${student.std} वी`) : '-';
    const sportsStr = Array.isArray(student.sports) && student.sports.length > 0 ? student.sports.join(', ') : '-';

    const newRow: HostelPlayerRow = {
      id: student.id || `hostel-roster-${Date.now()}`,
      srNo: String(current.length + 1),
      studentName: displayName,
      std: stdVal,
      grNo: gr,
      ageCategoryLabel: getStudentAgeCategoryLabel(student, gender),
      sportOrEvent: sportsStr,
      parentMobile: getStudentMobile(student),
      roomOrSign: '',
      gender
    };
    setActiveSectionRows(activeTab, [...current, newRow], true);
    setIsPickerOpen(false);
  };

  const handleResetSection = () => {
    clearSavedHostelList(activeTab);
    if (activeTab === 'boys') {
      setBoysRows(defaultBoys);
    } else if (activeTab === 'girls') {
      setGirlsRows(defaultGirls);
    } else {
      const merged = [...boysRows, ...girlsRows].map((r, i) => ({ ...r, srNo: String(i + 1) }));
      setBothRows(merged);
    }
    hasUnsavedRef.current = false;
    setHasUnsavedChanges(false);
    setSaveMessage('🔄 या विभागाची मूळ यादी पुन्हा आणली आहे (Reset)');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handlePrintCurrentSection = () => {
    const latestRows = draftRef.current || activeRows;
    setActiveSectionRows(activeTab, latestRows, true);
    const printKey = activeTab === 'both' ? 'all' : activeTab;
    onPrintHostelSection(printKey, latestRows);
  };

  const handleCloseModal = () => {
    commitCurrentDraft();
    onClose();
  };

  const filteredRosterStudents = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return allSchoolStudents
      .filter((s: any) => {
        if (activeTab === 'boys' && (s.gender === 'Female' || s.gender === 'मुली')) return false;
        if (activeTab === 'girls' && s.gender !== 'Female' && s.gender !== 'मुली') return false;
        if (!q) return true;
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchMar = (s.nameMarathi || '').includes(q);
        const matchGR = String(s.generalRegisterNumber || s.rollNo || s.serialNumber || '').includes(q);
        const matchStd = String(s.std || '').includes(q);
        return matchName || matchMar || matchGR || matchStd;
      })
      .slice(0, 40);
  }, [allSchoolStudents, activeTab, pickerSearch]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="w-[96vw] max-w-6xl max-h-[92vh] flex flex-col p-3 sm:p-6 rounded-3xl bg-slate-50 border-2 shadow-3xl overflow-hidden">
          <DialogHeader className="shrink-0 pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-black text-teal-900 flex items-center gap-2">
                <Home className="w-6 h-6 text-teal-600" />
                वसतिगृह खेळाडू यादी संपादन (Edit Hostel Player List)
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                मुले, मुली व एकत्रित विभागातील खेळाडू निवडा, नको असलेले खेळाडू काढा आणि एका A4 पानावर प्रिंट करा
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {saveMessage && (
                <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
                </Badge>
              )}
              <Button
                onClick={handlePrintCurrentSection}
                className="h-9 px-4 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-1.5"
              >
                <Printer className="w-4 h-4" />
                🖨️ {activeTab === 'boys' ? 'मुले' : activeTab === 'girls' ? 'मुली' : 'एकत्रित'} १ पान प्रिंट
              </Button>
            </div>
          </DialogHeader>

          {/* 3 Section Tabs: Boys / Girls / Both */}
          <div className="shrink-0 grid grid-cols-3 gap-2 my-2 bg-white p-1.5 rounded-2xl border shadow-xs">
            <button
              type="button"
              onClick={() => handleTabSwitch('boys')}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'boys'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-blue-50'
              }`}
            >
              <span>👦 फक्त मुले (Boys)</span>
              <Badge className={activeTab === 'boys' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'}>
                {boysRows.length}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('girls')}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'girls'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-pink-50'
              }`}
            >
              <span>👧 फक्त मुली (Girls)</span>
              <Badge className={activeTab === 'girls' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-900'}>
                {girlsRows.length}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('both')}
              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'both'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-teal-50'
              }`}
            >
              <span>👫 मुले व मुली एकत्रित (Both)</span>
              <Badge className={activeTab === 'both' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-900'}>
                {bothRows.length}
              </Badge>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddBlankRow}
                className="h-8 rounded-lg text-xs font-bold bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + नवीन ओळ जोडा
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                className="h-8 rounded-lg text-xs font-bold bg-white text-blue-700 border-blue-300 hover:bg-blue-50 gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> 👥 रोस्टरमधून खेळाडू घ्या
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetSection}
                className="h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-destructive gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> मूळ यादी आणा (Reset)
              </Button>
            </div>

            <Button
              onClick={handleSaveToBrowser}
              size="sm"
              className={`h-8 rounded-lg text-xs font-black gap-1.5 shadow-sm ${
                hasUnsavedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {hasUnsavedChanges ? '💾 बदल सेव्ह करा (Save)*' : '💾 सेव्ह करा (Save)'}
            </Button>
          </div>

          {/* Editable Table */}
          <div className="flex-1 min-h-[260px] overflow-auto rounded-2xl border-2 border-slate-300 bg-white shadow-inner">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 text-slate-900 border-b-2 border-slate-300">
                <tr>
                  <th className="p-2 text-center w-24 border-r font-black">अ.क्र.</th>
                  <th className="p-2 border-r min-w-[200px] font-black">खेळाडूचे पूर्ण नाव</th>
                  <th className="p-2 text-center w-20 border-r font-black">इयत्ता</th>
                  <th className="p-2 text-center w-24 border-r font-black">ज.र.क्र. (GR)</th>
                  <th className="p-2 text-center w-36 border-r font-black">वयोगट (१४/१७/१९)</th>
                  <th className="p-2 text-center w-36 border-r font-black">खेळ प्रकार</th>
                  <th className="p-2 text-center w-32 border-r font-black">पालक मो. क्र.</th>
                  <th className="p-2 text-center w-24 border-r font-black">खोली क्र.</th>
                  <th className="p-2 text-center w-14 font-black">काढा</th>
                </tr>
              </thead>
              <tbody>
                {activeRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground font-semibold">
                      या विभागात खेळाडू नाहीत. वरील &quot;👥 रोस्टरमधून खेळाडू घ्या&quot; किंवा &quot;+ नवीन ओळ जोडा&quot; वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  activeRows.map((row, index) => (
                    <HostelRowItem
                      key={row.id}
                      row={row}
                      index={index}
                      totalRows={activeRows.length}
                      showGenderBadge={activeTab === 'both'}
                      onDraftChange={handleDraftChange}
                      onMoveRow={handleMoveRow}
                      onDeleteRow={handleDeleteRow}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter className="shrink-0 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground font-semibold">
              टीप: नको असलेले खेळाडू समोरील 🗑️ बटणाने काढू शकता आणि बदल केल्यावर &quot;💾 सेव्ह करा&quot; दाबा.
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleCloseModal} className="rounded-xl font-bold text-xs h-10">
                बंद करा (Close)
              </Button>
              <Button
                onClick={handleSaveToBrowser}
                className={`h-10 px-5 rounded-xl font-black text-xs shadow-md gap-2 ${
                  hasUnsavedChanges
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                {hasUnsavedChanges ? '💾 बदल सेव्ह करा (Save in Browser)*' : '💾 सेव्ह करा (Save in Browser)'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roster Student Picker Dialog */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-5 rounded-3xl bg-white border-2 shadow-2xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg font-black text-teal-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              वसतिगृह यादीत जोडण्यासाठी विद्यार्थी निवडा
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="विद्यार्थ्याचे नाव, GR नंबर किंवा इयत्ता शोधा..."
              className="pl-9 h-10 text-xs font-bold rounded-xl"
            />
          </div>

          <div className="flex-1 min-h-[220px] max-h-[48vh] overflow-y-auto space-y-2 pr-1">
            {filteredRosterStudents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground font-bold text-xs">
                कोणताही विद्यार्थी सापडला नाही.
              </div>
            ) : (
              filteredRosterStudents.map((s: any) => {
                const displayName = s.nameMarathi?.trim() || transliterateEnglishToMarathi(s.name) || s.name;
                const gr = s.generalRegisterNumber || s.rollNo || s.serialNumber || '-';
                const isGirl = s.gender === 'Female' || s.gender === 'मुली';
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-slate-900 text-xs">{displayName}</div>
                      <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                        <span>इयत्ता: {s.std}</span>
                        <span>&bull;</span>
                        <span>{isGirl ? '👧 मुली' : '👦 मुले'}</span>
                        <span>&bull;</span>
                        <span>GR: {gr}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddFromRoster(s)}
                      className="h-8 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                    >
                      + यादीत जोडा
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

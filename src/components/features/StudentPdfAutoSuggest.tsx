"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SchoolStudent } from '@/data/waghambaStudents';
import { searchWaghambaStudents, correctMarathiFullName } from '@/lib/marathiNameHelper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Search, 
  User, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Phone, 
  Check, 
  ChevronDown, 
  X,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentPdfAutoSuggestProps {
  value: string;
  onChange: (value: string) => void;
  onSelectStudent: (student: SchoolStudent) => void;
  placeholder?: string;
  currentStd?: string; // default standard filter if known
  className?: string;
  inputClassName?: string;
  label?: React.ReactNode;
  hintText?: string;
  mode?: 'english' | 'marathi';
  autoFocus?: boolean;
}

export function StudentPdfAutoSuggest({
  value,
  onChange,
  onSelectStudent,
  placeholder,
  currentStd,
  className,
  inputClassName,
  label,
  hintText,
  mode = 'english',
  autoFocus = false
}: StudentPdfAutoSuggestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStdFilter, setActiveStdFilter] = useState<string>(currentStd || 'all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync standard filter if currentStd changes from parent
  useEffect(() => {
    if (currentStd && currentStd !== 'all') {
      setActiveStdFilter(currentStd);
    }
  }, [currentStd]);

  // Outside click listener to dismiss the suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute matching students from PDF roster
  const matchingStudents = useMemo(() => {
    return searchWaghambaStudents(value, activeStdFilter).slice(0, 15);
  }, [value, activeStdFilter]);

  const handleSelect = (student: SchoolStudent) => {
    onSelectStudent(student);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < matchingStudents.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < matchingStudents.length) {
        e.preventDefault();
        handleSelect(matchingStudents[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Label & Quick Actions */}
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="font-black text-primary uppercase text-[10px] tracking-widest flex items-center gap-1.5">
            {label}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>💡 PDF सुचवा</span>
            {matchingStudents.length > 0 && (
              <span className="bg-purple-600 text-white rounded-full px-1.5 py-0.2 text-[8px]">
                {matchingStudents.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Input Field with Inline Quick Suggestion Pill */}
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (mode === 'marathi' ? "मराठी नाव टाका किंवा शोधा..." : "Type student name (English or Marathi)...")}
          autoFocus={autoFocus}
          className={cn("pr-24 font-bold transition-all", inputClassName)}
        />

        {/* Action icons at the right side of the input */}
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(prev => !prev)}
            className="h-7 px-2 text-[10px] font-black text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3 text-purple-600" />
            <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </div>
      </div>

      {hintText && !isOpen && (
        <p className="text-[10px] text-muted-foreground mt-1">{hintText}</p>
      )}

      {/* FLOATING AUTO-SUGGESTION DROPDOWN */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header & Class Filter Pills */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 p-3 border-b border-purple-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-black text-xs text-purple-950 uppercase tracking-wider">
                  शाळा यादीतील सुचना (School PDF)
                </span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-200/70 px-2 py-0.5 rounded-full">
                {matchingStudents.length} सापडले
              </span>
            </div>

            {/* Standard Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveStdFilter('all')}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all",
                  activeStdFilter === 'all' 
                    ? "bg-purple-600 text-white shadow-xs" 
                    : "bg-white/80 text-muted-foreground hover:bg-white"
                )}
              >
                सर्व इयत्ता
              </button>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveStdFilter(s)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all",
                    activeStdFilter === s 
                      ? "bg-purple-600 text-white shadow-xs" 
                      : "bg-white/80 text-muted-foreground hover:bg-white"
                  )}
                >
                  इ.{s}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <ScrollArea className="max-h-[320px] p-2">
            {matchingStudents.length === 0 ? (
              <div className="text-center py-6 px-4 space-y-2">
                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-bold text-muted-foreground">
                  &quot;{value}&quot; नावाने विद्यार्थी सापडला नाही.
                </p>
                <p className="text-[10px] text-muted-foreground">
                  स्पेलिंग तपासा किंवा वरील इयत्ता फिल्टर बदला.
                </p>
                {activeStdFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveStdFilter('all')}
                    className="text-xs font-black text-purple-700 hover:underline inline-block mt-1"
                  >
                    सर्व इयत्तांमधून शोधा &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {matchingStudents.map((st, idx) => {
                  const isSelected = selectedIndex === idx;
                  const cleanedMarathiName = correctMarathiFullName(st.nameMarathi);
                  const isBoy = st.gender === 'Male';

                  return (
                    <div
                      key={`${st.std}-${st.rollNo}-${st.name}`}
                      onClick={() => handleSelect(st)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group text-left",
                        isSelected
                          ? "bg-purple-50 border-purple-300 shadow-sm"
                          : "bg-white border-slate-100 hover:bg-slate-50 hover:border-purple-200"
                      )}
                    >
                      {/* Avatar / Number */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-xs",
                          isBoy ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
                        )}>
                          {st.rollNo}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          {/* Names */}
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="font-black text-sm text-foreground tracking-tight">
                              {cleanedMarathiName}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              ({st.name})
                            </span>
                          </div>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Badge variant="outline" className="px-1.5 py-0 text-[9px] font-black bg-purple-50 text-purple-700 border-purple-200">
                              इयत्ता {st.std} वी
                            </Badge>
                            <span className={cn("font-bold", isBoy ? "text-blue-600" : "text-rose-600")}>
                              {isBoy ? "मुलगा" : "मुलगी"}
                            </span>
                            {st.dob && (
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" /> {st.dob}
                              </span>
                            )}
                            {st.village && (
                              <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                                <MapPin className="w-2.5 h-2.5" /> {st.village}
                              </span>
                            )}
                            {st.apaarId && (
                              <span className="text-emerald-700 font-mono text-[9px]">
                                ID: {st.apaarId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Auto Fill Action */}
                      <div className="shrink-0 flex items-center">
                        <Button
                          type="button"
                          size="sm"
                          className={cn(
                            "h-8 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs",
                            isSelected
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-purple-100 hover:bg-purple-600 text-purple-800 hover:text-white group-hover:bg-purple-600 group-hover:text-white"
                          )}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>आपोआप भरा</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer note */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-muted-foreground px-3">
            <span>💡 नावावर क्लिक करा — सर्व माहिती आपोआप भरेल.</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-bold text-slate-500 hover:text-slate-800"
            >
              बंद करा (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

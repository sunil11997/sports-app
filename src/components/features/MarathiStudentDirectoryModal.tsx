"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  GraduationCap, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Calendar, 
  IdCard, 
  Check, 
  Copy,
  BookOpen,
  Filter,
  Wand2
} from 'lucide-react';
import { WAGHAMBA_STUDENTS_DATA, SchoolStudent } from '@/data/waghambaStudents';
import { 
  cleanLegacyMarathiText, 
  correctMarathiFullName, 
  decomposeMarathiFullName,
  searchWaghambaStudents 
} from '@/lib/marathiNameHelper';
import { useToast } from '@/hooks/use-toast';

interface MarathiStudentDirectoryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectStudent?: (student: SchoolStudent) => void;
  mode?: 'picker' | 'corrector';
}

export function MarathiStudentDirectoryModal({
  open,
  onClose,
  onSelectStudent,
  mode = 'picker'
}: MarathiStudentDirectoryModalProps) {
  const { toast } = useToast();
  const [selectedStd, setSelectedStd] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Marathi Name Corrector Sandbox
  const [customInputName, setCustomInputName] = useState('');
  const [customCorrectedName, setCustomCorrectedName] = useState('');

  const filteredStudents = useMemo(() => {
    return searchWaghambaStudents(searchQuery, selectedStd);
  }, [searchQuery, selectedStd]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "कॉपी झाले! ✅",
      description: `"${text}" क्लिपबोर्डवर कॉपी केले आहे.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestCorrection = (input: string) => {
    setCustomInputName(input);
    const cleaned = cleanLegacyMarathiText(input);
    const corrected = correctMarathiFullName(cleaned);
    setCustomCorrectedName(corrected);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] rounded-[2.5rem] p-6 bg-white border-2 border-primary/20 shadow-2xl flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-accent" />
                शासकीय आश्रमशाळा वाघंबा - विद्यार्थी नोंदवही
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-semibold mt-1">
                इयत्ता १ ली ते १० वी मधील सर्व ४११ विद्यार्थ्यांची अधिकृत माहिती व मराठी नाव शुद्धलेखन सहाय्यक
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border border-primary/20 font-black text-xs px-3 py-1 rounded-full w-fit">
              एकूण: {filteredStudents.length} विद्यार्थी
            </Badge>
          </div>
        </DialogHeader>

        {/* MARATHI NAME CORRECTION LIVE TOOLBOX */}
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-2 mt-2">
          <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
            <Wand2 className="w-4 h-4 text-amber-600" />
            मराठी नाव तपासणी व शुद्धलेखन (Live Marathi Name Correction)
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Input
              placeholder="कोणतेही मराठी नाव टाइप करा किंवा पेस्ट करा (उदा. £ानेæवर, ͩĐçणा, विपुळ...)"
              value={customInputName}
              onChange={(e) => handleTestCorrection(e.target.value)}
              className="h-10 bg-white border-amber-300 font-bold text-sm rounded-xl flex-1"
            />
            {customCorrectedName && customCorrectedName !== customInputName && (
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-300 font-black text-xs">
                <span>दुरुस्त: <strong>{customCorrectedName}</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy(customCorrectedName, 'custom')}
                  className="hover:text-emerald-700 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH AND CLASS FILTER CONTROLS */}
        <div className="py-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="विद्यार्थ्याचे नाव, रोल नंबर, अपार आयडी, गाव (उदा. वाघंबा, गोळवाड) किंवा मोबाईल नंबर शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 border-2 rounded-2xl bg-slate-50 font-bold text-sm focus:bg-white transition-all"
            />
          </div>

          {/* Standard Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3" /> इयत्ता:
            </span>
            <Button
              size="sm"
              variant={selectedStd === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedStd('all')}
              className={`h-7 text-xs font-black rounded-full px-3 ${
                selectedStd === 'all' ? 'bg-primary text-white' : 'bg-slate-50'
              }`}
            >
              सर्व (All)
            </Button>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((std) => (
              <Button
                key={std}
                size="sm"
                variant={selectedStd === std ? 'default' : 'outline'}
                onClick={() => setSelectedStd(std)}
                className={`h-7 text-xs font-black rounded-full px-3 ${
                  selectedStd === std ? 'bg-primary text-white' : 'bg-slate-50'
                }`}
              >
                {std} ली/वी
              </Button>
            ))}
          </div>
        </div>

        {/* STUDENTS LIST */}
        <ScrollArea className="flex-1 max-h-[380px] rounded-2xl border-2 p-2 bg-slate-50/50">
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <GraduationCap className="w-10 h-10 mx-auto opacity-30" />
                <p className="font-bold text-sm">कोणताही विद्यार्थी आढळला नाही.</p>
                <p className="text-xs">कृपया नाव, रोल नंबर किंवा गावाचे स्पेलिंग तपासा.</p>
              </div>
            ) : (
              filteredStudents.map((st) => {
                const correctedMarathi = correctMarathiFullName(st.nameMarathi);
                return (
                  <div
                    key={st.id}
                    className="p-3.5 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border border-primary/20 font-black text-[10px] px-2 py-0.5 rounded-md">
                          इ. {st.std} वी &bull; क्र. {st.rollNo}
                        </Badge>
                        <h4 className="font-black text-slate-900 text-sm tracking-tight">
                          {correctedMarathi}
                        </h4>
                        <span className="text-xs font-semibold text-muted-foreground">
                          ({st.name})
                        </span>
                        <Badge variant="outline" className="text-[9px] font-bold">
                          {st.gender === 'Male' ? 'मुलगा' : 'मुलगी'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                        {st.dob && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary/70" />
                            जन्म: <strong>{st.dob}</strong> ({st.age} वर्षे)
                          </span>
                        )}
                        {st.apaarId && (
                          <span className="flex items-center gap-1 text-primary">
                            <IdCard className="w-3 h-3" />
                            APAAR ID: <strong className="tracking-wider">{st.apaarId}</strong>
                          </span>
                        )}
                        {st.village && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500/70" />
                            गाव: <strong>{st.village}</strong> ({st.taluka})
                          </span>
                        )}
                        {st.mobileNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            मो.: <strong>{st.mobileNumber}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(correctedMarathi, st.id)}
                        className="h-8 px-2 text-xs font-bold text-muted-foreground hover:text-primary rounded-xl"
                        title="नाव कॉपी करा"
                      >
                        {copiedId === st.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>

                      {onSelectStudent && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onSelectStudent(st);
                            onClose();
                          }}
                          className="bg-primary text-white font-black text-xs rounded-xl h-8 px-3.5 hover:bg-primary/90 flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          माहिती भरा
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

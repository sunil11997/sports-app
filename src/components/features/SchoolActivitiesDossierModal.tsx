"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Calendar,
  Camera,
  HeartPulse,
  Activity,
  Users,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getAllPhotosFromIDB, GeoPhoto } from '@/lib/photo-storage';
import {
  DossierFilterOptions,
  aggregateDossierData,
  openPrintDossierWindow,
  downloadWordDossier,
} from '@/lib/schoolActivitiesDossierGenerator';
import { parseMedicalLog, transliterateEnglishToMarathi } from '@/lib/utils';

interface SchoolActivitiesDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  defaultDate?: string;
  defaultCategory?: 'all' | 'sports' | 'general';
}

export function SchoolActivitiesDossierModal({
  isOpen,
  onClose,
  store,
  defaultDate,
  defaultCategory = 'all',
}: SchoolActivitiesDossierModalProps) {
  const { toast } = useToast();
  const [allIdbPhotos, setAllIdbPhotos] = useState<GeoPhoto[]>([]);
  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'academic_year' | 'this_month' | 'last_30_days' | 'today' | 'custom'>('all');
  const [startDate, setStartDate] = useState(() => {
    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth() + 1;
    return curMonth >= 6 ? `${curYear}-06-01` : `${curYear - 1}-06-01`;
  });
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<'all' | 'sports' | 'general'>(defaultCategory);
  const [includeDailyActivities, setIncludeDailyActivities] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeMedical, setIncludeMedical] = useState(true);
  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeTeacherRemarks, setIncludeTeacherRemarks] = useState(true);
  const [outwardRef, setOutwardRef] = useState('');
  const [submittedTo, setSubmittedTo] = useState('मा. प्रकल्प अधिकारी / गटशिक्षणाधिकारी / मुख्याध्यापक');
  const [customRemarks, setCustomRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'activities' | 'photos' | 'medical'>('preview');

  // Load all IndexedDB photos across all dates
  useEffect(() => {
    if (!isOpen) return;
    getAllPhotosFromIDB()
      .then((photos) => setAllIdbPhotos(photos))
      .catch((err) => console.warn('Could not load all IDB photos:', err));
  }, [isOpen]);

  // Set default outward ref if empty
  useEffect(() => {
    if (!outwardRef) {
      const curYear = new Date().getFullYear();
      setOutwardRef(`शामाआशा/वाघंबा/क्रीडा/${curYear}-${(curYear + 1).toString().slice(-2)}/${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [outwardRef]);

  const filterOptions: DossierFilterOptions = useMemo(() => ({
    dateRangeMode,
    startDate,
    endDate,
    category,
    includeDailyActivities,
    includePhotos,
    includeMedical,
    includeAttendance,
    includeTeacherRemarks,
    outwardRefNumber: outwardRef,
    submittedTo,
    customRemarks,
  }), [
    dateRangeMode,
    startDate,
    endDate,
    category,
    includeDailyActivities,
    includePhotos,
    includeMedical,
    includeAttendance,
    includeTeacherRemarks,
    outwardRef,
    submittedTo,
    customRemarks,
  ]);

  const dossierData = useMemo(() => {
    return aggregateDossierData(store?.data || {}, filterOptions, allIdbPhotos);
  }, [store?.data, filterOptions, allIdbPhotos]);

  const handlePrint = () => {
    openPrintDossierWindow(dossierData, filterOptions);
    toast({
      title: "मुद्रण खिडकी उघडली (Print Window Opened)",
      description: "कृपया A4 आकारात मुद्रण करा किंवा Save as PDF पर्याय निवडा.",
      className: "bg-primary text-white font-bold",
    });
  };

  const handleDownloadWord = () => {
    downloadWordDossier(dossierData, filterOptions);
    toast({
      title: "वर्ड फाईल डाउनलोड झाली (.DOC Downloaded)",
      description: "कार्यालयीन अहवाल Microsoft Word स्वरूपात जतन करण्यात आला आहे.",
      className: "bg-blue-600 text-white font-bold",
    });
  };

  const handleShareWhatsApp = () => {
    const schoolName = dossierData.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा';
    const lines = [
      `🏛️ *शालेय क्रीडा, शारीरिक शिक्षण व दैनिक उपक्रम अहवाल*`,
      `🏫 *${schoolName}*`,
      `📅 *कालावधी:* ${dossierData.dateRangeLabel}`,
      `📌 *जावक क्र.:* ${filterOptions.outwardRefNumber || '-'}`,
      `---------------------------------`,
      `📊 *संक्षिप्त गोषवारा (Statistical Summary):*`,
      `• एकूण सक्रिय दिवस: ${dossierData.stats.totalDays}`,
      `• एकूण क्रीडा व पी.टी. सत्रे: ${dossierData.stats.totalActivities}`,
      `• योगासन व सूर्यनमस्कार सत्रे: ${dossierData.stats.totalYoga}`,
      `• पी.टी. मास व कवायत: ${dossierData.stats.totalPtMass}`,
      `• मैदानी क्रीडा सराव (खो-खो, कबड्डी, वॉलीबॉल): ${dossierData.stats.totalSportsDrills}`,
      `• एकूण विद्यार्थी सहभाग: ${dossierData.stats.totalParticipation} (मुले: ${dossierData.stats.totalBoysCount}, मुली: ${dossierData.stats.totalGirlsCount})`,
      `• प्रत्यक्ष पुरावा छायाचित्रे: ${dossierData.stats.totalPhotos} फोटो (GPS टॅग सह)`,
      `• वैद्यकीय व प्रथमोपचार प्रसंग: ${dossierData.stats.totalMedical} प्रसंग (तात्काळ उपचारित)`,
      `---------------------------------`,
      `✍️ *क्रीडा मार्गदर्शक:* ${dossierData.schoolProfile?.teacherName || 'सुनील देशमुख'}`,
      `✅ *सदर अधिकृत अहवाल कार्यालयात सादर करण्यासाठी तयार आहे.*`
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl w-[96vw] max-h-[92vh] overflow-hidden flex flex-col p-0 border-2 rounded-2xl sm:rounded-3xl shadow-2xl bg-slate-50">
        {/* Header Bar */}
        <div className="bg-primary text-white p-4 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-900 font-black text-[9px] uppercase px-2.5 py-0.5">
                  शासकीय कार्यालयीन दस्तऐवज (Official Office Format)
                </Badge>
                <Badge className="bg-white/20 text-white font-bold text-[9px] uppercase">
                  PDF & Word Ready
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                शालेय उपक्रम सर्वसमावेशक अहवाल (Activities & Duty Dossier)
              </DialogTitle>
              <p className="text-xs font-medium text-white/80">
                दैनिक अहवाल, खेळांचे सराव, भू-चिन्हांकित छायाचित्रे व आरोग्य प्रसंग यांचा अधिकृत अहवाल.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handlePrint}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase h-10 px-4 rounded-xl shadow-lg"
              >
                <Printer className="w-4 h-4 mr-1.5" /> प्रिंट / PDF
              </Button>
              <Button
                onClick={handleDownloadWord}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase h-10 px-4 rounded-xl shadow-lg"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> वर्ड (.DOC)
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase h-10 px-3 rounded-xl shadow-lg"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Filters and Config Toolbar */}
        <div className="bg-white border-b px-4 sm:px-6 py-3 shrink-0 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[10px] font-black uppercase text-primary block mb-1">
                कालावधी निवडा (Date Scope)
              </label>
              <Select value={dateRangeMode} onValueChange={(val: any) => setDateRangeMode(val)}>
                <SelectTrigger className="h-9 text-xs font-bold rounded-lg border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सर्व नोंदी (All Cumulative)</SelectItem>
                  <SelectItem value="academic_year">चालू शैक्षणिक वर्ष २०२६-२७</SelectItem>
                  <SelectItem value="this_month">चालू महिना (This Month)</SelectItem>
                  <SelectItem value="last_30_days">मागील ३० दिवस (Last 30 Days)</SelectItem>
                  <SelectItem value="today">आजचा अहवाल (Today Only)</SelectItem>
                  <SelectItem value="custom">कस्टम कालावधी (Custom Range)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRangeMode === 'custom' && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-primary block mb-1">
                    सुरुवात तारीख (From)
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs font-bold rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-primary block mb-1">
                    अखेर तारीख (To)
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs font-bold rounded-lg"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-primary block mb-1">
                वर्गवारी (Category)
              </label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger className="h-9 text-xs font-bold rounded-lg border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सर्व उपक्रम (All Activities)</SelectItem>
                  <SelectItem value="sports">क्रीडा व शारीरिक शिक्षण (Sports & PE)</SelectItem>
                  <SelectItem value="general">सामान्य विद्यार्थी उपक्रम (General)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-primary block mb-1">
                जावक क्रमांक (Outward Ref)
              </label>
              <Input
                type="text"
                value={outwardRef}
                onChange={(e) => setOutwardRef(e.target.value)}
                placeholder="जावक क्र."
                className="h-9 text-xs font-bold rounded-lg"
              />
            </div>
          </div>

          {/* Section Toggles */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t text-[11px] font-bold text-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-500 mr-1">समाविष्ट घटक:</span>
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md">
              <input
                type="checkbox"
                checked={includeDailyActivities}
                onChange={(e) => setIncludeDailyActivities(e.target.checked)}
                className="rounded accent-primary"
              />
              दैनिक उपक्रम नोंद (${dossierData.stats.totalActivities})
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="rounded accent-primary"
              />
              छायाचित्रे पुरावा (${dossierData.stats.totalPhotos})
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md">
              <input
                type="checkbox"
                checked={includeMedical}
                onChange={(e) => setIncludeMedical(e.target.checked)}
                className="rounded accent-primary"
              />
              आरोग्य व प्रथमोपचार नोंद (${dossierData.stats.totalMedical})
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md">
              <input
                type="checkbox"
                checked={includeTeacherRemarks}
                onChange={(e) => setIncludeTeacherRemarks(e.target.checked)}
                className="rounded accent-primary"
              />
              शिक्षक शेरा व स्वाक्षरी
            </label>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="bg-slate-100/80 px-4 sm:px-6 py-2.5 shrink-0 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white border rounded-full px-3 py-1 font-black text-blue-900 shadow-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> {dossierData.stats.totalDays} दिवस
            </span>
            <span className="bg-white border rounded-full px-3 py-1 font-black text-purple-900 shadow-sm flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-600" /> {dossierData.stats.totalActivities} उपक्रम
            </span>
            <span className="bg-white border rounded-full px-3 py-1 font-black text-amber-900 shadow-sm flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-600" /> {dossierData.stats.totalPhotos} फोटो पुरावा
            </span>
            <span className="bg-white border rounded-full px-3 py-1 font-black text-red-900 shadow-sm flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-red-600" /> {dossierData.stats.totalMedical} प्रथमोपचार
            </span>
            <span className="bg-white border rounded-full px-3 py-1 font-black text-emerald-900 shadow-sm flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> {dossierData.stats.totalParticipation} एकूण उपस्थिती
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-500 italic">
            {dossierData.dateRangeLabel}
          </div>
        </div>

        {/* Main Body with Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-4">
            <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
              <TabsTrigger value="preview" className="text-xs font-bold px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                📄 दस्तऐवज थेट पूर्वावलोकन (Live Document)
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-xs font-bold px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                🏃 उपक्रम तपशील (${dossierData.activities.length})
              </TabsTrigger>
              <TabsTrigger value="photos" className="text-xs font-bold px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                📸 छायाचित्रे (${dossierData.photos.length})
              </TabsTrigger>
              <TabsTrigger value="medical" className="text-xs font-bold px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                🩺 आरोग्य नोंदवही (${dossierData.healthIncidents.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Live Document Preview */}
            <TabsContent value="preview" className="mt-0">
              <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                {/* Simulated Official Header */}
                <div className="text-center border-b-2 border-primary pb-4 space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                    महाराष्ट्र शासन • आदिवासी विकास विभाग
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary uppercase">
                    {dossierData.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा'}
                  </h3>
                  <div className="text-xs font-bold text-slate-600">
                    तालुका: बागलाण • जिल्हा: नाशिक (महाराष्ट्र) • U-DISE: 27200201201
                  </div>
                  <div className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1 rounded-full text-xs font-black uppercase mt-2">
                    शालेय क्रीडा, शारीरिक शिक्षण, दैनिक उपक्रम व आरोग्य तपासणी सर्वसमावेशक अहवाल
                  </div>
                </div>

                {/* Simulated Meta Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border text-xs">
                  <div><strong>जावक क्र.:</strong> {filterOptions.outwardRefNumber || '-'}</div>
                  <div><strong>दिनांक:</strong> {format(new Date(), 'dd/MM/yyyy')}</div>
                  <div><strong>कालावधी:</strong> {dossierData.dateRangeLabel}</div>
                  <div><strong>क्रीडा मार्गदर्शक:</strong> {dossierData.schoolProfile?.teacherName || 'सुनील देशमुख'}</div>
                  <div className="col-span-2"><strong>सादर:</strong> {submittedTo}</div>
                </div>

                {/* Summary Table Preview */}
                <div className="space-y-2">
                  <div className="bg-primary text-white text-xs font-black uppercase px-3 py-1.5 rounded-md">
                    १. संक्षिप्त सांख्यिकी गोषवारा (Summary Overview)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border">
                      <thead className="bg-slate-100 text-primary font-black">
                        <tr>
                          <th className="p-2 border text-left">घटक</th>
                          <th className="p-2 border text-center">नोंदवलेली संख्या</th>
                          <th className="p-2 border text-left">शेरा</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 border font-bold">सक्रिय दिवस</td>
                          <td className="p-2 border text-center font-black text-primary">{dossierData.stats.totalDays} दिवस</td>
                          <td className="p-2 border text-slate-600">नियमित शारीरिक शिक्षण उपक्रम</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border font-bold">आयोजित क्रीडा व पी.टी. सत्रे</td>
                          <td className="p-2 border text-center font-black text-primary">{dossierData.stats.totalActivities} सत्रे</td>
                          <td className="p-2 border text-slate-600">योगा, पी.टी. मास व खेळ ड्रिल्स</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border font-bold">योगासन व सूर्यनमस्कार</td>
                          <td className="p-2 border text-center font-black text-purple-700">{dossierData.stats.totalYoga} सत्रे</td>
                          <td className="p-2 border text-slate-600">प्राणायाम व आसन सराव</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border font-bold">मैदानी क्रीडा सराव (खो-खो, कबड्डी, इ.)</td>
                          <td className="p-2 border text-center font-black text-amber-700">{dossierData.stats.totalSportsDrills} सत्रे</td>
                          <td className="p-2 border text-slate-600">कौशल्य व स्पर्धा सराव</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border font-bold">एकूण विद्यार्थी उपस्थिती</td>
                          <td className="p-2 border text-center font-black text-emerald-700">
                            {dossierData.stats.totalParticipation} (मुले: {dossierData.stats.totalBoysCount}, मुली: {dossierData.stats.totalGirlsCount})
                          </td>
                          <td className="p-2 border text-slate-600">सक्रिय व नियमित उपस्थिती</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border font-bold">भू-चिन्हांकित प्रत्यक्ष पुरावा फोटो</td>
                          <td className="p-2 border text-center font-black text-amber-600">{dossierData.stats.totalPhotos} फोटो</td>
                          <td className="p-2 border text-slate-600">GPS स्थान व वेळेसह जतन</td>
                        </tr>
                        <tr>
                          <td className="p-2 border font-bold">आरोग्य व प्रथमोपचार प्रसंग</td>
                          <td className="p-2 border text-center font-black text-red-600">{dossierData.stats.totalMedical} प्रसंग</td>
                          <td className="p-2 border text-slate-600">तात्काळ उपचार व सर्व बरे</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Highlight Info */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-1.5 text-emerald-950">
                  <div className="font-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    दस्तऐवज पूर्णतः अधिकृत स्वरूपात तयार आहे:
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-800">
                    वरील &quot;प्रिंट / PDF&quot; बटणावर क्लिक करून आपण थेट A4 साईजमध्ये प्रिंट करू शकता किंवा PDF म्हणून जतन करू शकता.
                    तसेच &quot;वर्ड (.DOC)&quot; बटणावर क्लिक करून थेट Microsoft Word फाईल डाऊनलोड करू शकता.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Activities List */}
            <TabsContent value="activities" className="mt-0">
              <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-primary uppercase">
                    आयोजित क्रीडा व शारीरिक शिक्षण सराव ({dossierData.activities.length})
                  </h4>
                  <Badge variant="outline">{dossierData.dateRangeLabel}</Badge>
                </div>

                {dossierData.activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">
                    कोणतेही उपक्रम आढळले नाहीत.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border">
                      <thead className="bg-slate-100 text-slate-800 font-black">
                        <tr>
                          <th className="p-2 border text-center w-10">अ.क्र.</th>
                          <th className="p-2 border text-left w-24">तारीख</th>
                          <th className="p-2 border text-left w-28">प्रकार</th>
                          <th className="p-2 border text-left">आयोजित सराव / तपशील</th>
                          <th className="p-2 border text-center w-14">इयत्ता</th>
                          <th className="p-2 border text-center w-12 text-blue-700">मुले</th>
                          <th className="p-2 border text-center w-12 text-pink-700">मुली</th>
                          <th className="p-2 border text-center w-14">एकूण</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dossierData.activities.map((act: any, idx: number) => {
                          const b = parseInt(act.boysCount || '0', 10) || 0;
                          const g = parseInt(act.girlsCount || '0', 10) || 0;
                          return (
                            <tr key={act.id || idx} className="border-b hover:bg-slate-50">
                              <td className="p-2 border text-center font-bold">{idx + 1}</td>
                              <td className="p-2 border font-bold text-primary whitespace-nowrap">
                                {act.date ? format(new Date(act.date), 'dd/MM/yyyy') : '-'}
                              </td>
                              <td className="p-2 border">
                                <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                  {act.type || 'PE'}
                                </span>
                              </td>
                              <td className="p-2 border font-medium">
                                <strong>{act.summary || act.drillName || act.type}</strong>
                                {act.duration && <span className="text-muted-foreground ml-2 text-[10px]">({act.duration})</span>}
                              </td>
                              <td className="p-2 border text-center font-bold">{act.std ? `इ. ${act.std}` : 'सर्व'}</td>
                              <td className="p-2 border text-center font-bold text-blue-700">{b}</td>
                              <td className="p-2 border text-center font-bold text-pink-700">{g}</td>
                              <td className="p-2 border text-center font-black text-slate-900 bg-slate-50">{act.totalCount || b + g}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: Photos Gallery */}
            <TabsContent value="photos" className="mt-0">
              <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-primary uppercase">
                    भू-चिन्हांकित प्रत्यक्ष पुरावा छायाचित्रे ({dossierData.photos.length})
                  </h4>
                  <Badge variant="outline">{dossierData.photos.length} GPS Photos</Badge>
                </div>

                {dossierData.photos.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">
                    निवडलेल्या कालावधीत कोणतेही फोटो उपलब्ध नाहीत.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {dossierData.photos.map((photo: GeoPhoto, idx: number) => {
                      const photoDate = photo.date ? format(new Date(photo.date), 'dd/MM/yyyy') : '-';
                      return (
                        <div key={photo.id || idx} className="border-2 rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col justify-between">
                          <div className="relative aspect-video bg-slate-900 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Activity Photo'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                              पुरावा #{idx + 1}
                            </div>
                          </div>
                          <div className="p-3 space-y-1">
                            <p className="text-xs font-black text-primary line-clamp-1">{photo.caption || 'सराव सत्र'}</p>
                            <p className="text-[10px] font-bold text-amber-700">🏆 {photo.sport || 'Sports'} {photo.drill ? `• ${photo.drill}` : ''}</p>
                            <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-1 border-t font-semibold">
                              <span>📅 {photoDate}</span>
                              <span>📍 Lat: {photo.lat != null ? photo.lat : '20.6124'}°</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab 4: Medical Log */}
            <TabsContent value="medical" className="mt-0">
              <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-primary uppercase">
                    विद्यार्थी आरोग्य, दुखापत व प्रथमोपचार नोंदवही ({dossierData.healthIncidents.length})
                  </h4>
                  <Badge variant="outline">{dossierData.healthIncidents.length} Records</Badge>
                </div>

                {dossierData.healthIncidents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">
                    कोणतीही वैद्यकीय तक्रार नोंदवलेली नाही. सर्व विद्यार्थी सुदृढ आहेत.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border">
                      <thead className="bg-slate-100 text-slate-800 font-black">
                        <tr>
                          <th className="p-2 border text-center w-10">अ.क्र.</th>
                          <th className="p-2 border text-left w-24">तारीख</th>
                          <th className="p-2 border text-left">विद्यार्थ्याचे नाव</th>
                          <th className="p-2 border text-center w-14">इयत्ता</th>
                          <th className="p-2 border text-left">दुखापत / लक्षणे</th>
                          <th className="p-2 border text-center w-20">तीव्रता</th>
                          <th className="p-2 border text-left">प्रथमोपचार व औषधोपचार</th>
                          <th className="p-2 border text-center w-20">स्थिती</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dossierData.healthIncidents.map((h: any, idx: number) => {
                          const p = dossierData.players.find((pl) => pl.id === h.playerId);
                          const sName = p ? (p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name) : (h.playerName || 'विद्यार्थी');
                          const parsed = parseMedicalLog(h.description);
                          const isCrit = h.severity === 'Critical' || parsed.severity.includes('Severe');
                          return (
                            <tr key={h.id || idx} className="border-b hover:bg-slate-50">
                              <td className="p-2 border text-center font-bold">{idx + 1}</td>
                              <td className="p-2 border font-bold text-primary whitespace-nowrap">
                                {h.date ? format(new Date(h.date), 'dd/MM/yyyy') : '-'}
                              </td>
                              <td className="p-2 border font-bold">{sName}</td>
                              <td className="p-2 border text-center font-bold">{p?.std ? `इ. ${p.std}` : '-'}</td>
                              <td className="p-2 border font-medium">
                                <strong>{parsed.diagnosis}</strong>
                                <span className="block text-[10px] text-muted-foreground">स्थान: {parsed.location}</span>
                              </td>
                              <td className="p-2 border text-center">
                                <Badge className={isCrit ? 'bg-red-500 text-white text-[9px]' : 'bg-emerald-600 text-white text-[9px]'}>
                                  {isCrit ? 'Critical' : 'Minor'}
                                </Badge>
                              </td>
                              <td className="p-2 border text-[11px] font-medium">{parsed.medicine || parsed.protocol || '-'}</td>
                              <td className="p-2 border text-center font-bold text-emerald-700">
                                {h.resolved ? '✓ बरे झाले' : 'उपचार पूर्ण'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t px-4 sm:px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-600">
            आश्रमशाळा कार्यालय, क्रीडा विभाग व मुख्याध्यापक यांच्याकडे सादर करण्यासाठी अधिकृत नस्ती स्वरूप.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl font-bold text-xs"
            >
              बंद करा (Close)
            </Button>
            <Button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase h-10 px-6 rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4 mr-2" /> मुद्रण / PDF
            </Button>
            <Button
              onClick={handleDownloadWord}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase h-10 px-6 rounded-xl shadow-md"
            >
              <Download className="w-4 h-4 mr-2" /> वर्ड फाईल (.DOC)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

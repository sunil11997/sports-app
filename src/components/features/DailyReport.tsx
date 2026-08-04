/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { savePhotoToIDB, getPhotosByDateFromIDB, deletePhotoFromIDB, GeoPhoto } from '@/lib/photo-storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Printer, 
  FileText, 
  AlertTriangle, 
  Users, 
  ClipboardCheck, 
  History, 
  Trophy, 
  Zap, 
  Share2, 
  Plus, 
  Sparkles, 
  Flame, 
  Activity, 
  CheckCircle2,
  Camera,
  MapPin,
  Upload,
  Trash2,
  Crosshair,
  Image as ImageIcon,
  Pencil,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn, parseMedicalLog } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function DailyReport({ store, section, language = 'Marathi', preselectedSport }: { store: any, section: 'sports' | 'general', language?: string, preselectedSport?: string }) {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [manualNotes, setManualSummary] = useState("");
  const [weather, setWeather] = useState("Sunny");

  // Custom Quick Log state
  const [customSport, setCustomSport] = useState(preselectedSport || "Yoga");
  const [customDrill, setCustomDrill] = useState("Surya Namaskar (सूर्य नमस्कार)");
  const [customBoysCount, setCustomBoysCount] = useState<number>(15);
  const [customGirlsCount, setCustomGirlsCount] = useState<number>(15);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Geotagged Photo Upload state
  const [reportPhotos, setReportPhotos] = useState<GeoPhoto[]>([]);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoSport, setPhotoSport] = useState(preselectedSport || "Volleyball");
  const [photoDrill, setPhotoDrill] = useState("Spike & Serve Practice");
  const [currentLat, setCurrentLat] = useState<number | null>(20.5937);
  const [currentLng, setCurrentLng] = useState<number | null>(74.0045);
  const [locationName, setLocationName] = useState("शासकीय माध्यमिक आश्रम शाळा वाघंबा, नाशिक (Lat: 20.5937°, Lng: 74.0045°)");
  const [isLocating, setIsLocating] = useState(false);
  const [previewGeoPhoto, setPreviewGeoPhoto] = useState<GeoPhoto | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);

  const isMarathi = language === 'Marathi';

  useEffect(() => {
    setIsMounted(true);
    setReportDate(format(new Date(), 'yyyy-MM-dd'));
    if (preselectedSport) {
      setCustomSport(preselectedSport);
      setPhotoSport(preselectedSport);
    }
  }, [preselectedSport]);

  // Load photos for selected reportDate from persistent IndexedDB
  useEffect(() => {
    if (typeof window !== 'undefined' && reportDate) {
      getPhotosByDateFromIDB(reportDate).then((photos) => {
        setReportPhotos(photos);
      }).catch(err => {
        console.error('Error loading photos:', err);
      });
    }
  }, [reportDate]);

  // Fetch device live location
  const getDeviceLocation = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setCurrentLat(lat);
          setCurrentLng(lng);
          setLocationName(`वाघंबा, ता. बागलाण, जि. नाशिक (Lat: ${lat}°, Lng: ${lng}°)`);
          setIsLocating(false);
          toast({ title: "GPS सुसज्ज! (GPS Acquired)", description: `Lat: ${lat}, Lng: ${lng}`, className: "bg-emerald-600 text-white font-bold" });
        },
        (err) => {
          setIsLocating(false);
          setCurrentLat(20.5937);
          setCurrentLng(74.0045);
          setLocationName("शासकीय माध्यमिक आश्रम शाळा वाघंबा, नाशिक (Lat: 20.5937°, Lng: 74.0045°)");
          toast({ title: "GPS Fallback Active", description: "शाळा मूळ लोकेशन सेट केले.", variant: "default" });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Process photo file, draw geotag stamp on canvas & save to IndexedDB
  const processAndAddPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize image to max 900px for optimal quality and small storage footprint
        const maxW = 900;
        const scale = Math.min(1, maxW / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw Geotag Banner at bottom with full details
        const bannerHeight = 110 * scale;
        const startY = canvas.height - bannerHeight;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, startY, canvas.width, bannerHeight);

        // Amber top stripe
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, startY, canvas.width, 5 * scale);

        const schoolText = store?.data?.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा';
        
        // Line 1: School & Location Name
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(13, 16 * scale)}px sans-serif`;
        ctx.fillText(`📍 ${schoolText} | ${locationName}`, 16 * scale, startY + (28 * scale));

        // Line 2: Selected Sport & Drill Name
        ctx.fillStyle = '#fde047'; // Amber yellow text
        ctx.font = `bold ${Math.max(12, 15 * scale)}px sans-serif`;
        const activeSport = photoSport || customSport;
        const activeDrill = photoDrill || customDrill;
        ctx.fillText(`🏆 खेळ: ${activeSport}  |  प्रकार: ${activeDrill}`, 16 * scale, startY + (56 * scale));

        // Line 3: GPS Coordinates & Time
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `${Math.max(10, 12 * scale)}px sans-serif`;
        const timeStr = format(new Date(), 'dd MMM yyyy, hh:mm a');
        const latStr = currentLat ? currentLat.toString() : '20.5937';
        const lngStr = currentLng ? currentLng.toString() : '74.0045';
        ctx.fillText(`🌐 GPS: Lat ${latStr}° N, Long ${lngStr}° E  |  🕒 ${timeStr}`, 16 * scale, startY + (84 * scale));

        const stampedUrl = canvas.toDataURL('image/jpeg', 0.80);

        const newPhoto: GeoPhoto = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date: reportDate,
          url: stampedUrl,
          caption: photoCaption || `${activeSport} - ${activeDrill}`,
          sport: activeSport,
          drill: activeDrill,
          lat: currentLat,
          lng: currentLng,
          locationName: locationName,
          timestamp: new Date().toLocaleTimeString()
        };

        // Save persistently to IndexedDB
        await savePhotoToIDB(newPhoto);

        // Update UI state
        setReportPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
        setPhotoCaption("");
        toast({ title: "जिओ-टॅग फोटो जतन झाला! (Geotagged Photo Saved)", description: `${activeSport} photo saved permanently.`, className: "bg-emerald-600 text-white font-bold" });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (id: string) => {
    await deletePhotoFromIDB(id, reportDate);
    setReportPhotos(prev => prev.filter(p => p.id !== id));
    toast({ title: "फोटो हटवला", description: "फोटो अहवालातून काढला." });
  };

  const players = useMemo(() => store?.data?.players || [], [store?.data?.players]);

  // Attendance summary calculated with Boys & Girls count ONLY
  const attendanceCounts = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.attendance) {
      return { morningBoys: 0, morningGirls: 0, morningTotal: 0, eveningBoys: 0, eveningGirls: 0, eveningTotal: 0 };
    }

    let mBoys = 0, mGirls = 0;
    let eBoys = 0, eGirls = 0;

    Object.entries(store.data.attendance).forEach(([key, status]) => {
      if (status === 'P' && key.includes(reportDate)) {
        const playerId = key.split('_')[0];
        const player = players.find((p: any) => p.id === playerId);
        
        // Filter attendance for players matching preselectedSport if set
        if (preselectedSport && (!player?.sports || !player.sports.includes(preselectedSport))) {
          return;
        }

        const gender = player?.gender || 'Male';

        if (key.endsWith('_Morning')) {
          if (gender === 'Male') mBoys++;
          else mGirls++;
        }
        if (key.endsWith('_Evening')) {
          if (gender === 'Male') eBoys++;
          else eGirls++;
        }
      }
    });

    return {
      morningBoys: mBoys,
      morningGirls: mGirls,
      morningTotal: mBoys + mGirls,
      eveningBoys: eBoys,
      eveningGirls: eGirls,
      eveningTotal: eBoys + eGirls
    };
  }, [store?.data?.attendance, players, reportDate, isMounted, preselectedSport]);

  // Drills / Activities completed today grouped by Sport/Category
  const drillGroupedSummary = useMemo(() => {
    if (!isMounted || !reportDate) return { yoga: [], ptMass: [], volleyball: [], khoKho: [], kabaddi: [], other: [], totalConductededCount: 0 };

    const rawCompletions = (store?.data?.drillCompletionsRaw || []).filter((d: any) => 
      d.timestamp?.startsWith(reportDate)
    );

    // Also include custom logged activities for today
    const activitiesToday = (store?.data?.activities || []).filter((a: any) => 
      a.date === reportDate
    );

    const drillMap: Record<string, { sport: string; drill: string; boys: number; girls: number }> = {};

    // Process raw drill completions
    rawCompletions.forEach((d: any) => {
      const sport = d.sportName || d.drillId?.split('_')[0] || 'Sports';
      const lowerSport = sport.toLowerCase();
      // Skip auto completions for Yoga and PT/Mass to avoid total student counts
      if (lowerSport.includes('yoga') || lowerSport.includes('pt') || lowerSport.includes('mass')) return;
      if (preselectedSport && lowerSport !== preselectedSport.toLowerCase()) return;

      const drill = d.drillName || d.drillId?.split('_')[1] || 'Drill';
      const key = `${sport}___${drill}`;

      if (!drillMap[key]) {
        drillMap[key] = { sport, drill, boys: 0, girls: 0 };
      }

      // Check player gender if stored or lookup
      let gender = d.gender;
      if (!gender && d.playerId) {
        const p = players.find((pl: any) => pl.id === d.playerId);
        gender = p?.gender;
      }

      if (gender === 'Female') drillMap[key].girls++;
      else drillMap[key].boys++;
    });

    // Process logged activities
    activitiesToday.forEach((a: any) => {
      const sport = a.type || 'Activity';
      if (preselectedSport && sport.toLowerCase() !== preselectedSport.toLowerCase()) return;

      const drill = a.summary || a.type;
      const key = `${sport}___${drill}`;

      if (!drillMap[key]) {
        drillMap[key] = { 
          sport, 
          drill, 
          boys: parseInt(a.boysCount || '0') || 0, 
          girls: parseInt(a.girlsCount || '0') || 0 
        };
      } else {
        drillMap[key].boys += parseInt(a.boysCount || '0') || 0;
        drillMap[key].girls += parseInt(a.girlsCount || '0') || 0;
      }
    });

    const yoga: any[] = [];
    const ptMass: any[] = [];
    const volleyball: any[] = [];
    const khoKho: any[] = [];
    const kabaddi: any[] = [];
    const other: any[] = [];

    Object.values(drillMap).forEach((item) => {
      const lower = item.sport.toLowerCase();
      if (lower.includes('yoga')) yoga.push(item);
      else if (lower.includes('pt') || lower.includes('mass')) ptMass.push(item);
      else if (lower.includes('volleyball')) volleyball.push(item);
      else if (lower.includes('kho')) khoKho.push(item);
      else if (lower.includes('kabaddi')) kabaddi.push(item);
      else other.push(item);
    });

    const totalConductededCount = yoga.length + ptMass.length + volleyball.length + khoKho.length + kabaddi.length + other.length;

    return { yoga, ptMass, volleyball, khoKho, kabaddi, other, totalConductededCount };
  }, [store?.data?.drillCompletionsRaw, store?.data?.activities, players, reportDate, isMounted, preselectedSport]);

  // Health summary count (NO student names)
  const healthSummaryCounts = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.healthIncidents) return { boys: 0, girls: 0, total: 0, descriptions: [] };
    const healthToday = store.data.healthIncidents.filter((h: any) => {
      if (h.date !== reportDate) return false;
      const p = players.find((player: any) => player.id === h.playerId);
      if (preselectedSport && (!p?.sports || !p.sports.includes(preselectedSport))) return false;
      return true;
    });

    let boys = 0, girls = 0;
    const descriptions: string[] = [];

    healthToday.forEach((h: any) => {
      const p = players.find((player: any) => player.id === h.playerId);
      const gender = p?.gender || 'Male';
      if (gender === 'Female') girls++;
      else boys++;
      if (h.description) descriptions.push(h.description);
    });

    return { boys, girls, total: healthToday.length, descriptions };
  }, [store?.data?.healthIncidents, players, reportDate, isMounted, preselectedSport]);

  // Fitness evaluation counts today
  const fitnessCounts = useMemo(() => {
    if (!isMounted || !reportDate || !store?.data?.fitness) return { boys: 0, girls: 0, total: 0 };
    const fitnessToday = Object.values(store.data.fitness).filter((f: any) => {
      if (f.date !== reportDate) return false;
      const p = players.find((player: any) => player.id === f.playerId);
      if (preselectedSport && (!p?.sports || !p.sports.includes(preselectedSport))) return false;
      return true;
    });
    let boys = 0, girls = 0;
    fitnessToday.forEach((f: any) => {
      const p = players.find((player: any) => player.id === f.playerId);
      if (p?.gender === 'Female') girls++;
      else boys++;
    });
    return { boys, girls, total: fitnessToday.length };
  }, [store?.data?.fitness, players, reportDate, isMounted, preselectedSport]);

  // Handle Quick Add / Edit Activity Log
  const handleAddQuickActivity = () => {
    if (!customDrill || (customBoysCount <= 0 && customGirlsCount <= 0)) {
      toast({ title: "तपशील भरा (Fill Details)", description: "कृपया मुले/मुली संख्या टाका.", variant: "destructive" });
      return;
    }

    const activityId = editingActivityId || `act_${Date.now()}`;
    const activityObj = {
      id: activityId,
      date: reportDate,
      type: customSport,
      summary: customDrill,
      boysCount: customBoysCount.toString(),
      girlsCount: customGirlsCount.toString(),
      totalCount: (customBoysCount + customGirlsCount).toString(),
      category: 'athlete',
      createdAt: new Date().toISOString()
    };

    if (store?.addActivity) {
      store.addActivity(activityObj);
      toast({ 
        title: editingActivityId ? "उपक्रम संपादीत केले! (Log Updated)" : "दैनिक उपक्रम नोंदवले! (Activity Saved)", 
        description: `${customSport}: ${customDrill} (मुले: ${customBoysCount}, मुली: ${customGirlsCount})`, 
        className: "bg-emerald-600 text-white font-bold" 
      });
      setEditingActivityId(null);
    }
  };

  // Printable HTML Generator with Devanagari Marathi Header & NO Student Names
  // Printable HTML Generator with Formal Letterhead Double Border Box & Devanagari Marathi Layout
  const handlePrint = () => {
    if (!reportDate) return;
    
    const schoolNameMarathi = store?.data?.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक';
    const teacherName = store?.data?.schoolProfile?.teacherName || 'Teacher Sunil Deshmukh';

    const formatActivityTable = (items: any[], titleMarathi: string, titleEnglish: string) => {
      if (!items || items.length === 0) {
        return '<div class="empty-msg">आज ' + titleMarathi + ' प्रकार आयोजित केले नाहीत / नोंदवलेले नाहीत.</div>';
      }
      let html = '<table class="report-table"><thead><tr><th>अनु.क्र. (Sr)</th><th>प्रकार / प्रकाराचे नाव (Activity / Asana)</th><th>मुले (Boys)</th><th>मुली (Girls)</th><th>एकूण (Total)</th></tr></thead><tbody>';
      items.forEach((item, index) => {
        const total = item.boys + item.girls;
        html += '<tr><td style="text-align: center; font-weight: 800;">' + (index + 1) + '</td><td><strong>' + item.drill + '</strong></td><td style="text-align: center; color: #1e3a8a; font-weight: 800;">' + item.boys + '</td><td style="text-align: center; color: #ec4899; font-weight: 800;">' + item.girls + '</td><td style="text-align: center; color: #0f172a; font-weight: 900;">' + total + '</td></tr>';
      });
      html += '</tbody></table>';
      return html;
    };

    let secNum = 2;
    let activitiesSectionsHtml = '';

    if (drillGroupedSummary.yoga.length > 0) {
      activitiesSectionsHtml += '<h3>' + secNum + '. योगासन व प्राणायाम सत्र (Yoga & Pranayama Session)</h3>';
      secNum++;
      activitiesSectionsHtml += formatActivityTable(drillGroupedSummary.yoga, 'योगासन', 'Yoga');
    }
    if (drillGroupedSummary.ptMass.length > 0) {
      activitiesSectionsHtml += '<h3>' + secNum + '. पी. टी. मास व कवायत प्रकार (PT Mass Exercises)</h3>';
      secNum++;
      activitiesSectionsHtml += formatActivityTable(drillGroupedSummary.ptMass, 'पी.टी. मास', 'PT Mass');
    }
    if (drillGroupedSummary.volleyball.length > 0) {
      activitiesSectionsHtml += '<h3>' + secNum + '. वॉलीबॉल क्रीडा व ड्रिल्स (Volleyball Session & Drills)</h3>';
      secNum++;
      activitiesSectionsHtml += formatActivityTable(drillGroupedSummary.volleyball, 'वॉलीबॉल', 'Volleyball');
    }
    if (drillGroupedSummary.khoKho.length > 0) {
      activitiesSectionsHtml += '<h3>' + secNum + '. खो-खो क्रीडा व ड्रिल्स (Kho Kho Session & Drills)</h3>';
      secNum++;
      activitiesSectionsHtml += formatActivityTable(drillGroupedSummary.khoKho, 'खो-खो', 'Kho Kho');
    }
    if (drillGroupedSummary.kabaddi.length > 0) {
      activitiesSectionsHtml += '<h3>' + secNum + '. कबड्डी क्रीडा व ड्रिल्स (Kabaddi Session & Drills)</h3>';
      secNum++;
      activitiesSectionsHtml += formatActivityTable(drillGroupedSummary.kabaddi, 'कबड्डी', 'Kabaddi');
    }
    if (drillGroupedSummary.other.length > 0) {
      activitiesSectionsHtml += '<h3>' + secNum + '. इतर आयोजित खेळ ड्रिल्स (Other Conducted Sports & Drills)</h3>';
      secNum++;
      activitiesSectionsHtml += formatActivityTable(drillGroupedSummary.other, 'खेळ ड्रिल्स', 'Sports Drills');
    }

    if (activitiesSectionsHtml === '') {
      activitiesSectionsHtml = '<h3>' + secNum + '. आयोजित खेळ व उपक्रम (Conducted Activities)</h3><div class="empty-msg">आज कोणतेही खेळ किंवा योगा उपक्रम नोंदवलेले नाहीत.</div>';
      secNum++;
    }

    const healthToday = (store?.data?.healthIncidents || []).filter((h: any) => h.date === reportDate);
    
    let medicalLogHtml = '<h3>' + secNum + '. आरोग्य व वैद्यकीय स्वास्थ लॉग (Professional Medical Audit Log)</h3>';
    secNum++;
    medicalLogHtml += '<div class="medical-box">';
    medicalLogHtml += '<div class="card-numbers" style="margin-bottom: 8px;">';
    medicalLogHtml += '<div class="num-item"><span style="color: #1e3a8a;">बाधित मुले:</span> <strong style="font-size: 15px; color: #1e3a8a;">' + healthSummaryCounts.boys + '</strong></div>';
    medicalLogHtml += '<div class="num-item"><span style="color: #ec4899;">बाधित मुली:</span> <strong style="font-size: 15px; color: #ec4899;">' + healthSummaryCounts.girls + '</strong></div>';
    medicalLogHtml += '<div class="num-item"><span style="color: #b45309;">एकूण तक्रारी:</span> <strong style="font-size: 15px; color: #b45309;">' + healthSummaryCounts.total + '</strong></div>';
    medicalLogHtml += '</div>';

    if (healthToday.length === 0) {
      medicalLogHtml += '<div class="empty-msg" style="padding: 6px;">आज कोणतीही वैद्यकीय तक्रार किंवा आरोग्य अडचण नोंदवली गेली नाही. (All Healthy)</div>';
    } else {
      medicalLogHtml += '<table class="report-table" style="margin-top: 8px;">';
      medicalLogHtml += '<thead><tr><th>अनु.क्र.</th><th>विद्यार्थ्याचे नाव</th><th>ठिकाण (Location)</th><th>दुखापत (Diagnosis)</th><th>तीव्रता</th><th>प्रथमोपचार व औषधोपचार (First Aid / Protocol)</th></tr></thead><tbody>';
      healthToday.forEach((inc: any, i: number) => {
        const p = players.find((pl: any) => pl.id === inc.playerId);
        const pName = p ? (p.nameMarathi || p.name) : (inc.playerName || 'Student');
        const parsed = parseMedicalLog(inc.description);
        const isCrit = inc.severity === 'Critical' || parsed.severity.includes('Severe');
        const sevColor = isCrit ? '#dc2626' : '#2563eb';
        medicalLogHtml += '<tr>';
        medicalLogHtml += '<td style="text-align: center; font-weight: 800;">' + (i + 1) + '</td>';
        medicalLogHtml += '<td><strong>' + pName + '</strong></td>';
        medicalLogHtml += '<td>' + parsed.location + '</td>';
        medicalLogHtml += '<td>' + parsed.diagnosis + '</td>';
        medicalLogHtml += '<td><span style="color: ' + sevColor + '; font-weight: 800;">' + parsed.severity + '</span></td>';
        medicalLogHtml += '<td style="font-size: 11px;">' + (parsed.medicine || parsed.protocol) + '</td>';
        medicalLogHtml += '</tr>';
      });
      medicalLogHtml += '</tbody></table>';
    }
    medicalLogHtml += '</div>';

    const remarksHeader = '<h3>' + secNum + '. मार्गदर्शक / शिक्षकांचे निरीक्षण व शेरा (Instructor Remarks)</h3>';
    secNum++;

    let photosHtml = '';
    if (reportPhotos.length > 0) {
      photosHtml += '<h3>' + secNum + '. जिओ-टॅग केलेले दैनिक फोटो (Geotagged Activity Photos)</h3>';
      secNum++;
      photosHtml += '<div class="photo-grid">';
      reportPhotos.forEach(p => {
        const sportLabel = p.sport || 'Sports';
        const drillLabel = p.drill ? ('- ' + p.drill) : '';
        const latVal = p.lat || 20.5937;
        const lngVal = p.lng || 74.0045;
        photosHtml += '<div class="photo-card">';
        photosHtml += '<img src="' + p.url + '" />';
        photosHtml += '<div style="font-size: 11px; font-weight: 800; color: #1e3a8a; margin-top: 4px;">' + p.caption + '</div>';
        photosHtml += '<div style="font-size: 9.5px; color: #d97706; font-weight: 800;">🏆 ' + sportLabel + ' ' + drillLabel + '</div>';
        photosHtml += '<div style="font-size: 9px; color: #475569; font-weight: 700;">📍 GPS: Lat ' + latVal + '°, Long ' + lngVal + '°</div>';
        photosHtml += '</div>';
      });
      photosHtml += '</div>';
    }

    const notesContent = manualNotes || 'आजचे क्रीडा, योगा व शारीरिक शिक्षण सत्र नियोजनानुसार पार पडले. सर्व विद्यार्थी उपक्रमात उत्साहाने सहभागी झाले.';
    const formattedReportDate = reportDate ? format(new Date(reportDate), 'dd-MM-yyyy') : '---';

    const printContent = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8" />',
      '<title>Daily Report - ' + reportDate + '</title>',
      '<style>',
      '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap");',
      '* { box-sizing: border-box; }',
      '@media print {',
      '  @page { size: A4 portrait; margin: 8mm; }',
      '  .no-print { display: none !important; }',
      '  html, body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
      '  .paper {',
      '    width: 100% !important;',
      '    max-width: 100% !important;',
      '    border: 3.5px double #1e3a8a !important;',
      '    box-shadow: none !important;',
      '    padding: 16px !important;',
      '    margin: 0 !important;',
      '    background: #ffffff !important;',
      '    -webkit-print-color-adjust: exact !important;',
      '    print-color-adjust: exact !important;',
      '  }',
      '  .letter-inner-frame { border: 1px solid #1e3a8a !important; padding: 14px !important; }',
      '  h3, .meta-grid, .stat-cards, .card-box, .report-table, .notes-box, .photo-card, .footer-sign, .medical-box { page-break-inside: avoid !important; break-inside: avoid !important; }',
      '}',
      'body { font-family: "Noto Sans Devanagari", "Inter", sans-serif; padding: 24px; line-height: 1.5; color: #0f172a; background: #f1f5f9; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
      '.paper { max-width: 840px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 4px double #1e3a8a; position: relative; }',
      '.letter-inner-frame { border: 1px solid #1e3a8a; padding: 18px; border-radius: 2px; }',
      '.ref-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #1e3a8a; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 14px; text-transform: uppercase; }',
      '.header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px; }',
      '.govt-sub { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }',
      '.school-name { font-size: 20px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; }',
      '.report-title { font-size: 14px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; background: #fef3c7; border: 1.5px solid #f59e0b; padding: 5px 16px; display: inline-block; border-radius: 4px; }',
      '.sub-header { font-size: 10.5px; font-weight: 700; color: #475569; margin-top: 6px; }',
      '.meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; border: 1.5px solid #1e3a8a; padding: 10px 14px; border-radius: 6px; margin-bottom: 20px; font-size: 11.5px; font-weight: 700; }',
      'h3 { color: #1e3a8a !important; font-size: 12.5px !important; font-weight: 900 !important; background: #eff6ff !important; border: 1.5px solid #bfdbfe !important; border-left: 5px solid #1e3a8a !important; padding: 6px 12px !important; margin-top: 20px !important; margin-bottom: 10px !important; text-transform: uppercase !important; border-radius: 4px !important; }',
      '.stat-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px; }',
      '.card-box { background: #ffffff; border: 1.5px solid #1e3a8a; border-radius: 6px; padding: 12px; margin-bottom: 10px; }',
      '.card-title { font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-align: center; }',
      '.card-numbers { display: flex; justify-content: space-around; text-align: center; }',
      '.num-item { font-size: 11.5px; font-weight: 800; border: 1px solid #64748b; padding: 4px 10px; border-radius: 4px; background: #f8fafc; min-width: 65px; }',
      '.num-val { font-size: 17px; font-weight: 900; }',
      '.report-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 14px; font-size: 11.5px; }',
      '.report-table th, .report-table td { border: 1.5px solid #1e3a8a !important; padding: 7px 10px; text-align: left; }',
      '.report-table th { background: #1e3a8a !important; color: #ffffff !important; font-weight: 800; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.3px; }',
      '.report-table tr:nth-child(even) { background: #f8fafc; }',
      '.empty-msg { background: #f8fafc; border: 1.5px dashed #64748b; padding: 10px; text-align: center; border-radius: 6px; font-size: 11.5px; color: #475569; font-style: italic; font-weight: 700; }',
      '.medical-box { background: #fff5f5; border: 1.5px solid #dc2626; border-radius: 6px; padding: 12px; margin-bottom: 12px; }',
      '.notes-box { background: #fffdf5; border: 1.5px solid #b45309; padding: 12px 14px; border-radius: 6px; font-size: 11.5px; line-height: 1.6; min-height: 60px; margin-bottom: 16px; font-weight: 600; color: #1e293b; }',
      '.photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }',
      '.photo-card { border: 1.5px solid #1e3a8a; border-radius: 6px; overflow: hidden; background: #ffffff; text-align: center; padding: 6px; }',
      '.photo-card img { width: 100%; height: 180px; object-fit: contain; background: #0f172a; border-radius: 4px; border: 1px solid #cbd5e1; }',
      '.footer-sign { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10px; page-break-inside: avoid; break-inside: avoid; }',
      '.sign-block { text-align: center; border: 1.5px dashed #1e3a8a; background: #f8fafc; border-radius: 6px; width: 230px; padding: 10px; font-size: 11px; font-weight: 800; }',
      '.stamp-box { border: 1px dashed #94a3b8; width: 54px; height: 54px; border-radius: 50%; margin: 6px auto; line-height: 54px; font-size: 8px; color: #94a3b8; text-transform: uppercase; }',
      '.print-bar { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }',
      '.btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 12px; border: none; transition: all 0.2s; }',
      '.btn-back { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }',
      '.btn-print { background: #f59e0b; color: #fff; font-weight: 900; }',
      '</style>',
      '</head>',
      '<body style="padding-top: 70px;">',
      '<div class="no-print print-bar">',
      '<button onclick="window.close()" class="btn btn-back">← मागे जा (Go Back)</button>',
      '<button onclick="window.print()" class="btn btn-print">🖨️ प्रिंट / पीडीएफ डाउनलोड (PRINT PDF)</button>',
      '</div>',
      '<div class="paper">',
      '<div class="letter-inner-frame">',
      '<div class="ref-row">',
      '<div>जावक क्र. (OUTWARD REF NO): शामाआशा/वाघंबा/२०२६/_______</div>',
      '<div>दिनांक (DATE): ' + formattedReportDate + '</div>',
      '</div>',
      '<div class="header">',
      '<div class="govt-sub">महाराष्ट्र शासन • आदिवासी विकास विभाग</div>',
      '<div class="school-name">' + schoolNameMarathi + '</div>',
      '<div class="report-title">दैनिक क्रीडा, योगा व शारीरिक शिक्षण अहवाल</div>',
      '<div class="sub-header">(DAILY ACTIVITY & PHYSICAL EDUCATION OFFICIAL REPORT)</div>',
      '</div>',
      '<div class="meta-grid">',
      '<div>📅 तारीख (Date): <strong>' + formattedReportDate + '</strong></div>',
      '<div>🌤️ हवामान (Weather): <strong>' + weather + '</strong></div>',
      '<div>👨‍🏫 क्रीडा मार्गदर्शक: <strong>' + teacherName + '</strong></div>',
      '</div>',
      '<h3>१. संस्थात्मक उपस्थिती अहवाल (Attendance Summary)</h3>',
      '<div class="stat-cards">',
      '<div class="card-box">',
      '<div class="card-title">☀️ सकाळ सत्र (Morning Session)</div>',
      '<div class="card-numbers">',
      '<div class="num-item"><span style="color: #1e3a8a;">मुले:</span> <div class="num-val" style="color: #1e3a8a;">' + attendanceCounts.morningBoys + '</div></div>',
      '<div class="num-item"><span style="color: #ec4899;">मुली:</span> <div class="num-val" style="color: #ec4899;">' + attendanceCounts.morningGirls + '</div></div>',
      '<div class="num-item"><span style="color: #0f172a;">एकूण:</span> <div class="num-val">' + attendanceCounts.morningTotal + '</div></div>',
      '</div>',
      '</div>',
      '<div class="card-box">',
      '<div class="card-title">🌙 संध्याकाळ सत्र (Evening Session)</div>',
      '<div class="card-numbers">',
      '<div class="num-item"><span style="color: #1e3a8a;">मुले:</span> <div class="num-val" style="color: #1e3a8a;">' + attendanceCounts.eveningBoys + '</div></div>',
      '<div class="num-item"><span style="color: #ec4899;">मुली:</span> <div class="num-val" style="color: #ec4899;">' + attendanceCounts.eveningGirls + '</div></div>',
      '<div class="num-item"><span style="color: #0f172a;">एकूण:</span> <div class="num-val">' + attendanceCounts.eveningTotal + '</div></div>',
      '</div>',
      '</div>',
      '</div>',
      activitiesSectionsHtml,
      medicalLogHtml,
      remarksHeader,
      '<div class="notes-box">' + notesContent + '</div>',
      photosHtml,
      '<div class="footer-sign">',
      '<div class="sign-block"><img src="' + TEACHER_SIGN_B64 + '" alt="Teacher Signature" style="height:48px;max-width:180px;object-fit:contain;margin-bottom:4px;" /><div>क्रीडा शिक्षक स्वाक्षरी</div><div style="font-size: 10px; color: #475569; margin-top: 2px;">(' + teacherName + ')</div></div>',
      '<div class="sign-block"><div class="stamp-box">शिक्का</div><div>मुख्याध्यापक स्वाक्षरी</div><div style="font-size: 10px; color: #475569; margin-top: 2px;">(शासकीय माध्यमिक आश्रम शाळा वाघंबा)</div></div>',
      '</div>',
      '</div>',
      '</div>',
      '</body>',
      '</html>'
    ].join('\n');
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
  };

  // WhatsApp School Group Formatted Text Sharing
  const handleShareWhatsApp = () => {
    const schoolName = store?.data?.schoolProfile?.schoolName || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा ता. बागलाण जि. नाशिक';
    const formattedDate = reportDate ? format(new Date(reportDate), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

    const lines: string[] = [];
    lines.push("🚩 *" + schoolName + "* 🚩");
    lines.push("📋 *दैनिक क्रीडा, योगा व पी.टी. अहवाल*");
    lines.push("📅 तारीख: *" + formattedDate + "*\n");

    lines.push("👥 *१. संस्थात्मक उपस्थिती:*");
    lines.push("• सकाळ सत्र: मुले: " + attendanceCounts.morningBoys + ", मुली: " + attendanceCounts.morningGirls + " (एकूण: " + attendanceCounts.morningTotal + ")");
    lines.push("• संध्याकाळ सत्र: मुले: " + attendanceCounts.eveningBoys + ", मुली: " + attendanceCounts.eveningGirls + " (एकूण: " + attendanceCounts.eveningTotal + ")\n");

    let itemNo = 2;

    if (drillGroupedSummary.yoga.length > 0) {
      lines.push("🧘 *" + itemNo + ". योगासन सत्र:*");
      itemNo++;
      drillGroupedSummary.yoga.forEach((item: any) => {
        lines.push("• " + item.drill + ": मुले: " + item.boys + ", मुली: " + item.girls + " (एकूण: " + (item.boys + item.girls) + ")");
      });
      lines.push("");
    }

    if (drillGroupedSummary.ptMass.length > 0) {
      lines.push("🏃 *" + itemNo + ". पी.टी. मास कवायत:*");
      itemNo++;
      drillGroupedSummary.ptMass.forEach((item: any) => {
        lines.push("• " + item.drill + ": मुले: " + item.boys + ", मुली: " + item.girls + " (एकूण: " + (item.boys + item.girls) + ")");
      });
      lines.push("");
    }

    if (drillGroupedSummary.volleyball.length > 0) {
      lines.push("🏐 *" + itemNo + ". वॉलीबॉल सत्र:*");
      itemNo++;
      drillGroupedSummary.volleyball.forEach((item: any) => {
        lines.push("• " + item.drill + ": मुले: " + item.boys + ", मुली: " + item.girls + " (एकूण: " + (item.boys + item.girls) + ")");
      });
      lines.push("");
    }

    if (drillGroupedSummary.khoKho.length > 0) {
      lines.push("🏃 *" + itemNo + ". खो-खो सत्र:*");
      itemNo++;
      drillGroupedSummary.khoKho.forEach((item: any) => {
        lines.push("• " + item.drill + ": मुले: " + item.boys + ", मुली: " + item.girls + " (एकूण: " + (item.boys + item.girls) + ")");
      });
      lines.push("");
    }

    if (drillGroupedSummary.kabaddi.length > 0) {
      lines.push("🤼 *" + itemNo + ". कबड्डी सत्र:*");
      itemNo++;
      drillGroupedSummary.kabaddi.forEach((item: any) => {
        lines.push("• " + item.drill + ": मुले: " + item.boys + ", मुली: " + item.girls + " (एकूण: " + (item.boys + item.girls) + ")");
      });
      lines.push("");
    }

    if (drillGroupedSummary.other.length > 0) {
      lines.push("🏆 *" + itemNo + ". इतर खेळ ड्रिल्स:*");
      itemNo++;
      drillGroupedSummary.other.forEach((item: any) => {
        lines.push("• " + item.drill + ": मुले: " + item.boys + ", मुली: " + item.girls + " (एकूण: " + (item.boys + item.girls) + ")");
      });
      lines.push("");
    }

    lines.push("🏥 *" + itemNo + ". आरोग्य अहवाल:*");
    itemNo++;
    lines.push("• तक्रारी: मुले: " + healthSummaryCounts.boys + ", मुली: " + healthSummaryCounts.girls + " (एकूण: " + healthSummaryCounts.total + ")\n");

    if (reportPhotos.length > 0) {
      lines.push("📸 *" + itemNo + ". जिओ-टॅग फोटो:* " + reportPhotos.length + " फोटो जोडले (GPS Stamp सह)\n");
      itemNo++;
    }

    if (manualNotes) {
      lines.push("📝 *शेरा:* " + manualNotes + "\n");
    }

    const teacher = store?.data?.schoolProfile?.teacherName || 'Sunil Deshmukh';
    lines.push("✍️ *क्रीडा मार्गदर्शक:* " + teacher);

    const text = lines.join('\n');
    const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20" suppressHydrationWarning>
      {/* Top Banner */}
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-3 text-center lg:text-left">
            <Badge className="bg-primary text-white text-[10px] font-black uppercase px-4 py-1 tracking-widest">
              Daily Auto-Report Engine
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight flex items-center justify-center lg:justify-start gap-3">
              <FileText className="w-9 h-9 text-amber-500" /> दैनिक अहवाल (Daily Report)
            </h2>
            <p className="text-sm font-semibold text-foreground/70">
              शाळेचे नाव मराठीत, योगा, पी.टी. मास व कबड्डी ड्रिल्सच्या मुले/मुलींच्या संख्येचा स्वयंचलित अहवाल.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-primary uppercase ml-2 tracking-widest">निवडा तारीख (Date)</label>
              <Input 
                type="date" 
                value={reportDate} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportDate(e.target.value)} 
                className="rounded-2xl border-2 h-12 font-black shadow-sm bg-white" 
              />
            </div>
            
            <div className="flex gap-2 self-end">
              <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white h-12 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg active-scale px-6">
                <Printer className="w-4 h-4 mr-2" /> प्रिंट / PDF
              </Button>
              <Button onClick={handleShareWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg active-scale px-6">
                <Share2 className="w-4 h-4 mr-2" /> शाळा ग्रुप
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-blue-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full">सकाळ सत्र (Morning)</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{attendanceCounts.morningBoys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{attendanceCounts.morningGirls}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
              <p className="text-[9px] font-bold text-slate-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-slate-900">{attendanceCounts.morningTotal}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">संध्याकाळ सत्र (Evening)</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{attendanceCounts.eveningBoys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{attendanceCounts.eveningGirls}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
              <p className="text-[9px] font-bold text-slate-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-slate-900">{attendanceCounts.eveningTotal}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-emerald-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">फिटनेस मूल्यमापन</span>
            <Zap className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{fitnessCounts.boys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{fitnessCounts.girls}</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <p className="text-[9px] font-bold text-emerald-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-emerald-900">{fitnessCounts.total}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-[2rem] p-6 bg-white shadow-md border-amber-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full">आरोग्य तक्रारी</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">मुले</p>
              <p className="text-xl font-black text-blue-800">{healthSummaryCounts.boys}</p>
            </div>
            <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100">
              <p className="text-[9px] font-bold text-pink-600 uppercase">मुली</p>
              <p className="text-xl font-black text-pink-800">{healthSummaryCounts.girls}</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <p className="text-[9px] font-bold text-amber-600 uppercase">एकूण</p>
              <p className="text-xl font-black text-amber-900">{healthSummaryCounts.total}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left Column for Recorded Activities, Right Column for Quick Add & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recorded Activities Breakdown */}
        <div className="lg:col-span-8 space-y-8">
          
          {drillGroupedSummary.totalConductededCount === 0 ? (
            <Card className="border-2 border-dashed rounded-[2.5rem] bg-slate-50/50 p-10 text-center space-y-3">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto opacity-50" />
              <h3 className="font-black text-slate-800 text-base uppercase">आज कोणतेही खेळ किंवा योगा उपक्रम नोंदवलेले नाहीत</h3>
              <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                (No Conducted Activities Recorded Today) - उजवीकडील &quot;त्वरित उपक्रम नोंदवा&quot; कार्डवरून वॉलीबॉल, खो-खो, योगा, किंवा पी.टी. मास नोंदवा.
              </p>
            </Card>
          ) : (
            <>
              {/* Yoga Activities Section */}
              {drillGroupedSummary.yoga.length > 0 && (
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
                  <CardHeader className="bg-indigo-50/60 border-b p-6 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" /> योगासन व प्राणायाम सत्र (Yoga & Pranayama)
                    </CardTitle>
                    <Badge variant="outline" className="font-bold border-indigo-200 text-indigo-700 bg-white">
                      {drillGroupedSummary.yoga.length} उपक्रम प्रकार
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {drillGroupedSummary.yoga.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                        <div>
                          <p className="font-black text-sm text-indigo-950 uppercase">{item.drill}</p>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">{item.sport}</p>
                        </div>
                        <div className="flex gap-3 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                            <span className="text-blue-900 font-black">{item.boys}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                            <span className="text-pink-900 font-black">{item.girls}</span>
                          </div>
                          <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                            <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                            <span className="font-black">{item.boys + item.girls}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* PT Mass Exercises Section */}
              {drillGroupedSummary.ptMass.length > 0 && (
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
                  <CardHeader className="bg-teal-50/60 border-b p-6 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-teal-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" /> पी. टी. मास व कवायत (PT Mass Exercises)
                    </CardTitle>
                    <Badge variant="outline" className="font-bold border-teal-200 text-teal-700 bg-white">
                      {drillGroupedSummary.ptMass.length} कवायत प्रकार
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {drillGroupedSummary.ptMass.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-teal-50/30 rounded-2xl border border-teal-100">
                        <div>
                          <p className="font-black text-sm text-teal-950 uppercase">{item.drill}</p>
                          <p className="text-[10px] font-bold text-teal-600 uppercase mt-0.5">{item.sport}</p>
                        </div>
                        <div className="flex gap-3 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                            <span className="text-blue-900 font-black">{item.boys}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                            <span className="text-pink-900 font-black">{item.girls}</span>
                          </div>
                          <div className="bg-teal-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                            <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                            <span className="font-black">{item.boys + item.girls}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Volleyball Section */}
              {drillGroupedSummary.volleyball.length > 0 && (
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-sky-100">
                  <CardHeader className="bg-sky-50/60 border-b p-6 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-sky-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-sky-600" /> वॉलीबॉल सत्र व ड्रिल्स (Volleyball)
                    </CardTitle>
                    <Badge variant="outline" className="font-bold border-sky-200 text-sky-700 bg-white">
                      {drillGroupedSummary.volleyball.length} ड्रिल्स
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {drillGroupedSummary.volleyball.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-sky-50/30 rounded-2xl border border-sky-100">
                        <div>
                          <p className="font-black text-sm text-sky-950 uppercase">{item.drill}</p>
                          <p className="text-[10px] font-bold text-sky-600 uppercase mt-0.5">{item.sport}</p>
                        </div>
                        <div className="flex gap-3 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                            <span className="text-blue-900 font-black">{item.boys}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                            <span className="text-pink-900 font-black">{item.girls}</span>
                          </div>
                          <div className="bg-sky-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                            <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                            <span className="font-black">{item.boys + item.girls}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Kho Kho Section */}
              {drillGroupedSummary.khoKho.length > 0 && (
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-orange-100">
                  <CardHeader className="bg-orange-50/60 border-b p-6 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-orange-900 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-600" /> खो-खो सत्र व ड्रिल्स (Kho Kho)
                    </CardTitle>
                    <Badge variant="outline" className="font-bold border-orange-200 text-orange-700 bg-white">
                      {drillGroupedSummary.khoKho.length} ड्रिल्स
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {drillGroupedSummary.khoKho.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-orange-100">
                        <div>
                          <p className="font-black text-sm text-orange-950 uppercase">{item.drill}</p>
                          <p className="text-[10px] font-bold text-orange-600 uppercase mt-0.5">{item.sport}</p>
                        </div>
                        <div className="flex gap-3 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                            <span className="text-blue-900 font-black">{item.boys}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                            <span className="text-pink-900 font-black">{item.girls}</span>
                          </div>
                          <div className="bg-orange-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                            <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                            <span className="font-black">{item.boys + item.girls}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Kabaddi Section */}
              {drillGroupedSummary.kabaddi.length > 0 && (
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-amber-100">
                  <CardHeader className="bg-amber-50/60 border-b p-6 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-600" /> कबड्डी सत्र व ड्रिल्स (Kabaddi)
                    </CardTitle>
                    <Badge variant="outline" className="font-bold border-amber-200 text-amber-700 bg-white">
                      {drillGroupedSummary.kabaddi.length} ड्रिल्स
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {drillGroupedSummary.kabaddi.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
                        <div>
                          <p className="font-black text-sm text-amber-950 uppercase">{item.drill}</p>
                          <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">{item.sport}</p>
                        </div>
                        <div className="flex gap-3 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                            <span className="text-blue-900 font-black">{item.boys}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                            <span className="text-pink-900 font-black">{item.girls}</span>
                          </div>
                          <div className="bg-amber-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                            <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                            <span className="font-black">{item.boys + item.girls}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Other Sports Section */}
              {drillGroupedSummary.other.length > 0 && (
                <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-slate-200">
                  <CardHeader className="bg-slate-50/60 border-b p-6 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-slate-600" /> इतर खेळ व ड्रिल्स (Other Conducted Games)
                    </CardTitle>
                    <Badge variant="outline" className="font-bold border-slate-300 text-slate-700 bg-white">
                      {drillGroupedSummary.other.length} ड्रिल्स
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {drillGroupedSummary.other.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                        <div>
                          <p className="font-black text-sm text-slate-950 uppercase">{item.drill}</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase mt-0.5">{item.sport}</p>
                        </div>
                        <div className="flex gap-3 text-center">
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-blue-600 text-[10px] block font-black uppercase">मुले</span>
                            <span className="text-blue-900 font-black">{item.boys}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border font-bold text-xs">
                            <span className="text-pink-600 text-[10px] block font-black uppercase">मुली</span>
                            <span className="text-pink-900 font-black">{item.girls}</span>
                          </div>
                          <div className="bg-slate-800 text-white px-4 py-1.5 rounded-xl font-bold text-xs flex flex-col justify-center">
                            <span className="text-[9px] block uppercase opacity-80">एकूण</span>
                            <span className="font-black">{item.boys + item.girls}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Geotagged Activity Photos Display Section */}
          {reportPhotos.length > 0 && (
            <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-indigo-200">
              <CardHeader className="bg-slate-900 p-6 text-white flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" /> जिओ-टॅग केलेले दैनिक छायाचित्रे ({reportPhotos.length} Photos)
                </CardTitle>
                <Badge className="bg-emerald-500 text-white font-black text-[9px] uppercase px-3 py-1">
                  GPS Location Verified
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-950 shadow-md">
                      <img src={photo.url} alt={photo.caption} className="w-full h-52 object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-3 right-3 bg-red-600/90 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        title="हटवा"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 p-3 text-white backdrop-blur-xs border-t border-amber-500/40">
                        <p className="font-black text-sm tracking-tight text-white">{photo.caption}</p>
                        <p className="text-[10px] font-bold text-amber-400">🏆 {photo.sport || 'Sports'} {photo.drill ? ('- ' + photo.drill) : ''}</p>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-300 mt-1">
                          <span className="truncate max-w-[200px]">📍 {photo.locationName}</span>
                          <span>🕒 {photo.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Geotagged Photos, Quick Logger & Instructor Remarks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Geotagged Photo Upload Card */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" /> जिओ-टॅग फोटो (Geotag Photo)
                </span>
                <Badge className="bg-amber-500 text-slate-950 font-black text-[9px]">
                  {reportPhotos.length} Photos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> GPS लोकेशन स्थिती:
                  </span>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    onClick={getDeviceLocation}
                    disabled={isLocating}
                    className="h-8 rounded-xl text-[9px] font-black border-blue-300 text-blue-800 hover:bg-blue-100"
                  >
                    <Crosshair className={cn("w-3 h-3 mr-1", isLocating && "animate-spin")} /> 
                    {isLocating ? "GPS..." : "GPS अपडेट"}
                  </Button>
                </div>
                <p className="text-[10px] font-bold text-slate-700 bg-white p-2 rounded-xl border border-blue-100 truncate">
                  📍 {locationName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">खेळ (Sport)</label>
                  <Select value={photoSport} onValueChange={(val) => {
                    setPhotoSport(val);
                    if (val === 'Volleyball') setPhotoDrill("Spike & Serve Practice");
                    else if (val === 'Kho Kho') setPhotoDrill("Pole Dive & Chasing Drill");
                    else if (val === 'Kabaddi') setPhotoDrill("Raid Touch & Toe Touch Drill");
                    else if (val === 'Yoga') setPhotoDrill("Surya Namaskar & Asana");
                    else if (val === 'PT Mass') setPhotoDrill("Mass PT Exercise No 1");
                    else setPhotoDrill("Physical Activity & Training");
                  }}>
                    <SelectTrigger className="h-10 rounded-xl border-2 font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Kho Kho">Kho Kho</SelectItem>
                      <SelectItem value="Kabaddi">Kabaddi</SelectItem>
                      <SelectItem value="Yoga">Yoga & Pranayama</SelectItem>
                      <SelectItem value="PT Mass">PT Mass Exercises</SelectItem>
                      <SelectItem value="Athletics">Athletics / Running</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">ड्रिल (Drill)</label>
                  <Input 
                    value={photoDrill} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhotoDrill(e.target.value)} 
                    placeholder="उदा. Spike & Serve" 
                    className="h-10 rounded-xl border-2 font-bold text-xs" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">फोटो वर्णन (Caption)</label>
                <Input 
                  value={photoCaption} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhotoCaption(e.target.value)} 
                  placeholder="उदा. सकाळचे वॉलीबॉल सर्व्हिस सत्र" 
                  className="h-12 rounded-xl border-2 font-bold text-sm" 
                />
              </div>

              {/* Hidden Inputs for Camera and File selection */}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={cameraInputRef} 
                className="hidden" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files?.[0]) {
                    processAndAddPhoto(e.target.files[0]);
                    e.target.value = '';
                  }
                }} 
              />
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files?.[0]) {
                    processAndAddPhoto(e.target.files[0]);
                    e.target.value = '';
                  }
                }} 
              />

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  onClick={() => cameraInputRef.current?.click()} 
                  className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-md"
                >
                  <Camera className="w-4 h-4 mr-1.5" /> फोटो काढा
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()} 
                  className="h-12 border-2 border-indigo-200 text-indigo-900 hover:bg-indigo-50 rounded-xl font-black uppercase text-xs tracking-wider"
                >
                  <Upload className="w-4 h-4 mr-1.5" /> गॅलरी निवडा
                </Button>
              </div>

              {/* Uploaded Geotagged Photos Gallery Preview */}
              {reportPhotos.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">आजचे जिओ-टॅग फोटो ({reportPhotos.length})</p>
                  <div className="grid grid-cols-2 gap-3">
                    {reportPhotos.map((photo) => (
                      <div 
                        key={photo.id} 
                        onClick={() => setPreviewGeoPhoto(photo)}
                        className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all flex items-center justify-center min-h-[120px]"
                        title="संपूर्ण फोटो पाहण्यासाठी क्लिक करा (Click to view full photo)"
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.caption} 
                          className="w-full h-32 object-contain group-hover:scale-105 transition-transform" 
                        />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.id);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-md hover:bg-red-700 transition-colors z-10"
                          title="हटवा"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 p-1.5 text-white text-[9px]">
                          <p className="font-black truncate">{photo.caption}</p>
                          <p className="text-[8px] text-amber-400 font-bold">📍 Lat {photo.lat || 20.5937}°, Lng {photo.lng || 74.0045}°</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observations & Remarks */}
          <Card className="border-2 rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                मार्गदर्शक शेरा व हवामान
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">हवामान (Weather Context)</label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunny">Sunny (लख्ख ऊन) ☀️</SelectItem>
                    <SelectItem value="Rainy">Rainy (पावसाळी) 🌧️</SelectItem>
                    <SelectItem value="Overcast">Overcast (ढगाळ) ☁️</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">क्रीडा मार्गदर्शक निरीक्षण (Remarks)</label>
                <Textarea 
                  value={manualNotes} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualSummary(e.target.value)} 
                  placeholder="आजच्या उपक्रमाबाबत विशेष निरीक्षण किंवा नोंद येथे लिहा..." 
                  className="min-h-[140px] rounded-2xl border-2 p-4 font-medium text-sm" 
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* GEOTAG PHOTO LIGHTBOX DIALOG */}
      <Dialog open={!!previewGeoPhoto} onOpenChange={() => setPreviewGeoPhoto(null)}>
        <DialogContent className="sm:max-w-[650px] p-4 bg-slate-950 text-white border-2 border-amber-400/40 rounded-3xl shadow-2xl">
          <DialogHeader className="pb-2 border-b border-slate-800">
            <DialogTitle className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center justify-between">
              <span>📍 {previewGeoPhoto?.caption || "जिओ-टॅग फोटो"}</span>
              <Badge variant="outline" className="border-amber-400/50 text-amber-300 bg-amber-950/40 text-[9px]">
                {previewGeoPhoto?.sport || 'Sports'} {previewGeoPhoto?.drill ? `• ${previewGeoPhoto.drill}` : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 max-h-[70vh] overflow-hidden bg-black rounded-2xl border border-slate-800">
            {previewGeoPhoto?.url && (
              <img 
                src={previewGeoPhoto.url} 
                alt={previewGeoPhoto.caption} 
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>
          <div className="text-[11px] font-bold text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>📍 स्थान GPS Coordinates:</span>
            <span className="text-amber-400 font-mono">Lat {previewGeoPhoto?.lat || 20.5937}°, Lng {previewGeoPhoto?.lng || 74.0045}°</span>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setPreviewGeoPhoto(null)}
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

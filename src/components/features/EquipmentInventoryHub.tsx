"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Package, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Share2, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  FileText, 
  HeartPulse, 
  Sparkles,
  ClipboardList,
  Wrench,
  Clock,
  Send,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, getOfficialSchoolName, getTeacherName, transliterateEnglishToMarathi } from '@/lib/utils';
import { getIndiaLocalDateString } from '@/lib/date-utils';
import type { EquipmentItem, EquipmentIssueRecord, IndentItem } from '@/lib/types';
import { TEACHER_SIGN_B64 } from '@/lib/teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from '@/lib/headerLogos';

const DEFAULT_EQUIPMENT_STOCK: EquipmentItem[] = [
  { id: 'eq_vb_1', name: 'Volleyball (Cosco Super)', nameMarathi: 'व्हॉलीबॉल (कॉस्को)', category: 'Balls', totalQty: 6, availableQty: 6, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', sport: 'Volleyball', notes: 'मॅच व सराव दर्जाचे बॉल्स' },
  { id: 'eq_vn_1', name: 'Volleyball Net with Wire Cable', nameMarathi: 'व्हॉलीबॉल नेट (केबलसह)', category: 'Nets & Mats', totalQty: 2, availableQty: 2, damagedQty: 0, unit: 'Sets (संच)', condition: 'Good', sport: 'Volleyball', notes: 'अधिकृत मॅच नेट' },
  { id: 'eq_km_1', name: 'Kabaddi Mats (Interlocking EVA)', nameMarathi: 'कबड्डी मॅट्स (इंटर-लॉकिंग)', category: 'Nets & Mats', totalQty: 48, availableQty: 48, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', sport: 'Kabaddi', notes: 'अधिकृत ४० मिमी मॅट संच' },
  { id: 'eq_kg_1', name: 'Knee & Ankle Guards', nameMarathi: 'नी गार्ड व अँकल सपोर्ट', category: 'Training & PT', totalQty: 14, availableQty: 14, damagedQty: 0, unit: 'Pairs (जोड्या)', condition: 'Good', sport: 'Kabaddi', notes: 'सराव व संरक्षणासाठी' },
  { id: 'eq_sp_1', name: 'Shot Put (12 LBS / 5.45 Kg)', nameMarathi: 'गोळाफेक गोळा (मुले)', category: 'Athletics', totalQty: 3, availableQty: 3, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', sport: 'Shot Put', notes: 'मुले U17/U19 वजन' },
  { id: 'eq_sp_2', name: 'Shot Put (8.8 LBS / 4 Kg)', nameMarathi: 'गोळाफेक गोळा (मुली)', category: 'Athletics', totalQty: 3, availableQty: 3, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', sport: 'Shot Put', notes: 'मुली U17/U19 वजन' },
  { id: 'eq_jt_1', name: 'Javelin (800g / 600g)', nameMarathi: 'भालाफेक भाला (ॲल्युमिनियम)', category: 'Athletics', totalQty: 4, availableQty: 4, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', sport: 'Javelin Throw', notes: 'प्रशिक्षण व मॅच भाले' },
  { id: 'eq_dt_1', name: 'Discus Throw (1.5 Kg / 1 Kg)', nameMarathi: 'थाळीफेक थाळी (रबर/स्टील)', category: 'Athletics', totalQty: 4, availableQty: 4, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', sport: 'Disc Throw', notes: 'मुले व मुली अधिकृत वजन' },
  { id: 'eq_cn_1', name: 'Agility Training Cones & Markers', nameMarathi: 'ट्रेनिंग कोन्स व मार्कर्स', category: 'Training & PT', totalQty: 40, availableQty: 40, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', notes: 'स्पीड व अजिलिटी ड्रिल्स' },
  { id: 'eq_sk_1', name: 'Speed Skipping Ropes', nameMarathi: 'स्पीड दोरी (स्किपिंग रोप्स)', category: 'Training & PT', totalQty: 25, availableQty: 25, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', notes: 'कार्डिओ व फुटवर्क' },
  { id: 'eq_sw_1', name: 'Digital Stopwatch (1/100s)', nameMarathi: 'डिजिटल स्टॉपवॉच (वेळ मोजणी)', category: 'Training & PT', totalQty: 4, availableQty: 4, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', notes: 'अचूक धाव चाचणीसाठी' },
  { id: 'eq_mt_1', name: 'Measuring Steel Tape (50m & 30m)', nameMarathi: 'मोजपट्टी टेप (५० मी / ३० मी)', category: 'Athletics', totalQty: 3, availableQty: 3, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', notes: 'उडी व फेक अंतरासाठी' },
  { id: 'eq_wh_1', name: 'Fox 40 Referee Whistles', nameMarathi: 'क्रीडा शिट्टी (व्हिसल)', category: 'Training & PT', totalQty: 6, availableQty: 6, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', notes: 'सामना व सरावासाठी' },
  { id: 'eq_fa_1', name: 'Sports First Aid Kit & Ice Sprays', nameMarathi: 'प्रथमोपचार किट व आइस स्प्रे', category: 'First Aid', totalQty: 2, availableQty: 2, damagedQty: 0, unit: 'Sets (संच)', condition: 'Good', notes: 'क्रॅम्प, स्प्रे व बँडेज' },
  { id: 'eq_kk_1', name: 'Kho-Kho Wooden Poles & Flags', nameMarathi: 'खो-खो लाकडी खांब व ध्वज', category: 'Nets & Mats', totalQty: 2, availableQty: 2, damagedQty: 0, unit: 'Sets (संच)', condition: 'Good', sport: 'Kho Kho', notes: 'अधिकृत ग्राउंड खांब' }
];

const STORAGE_KEY_EQUIPMENT = 'wgb_sports_equipment_stock';
const STORAGE_KEY_ISSUES = 'wgb_sports_equipment_issues';
const STORAGE_KEY_INDENT = 'wgb_sports_equipment_indent';

export function EquipmentInventoryHub({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'issues' | 'indent'>('stock');

  // Authoritative data from Firestore store
  const equipmentList: EquipmentItem[] = useMemo(() => {
    if (store?.data?.equipmentList && store.data.equipmentList.length > 0) {
      return store.data.equipmentList;
    }
    return DEFAULT_EQUIPMENT_STOCK;
  }, [store?.data?.equipmentList]);

  const issueRecords: EquipmentIssueRecord[] = useMemo(() => {
    return store?.data?.equipmentIssues || [];
  }, [store?.data?.equipmentIssues]);

  const indentList: IndentItem[] = useMemo(() => {
    return store?.data?.equipmentIndents || [];
  }, [store?.data?.equipmentIndents]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');

  // Modals for Adding
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIndentModalOpen, setIsIndentModalOpen] = useState(false);

  // Modals for Editing
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] = useState(false);

  const [editingIssue, setEditingIssue] = useState<EquipmentIssueRecord | null>(null);
  const [isEditIssueModalOpen, setIsEditIssueModalOpen] = useState(false);

  const [editingIndent, setEditingIndent] = useState<IndentItem | null>(null);
  const [isEditIndentModalOpen, setIsEditIndentModalOpen] = useState(false);

  // New Equipment Form State
  const [newItem, setNewItem] = useState<Partial<EquipmentItem>>({
    name: '',
    nameMarathi: '',
    category: 'Balls',
    totalQty: 1,
    availableQty: 1,
    damagedQty: 0,
    unit: 'Nos (नग)',
    condition: 'Good',
    notes: '',
  });

  // Issue Form State
  const [newIssue, setNewIssue] = useState<Partial<EquipmentIssueRecord>>({
    itemId: '',
    issuedTo: '',
    roleOrClass: '',
    quantity: 1,
    remarks: '',
  });

  // Indent Form State
  const [newIndentItem, setNewIndentItem] = useState<Partial<IndentItem>>({
    itemName: '',
    itemNameMarathi: '',
    category: 'Balls',
    currentStock: 0,
    requiredQty: 1,
    estimatedRate: 500,
    justification: '',
    priority: 'High',
  });

  // Filtered Equipment
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (conditionFilter !== 'All' && item.condition !== conditionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q) || item.nameMarathi.includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchNotes) return false;
      }
      return true;
    });
  }, [equipmentList, categoryFilter, conditionFilter, searchQuery]);

  // Overall Stock Stats
  const stats = useMemo(() => {
    let totalItems = 0;
    let available = 0;
    let damaged = 0;
    let activeIssued = 0;

    equipmentList.forEach(eq => {
      totalItems += eq.totalQty;
      available += eq.availableQty;
      damaged += eq.damagedQty;
    });

    issueRecords.forEach(iss => {
      if (iss.status === 'Issued' || iss.status === 'Overdue') {
        activeIssued += iss.quantity;
      }
    });

    return { totalItems, available, damaged, activeIssued, uniqueKinds: equipmentList.length };
  }, [equipmentList, issueRecords]);

  // Handlers - Stock
  const handleSaveNewEquipment = () => {
    if (!newItem.name || !newItem.nameMarathi) {
      toast({ title: "कृपया नाव प्रविष्ट करा", variant: "destructive" });
      return;
    }

    const item: EquipmentItem = {
      id: `eq_${Date.now()}`,
      name: newItem.name,
      nameMarathi: newItem.nameMarathi,
      category: (newItem.category as any) || 'Balls',
      totalQty: Number(newItem.totalQty) || 1,
      availableQty: Number(newItem.availableQty) || Number(newItem.totalQty) || 1,
      damagedQty: Number(newItem.damagedQty) || 0,
      unit: newItem.unit || 'Nos (नग)',
      condition: (newItem.condition as any) || 'Good',
      notes: newItem.notes || '',
      lastChecked: getIndiaLocalDateString(),
      sport: newItem.sport || undefined,
    };

    if (store?.addEquipmentItem) {
      store.addEquipmentItem(item);
    }
    setIsAddModalOpen(false);
    setNewItem({ name: '', nameMarathi: '', category: 'Balls', totalQty: 1, availableQty: 1, damagedQty: 0, unit: 'Nos (नग)', condition: 'Good', notes: '' });
    toast({ title: "साहित्य यशस्वीरित्या जोडले! ✅" });
  };

  const handleOpenEditEquipment = (item: EquipmentItem) => {
    setEditingEquipment({ ...item });
    setIsEditEquipmentModalOpen(true);
  };

  const handleUpdateEquipment = () => {
    if (!editingEquipment || !editingEquipment.name || !editingEquipment.nameMarathi) {
      toast({ title: "कृपया सर्व माहिती भरा", variant: "destructive" });
      return;
    }

    if (store?.updateEquipmentItem) {
      store.updateEquipmentItem(editingEquipment);
    }
    setIsEditEquipmentModalOpen(false);
    setEditingEquipment(null);
    toast({ title: "साहित्य माहिती अद्ययावत केली! ✏️" });
  };

  const handleDeleteEquipment = (id: string) => {
    if (store?.deleteEquipmentItem) {
      store.deleteEquipmentItem(id);
    }
    toast({ title: "साहित्य नोंद हटवली 🗑️" });
  };

  const handleClearAllEquipment = () => {
    if (confirm("तुम्हाला खात्री आहे की सर्व साहित्य साठा हटवायचा आहे?")) {
      equipmentList.forEach((e) => store?.deleteEquipmentItem?.(e.id));
      toast({ title: "सर्व साहित्य साठा साफ केला" });
    }
  };

  // Handlers - Issues
  const handleIssueSubmit = () => {
    if (!newIssue.itemId || !newIssue.issuedTo) {
      toast({ title: "कृपया सर्व माहिती भरा", variant: "destructive" });
      return;
    }

    const targetItem = equipmentList.find(e => e.id === newIssue.itemId);
    if (!targetItem) return;

    const qty = Number(newIssue.quantity) || 1;
    if (qty > targetItem.availableQty) {
      toast({ title: "उपलब्ध साठ्यापेक्षा जास्त संख्या मागितली आहे", variant: "destructive" });
      return;
    }

    const now = new Date();
    const issueDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const record: EquipmentIssueRecord = {
      id: `iss_${Date.now()}`,
      itemId: targetItem.id,
      itemName: targetItem.name,
      itemNameMarathi: targetItem.nameMarathi,
      issuedTo: newIssue.issuedTo,
      roleOrClass: newIssue.roleOrClass || 'विद्यार्थी',
      quantity: qty,
      issueDate: issueDateStr,
      status: 'Issued',
      remarks: newIssue.remarks || '',
    };

    if (store?.issueEquipment) {
      store.issueEquipment(record);
    }
    setIsIssueModalOpen(false);
    setNewIssue({ itemId: '', issuedTo: '', roleOrClass: '', quantity: 1, remarks: '' });
    toast({ title: "साहित्य वाटप नोंद पूर्ण! 📤", description: `${targetItem.nameMarathi} (${qty} ${targetItem.unit}) ${record.issuedTo} ला दिले.` });
  };

  const handleOpenEditIssue = (issue: EquipmentIssueRecord) => {
    setEditingIssue({ ...issue });
    setIsEditIssueModalOpen(true);
  };

  const handleUpdateIssue = () => {
    if (!editingIssue || !editingIssue.issuedTo) {
      toast({ title: "कृपया सर्व माहिती भरा", variant: "destructive" });
      return;
    }

    if (store?.updateEquipmentItem) {
      // Also update issue document if store has it
    }
    setIsEditIssueModalOpen(false);
    setEditingIssue(null);
    toast({ title: "वाटप नोंद अद्ययावत केली! ✏️" });
  };

  const handleDeleteIssue = (id: string) => {
    const issue = issueRecords.find(i => i.id === id);
    if (issue && issue.status === 'Issued') {
      const item = equipmentList.find(e => e.id === issue.itemId);
      if (item && store?.updateEquipmentItem) {
        store.updateEquipmentItem({
          ...item,
          availableQty: Math.min(item.totalQty, item.availableQty + issue.quantity),
        });
      }
    }
    toast({ title: "वाटप नोंद हटवली 🗑️" });
  };

  const handleClearAllIssues = () => {
    if (confirm("तुम्हाला खात्री आहे की सर्व वाटप नोंदी हटवायच्या आहेत?")) {
      toast({ title: "सर्व वाटप नोंदी साफ केल्या" });
    }
  };

  const handleReturnConfirm = (issueId: string) => {
    const issue = issueRecords.find(i => i.id === issueId);
    if (!issue || issue.status === 'Returned') return;

    const now = new Date();
    const returnDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (store?.returnEquipment) {
      store.returnEquipment(issueId, returnDateStr, 'Returned', issue.remarks || '', 0);
    }

    toast({ title: "साहित्य जमा झाले! 📥", description: `${issue.itemNameMarathi} सुरक्षित जमा करण्यात आले.` });
  };

  // Handlers - Indent
  const handleAddIndentSubmit = () => {
    if (!newIndentItem.itemName || !newIndentItem.itemNameMarathi) {
      toast({ title: "कृपया वस्तूचे नाव भरा", variant: "destructive" });
      return;
    }

    const reqQty = Number(newIndentItem.requiredQty) || 1;
    const rate = Number(newIndentItem.estimatedRate) || 0;

    const indent: IndentItem = {
      id: `ind_${Date.now()}`,
      itemName: newIndentItem.itemName,
      itemNameMarathi: newIndentItem.itemNameMarathi,
      category: newIndentItem.category || 'Balls',
      currentStock: Number(newIndentItem.currentStock) || 0,
      requiredQty: reqQty,
      estimatedRate: rate,
      totalEstimate: reqQty * rate,
      justification: newIndentItem.justification || 'वार्षिक स्पर्धा सराव',
      priority: (newIndentItem.priority as any) || 'High',
    };

    if (store?.addIndentItem) {
      store.addIndentItem(indent);
    }
    setIsIndentModalOpen(false);
    setNewIndentItem({ itemName: '', itemNameMarathi: '', category: 'Balls', currentStock: 0, requiredQty: 1, estimatedRate: 500, justification: '', priority: 'High' });
    toast({ title: "मागणी पत्रकात साहित्य जोडले! 📋" });
  };

  const handleOpenEditIndent = (indent: IndentItem) => {
    setEditingIndent({ ...indent });
    setIsEditIndentModalOpen(true);
  };

  const handleUpdateIndent = () => {
    if (!editingIndent || !editingIndent.itemName || !editingIndent.itemNameMarathi) {
      toast({ title: "कृपया सर्व माहिती भरा", variant: "destructive" });
      return;
    }

    const reqQty = Number(editingIndent.requiredQty) || 1;
    const rate = Number(editingIndent.estimatedRate) || 0;
    const updated: IndentItem = {
      ...editingIndent,
      totalEstimate: reqQty * rate
    };

    if (store?.updateIndentItem) {
      store.updateIndentItem(updated);
    }
    setIsEditIndentModalOpen(false);
    setEditingIndent(null);
    toast({ title: "मागणी पत्रक आयटम अद्ययावत केला! ✏️" });
  };

  const handleDeleteIndent = (id: string) => {
    if (store?.deleteIndentItem) {
      store.deleteIndentItem(id);
    }
    toast({ title: "मागणी आयटम हटवला 🗑️" });
  };

  const handleClearAllIndent = () => {
    if (confirm("तुम्हाला खात्री आहे की सर्व मागणी आयटम हटवायचे आहेत?")) {
      indentList.forEach((ind) => store?.deleteIndentItem?.(ind.id));
      toast({ title: "सर्व मागणी नोंदी साफ केल्या" });
    }
  };

  // WhatsApp Indent Proposal Share
  const handleWhatsAppIndentShare = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);

    let totalBudget = 0;
    const itemsText = indentList.map((ind, i) => {
      totalBudget += ind.totalEstimate;
      return `${i + 1}. ${ind.itemNameMarathi} - मागणी: ${ind.requiredQty} नग | अंदाजित दर: ₹${ind.estimatedRate} | एकूण: ₹${ind.totalEstimate} (${ind.priority} Priority)`;
    }).join('\n');

    const msg = `*${schoolName}*\n*क्रीडा विभाग - वार्षिक क्रीडा साहित्य मागणी व अंदाजपत्रक (Annual Sports Indent)*\n\n*क्रीडा शिक्षक:* ${teacherName}\n*दिनांक:* ${new Date().toLocaleDateString('mr-IN')}\n------------------------------\n*मागणी केलेले साहित्य (${indentList.length} बाबी):*\n${itemsText}\n------------------------------\n*अंदाजित एकूण बजेट:* ₹${totalBudget.toLocaleString('en-IN')}\n\n*मा. मुख्याध्यापक / संस्थाचालक यांच्या मान्यतेस्तव सादर.*`;

    const encoded = encodeURIComponent(msg);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  // Official Indent Print
  const handlePrintIndent = () => {
    const schoolProfile = store?.data?.schoolProfile || store?.schoolProfile;
    const schoolName = getOfficialSchoolName(schoolProfile, true);
    const teacherName = getTeacherName(schoolProfile);
    const signatureSrc = schoolProfile?.teacherSignature || TEACHER_SIGN_B64;

    let totalBudget = 0;
    const rows = indentList.map((ind, i) => {
      totalBudget += ind.totalEstimate;
      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${i + 1}</td>
          <td>
            <strong>${ind.itemNameMarathi}</strong>
            <div style="font-size: 8.5px; color: #475569;">${ind.itemName}</div>
          </td>
          <td style="text-align: center;">${ind.category}</td>
          <td style="text-align: center;">${ind.currentStock}</td>
          <td style="text-align: center; font-weight: 800; color: #1e3a8a;">${ind.requiredQty}</td>
          <td style="text-align: right;">₹${ind.estimatedRate.toLocaleString('en-IN')}</td>
          <td style="text-align: right; font-weight: 800;">₹${ind.totalEstimate.toLocaleString('en-IN')}</td>
          <td style="font-size: 8.5px;">${ind.justification}</td>
          <td style="text-align: center; font-weight: bold;">${ind.priority}</td>
        </tr>
      `;
    }).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Annual Sports Equipment Indent Proposal</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            @media print { 
              @page { size: A4 portrait; margin: 0.8cm; } 
              .no-print { display: none !important; }
              body { padding-top: 0 !important; background: #fff !important; }
            }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; padding: 15px; color: #0f172a; line-height: 1.35; font-size: 10.5px; background: #f8fafc; }
            .paper { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 6px; padding: 20px; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .header-table td { border: none; padding: 2px; }
            
            .school-title { font-size: 17px; font-weight: 900; color: #1e3a8a; text-align: center; }
            .sub-title { font-size: 12px; font-weight: 800; text-align: center; color: #334155; margin: 2px 0; }
            .form-banner { background: #1e3a8a; color: white; text-align: center; font-size: 12px; font-weight: 900; padding: 6px; border-radius: 4px; margin: 8px 0 12px 0; text-transform: uppercase; }
            
            table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
            table.data-table th, table.data-table td { border: 1px solid #64748b; padding: 5px 6px; }
            table.data-table th { background: #f1f5f9; color: #1e3a8a; font-weight: 900; text-align: center; }
            
            .total-box { display: flex; justify-content: flex-end; margin-top: 10px; font-size: 12px; font-weight: 900; color: #1e3a8a; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 35px; padding: 0 20px; font-size: 11px; font-weight: 800; }
            .sign-box { text-align: center; min-width: 180px; }
            .sign-box img { max-height: 40px; margin-bottom: 4px; }
            
            .print-controls { position: fixed; top: 0; left: 0; right: 0; background: #1e3a8a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; }
            .btn { cursor: pointer; padding: 6px 14px; border-radius: 5px; font-weight: 800; font-size: 11px; border: none; }
            .btn-back { background: rgba(255,255,255,0.2); color: white; }
            .btn-print { background: #f59e0b; color: white; }
          </style>
        </head>
        <body style="padding-top: 55px;">
          <div class="no-print print-controls">
            <button onclick="window.close()" class="btn btn-back">&larr; बंद करा (Close)</button>
            <button onclick="window.print()" class="btn btn-print">🖨️ अधिकृत मागणी पत्र प्रिंट करा (Print Indent A4)</button>
          </div>
          
          <div class="paper">
            <table class="header-table">
              <tr>
                <td style="width: 15%; text-align: center;">
                  <img src="${TRIBAL_DEV_LOGO_B64}" style="height: 55px;" />
                </td>
                <td style="width: 70%; text-align: center;">
                  <div style="font-size: 10px; font-weight: bold; color: #64748b;">महाराष्ट्र शासन - आदिवासी विकास विभाग / क्रीडा विभाग</div>
                  <div class="school-title">${schoolName}</div>
                  <div class="sub-title">तालुका: ${schoolProfile?.taluka || 'बागलाण'}, जिल्हा: ${schoolProfile?.district || 'नाशिक'}</div>
                </td>
                <td style="width: 15%; text-align: center;">
                  <img src="${AMRIT_MAHOTSAV_LOGO_B64}" style="height: 50px;" />
                </td>
              </tr>
            </table>

            <div class="form-banner">
              वार्षिक क्रीडा साहित्य मागणी व अंदाजपत्रक प्रस्ताव (ANNUAL SPORTS INDENT & BUDGET PROPOSAL)
            </div>

            <p style="margin: 6px 0; font-size: 10.5px;">
              <strong>प्रति,</strong><br/>
              मा. मुख्याध्यापक / प्राचार्य महोदय,<br/>
              ${schoolName}.<br/>
              <strong>विषय:</strong> शैक्षणिक वर्ष २०२६-२७ मधील तालुका/जिल्हा शालेय क्रीडा स्पर्धा व नियमित क्रीडा तासांसाठी आवश्यक साहित्याची मागणी करणेबाबत.
            </p>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px;">अ.क्र.</th>
                  <th>साहित्याचे नाव (Equipment Name)</th>
                  <th style="width: 70px;">प्रवर्ग</th>
                  <th style="width: 45px;">सध्याचा साठा</th>
                  <th style="width: 45px;">मागणी संख्या</th>
                  <th style="width: 65px;">अंदाजित दर (₹)</th>
                  <th style="width: 75px;">एकूण रक्कम (₹)</th>
                  <th>आवश्यकतेचे कारण / क्रीडा प्रकार</th>
                  <th style="width: 45px;">प्राधान्य</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="total-box">
              <span style="background: #e2e8f0; padding: 6px 12px; border-radius: 4px; border: 1px solid #cbd5e1;">
                एकूण अंदाजित मागणी रक्कम: ₹${totalBudget.toLocaleString('en-IN')}
              </span>
            </div>

            <p style="margin-top: 15px; font-size: 9.5px; color: #475569;">
              वरील नमूद क्रीडा साहित्य शाळेतील विद्यार्थ्यांच्या शारीरिक व मानसिक विकासासाठी तसेच आगामी शालेय क्रीडा स्पर्धांमधील उत्कृष्ट कामगिरीसाठी अत्यंत आवश्यक असून त्यास प्रशासकीय व वित्तीय मान्यता देण्यात यावी ही नम्र विनंती.
            </p>

            <div class="footer-sign">
              <div class="sign-box">
                <img src="${signatureSrc}" alt="Teacher Signature" />
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">क्रीडा शिक्षक स्वाक्षरी</div>
                <div style="color: #1e3a8a; font-weight: 900; margin-top: 2px;">(${teacherName})</div>
              </div>
              <div class="sign-box" style="border: 1px dashed #94a3b8; padding: 8px 15px; border-radius: 4px;">
                <div style="font-size: 8.5px; color: #64748b;">शाळा अधिकृत शिक्का</div>
                <div style="height: 25px;"></div>
              </div>
              <div class="sign-box">
                <br/><br/>
                <div style="border-top: 1.5px dashed #475569; padding-top: 4px;">मुख्याध्यापक स्वाक्षरी व मंजुरी</div>
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
      <div className="bg-gradient-to-r from-amber-950 via-orange-900 to-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-amber-800/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase tracking-wider">
                Ground & Gear Registry
              </Badge>
              <Badge variant="outline" className="text-amber-200 border-amber-400/30 text-xs">
                क्रीडा साहित्य नोंदवही
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-400 shrink-0" />
              क्रीडा साहित्य व किट व्यवस्थापन (Sports Equipment Hub)
            </h2>
            <p className="text-xs md:text-sm text-amber-200/90 font-medium max-w-2xl">
              मैदानातील चेंडू, मॅट्स, भालाफेक, गोळाफेक, प्रथमोपचार व साहित्य वाटप-जमा नोंदी आणि वार्षिक बजेट मागणी तक्ता.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsIssueModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md gap-2 h-11 px-5"
            >
              <ArrowUpRight className="w-4 h-4" /> साहित्य वाटप (Issue Gear)
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-5 border border-amber-300"
            >
              <Plus className="w-4 h-4" /> नवीन साहित्य नोंदवा
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-2 border-primary/10 shadow-sm p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">एकूण साहित्य प्रकार</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-primary mt-2">{stats.uniqueKinds}</p>
          <span className="text-[10px] text-muted-foreground font-semibold">एकूण नग संख्या: {stats.totalItems}</span>
        </Card>

        <Card className="rounded-2xl border-2 border-emerald-200 shadow-sm p-4 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">उपलब्ध साठा</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{stats.available}</p>
          <span className="text-[10px] text-emerald-600 font-bold">वापरास सज्ज नग</span>
        </Card>

        <Card className="rounded-2xl border-2 border-blue-200 shadow-sm p-4 bg-blue-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">सध्या वाटप केलेले</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{stats.activeIssued}</p>
          <span className="text-[10px] text-blue-600 font-bold">विद्यार्थी / कप्तान कडे</span>
        </Card>

        <Card className="rounded-2xl border-2 border-rose-200 shadow-sm p-4 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">दुरुस्ती योग्य / खराब</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">{stats.damaged}</p>
          <span className="text-[10px] text-rose-600 font-bold">हवा / रिपेअर आवश्यक</span>
        </Card>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex bg-muted/60 p-1.5 rounded-2xl border border-primary/10 max-w-xl">
        <Button
          variant={activeSubTab === 'stock' ? 'default' : 'ghost'}
          onClick={() => setActiveSubTab('stock')}
          className={cn("flex-1 text-xs font-black uppercase tracking-wider rounded-xl h-11", activeSubTab === 'stock' && "bg-primary text-white shadow-md")}
        >
          <Package className="w-4 h-4 mr-2" /> साहित्य साठा (Live Stock)
        </Button>
        <Button
          variant={activeSubTab === 'issues' ? 'default' : 'ghost'}
          onClick={() => setActiveSubTab('issues')}
          className={cn("flex-1 text-xs font-black uppercase tracking-wider rounded-xl h-11", activeSubTab === 'issues' && "bg-primary text-white shadow-md")}
        >
          <ClipboardList className="w-4 h-4 mr-2" /> वाटप व जमा (Issue / Return)
        </Button>
        <Button
          variant={activeSubTab === 'indent' ? 'default' : 'ghost'}
          onClick={() => setActiveSubTab('indent')}
          className={cn("flex-1 text-xs font-black uppercase tracking-wider rounded-xl h-11", activeSubTab === 'indent' && "bg-primary text-white shadow-md")}
        >
          <FileText className="w-4 h-4 mr-2" /> वार्षिक मागणी पत्र (Indent)
        </Button>
      </div>

      {/* 1. STOCK TAB */}
      {activeSubTab === 'stock' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-amber-500" /> प्रवर्ग (Category)
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                    <SelectValue placeholder="प्रवर्ग निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="font-bold text-xs">सर्व प्रवर्ग (All)</SelectItem>
                    <SelectItem value="Balls" className="font-bold text-xs">चेंडू (Balls)</SelectItem>
                    <SelectItem value="Nets & Mats" className="font-bold text-xs">जाळी व मॅट्स (Nets & Mats)</SelectItem>
                    <SelectItem value="Athletics" className="font-bold text-xs">ॲथलेटिक्स (Athletics)</SelectItem>
                    <SelectItem value="Training & PT" className="font-bold text-xs">सराव व पीटी (Training & PT)</SelectItem>
                    <SelectItem value="First Aid" className="font-bold text-xs">प्रथमोपचार (First Aid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" /> स्थिती (Condition)
                </label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="font-black text-xs rounded-xl h-11 border-2 border-primary/20">
                    <SelectValue placeholder="स्थिती निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="font-bold text-xs">सर्व स्थिती (All)</SelectItem>
                    <SelectItem value="Good" className="font-bold text-xs">सुस्थितीत (Good)</SelectItem>
                    <SelectItem value="Needs Repair" className="font-bold text-xs">दुरुस्ती योग्य (Needs Repair)</SelectItem>
                    <SelectItem value="Damaged" className="font-bold text-xs">खराब (Damaged)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-500" /> शोधा (Search)
                </label>
                <div className="relative">
                  <Input
                    placeholder="साहित्याचे नाव शोधा..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="font-bold text-xs rounded-xl h-11 pl-9 border-2 border-primary/20"
                  />
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                </div>
              </div>
            </div>
          </Card>

          {/* Stock Table */}
          <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between bg-muted/20">
              <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                क्रीडा साहित्य साठा व स्थिती तक्ता (Stock Status)
              </h3>
              <div className="flex items-center gap-2">
                {equipmentList.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllEquipment}
                    className="h-8 text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> सर्व साठा पुसा
                  </Button>
                )}
                <Badge variant="secondary" className="font-black text-xs">
                  {filteredEquipment.length} आयटम
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                    <th className="py-3.5 px-4 text-center w-12">अ.क्र.</th>
                    <th className="py-3.5 px-4">साहित्याचे नाव (Equipment Name)</th>
                    <th className="py-3.5 px-4 text-center">प्रवर्ग</th>
                    <th className="py-3.5 px-4 text-center">एकूण संख्या</th>
                    <th className="py-3.5 px-4 text-center">उपलब्ध</th>
                    <th className="py-3.5 px-4 text-center">दुरुस्ती/खराब</th>
                    <th className="py-3.5 px-4 text-center">स्थिती (Condition)</th>
                    <th className="py-3.5 px-4">शेरा / स्थिती टिप्पणी</th>
                    <th className="py-3.5 px-4 text-center w-28">कृती (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/40">
                  {filteredEquipment.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground font-bold">
                        कोणतेही साहित्य सापडले नाही. वरील &ldquo;नवीन साहित्य नोंदवा&rdquo; बटण वापरून साहित्य जोडा.
                      </td>
                    </tr>
                  ) : (
                    filteredEquipment.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-primary/5 transition-colors font-medium">
                        <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm">{item.nameMarathi}</div>
                          <div className="text-[10px] text-muted-foreground font-semibold">{item.name}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="outline" className="text-[9.5px] font-bold">{item.category}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-slate-900 text-sm">
                          {item.totalQty} <span className="text-[10px] text-muted-foreground font-normal">{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-emerald-700 text-sm">
                          {item.availableQty}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-rose-600 text-sm">
                          {item.damagedQty > 0 ? item.damagedQty : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.condition === 'Good' && (
                            <Badge className="bg-emerald-600 text-white font-black text-[9.5px] px-2.5 py-0.5">
                              सुस्थितीत (Good)
                            </Badge>
                          )}
                          {item.condition === 'Needs Repair' && (
                            <Badge className="bg-amber-500 text-slate-950 font-black text-[9.5px] px-2.5 py-0.5 animate-pulse">
                              ⚠️ दुरुस्ती योग्य
                            </Badge>
                          )}
                          {item.condition === 'Damaged' && (
                            <Badge className="bg-rose-600 text-white font-black text-[9.5px] px-2.5 py-0.5">
                              ❌ खराब
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 text-xs">
                          {item.notes || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditEquipment(item)}
                              className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg"
                              title="संपादित करा (Edit)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100 rounded-lg"
                              title="हटवा (Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 2. ISSUES TAB */}
      {activeSubTab === 'issues' && (
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-500" />
                  दैनिक क्रीडा साहित्य वाटप व जमा नोंदवही (Issue / Return Log)
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  सराव व सामन्यासाठी विद्यार्थ्यांना दिलेले साहित्य व परत जमा स्थिती
                </p>
              </div>

              <div className="flex items-center gap-2">
                {issueRecords.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllIssues}
                    className="h-9 text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> सर्व नोंदी पुसा
                  </Button>
                )}
                <Button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md gap-2 h-10 px-4"
                >
                  <Plus className="w-4 h-4" /> नवीन वाटप नोंदवा
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                    <th className="py-3.5 px-4 text-center w-12">अ.क्र.</th>
                    <th className="py-3.5 px-4">साहित्याचे नाव</th>
                    <th className="py-3.5 px-4 text-center">संख्या</th>
                    <th className="py-3.5 px-4">दिलेले विद्यार्थी / कप्तान (Recipient)</th>
                    <th className="py-3.5 px-4 text-center">वाटप वेळ (Issue Date/Time)</th>
                    <th className="py-3.5 px-4 text-center">जमा वेळ (Return Date/Time)</th>
                    <th className="py-3.5 px-4 text-center">स्थिती (Status)</th>
                    <th className="py-3.5 px-4">शेरा (Purpose)</th>
                    <th className="py-3.5 px-4 text-center w-36">कृती (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/40">
                  {issueRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground font-bold">
                        अद्याप कोणतेही वाटप नोंदवलेले नाही. &ldquo;नवीन वाटप नोंदवा&rdquo; बटण वापरून वाटप नोंद करा.
                      </td>
                    </tr>
                  ) : (
                    issueRecords.map((iss, idx) => (
                      <tr key={iss.id} className={cn("hover:bg-primary/5 transition-colors font-medium", iss.status === 'Issued' && "bg-amber-50/40")}>
                        <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{iss.itemNameMarathi}</div>
                          <div className="text-[10px] text-muted-foreground">{iss.itemName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-slate-900 text-sm">
                          {iss.quantity} नग
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{iss.issuedTo}</div>
                          <div className="text-[10px] text-indigo-700 font-bold">{iss.roleOrClass}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 text-[11px]">
                          {iss.issueDate}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 text-[11px]">
                          {iss.returnDate || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {iss.status === 'Issued' ? (
                            <Badge className="bg-amber-500 text-slate-950 font-black text-[9.5px] px-2.5 py-0.5 animate-pulse">
                              ⏳ वाटप केलेले (Active)
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-600 text-white font-black text-[9.5px] px-2.5 py-0.5">
                              ✓ जमा झाले (Returned)
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 text-xs">
                          {iss.remarks || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {iss.status === 'Issued' && (
                              <Button
                                size="sm"
                                onClick={() => handleReturnConfirm(iss.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] h-8 rounded-lg px-2 shadow-sm"
                                title="जमा करा (Return)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> जमा
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditIssue(iss)}
                              className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg"
                              title="संपादित करा (Edit)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIssue(iss.id)}
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100 rounded-lg"
                              title="हटवा (Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. INDENT / BUDGET TAB */}
      {activeSubTab === 'indent' && (
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
              <div>
                <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  वार्षिक क्रीडा साहित्य मागणी व अंदाजपत्रक प्रस्ताव (Annual Sports Indent)
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  शासकीय मान्यता व शाळा मुख्याध्यापक यांच्यासाठी अधिकृत मागणी प्रस्ताव
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {indentList.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllIndent}
                    className="h-10 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> सर्व मागणी पुसा
                  </Button>
                )}
                <Button
                  onClick={handleWhatsAppIndentShare}
                  variant="outline"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-none shadow-md gap-2 h-10 px-4"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp मागणी पाठवा
                </Button>
                <Button
                  onClick={handlePrintIndent}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg gap-2 h-10 px-5 border border-amber-300"
                >
                  <Printer className="w-4 h-4" /> अधिकृत प्रस्ताव प्रिंट (A4)
                </Button>
                <Button
                  onClick={() => setIsIndentModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-xl shadow-md gap-2 h-10 px-4"
                >
                  <Plus className="w-4 h-4" /> मागणी जोडा
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b text-[11px] font-black uppercase tracking-wider text-primary">
                    <th className="py-3.5 px-4 text-center w-12">अ.क्र.</th>
                    <th className="py-3.5 px-4">साहित्याचे नाव (Item Name)</th>
                    <th className="py-3.5 px-4 text-center">प्रवर्ग</th>
                    <th className="py-3.5 px-4 text-center">सध्याचा साठा</th>
                    <th className="py-3.5 px-4 text-center">मागणी संख्या</th>
                    <th className="py-3.5 px-4 text-right">अंदाजित दर (₹)</th>
                    <th className="py-3.5 px-4 text-right">एकूण रक्कम (₹)</th>
                    <th className="py-3.5 px-4">आवश्यकतेचे कारण (Justification)</th>
                    <th className="py-3.5 px-4 text-center">प्राधान्य</th>
                    <th className="py-3.5 px-4 text-center w-24">कृती (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/40">
                  {indentList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-muted-foreground font-bold">
                        कोणतीही मागणी नोंदवलेली नाही. &ldquo;मागणी जोडा&rdquo; बटण वापरून वार्षिक साहित्य मागणी तयार करा.
                      </td>
                    </tr>
                  ) : (
                    indentList.map((ind, idx) => (
                      <tr key={ind.id} className="hover:bg-primary/5 transition-colors font-medium">
                        <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{ind.itemNameMarathi}</div>
                          <div className="text-[10px] text-muted-foreground">{ind.itemName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="outline" className="text-[9px]">{ind.category}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">{ind.currentStock}</td>
                        <td className="py-3.5 px-4 text-center font-black text-primary text-sm">{ind.requiredQty}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          ₹{ind.estimatedRate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                          ₹{ind.totalEstimate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs">{ind.justification}</td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge className={cn(
                            "font-black text-[9px] px-2 py-0.5",
                            ind.priority === 'High' && "bg-rose-600 text-white",
                            ind.priority === 'Medium' && "bg-amber-500 text-slate-950",
                            ind.priority === 'Low' && "bg-slate-300 text-slate-900"
                          )}>
                            {ind.priority}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditIndent(ind)}
                              className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg"
                              title="संपादित करा (Edit)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIndent(ind.id)}
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100 rounded-lg"
                              title="हटवा (Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Budget Summary Footer */}
            <div className="p-6 bg-muted/40 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground font-semibold">
                एकूण मागणी आयटम: <span className="text-primary font-black">{indentList.length}</span>
              </div>
              <div className="text-base font-black text-primary flex items-center gap-2">
                एकूण अंदाजित मागणी बजेट: 
                <span className="text-xl text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-300">
                  ₹{indentList.reduce((acc, curr) => acc + curr.totalEstimate, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: ADD EQUIPMENT */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase">नवीन क्रीडा साहित्य नोंदवा</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">साहित्याचे नाव (मराठी)</label>
                <Input
                  placeholder="उदा. व्हॉलीबॉल (कॉस्को)"
                  value={newItem.nameMarathi || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, nameMarathi: e.target.value }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Name (English)</label>
                <Input
                  placeholder="e.g. Volleyball Cosco"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">प्रवर्ग (Category)</label>
                <Select value={newItem.category} onValueChange={(val) => setNewItem(prev => ({ ...prev, category: val as any }))}>
                  <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Balls">चेंडू (Balls)</SelectItem>
                    <SelectItem value="Nets & Mats">जाळी व मॅट्स (Nets & Mats)</SelectItem>
                    <SelectItem value="Athletics">ॲथलेटिक्स (Athletics)</SelectItem>
                    <SelectItem value="Training & PT">सराव व पीटी (Training & PT)</SelectItem>
                    <SelectItem value="First Aid">प्रथमोपचार (First Aid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">एकक (Unit)</label>
                <Input
                  placeholder="Nos (नग) / Sets (संच)"
                  value={newItem.unit || 'Nos (नग)'}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">एकूण संख्या</label>
                <Input
                  type="number"
                  min={1}
                  value={newItem.totalQty || 1}
                  onChange={(e) => setNewItem(prev => ({ ...prev, totalQty: parseInt(e.target.value, 10) || 1, availableQty: parseInt(e.target.value, 10) || 1 }))}
                  className="rounded-xl font-black h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">उपलब्ध सज्ज</label>
                <Input
                  type="number"
                  min={0}
                  value={newItem.availableQty || 1}
                  onChange={(e) => setNewItem(prev => ({ ...prev, availableQty: parseInt(e.target.value, 10) || 0 }))}
                  className="rounded-xl font-black h-10 text-emerald-700"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">खराब संख्या</label>
                <Input
                  type="number"
                  min={0}
                  value={newItem.damagedQty || 0}
                  onChange={(e) => setNewItem(prev => ({ ...prev, damagedQty: parseInt(e.target.value, 10) || 0 }))}
                  className="rounded-xl font-black h-10 text-rose-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">स्थिती (Condition)</label>
              <Select value={newItem.condition} onValueChange={(val) => setNewItem(prev => ({ ...prev, condition: val as any }))}>
                <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">सुस्थितीत (Good)</SelectItem>
                  <SelectItem value="Needs Repair">दुरुस्ती योग्य (Needs Repair)</SelectItem>
                  <SelectItem value="Damaged">खराब (Damaged)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">शेरा / स्थिती टिप्पणी (Notes)</label>
              <Input
                placeholder="उदा. हवा भरणे बाकी / नवीन खरेदी"
                value={newItem.notes || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-xl font-bold h-10"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">रद्द करा</Button>
            <Button onClick={handleSaveNewEquipment} className="bg-primary text-white font-black rounded-xl">नोंदवा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 1B: EDIT EQUIPMENT */}
      <Dialog open={isEditEquipmentModalOpen} onOpenChange={setIsEditEquipmentModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" /> साहित्य माहिती संपादन (Edit Equipment)
            </DialogTitle>
          </DialogHeader>

          {editingEquipment && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">साहित्याचे नाव (मराठी)</label>
                  <Input
                    value={editingEquipment.nameMarathi || ''}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, nameMarathi: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Name (English)</label>
                  <Input
                    value={editingEquipment.name || ''}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">प्रवर्ग (Category)</label>
                  <Select value={editingEquipment.category} onValueChange={(val) => setEditingEquipment(prev => prev ? ({ ...prev, category: val as any }) : null)}>
                    <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Balls">चेंडू (Balls)</SelectItem>
                      <SelectItem value="Nets & Mats">जाळी व मॅट्स (Nets & Mats)</SelectItem>
                      <SelectItem value="Athletics">ॲथलेटिक्स (Athletics)</SelectItem>
                      <SelectItem value="Training & PT">सराव व पीटी (Training & PT)</SelectItem>
                      <SelectItem value="First Aid">प्रथमोपचार (First Aid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">एकक (Unit)</label>
                  <Input
                    value={editingEquipment.unit || 'Nos (नग)'}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, unit: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">एकूण संख्या</label>
                  <Input
                    type="number"
                    min={1}
                    value={editingEquipment.totalQty || 1}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, totalQty: parseInt(e.target.value, 10) || 1 }) : null)}
                    className="rounded-xl font-black h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">उपलब्ध सज्ज</label>
                  <Input
                    type="number"
                    min={0}
                    value={editingEquipment.availableQty || 0}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, availableQty: parseInt(e.target.value, 10) || 0 }) : null)}
                    className="rounded-xl font-black h-10 text-emerald-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">खराब संख्या</label>
                  <Input
                    type="number"
                    min={0}
                    value={editingEquipment.damagedQty || 0}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, damagedQty: parseInt(e.target.value, 10) || 0 }) : null)}
                    className="rounded-xl font-black h-10 text-rose-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">स्थिती (Condition)</label>
                <Select value={editingEquipment.condition} onValueChange={(val) => setEditingEquipment(prev => prev ? ({ ...prev, condition: val as any }) : null)}>
                  <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">सुस्थितीत (Good)</SelectItem>
                    <SelectItem value="Needs Repair">दुरुस्ती योग्य (Needs Repair)</SelectItem>
                    <SelectItem value="Damaged">खराब (Damaged)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">शेरा / स्थिती टिप्पणी (Notes)</label>
                <Input
                  value={editingEquipment.notes || ''}
                  onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                  className="rounded-xl font-bold h-10"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditEquipmentModalOpen(false)} className="rounded-xl">रद्द करा</Button>
            <Button onClick={handleUpdateEquipment} className="bg-primary text-white font-black rounded-xl">बदल सेव्ह करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ISSUE EQUIPMENT */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              क्रीडा साहित्य वाटप नोंद (Issue Gear)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Equipment Selection */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>साहित्य निवडा (Select Equipment) *</span>
                <span className="text-[10px] text-muted-foreground font-semibold">एकूण प्रकार: {equipmentList.length}</span>
              </label>
              {equipmentList.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center justify-between">
                  <span className="font-medium">साठा रिकामा आहे.</span>
                  <Button 
                    size="sm" 
                    onClick={() => DEFAULT_EQUIPMENT_STOCK.forEach(item => store?.addEquipmentItem?.(item))}
                    className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                  >
                    मानक साठा जोडा (Load Standard Stock)
                  </Button>
                </div>
              ) : (
                <Select value={newIssue.itemId || ''} onValueChange={(val) => setNewIssue(prev => ({ ...prev, itemId: val }))}>
                  <SelectTrigger className="rounded-xl font-bold h-11 border-2">
                    <SelectValue placeholder="साहित्य निवडा..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {equipmentList.map(eq => (
                      <SelectItem 
                        key={eq.id} 
                        value={eq.id} 
                        className="font-bold text-xs"
                        disabled={eq.availableQty <= 0}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{eq.nameMarathi || eq.name}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-mono ml-2",
                            eq.availableQty > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          )}>
                            {eq.availableQty > 0 ? `उपलब्ध: ${eq.availableQty} ${eq.unit}` : 'साठा संपला'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Quick Player Select from Roster or Custom Type */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>खेळाडू / विद्यार्थी निवडा (Select Registered Student/Player)</span>
                <span className="text-[10px] text-primary font-bold">किंवा खाली थेट टाईप करा</span>
              </label>
              <Select 
                value="" 
                onValueChange={(pId) => {
                  const pl = (store?.data?.players || []).find((p: any) => p.id === pId);
                  if (pl) {
                    const marathi = pl.nameMarathi || transliterateEnglishToMarathi(pl.name) || pl.name;
                    setNewIssue(prev => ({
                      ...prev,
                      issuedTo: marathi,
                      roleOrClass: `इ. ${pl.std || '९'} वी (${(pl.sports && pl.sports[0]) || 'खेळाडू'})`
                    }));
                  }
                }}
              >
                <SelectTrigger className="rounded-xl font-medium text-xs h-9 border border-dashed border-primary/40 bg-slate-50">
                  <SelectValue placeholder="रोस्टरमधून विद्यार्थी निवडा (वैकल्पिक)..." />
                </SelectTrigger>
                <SelectContent className="max-h-52">
                  {(store?.data?.players || []).map((pl: any) => (
                    <SelectItem key={pl.id} value={pl.id} className="text-xs">
                      {pl.nameMarathi || transliterateEnglishToMarathi(pl.name) || pl.name} (इ. {pl.std} वी - {pl.sports?.join(', ') || 'खेळाडू'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">विद्यार्थी / कप्तान नाव *</label>
                <Input
                  placeholder="उदा. युनिराम गावित / सचिन गांगुर्डे"
                  value={newIssue.issuedTo || ''}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, issuedTo: e.target.value }))}
                  className="rounded-xl font-bold h-10 border-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">इयत्ता / भूमिका (Role/Class)</label>
                <Input
                  placeholder="उदा. इ. ९ वी (व्हॉलीबॉल कप्तान)"
                  value={newIssue.roleOrClass || ''}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, roleOrClass: e.target.value }))}
                  className="rounded-xl font-bold h-10 border-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">संख्या (Quantity) *</label>
              <Input
                type="number"
                min={1}
                max={99}
                value={newIssue.quantity || 1}
                onChange={(e) => setNewIssue(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 1 }))}
                className="rounded-xl font-black h-10 border-2"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">कारण / उद्देश (Remarks/Purpose)</label>
              <Input
                placeholder="उदा. सकाळचा सराव / तालुकास्तरीय सामना"
                value={newIssue.remarks || ''}
                onChange={(e) => setNewIssue(prev => ({ ...prev, remarks: e.target.value }))}
                className="rounded-xl font-bold h-10 border-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)} className="rounded-xl">रद्द करा</Button>
            <Button onClick={handleIssueSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl">वाटप नोंद पूर्ण करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2B: EDIT ISSUE */}
      <Dialog open={isEditIssueModalOpen} onOpenChange={setIsEditIssueModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" /> वाटप नोंद संपादन (Edit Issue Record)
            </DialogTitle>
          </DialogHeader>

          {editingIssue && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">विद्यार्थी / कप्तान नाव</label>
                  <Input
                    value={editingIssue.issuedTo || ''}
                    onChange={(e) => setEditingIssue(prev => prev ? ({ ...prev, issuedTo: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">इयत्ता / भूमिका (Role/Class)</label>
                  <Input
                    value={editingIssue.roleOrClass || ''}
                    onChange={(e) => setEditingIssue(prev => prev ? ({ ...prev, roleOrClass: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">संख्या (Quantity)</label>
                  <Input
                    type="number"
                    min={1}
                    value={editingIssue.quantity || 1}
                    onChange={(e) => setEditingIssue(prev => prev ? ({ ...prev, quantity: parseInt(e.target.value, 10) || 1 }) : null)}
                    className="rounded-xl font-black h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">स्थिती (Status)</label>
                  <Select value={editingIssue.status} onValueChange={(val) => setEditingIssue(prev => prev ? ({ ...prev, status: val as any }) : null)}>
                    <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Issued">वाटप केलेले (Issued)</SelectItem>
                      <SelectItem value="Returned">जमा झाले (Returned)</SelectItem>
                      <SelectItem value="Overdue">प्रलंबित (Overdue)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">वाटप वेळ / तारीख</label>
                  <Input
                    value={editingIssue.issueDate || ''}
                    onChange={(e) => setEditingIssue(prev => prev ? ({ ...prev, issueDate: e.target.value }) : null)}
                    className="rounded-xl font-mono text-xs h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">जमा वेळ / तारीख</label>
                  <Input
                    placeholder="उदा. 2026-08-27 18:00"
                    value={editingIssue.returnDate || ''}
                    onChange={(e) => setEditingIssue(prev => prev ? ({ ...prev, returnDate: e.target.value }) : null)}
                    className="rounded-xl font-mono text-xs h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">कारण / उद्देश / शेरा (Remarks)</label>
                <Input
                  value={editingIssue.remarks || ''}
                  onChange={(e) => setEditingIssue(prev => prev ? ({ ...prev, remarks: e.target.value }) : null)}
                  className="rounded-xl font-bold h-10"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditIssueModalOpen(false)} className="rounded-xl">रद्द करा</Button>
            <Button onClick={handleUpdateIssue} className="bg-primary text-white font-black rounded-xl">बदल सेव्ह करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: ADD INDENT ITEM */}
      <Dialog open={isIndentModalOpen} onOpenChange={setIsIndentModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase">नवीन मागणी साहित्य जोडा</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">साहित्याचे नाव (मराठी)</label>
                <Input
                  placeholder="उदा. कॉस्को व्हॉलीबॉल"
                  value={newIndentItem.itemNameMarathi || ''}
                  onChange={(e) => setNewIndentItem(prev => ({ ...prev, itemNameMarathi: e.target.value }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Item Name (English)</label>
                <Input
                  placeholder="e.g. Cosco Volleyball"
                  value={newIndentItem.itemName || ''}
                  onChange={(e) => setNewIndentItem(prev => ({ ...prev, itemName: e.target.value }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">सध्याचा साठा</label>
                <Input
                  type="number"
                  min={0}
                  value={newIndentItem.currentStock || 0}
                  onChange={(e) => setNewIndentItem(prev => ({ ...prev, currentStock: parseInt(e.target.value, 10) || 0 }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">मागणी संख्या</label>
                <Input
                  type="number"
                  min={1}
                  value={newIndentItem.requiredQty || 1}
                  onChange={(e) => setNewIndentItem(prev => ({ ...prev, requiredQty: parseInt(e.target.value, 10) || 1 }))}
                  className="rounded-xl font-black h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">अंदाजित दर (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={newIndentItem.estimatedRate || 500}
                  onChange={(e) => setNewIndentItem(prev => ({ ...prev, estimatedRate: parseInt(e.target.value, 10) || 0 }))}
                  className="rounded-xl font-bold h-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">मागणीचे कारण / आवश्यकता</label>
              <Input
                placeholder="उदा. तालुकास्तरीय स्पर्धा पूर्वतयारीसाठी"
                value={newIndentItem.justification || ''}
                onChange={(e) => setNewIndentItem(prev => ({ ...prev, justification: e.target.value }))}
                className="rounded-xl font-bold h-10"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">प्राधान्य (Priority)</label>
              <Select value={newIndentItem.priority} onValueChange={(val) => setNewIndentItem(prev => ({ ...prev, priority: val as any }))}>
                <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">उच्च (High Priority - अत्यावश्यक)</SelectItem>
                  <SelectItem value="Medium">मध्यम (Medium Priority)</SelectItem>
                  <SelectItem value="Low">कमी (Low Priority)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsIndentModalOpen(false)} className="rounded-xl">रद्द करा</Button>
            <Button onClick={handleAddIndentSubmit} className="bg-primary text-white font-black rounded-xl">मागणी जोडा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3B: EDIT INDENT ITEM */}
      <Dialog open={isEditIndentModalOpen} onOpenChange={setIsEditIndentModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" /> मागणी साहित्य संपादन (Edit Indent Item)
            </DialogTitle>
          </DialogHeader>

          {editingIndent && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">साहित्याचे नाव (मराठी)</label>
                  <Input
                    value={editingIndent.itemNameMarathi || ''}
                    onChange={(e) => setEditingIndent(prev => prev ? ({ ...prev, itemNameMarathi: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Item Name (English)</label>
                  <Input
                    value={editingIndent.itemName || ''}
                    onChange={(e) => setEditingIndent(prev => prev ? ({ ...prev, itemName: e.target.value }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">सध्याचा साठा</label>
                  <Input
                    type="number"
                    min={0}
                    value={editingIndent.currentStock || 0}
                    onChange={(e) => setEditingIndent(prev => prev ? ({ ...prev, currentStock: parseInt(e.target.value, 10) || 0 }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">मागणी संख्या</label>
                  <Input
                    type="number"
                    min={1}
                    value={editingIndent.requiredQty || 1}
                    onChange={(e) => setEditingIndent(prev => prev ? ({ ...prev, requiredQty: parseInt(e.target.value, 10) || 1 }) : null)}
                    className="rounded-xl font-black h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">अंदाजित दर (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    value={editingIndent.estimatedRate || 0}
                    onChange={(e) => setEditingIndent(prev => prev ? ({ ...prev, estimatedRate: parseInt(e.target.value, 10) || 0 }) : null)}
                    className="rounded-xl font-bold h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">मागणीचे कारण / आवश्यकता</label>
                <Input
                  value={editingIndent.justification || ''}
                  onChange={(e) => setEditingIndent(prev => prev ? ({ ...prev, justification: e.target.value }) : null)}
                  className="rounded-xl font-bold h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">प्राधान्य (Priority)</label>
                <Select value={editingIndent.priority} onValueChange={(val) => setEditingIndent(prev => prev ? ({ ...prev, priority: val as any }) : null)}>
                  <SelectTrigger className="rounded-xl font-bold h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">उच्च (High Priority - अत्यावश्यक)</SelectItem>
                    <SelectItem value="Medium">मध्यम (Medium Priority)</SelectItem>
                    <SelectItem value="Low">कमी (Low Priority)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditIndentModalOpen(false)} className="rounded-xl">रद्द करा</Button>
            <Button onClick={handleUpdateIndent} className="bg-primary text-white font-black rounded-xl">बदल सेव्ह करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

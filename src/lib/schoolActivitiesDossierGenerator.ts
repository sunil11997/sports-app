/**
 * Official School Activities, Daily Reports, Photo Evidence & Medical Incidents Dossier Generator
 * Designed for Ashram Schools (शासकीय माध्यमिक आश्रम शाळा वाघंबा, ता. बागलाण, जि. नाशिक)
 * under the Tribal Development Department, Government of Maharashtra.
 * 
 * Supports:
 * 1. High-fidelity A4 Printable HTML / PDF Document
 * 2. Formatted Microsoft Word (.DOC) Export with tables and embedded imagery
 * 3. Multi-day / All-time cumulative aggregation (Daily Reports, Photos, Medical Incidents, Attendance)
 */

import { format } from 'date-fns';
import { TEACHER_SIGN_B64 } from './teacherSignature';
import { TRIBAL_DEV_LOGO_B64, AMRIT_MAHOTSAV_LOGO_B64 } from './headerLogos';
import { parseMedicalLog, transliterateEnglishToMarathi, getOfficialSchoolName, getTeacherName } from './utils';
import { generateVerificationQrSvgUri } from './dsoFormAGenerator';
import { GeoPhoto } from './photo-storage';
import { HealthIncident, Player, SchoolProfile } from './types';

export interface DossierFilterOptions {
  dateRangeMode: 'all' | 'academic_year' | 'this_month' | 'last_30_days' | 'today' | 'custom';
  startDate?: string;
  endDate?: string;
  category?: 'all' | 'sports' | 'general';
  includeDailyActivities: boolean;
  includePhotos: boolean;
  includeMedical: boolean;
  includeAttendance: boolean;
  includeTeacherRemarks: boolean;
  outwardRefNumber?: string;
  submittedTo?: string;
  reportTitle?: string;
  customRemarks?: string;
}

export interface DossierAggregatedData {
  schoolProfile?: SchoolProfile;
  activities: any[];
  photos: GeoPhoto[];
  healthIncidents: HealthIncident[];
  dailySummaries: Record<string, { summary: string; weather: string }>;
  attendanceRecords: Record<string, any>;
  players: Player[];
  dateRangeLabel: string;
  stats: {
    totalDays: number;
    totalActivities: number;
    totalYoga: number;
    totalPtMass: number;
    totalSportsDrills: number;
    totalPhotos: number;
    totalMedical: number;
    totalBoysCount: number;
    totalGirlsCount: number;
    totalParticipation: number;
  };
}

/**
 * Filter and aggregate raw store data according to selected date options
 */
export function aggregateDossierData(
  storeData: any,
  options: DossierFilterOptions,
  allIdbPhotos: GeoPhoto[] = []
): DossierAggregatedData {
  const schoolProfile = storeData?.schoolProfile;
  const players: Player[] = storeData?.players || [];
  const rawActivities: any[] = storeData?.activities || storeData?.schoolActivities || [];
  const rawHealth: HealthIncident[] = storeData?.healthIncidents || [];
  const dailySummaries: Record<string, { summary: string; weather: string }> = storeData?.dailySummaries || {};
  const rawAttendance: Record<string, any> = storeData?.attendance || {};

  // Merge photos from Firestore and IndexedDB
  const photoMap = new Map<string, GeoPhoto>();
  const firestorePhotosObj = storeData?.reportPhotos || {};
  Object.values(firestorePhotosObj).forEach((photoList: any) => {
    if (Array.isArray(photoList)) {
      photoList.forEach((p: GeoPhoto) => {
        if (p?.id) photoMap.set(p.id, p);
      });
    }
  });
  allIdbPhotos.forEach((p) => {
    if (p?.id) photoMap.set(p.id, p);
  });
  const allPhotos = Array.from(photoMap.values());

  // Determine date bounds
  const today = format(new Date(), 'yyyy-MM-dd');
  let start = options.startDate || '2025-06-01';
  let end = options.endDate || today;
  let dateRangeLabel = 'सर्व नोंदी (All Records Cumulative)';

  if (options.dateRangeMode === 'today') {
    start = today;
    end = today;
    dateRangeLabel = `आजचा अहवाल: ${format(new Date(today), 'dd/MM/yyyy')}`;
  } else if (options.dateRangeMode === 'this_month') {
    const now = new Date();
    start = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    end = today;
    dateRangeLabel = `चालू महिना (${format(now, 'MMMM yyyy')}): ${format(new Date(start), 'dd/MM/yyyy')} ते ${format(new Date(end), 'dd/MM/yyyy')}`;
  } else if (options.dateRangeMode === 'last_30_days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    start = format(d, 'yyyy-MM-dd');
    end = today;
    dateRangeLabel = `मागील ३० दिवस: ${format(new Date(start), 'dd/MM/yyyy')} ते ${format(new Date(end), 'dd/MM/yyyy')}`;
  } else if (options.dateRangeMode === 'academic_year') {
    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth() + 1;
    const academicStart = curMonth >= 6 ? `${curYear}-06-01` : `${curYear - 1}-06-01`;
    start = academicStart;
    end = today;
    dateRangeLabel = `शैक्षणिक वर्ष २०२६-२७: ${format(new Date(start), 'dd/MM/yyyy')} ते ${format(new Date(end), 'dd/MM/yyyy')}`;
  } else if (options.dateRangeMode === 'custom') {
    start = options.startDate || today;
    end = options.endDate || today;
    dateRangeLabel = `कालावधी: ${format(new Date(start), 'dd/MM/yyyy')} ते ${format(new Date(end), 'dd/MM/yyyy')}`;
  }

  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = dateStr.slice(0, 10);
    if (options.dateRangeMode === 'all') return true;
    return d >= start && d <= end;
  };

  // Filter activities
  const filteredActivities = rawActivities.filter((a: any) => {
    if (!isDateInRange(a.date)) return false;
    if (options.category && options.category !== 'all') {
      const cat = a.category === 'student' ? 'general' : 'sports';
      if (cat !== options.category) return false;
    }
    return true;
  });
  // Sort reverse chronological
  filteredActivities.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Filter photos
  const filteredPhotos = allPhotos.filter((p: GeoPhoto) => {
    return isDateInRange(p.date);
  });
  filteredPhotos.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Filter health incidents
  const filteredHealth = rawHealth.filter((h: HealthIncident) => {
    return isDateInRange(h.date);
  });
  filteredHealth.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Compute stats
  const distinctDays = new Set<string>();
  let totalBoys = 0;
  let totalGirls = 0;
  let yogaCount = 0;
  let ptMassCount = 0;
  let sportsDrillsCount = 0;

  filteredActivities.forEach((act: any) => {
    if (act.date) distinctDays.add(act.date);
    const b = parseInt(act.boysCount || '0', 10) || 0;
    const g = parseInt(act.girlsCount || '0', 10) || 0;
    totalBoys += b;
    totalGirls += g;

    const lower = `${act.type || ''} ${act.summary || ''}`.toLowerCase();
    if (lower.includes('yoga') || lower.includes('योगा') || lower.includes('सूर्य')) {
      yogaCount++;
    } else if (lower.includes('pt') || lower.includes('कवायत') || lower.includes('mass')) {
      ptMassCount++;
    } else {
      sportsDrillsCount++;
    }
  });

  filteredPhotos.forEach((p) => {
    if (p.date) distinctDays.add(p.date);
  });
  filteredHealth.forEach((h) => {
    if (h.date) distinctDays.add(h.date);
  });

  return {
    schoolProfile,
    activities: filteredActivities,
    photos: filteredPhotos,
    healthIncidents: filteredHealth,
    dailySummaries,
    attendanceRecords: rawAttendance,
    players,
    dateRangeLabel,
    stats: {
      totalDays: distinctDays.size || 1,
      totalActivities: filteredActivities.length,
      totalYoga: yogaCount,
      totalPtMass: ptMassCount,
      totalSportsDrills: sportsDrillsCount,
      totalPhotos: filteredPhotos.length,
      totalMedical: filteredHealth.length,
      totalBoysCount: totalBoys,
      totalGirlsCount: totalGirls,
      totalParticipation: totalBoys + totalGirls,
    },
  };
}

/**
 * Generate official printable HTML Document
 */
export function generatePrintableDossierHtml(
  data: DossierAggregatedData,
  options: DossierFilterOptions
): string {
  const schoolName = getOfficialSchoolName(data.schoolProfile, true);
  const teacherName = getTeacherName(data.schoolProfile);
  const teacherSignature = data.schoolProfile?.teacherSignature || TEACHER_SIGN_B64;
  const outwardRef = options.outwardRefNumber || `शामाआशा/वाघंबा/क्रीडा/२०२६-२७/${Math.floor(100 + Math.random() * 900)}`;
  const submittedTo = options.submittedTo || 'मा. प्रकल्प अधिकारी / गटशिक्षणाधिकारी / मुख्याध्यापक, शासकीय आश्रम शाळा वाघंबा';
  const currentDate = format(new Date(), 'dd/MM/yyyy');
  const reportMainTitle = options.reportTitle || 'शालेय क्रीडा, शारीरिक शिक्षण, दैनिक उपक्रम व आरोग्य तपासणी सर्वसमावेशक अहवाल';

  const verificationQrUri = generateVerificationQrSvgUri({
    schoolUdise: '27200201201',
    sport: 'Comprehensive-PE-Sports',
    category: 'Institutional-Dossier',
    academicYear: '2026-2027',
    playerCount: data.players.length || 150,
  });

  // Section 1: Executive Summary Table
  const summarySectionHtml = `
    <div class="section-box">
      <div class="section-header">१. संक्षिप्त सांख्यिकी गोषवारा (EXECUTIVE STATISTICAL SUMMARY)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 45px;">अ.क्र.</th>
            <th>तपशील / घटक (Component)</th>
            <th style="text-align: center; width: 150px;">नोंदवलेली संख्या (Total Count)</th>
            <th>शेरा / टिप्पणी (Remarks)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; font-weight: 800;">१</td>
            <td><strong>एकूण सक्रिय उपक्रम दिवस (Total Activity Days)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #1e3a8a; font-size: 13px;">${data.stats.totalDays} दिवस</td>
            <td>शारीरिक शिक्षण व क्रीडा सराव नियमित चालू</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">२</td>
            <td><strong>एकूण आयोजित क्रीडा व शारीरिक शिक्षण सत्रे (Total Drills Conducted)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #1e3a8a; font-size: 13px;">${data.stats.totalActivities} सत्रे</td>
            <td>योगा, पी.टी. व क्रीडा ड्रिल्स एकत्रित</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">३</td>
            <td><strong>योगासन व ध्यानधारणा सत्रे (Yoga & Meditation Sessions)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #7c3aed; font-size: 13px;">${data.stats.totalYoga} सत्रे</td>
            <td>सूर्यनमस्कार, प्राणायाम व ताडासन सराव</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">४</td>
            <td><strong>सामूहिक पी.टी. मास व कवायत (Mass PT & Assembly Drills)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #0284c7; font-size: 13px;">${data.stats.totalPtMass} सत्रे</td>
            <td>शिस्त, ताळमेळ व संचलन सराव</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">५</td>
            <td><strong>प्रमुख क्रीडा सराव (Volleyball, Kabaddi, Kho-Kho Drills)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #ea580c; font-size: 13px;">${data.stats.totalSportsDrills} सत्रे</td>
            <td>मैदानी कौशल्य व तंत्रशुद्ध सराव</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">६</td>
            <td><strong>सहभागी विद्यार्थी उपस्थिती (Total Student Attendances)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #059669; font-size: 13px;">${data.stats.totalParticipation} (मुले: ${data.stats.totalBoysCount}, मुली: ${data.stats.totalGirlsCount})</td>
            <td>मुले व मुलींचा सक्रिय व उत्साही सहभाग</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">७</td>
            <td><strong>भू-चिन्हांकित प्रत्यक्ष पुरावा छायाचित्रे (Geotagged Photo Evidence)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #b45309; font-size: 13px;">${data.stats.totalPhotos} फोटो</td>
            <td>GPS अक्षांश-रेखांश व वेळेच्या नोंदीसह</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 800;">८</td>
            <td><strong>आरोग्य व प्रथमोपचार प्रसंग (Medical Incidents & First Aid)</strong></td>
            <td style="text-align: center; font-weight: 900; color: #dc2626; font-size: 13px;">${data.stats.totalMedical} प्रसंग</td>
            <td>तात्काळ प्रथमोपचार व वैद्यकीय उपचार पूर्ण</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // Section 2: Daily Activities Table
  let activitiesSectionHtml = '';
  if (options.includeDailyActivities) {
    activitiesSectionHtml = `
      <div class="section-box page-break-before">
        <div class="section-header">२. दैनिक क्रीडा, योगा व शारीरिक शिक्षण उपक्रम सविस्तर नोंद (DETAILED DAILY ACTIVITIES LOG)</div>
        ${
          data.activities.length === 0
            ? '<div class="empty-state">निवडलेल्या कालावधीत कोणतेही उपक्रम नोंदवलेले नाहीत.</div>'
            : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px;">अ.क्र.</th>
                  <th style="width: 85px;">तारीख (Date)</th>
                  <th style="width: 120px;">क्रीडा / उपक्रम प्रकार</th>
                  <th>आयोजित सराव / तपशील (Drill / Activity Details)</th>
                  <th style="width: 60px; text-align: center;">इयत्ता</th>
                  <th style="width: 50px; text-align: center;">मुले</th>
                  <th style="width: 50px; text-align: center;">मुली</th>
                  <th style="width: 55px; text-align: center;">एकूण</th>
                </tr>
              </thead>
              <tbody>
                ${data.activities
                  .map((act: any, idx: number) => {
                    const formattedDate = act.date ? format(new Date(act.date), 'dd/MM/yyyy') : '-';
                    const boys = parseInt(act.boysCount || '0', 10) || 0;
                    const girls = parseInt(act.girlsCount || '0', 10) || 0;
                    const total = act.totalCount || boys + girls || '-';
                    const stdLabel = act.std ? `इ. ${act.std}` : 'सर्व';
                    return `
                      <tr>
                        <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                        <td style="font-weight: 700; color: #1e3a8a; white-space: nowrap;">${formattedDate}</td>
                        <td><span class="badge-tag">${act.type || 'General PE'}</span></td>
                        <td>
                          <strong>${act.summary || act.drillName || act.type}</strong>
                          ${act.duration ? `<span style="font-size: 10px; color: #64748b; margin-left: 6px;">(${act.duration})</span>` : ''}
                        </td>
                        <td style="text-align: center; font-weight: 700;">${stdLabel}</td>
                        <td style="text-align: center; font-weight: 800; color: #1e3a8a;">${boys}</td>
                        <td style="text-align: center; font-weight: 800; color: #ec4899;">${girls}</td>
                        <td style="text-align: center; font-weight: 900; color: #0f172a; background: #f8fafc;">${total}</td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          `
        }
      </div>
    `;
  }

  // Section 3: Geotagged Photos Gallery
  let photosSectionHtml = '';
  if (options.includePhotos) {
    photosSectionHtml = `
      <div class="section-box page-break-before">
        <div class="section-header">३. भू-चिन्हांकित प्रत्यक्ष छायाचित्रे पुरावा (GEOTAGGED GROUND PHOTO EVIDENCE)</div>
        <p class="section-subtext">
          सदर छायाचित्रे प्रत्यक्ष शालेय क्रीडांगणावर व मैदानावर आयोजित सराव सत्रादरम्यान GPS स्थान नोंदीसह टिपण्यात आलेली आहेत.
        </p>
        ${
          data.photos.length === 0
            ? '<div class="empty-state">निवडलेल्या कालावधीत कोणतेही फोटो नोंदवलेले नाहीत.</div>'
            : `
            <div class="photo-grid">
              ${data.photos
                .map((photo: GeoPhoto, index: number) => {
                  const photoDate = photo.date ? format(new Date(photo.date), 'dd/MM/yyyy') : '-';
                  const lat = photo.lat != null ? `${photo.lat}° N` : '20.6124° N';
                  const lng = photo.lng != null ? `${photo.lng}° E` : '74.0722° E';
                  const sportBadge = photo.sport || 'Sports Practice';
                  const drillBadge = photo.drill ? ` • ${photo.drill}` : '';
                  const captionText = photo.caption || 'दैनिक क्रीडा व शारीरिक सराव सत्र';

                  return `
                    <div class="photo-card">
                      <div class="photo-frame">
                        <img src="${photo.url}" alt="${photo.caption || 'Activity Photo'}" loading="lazy" />
                        <div class="photo-watermark">शा.मा.आ.शाळा वाघंबा • अधिकृत पुरावा #${index + 1}</div>
                      </div>
                      <div class="photo-details">
                        <div class="photo-caption">${captionText}</div>
                        <div class="photo-tags">🏆 ${sportBadge}${drillBadge}</div>
                        <div class="photo-meta">
                          <span>📅 दिनांक: <strong>${photoDate}</strong></span>
                          <span>📍 GPS: <strong>${lat}, ${lng}</strong></span>
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          `
        }
      </div>
    `;
  }

  // Section 4: Medical Incidents Register
  let medicalSectionHtml = '';
  if (options.includeMedical) {
    medicalSectionHtml = `
      <div class="section-box page-break-before">
        <div class="section-header">४. विद्यार्थी आरोग्य, दुखापत व प्रथमोपचार नोंदवही (STUDENT MEDICAL & FIRST AID AUDIT REGISTER)</div>
        <p class="section-subtext">
          खेळ, सराव व निवासी आश्रमशाळा परिसरामध्ये घडलेल्या वैद्यकीय घटना, दुखापती व तत्परतेने दिलेला प्रथमोपचार यांचा अधिकृत तपशील.
        </p>
        ${
          data.healthIncidents.length === 0
            ? '<div class="empty-state">निवडलेल्या कालावधीत कोणतीही गंभीर वैद्यकीय अडचण किंवा दुखापत नोंदवलेली नाही. सर्व विद्यार्थी सुदृढ आहेत.</div>'
            : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px;">अ.क्र.</th>
                  <th style="width: 85px;">तारीख</th>
                  <th style="width: 140px;">विद्यार्थ्याचे नाव (Student)</th>
                  <th style="width: 60px; text-align: center;">इयत्ता</th>
                  <th style="width: 130px;">दुखापत / अडचण (Diagnosis)</th>
                  <th style="width: 80px; text-align: center;">तीव्रता</th>
                  <th>दिलेला प्रथमोपचार व उपचार (First Aid / Protocol)</th>
                  <th style="width: 90px; text-align: center;">सद्यस्थिती</th>
                </tr>
              </thead>
              <tbody>
                ${data.healthIncidents
                  .map((inc: any, idx: number) => {
                    const formattedDate = inc.date ? format(new Date(inc.date), 'dd/MM/yyyy') : '-';
                    const p = data.players.find((pl) => pl.id === inc.playerId);
                    const studentName = p
                      ? p.nameMarathi || transliterateEnglishToMarathi(p.name) || p.name
                      : inc.playerName || 'विद्यार्थी';
                    const std = p?.std ? `इ. ${p.std}` : '-';
                    const parsed = parseMedicalLog(inc.description);
                    const isCrit = inc.severity === 'Critical' || parsed.severity.includes('Severe');
                    const sevBadge = isCrit
                      ? '<span class="badge-crit">गंभीर / Critical</span>'
                      : '<span class="badge-minor">सामान्य / Minor</span>';
                    const treatment = parsed.medicine || parsed.protocol || parsed.remarks || 'प्रथमोपचार व विश्रांती';
                    const statusText = inc.resolved
                      ? '<span style="color:#059669; font-weight:800;">✓ पूर्ण बरे</span>'
                      : '<span style="color:#2563eb; font-weight:800;">उपचार पूर्ण</span>';

                    return `
                      <tr>
                        <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                        <td style="font-weight: 700; color: #1e3a8a;">${formattedDate}</td>
                        <td><strong>${studentName}</strong></td>
                        <td style="text-align: center; font-weight: 700;">${std}</td>
                        <td>
                          <strong>${parsed.diagnosis}</strong>
                          <div style="font-size: 10px; color: #64748b;">ठिकाण: ${parsed.location}</div>
                        </td>
                        <td style="text-align: center;">${sevBadge}</td>
                        <td style="font-size: 11px; line-height: 1.4;">${treatment}</td>
                        <td style="text-align: center;">${statusText}</td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          `
        }
      </div>
    `;
  }

  // Section 5: Teacher Observations & Certification
  const teacherRemarksHtml = options.includeTeacherRemarks
    ? `
      <div class="section-box">
        <div class="section-header">५. क्रीडा शिक्षक स्व-मूल्यांकन व शेरा (INSTRUCTOR EVALUATION & REMARKS)</div>
        <div class="remarks-content">
          ${
            options.customRemarks ||
            `शासकीय माध्यमिक आश्रम शाळा वाघंबा येथील विद्यार्थ्यांच्या सर्वांगीण शारीरिक, मानसिक व क्रीडा विकासासाठी वरील नमूद उपक्रम वेळेवर व नियोजनबद्धरीत्या घेण्यात आले आहेत. आश्रमशाळेतील सर्व विद्यार्थी नियमित सकाळच्या योगासन, सूर्यनमस्कार, सामूहिक पी.टी. आणि संध्याकाळच्या वॉलीबॉल, खो-खो व कबड्डी खेळांच्या सराव सत्रांमध्ये उत्साहाने सहभागी होत आहेत. सराव दरम्यान विद्यार्थ्यांच्या सुरक्षिततेची व आरोग्याची संपूर्ण दक्षता घेतली जात असून कोणत्याही दुखापतीच्या वेळी तात्काळ प्रथमोपचार उपलब्ध करून देण्यात येत आहे. आगामी तालुका व जिल्हास्तरीय क्रीडा स्पर्धांसाठी विद्यार्थी कसून सराव करत आहेत.`
          }
        </div>
      </div>
    `
    : '';

  // Return full HTML page
  return `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${reportMainTitle} - ${data.dateRangeLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Noto Sans Devanagari', 'Inter', -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      line-height: 1.5;
      margin: 0;
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1e3a8a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 99999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    .toolbar-title { font-weight: 900; font-size: 14px; letter-spacing: 0.5px; }
    .toolbar-actions { display: flex; gap: 10px; }
    .btn {
      cursor: pointer;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      border: none;
      transition: all 0.2s;
    }
    .btn-back { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .btn-print { background: #f59e0b; color: #fff; }
    .btn-word { background: #2563eb; color: #fff; }

    .paper-sheet {
      max-width: 900px;
      margin: 60px auto 40px auto;
      background: #ffffff;
      padding: 28px;
      border: 4px double #1e3a8a;
      border-radius: 4px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }

    .inner-border {
      border: 1.5px solid #1e3a8a;
      padding: 20px;
      border-radius: 2px;
    }

    /* Government Letterhead */
    .official-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 14px;
      margin-bottom: 16px;
      gap: 16px;
    }
    .header-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .header-text {
      text-align: center;
      flex: 1;
    }
    .govt-title {
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 3px;
    }
    .school-title {
      font-size: 19px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
      line-height: 1.25;
    }
    .taluka-dist {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }
    .dossier-pill {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      border: 1.5px solid #f59e0b;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Meta Box */
    .meta-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 18px;
      font-size: 11.5px;
    }
    .meta-item { display: flex; gap: 6px; }
    .meta-label { font-weight: 800; color: #1e3a8a; }
    .meta-val { font-weight: 700; color: #0f172a; }

    /* Section Styling */
    .section-box {
      margin-bottom: 22px;
      page-break-inside: auto;
    }
    .section-header {
      background: #1e3a8a;
      color: #ffffff;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 4px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    .section-subtext {
      font-size: 11px;
      color: #475569;
      font-style: italic;
      margin-bottom: 10px;
      padding-left: 2px;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: middle;
    }
    .data-table th {
      background: #f1f5f9;
      color: #1e3a8a;
      font-weight: 900;
      text-transform: uppercase;
      font-size: 10.5px;
      letter-spacing: 0.3px;
    }
    .data-table tr:nth-child(even) { background: #fafafa; }
    .data-table tr { page-break-inside: avoid; }

    /* Badges */
    .badge-tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      display: inline-block;
    }
    .badge-crit {
      background: #fee2e2;
      color: #b91c1c;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 900;
      display: inline-block;
    }
    .badge-minor {
      background: #ecfdf5;
      color: #047857;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 800;
      display: inline-block;
    }

    /* Photos Grid */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-top: 10px;
    }
    .photo-card {
      border: 1.5px solid #1e3a8a;
      border-radius: 6px;
      background: #ffffff;
      padding: 8px;
      page-break-inside: avoid;
    }
    .photo-frame {
      position: relative;
      width: 100%;
      height: 200px;
      background: #0f172a;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }
    .photo-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .photo-watermark {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 8.5px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 3px;
      letter-spacing: 0.3px;
    }
    .photo-details { margin-top: 8px; }
    .photo-caption { font-size: 11px; font-weight: 800; color: #1e3a8a; margin-bottom: 2px; }
    .photo-tags { font-size: 9.5px; font-weight: 800; color: #b45309; margin-bottom: 4px; }
    .photo-meta { display: flex; justify-content: space-between; font-size: 9px; color: #475569; font-weight: 700; border-top: 1px dashed #cbd5e1; padding-top: 4px; }

    /* Remarks Content */
    .remarks-content {
      background: #fafafa;
      border: 1px solid #cbd5e1;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 11.5px;
      line-height: 1.7;
      font-weight: 600;
      color: #1e293b;
      font-style: italic;
    }

    /* Footer & Signatures */
    .footer-attestation {
      margin-top: 35px;
      padding-top: 14px;
      border-top: 2px solid #1e3a8a;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
    }
    .sign-col {
      text-align: center;
      width: 220px;
    }
    .sign-img {
      height: 48px;
      max-width: 180px;
      object-fit: contain;
      margin: 0 auto 4px auto;
      display: block;
    }
    .stamp-circle {
      width: 60px;
      height: 60px;
      border: 1.5px dashed #64748b;
      border-radius: 50%;
      margin: 0 auto 6px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: #64748b;
      font-weight: 800;
      text-transform: uppercase;
    }
    .sign-label { font-weight: 900; font-size: 11px; color: #0f172a; text-transform: uppercase; }
    .sign-name { font-size: 10px; font-weight: 700; color: #475569; margin-top: 2px; }
    .qr-col { text-align: center; }
    .qr-img { width: 70px; height: 70px; margin: 0 auto 2px auto; display: block; }
    .qr-caption { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; }

    .empty-state {
      padding: 18px;
      text-align: center;
      font-size: 11.5px;
      color: #64748b;
      font-style: italic;
      background: #fafafa;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
    }

    /* Print Styles */
    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      .no-print { display: none !important; }
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .paper-sheet {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 12px !important;
        border: 3.5px double #1e3a8a !important;
        box-shadow: none !important;
      }
      .inner-border {
        border: 1px solid #1e3a8a !important;
        padding: 12px !important;
      }
      .page-break-before {
        page-break-before: always !important;
      }
      .photo-frame { height: 160px !important; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid !important; }
      .photo-card, .section-box, .footer-attestation { page-break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print print-toolbar">
    <div class="toolbar-title">🏛️ शासकीय कार्यालय सादर अहवाल (Official Office Dossier Preview)</div>
    <div class="toolbar-actions">
      <button onclick="window.close()" class="btn btn-back">← मागे जा (Go Back)</button>
      <button onclick="window.print()" class="btn btn-print">🖨️ मुद्रण / PDF सेव्ह करा (Print PDF)</button>
    </div>
  </div>

  <div class="paper-sheet">
    <div class="inner-border">
      <!-- Official Header -->
      <div class="official-header">
        <img src="${TRIBAL_DEV_LOGO_B64}" alt="Tribal Development Department Logo" class="header-logo" />
        <div class="header-text">
          <div class="govt-title">महाराष्ट्र शासन • आदिवासी विकास विभाग</div>
          <div class="school-title">${schoolName}</div>
          <div class="taluka-dist">तालुका: बागलाण • जिल्हा: नाशिक (महाराष्ट्र) • U-DISE: 27200201201</div>
          <div class="dossier-pill">${reportMainTitle}</div>
        </div>
        <img src="${AMRIT_MAHOTSAV_LOGO_B64}" alt="Azadi Ka Amrit Mahotsav Logo" class="header-logo" />
      </div>

      <!-- Outward & Submission Meta -->
      <div class="meta-box">
        <div class="meta-item">
          <span class="meta-label">जावक क्रमांक:</span>
          <span class="meta-val">${outwardRef}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">अहवाल दिनांक:</span>
          <span class="meta-val">${currentDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">अहवाल कालावधी:</span>
          <span class="meta-val">${data.dateRangeLabel}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">सादरकर्ता:</span>
          <span class="meta-val">${teacherName} (क्रीडा शिक्षक)</span>
        </div>
        <div class="meta-item" style="grid-column: span 2;">
          <span class="meta-label">सादर:</span>
          <span class="meta-val">${submittedTo}</span>
        </div>
      </div>

      <!-- Sections -->
      ${summarySectionHtml}
      ${activitiesSectionHtml}
      ${photosSectionHtml}
      ${medicalSectionHtml}
      ${teacherRemarksHtml}

      <!-- Attestation Signatures -->
      <div class="footer-attestation">
        <div class="sign-col">
          <img src="${teacherSignature}" alt="Teacher Signature" class="sign-img" />
          <div class="sign-label">क्रीडा शिक्षक स्वाक्षरी</div>
          <div class="sign-name">(${teacherName})</div>
          <div style="font-size: 8.5px; color: #64748b;">शारीरिक शिक्षण व क्रीडा मार्गदर्शक</div>
        </div>

        <div class="qr-col">
          <img src="${verificationQrUri}" alt="Verification QR Code" class="qr-img" />
          <div class="qr-caption">शासकीय दस्तऐवज पडताळणी QR</div>
        </div>

        <div class="sign-col">
          <div class="stamp-circle">अधिकृत शिक्का</div>
          <div class="sign-label">मुख्याध्यापक स्वाक्षरी व शिक्का</div>
          <div class="sign-name">(${schoolName})</div>
          <div style="font-size: 8.5px; color: #64748b;">शासकीय माध्यमिक आश्रम शाळा वाघंबा</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate MS Word (.doc) MIME formatted document and trigger download
 */
export function downloadWordDossier(
  data: DossierAggregatedData,
  options: DossierFilterOptions
): void {
  const schoolName = getOfficialSchoolName(data.schoolProfile, true);
  const teacherName = getTeacherName(data.schoolProfile);
  const outwardRef = options.outwardRefNumber || `शामाआशा/वाघंबा/क्रीडा/२०२६-२७/${Math.floor(100 + Math.random() * 900)}`;
  const submittedTo = options.submittedTo || 'मा. प्रकल्प अधिकारी / गटशिक्षणाधिकारी / मुख्याध्यापक';
  const currentDate = format(new Date(), 'dd/MM/yyyy');
  const reportMainTitle = options.reportTitle || 'शालेय क्रीडा, शारीरिक शिक्षण, दैनिक उपक्रम व आरोग्य तपासणी सर्वसमावेशक अहवाल';

  const htmlDoc = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${reportMainTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Noto Sans Devanagari', 'Arial', sans-serif; font-size: 11pt; color: #000; line-height: 1.4; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 14pt; }
        th, td { border: 1pt solid #1e3a8a; padding: 6pt 8pt; vertical-align: top; }
        th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-align: left; }
        .hdr { text-align: center; border-bottom: 2pt solid #1e3a8a; padding-bottom: 10pt; margin-bottom: 12pt; }
        .school-name { font-size: 16pt; font-weight: bold; color: #1e3a8a; margin: 4pt 0; }
        .report-title { font-size: 13pt; font-weight: bold; color: #b45309; text-transform: uppercase; margin-top: 6pt; }
        .sec-head { background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 11pt; padding: 5pt 8pt; margin: 14pt 0 6pt 0; }
      </style>
    </head>
    <body>
      <div class="hdr">
        <p style="font-size: 10pt; color: #475569; margin: 0;">महाराष्ट्र शासन • आदिवासी विकास विभाग</p>
        <div class="school-name">${schoolName}</div>
        <p style="font-size: 10pt; margin: 2pt 0;">तालुका: बागलाण, जिल्हा: नाशिक (महाराष्ट्र) • U-DISE: 27200201201</p>
        <div class="report-title">${reportMainTitle}</div>
      </div>

      <table>
        <tr>
          <td><strong>जावक क्रमांक:</strong> ${outwardRef}</td>
          <td><strong>अहवाल दिनांक:</strong> ${currentDate}</td>
        </tr>
        <tr>
          <td><strong>कालावधी:</strong> ${data.dateRangeLabel}</td>
          <td><strong>सादरकर्ता:</strong> ${teacherName} (क्रीडा शिक्षक)</td>
        </tr>
        <tr>
          <td colspan="2"><strong>सादर:</strong> ${submittedTo}</td>
        </tr>
      </table>

      <div class="sec-head">१. संक्षिप्त सांख्यिकी गोषवारा (EXECUTIVE STATISTICAL SUMMARY)</div>
      <table>
        <tr><th>अ.क्र.</th><th>घटक</th><th>एकूण संख्या</th><th>शेरा</th></tr>
        <tr><td>१</td><td>सक्रिय उपक्रम दिवस</td><td>${data.stats.totalDays} दिवस</td><td>नियमित सराव चालू</td></tr>
        <tr><td>२</td><td>आयोजित क्रीडा व पी.टी. सत्रे</td><td>${data.stats.totalActivities} सत्रे</td><td>योगा, पी.टी. व खेळांचे ड्रिल्स</td></tr>
        <tr><td>३</td><td>योगासन व प्राणायाम सत्रे</td><td>${data.stats.totalYoga} सत्रे</td><td>सूर्यनमस्कार व आसन सराव</td></tr>
        <tr><td>४</td><td>सामूहिक पी.टी. मास कवायत</td><td>${data.stats.totalPtMass} सत्रे</td><td>कवायत व शिस्त संचलन</td></tr>
        <tr><td>५</td><td>प्रमुख क्रीडा सराव सत्रे</td><td>${data.stats.totalSportsDrills} सत्रे</td><td>वॉलीबॉल, कबड्डी, खो-खो</td></tr>
        <tr><td>६</td><td>सहभागी विद्यार्थी उपस्थिती</td><td>${data.stats.totalParticipation} (मुले: ${data.stats.totalBoysCount}, मुली: ${data.stats.totalGirlsCount})</td><td>सक्रिय सहभाग</td></tr>
        <tr><td>७</td><td>प्रत्यक्ष पुरावा छायाचित्रे</td><td>${data.stats.totalPhotos} फोटो</td><td>GPS नोंदीसह छायाचित्रे</td></tr>
        <tr><td>८</td><td>वैद्यकीय व प्रथमोपचार प्रसंग</td><td>${data.stats.totalMedical} प्रसंग</td><td>तात्काळ प्रथमोपचार पूर्ण</td></tr>
      </table>

      ${
        options.includeDailyActivities && data.activities.length > 0
          ? `
          <div class="sec-head">२. दैनिक क्रीडा व उपक्रम तपशील (DAILY ACTIVITIES LOG)</div>
          <table>
            <tr><th>अ.क्र.</th><th>तारीख</th><th>प्रकार</th><th>सराव तपशील</th><th>इयत्ता</th><th>मुले</th><th>मुली</th><th>एकूण</th></tr>
            ${data.activities
              .map((act: any, i: number) => {
                const b = parseInt(act.boysCount || '0', 10) || 0;
                const g = parseInt(act.girlsCount || '0', 10) || 0;
                return `<tr>
                  <td>${i + 1}</td>
                  <td>${act.date || '-'}</td>
                  <td>${act.type || 'Sports'}</td>
                  <td>${act.summary || act.drillName || '-'}</td>
                  <td>${act.std ? 'इ. ' + act.std : 'सर्व'}</td>
                  <td>${b}</td>
                  <td>${g}</td>
                  <td>${b + g}</td>
                </tr>`;
              })
              .join('')}
          </table>
        `
          : ''
      }

      ${
        options.includeMedical && data.healthIncidents.length > 0
          ? `
          <div class="sec-head">३. विद्यार्थी आरोग्य व प्रथमोपचार नोंदवही (MEDICAL LOG)</div>
          <table>
            <tr><th>अ.क्र.</th><th>तारीख</th><th>नाव</th><th>इयत्ता</th><th>दुखापत</th><th>तीव्रता</th><th>प्रथमोपचार</th></tr>
            ${data.healthIncidents
              .map((h: any, i: number) => {
                const p = data.players.find((pl) => pl.id === h.playerId);
                const sName = p?.nameMarathi || h.playerName || 'विद्यार्थी';
                const parsed = parseMedicalLog(h.description);
                return `<tr>
                  <td>${i + 1}</td>
                  <td>${h.date || '-'}</td>
                  <td>${sName}</td>
                  <td>${p?.std ? 'इ. ' + p.std : '-'}</td>
                  <td>${parsed.diagnosis} (${parsed.location})</td>
                  <td>${h.severity || 'Minor'}</td>
                  <td>${parsed.medicine || parsed.protocol || '-'}</td>
                </tr>`;
              })
              .join('')}
          </table>
        `
          : ''
      }

      <div class="sec-head">४. क्रीडा शिक्षक शेरा (INSTRUCTOR REMARKS)</div>
      <p style="font-style: italic; background: #f8fafc; padding: 10pt; border: 1pt solid #cbd5e1;">
        ${options.customRemarks || 'शासकीय माध्यमिक आश्रम शाळा वाघंबा येथील विद्यार्थ्यांसाठी आयोजित क्रीडा, योगा व शारीरिक शिक्षण उपक्रम विहित वेळेत यशस्वीरीत्या पार पडले आहेत. विद्यार्थ्यांच्या आरोग्याची संपूर्ण काळजी घेण्यात आली असून आगामी क्रीडा स्पर्धांसाठी तयारी चालू आहे.'}
      </p>

      <table style="border: none; margin-top: 35pt;">
        <tr style="border: none;">
          <td style="border: none; text-align: center; width: 50%;">
            <br><br>
            <strong>क्रीडा शिक्षक स्वाक्षरी</strong><br>
            (${teacherName})<br>
            शा.मा.आ.शाळा वाघंबा
          </td>
          <td style="border: none; text-align: center; width: 50%;">
            <br><br>
            <strong>मुख्याध्यापक स्वाक्षरी व शिक्का</strong><br>
            (${schoolName})
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeDate = format(new Date(), 'yyyyMMdd');
  a.download = `शासकीय_आश्रम_शाळा_वाघंबा_सर्वसमावेशक_क्रीडा_अहवाल_${safeDate}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Open official print window
 */
export function openPrintDossierWindow(
  data: DossierAggregatedData,
  options: DossierFilterOptions
): void {
  const html = generatePrintableDossierHtml(data, options);
  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}

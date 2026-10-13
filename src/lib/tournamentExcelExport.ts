import * as XLSX from 'xlsx';
import { SheetRow, UnderCategoryDef, OFFICIAL_CATEGORIES, SPORT_MARATHI_MAP, is12SquadSport } from '@/components/features/OfficialTournamentSheetModal';

export interface TournamentExcelMetadata {
  departmentName: string;
  projectName: string;
  schoolName: string;
  sportName: string;
  selectedSportKey: string;
  academicYear: string;
  teacherName?: string;
  uDise?: string;
  taluka?: string;
}

export const DEFAULT_UDISE = '27200116503';
export const DEFAULT_TALUKA = 'बागलाण';
export const DEFAULT_SCHOOL_MR = 'शासकीय माध्यमिक आश्रमशाळा वाघांबा';

export const OFFICIAL_MARATHI_COLUMNS = [
  'अनु. क्र.',
  'खेळाडूचे पूर्ण नाव',
  'जनरल रजिस्टर नं.',
  'जन्मतारीख',
  'आईचे नाव',
  'आधार क्र.',
  'शाळेचे नाव',
  'यु-डायस क्रमांक',
  'तालुका',
  'वयोगट',
  'खेळाचा प्रकार'
];

/**
 * Helper to sanitize sheet names for Excel (max 31 chars, no invalid characters like : \ / ? * [ ])
 */
function sanitizeSheetName(name: string): string {
  const clean = name.replace(/[:\\/?*\[\]]/g, ' ').trim();
  return clean.slice(0, 31) || 'Sheet';
}

/**
 * Build a professionally styled worksheet with the exact 11 Marathi columns requested by user:
 * 1. अनु. क्र.
 * 2. खेळाडूचे पूर्ण नाव
 * 3. जनरल रजिस्टर नं.
 * 4. जन्मतारीख
 * 5. आईचे नाव
 * 6. आधार क्र.
 * 7. शाळेचे नाव
 * 8. यु-डायस क्रमांक (27200116503)
 * 9. तालुका (बागलाण)
 * 10. वयोगट
 * 11. खेळाचा प्रकार
 */
export function buildOfficialWorksheet(
  categoryLabel: string,
  rows: SheetRow[],
  meta: TournamentExcelMetadata,
  options?: {
    is12Only?: boolean;
    customNote?: string;
    includeSignatures?: boolean;
    headerSportName?: string;
  }
): XLSX.WorkSheet {
  const is12Only = options?.is12Only ?? false;
  const playerRows = is12Only ? rows.slice(0, 12) : rows;

  const defaultSchool = meta.schoolName || DEFAULT_SCHOOL_MR;
  const defaultUdise = meta.uDise || DEFAULT_UDISE;
  const defaultTaluka = meta.taluka || DEFAULT_TALUKA;
  const sportDisplayName = options?.headerSportName || meta.sportName || SPORT_MARATHI_MAP[meta.selectedSportKey] || meta.selectedSportKey;

  // Header metadata rows
  const wsData: (string | number)[][] = [
    // Row 1: Department
    [meta.departmentName || 'आदिवासी विकास विभाग नाशिक'],
    // Row 2: Project
    [meta.projectName || 'एकात्मिक आदिवासी विकास प्रकल्प, कळवण ता.कळवण जि.नाशिक'],
    // Row 3: School Name
    [defaultSchool],
    // Row 4: Subheader meta bar
    [
      `वयोगट :- ${categoryLabel}`,
      '',
      '',
      `खेळ प्रकार :- ${sportDisplayName}`,
      '',
      '',
      `सन :- ${meta.academicYear || '2026-27'}`,
      '',
      options?.customNote ? options.customNote : (is12Only ? 'नियम: १२ खेळाडू संघ' : `एकूण खेळाडू: ${playerRows.length}`),
      '',
      ''
    ],
    // Row 5: Blank separation
    [],
    // Row 6: Column Headers (Exact 11 Marathi Headers)
    [...OFFICIAL_MARATHI_COLUMNS]
  ];

  // Data rows
  if (playerRows.length === 0) {
    wsData.push([
      '१',
      '-- या वयोगटासाठी खेळाडू यादी उपलब्ध नाही --',
      '-',
      '-',
      '-',
      '-',
      defaultSchool,
      defaultUdise,
      defaultTaluka,
      categoryLabel,
      sportDisplayName
    ]);
  } else {
    playerRows.forEach((r, idx) => {
      const sr = r.srNo || String(idx + 1);
      const name = r.studentName || '';
      const gr = r.grNo || '-';
      const dob = r.dob || '-';
      const mother = r.motherName || '-';
      const aadhar = r.aadhar || '-';
      const school = r.schoolName || defaultSchool;
      const udise = r.uDise || defaultUdise;
      const taluka = r.taluka || defaultTaluka;
      const vyogat = r.ageCategoryLabel || categoryLabel || '-';
      const khel = r.sportOrEvent || sportDisplayName || '-';

      wsData.push([
        sr,
        name,
        gr,
        dob,
        mother,
        aadhar,
        school,
        udise,
        taluka,
        vyogat,
        khel
      ]);
    });
  }

  // Footer & Signatures
  if (options?.includeSignatures !== false) {
    wsData.push([]);
    wsData.push([]);
    const teacherDisplayName = meta.teacherName || 'क्रीडा शिक्षक';
    wsData.push([
      '',
      `क्रीडा शिक्षक (स्वाक्षरी) - ${teacherDisplayName}`,
      '',
      '',
      '',
      '',
      `मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का) - ${defaultSchool}`,
      '',
      '',
      '',
      ''
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths (wch = character width)
  ws['!cols'] = [
    { wch: 9 },  // अनु. क्र.
    { wch: 30 }, // खेळाडूचे पूर्ण नाव
    { wch: 15 }, // जनरल रजिस्टर नं.
    { wch: 14 }, // जन्मतारीख
    { wch: 22 }, // आईचे नाव
    { wch: 18 }, // आधार क्र.
    { wch: 34 }, // शाळेचे नाव
    { wch: 16 }, // यु-डायस क्रमांक
    { wch: 12 }, // तालुका
    { wch: 18 }, // वयोगट
    { wch: 16 }  // खेळाचा प्रकार
  ];

  // Header Merges
  const totalCols = 10; // 0 to 10 = 11 columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
    { s: { r: 3, c: 3 }, e: { r: 3, c: 5 } },
    { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 8 }, e: { r: 3, c: totalCols } },
  ];

  return ws;
}

/**
 * Export the currently selected Category Sheet to an Excel (.xlsx) file.
 */
export function exportSingleCategoryToExcel(
  categoryLabel: string,
  rows: SheetRow[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();
  const is12Only = is12SquadSport(meta.selectedSportKey, meta.sportName);
  const ws = buildOfficialWorksheet(categoryLabel, rows, meta, { is12Only });
  const cleanSheetName = sanitizeSheetName(categoryLabel || 'Tournament_Sheet');
  
  XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

  const cleanSport = (meta.sportName || meta.selectedSportKey || 'Sport').replace(/\s+/g, '_');
  const cleanCat = (categoryLabel || 'Category').replace(/\s+/g, '_');
  const filename = `${cleanSport}_${cleanCat}_अधिकृत_क्रीडा_शीट_${meta.academicYear || '2026-27'}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Export 12 Players for Current Sport: First Boys, then Girls in a single sheet (or multi-tab).
 * Deduplicates players so the same student is not repeated.
 */
export function exportGame12PlayersBoysGirlsExcel(
  sportKey: string,
  boysRows: SheetRow[],
  girlsRows: SheetRow[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();
  const sportMr = meta.sportName || SPORT_MARATHI_MAP[sportKey] || sportKey;

  // Deduplicate and cap to 12
  const top12Boys = boysRows.slice(0, 12);
  const top12Girls = girlsRows.slice(0, 12);

  // Combine: First Boys (1 to 12), then Girls (1 to 12 or 13 to 24)
  const seenIds = new Set<string>();
  const combined: SheetRow[] = [];

  top12Boys.forEach((b, idx) => {
    const key = b.id || b.grNo || b.studentName;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      combined.push({
        ...b,
        srNo: String(combined.length + 1),
        ageCategoryLabel: b.ageCategoryLabel || 'मुले',
        sportOrEvent: sportMr
      });
    }
  });

  top12Girls.forEach((g, idx) => {
    const key = g.id || g.grNo || g.studentName;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      combined.push({
        ...g,
        srNo: String(combined.length + 1),
        ageCategoryLabel: g.ageCategoryLabel || 'मुली',
        sportOrEvent: sportMr
      });
    }
  });

  // Sheet 1: Combined 12 Boys + 12 Girls (First Boys, Then Girls)
  const combinedWs = buildOfficialWorksheet(
    '१२ खेळाडू संघ (प्रथम मुले, नंतर मुली)',
    combined,
    meta,
    {
      is12Only: false,
      customNote: `एकूण खेळाडू: ${combined.length} (मुले: ${top12Boys.length}, मुली: ${top12Girls.length})`,
      headerSportName: sportMr
    }
  );
  XLSX.utils.book_append_sheet(wb, combinedWs, '१२_खेळाडू_मुले_व_मुली');

  // Sheet 2: Boys 12 Squad
  if (top12Boys.length > 0) {
    const boysWs = buildOfficialWorksheet(
      '१२ मुले संघ (Boys 12 Squad)',
      top12Boys.map((b, i) => ({ ...b, srNo: String(i + 1), ageCategoryLabel: b.ageCategoryLabel || 'मुले' })),
      meta,
      { is12Only: true, headerSportName: sportMr }
    );
    XLSX.utils.book_append_sheet(wb, boysWs, 'मुले_१२_खेळाडू');
  }

  // Sheet 3: Girls 12 Squad
  if (top12Girls.length > 0) {
    const girlsWs = buildOfficialWorksheet(
      '१२ मुली संघ (Girls 12 Squad)',
      top12Girls.map((g, i) => ({ ...g, srNo: String(i + 1), ageCategoryLabel: g.ageCategoryLabel || 'मुली' })),
      meta,
      { is12Only: true, headerSportName: sportMr }
    );
    XLSX.utils.book_append_sheet(wb, girlsWs, 'मुली_१२_खेळाडू');
  }

  const cleanSport = sportMr.replace(/\s+/g, '_');
  const filename = `${cleanSport}_१२_खेळाडू_मुले_व_मुली_${meta.academicYear || '2026-27'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export Consolidated Track & Field Athletics Sheet (all 6 events) to an Excel (.xlsx) file.
 */
export function exportConsolidatedAthleticsToExcel(
  rows: SheetRow[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();
  const ws = buildOfficialWorksheet(
    'सर्व मैदानी स्पर्धा (भालाफेक, थाळीफेक, गोळाफेक, धावणे, लांब उडी, उंच उडी)',
    rows,
    meta,
    {
      is12Only: false,
      headerSportName: 'सर्व मैदानी व धावणे स्पर्धा'
    }
  );
  
  XLSX.utils.book_append_sheet(wb, ws, 'मैदानी_स्पर्धा_एकत्रित');

  const filename = `सर्व_मैदानी_खेळ_एकत्रित_अधिकृत_शीट_${meta.academicYear || '2026-27'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export ALL 6 Official Tournament Categories (14 Girls, 14 Boys, 17 Girls, 17 Boys, 19 Girls, 19 Boys)
 * into a single multi-worksheet Excel workbook!
 */
export function exportAllCategoriesWorkbookToExcel(
  categorySheets: Record<string, SheetRow[]>,
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();

  OFFICIAL_CATEGORIES.forEach(catDef => {
    const catRows = categorySheets[catDef.key] || [];
    const is12Only = is12SquadSport(meta.selectedSportKey, meta.sportName);
    const ws = buildOfficialWorksheet(catDef.labelMr, catRows, meta, { is12Only });
    const sheetName = sanitizeSheetName(catDef.shortLabel || catDef.key);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const cleanSport = (meta.sportName || meta.selectedSportKey || 'Sport').replace(/\s+/g, '_');
  const filename = `${cleanSport}_सर्व_६_वयोगट_अधिकृत_क्रीडा_शीट_${meta.academicYear || '2026-27'}.xlsx`;

  XLSX.writeFile(wb, filename);
}

export interface SportSquadExportItem {
  sportKey: string;
  sportNameMr: string;
  boysRows: SheetRow[];
  girlsRows: SheetRow[];
}

/**
 * Export EVERY GAME 12 Players (Boys then Girls) into a master multi-tab workbook!
 */
export function exportEveryGame12PlayersWorkbookToExcel(
  sportsData: SportSquadExportItem[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();

  sportsData.forEach(item => {
    const top12Boys = item.boysRows.slice(0, 12);
    const top12Girls = item.girlsRows.slice(0, 12);

    const combined: SheetRow[] = [];
    const seen = new Set<string>();

    top12Boys.forEach((b) => {
      const k = b.id || b.grNo || b.studentName;
      if (!seen.has(k)) {
        seen.add(k);
        combined.push({
          ...b,
          srNo: String(combined.length + 1),
          sportOrEvent: item.sportNameMr,
          ageCategoryLabel: b.ageCategoryLabel || 'मुले'
        });
      }
    });

    top12Girls.forEach((g) => {
      const k = g.id || g.grNo || g.studentName;
      if (!seen.has(k)) {
        seen.add(k);
        combined.push({
          ...g,
          srNo: String(combined.length + 1),
          sportOrEvent: item.sportNameMr,
          ageCategoryLabel: g.ageCategoryLabel || 'मुली'
        });
      }
    });

    const sportMeta: TournamentExcelMetadata = {
      ...meta,
      selectedSportKey: item.sportKey,
      sportName: item.sportNameMr
    };

    const ws = buildOfficialWorksheet(
      `${item.sportNameMr} (१२ मुले व १२ मुली)`,
      combined,
      sportMeta,
      {
        is12Only: false,
        customNote: `१२ खेळाडू संघ: प्रथम मुले (${top12Boys.length}), नंतर मुली (${top12Girls.length})`,
        headerSportName: item.sportNameMr
      }
    );

    const sheetName = sanitizeSheetName(item.sportNameMr || item.sportKey);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const filename = `सर्व_खेळ_१२_खेळाडू_मुले_व_मुली_वर्कबुक_${meta.academicYear || '2026-27'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Master Tournament Participation Sheet:
 * User requirement: "dont add in the list same student in the same porpose that list is the i want to know how many plyer are going to play"
 *
 * This export lists all UNIQUE players selected across all squads / purposes.
 * - Deduplicated by student ID / GR No / name (each student appears strictly ONCE)
 * - Ordered: FIRST ALL BOYS, THEN ALL GIRLS
 * - Displays exact player count prominently: "एकूण खेळाडू संख्या: XX (मुले: YY, मुली: ZZ)"
 */
export function exportUniqueTournamentPlayersExcel(
  uniquePlayers: SheetRow[],
  meta: TournamentExcelMetadata,
  summary: { total: number; boys: number; girls: number }
) {
  const wb = XLSX.utils.book_new();

  const ws = buildOfficialWorksheet(
    'एकूण सहभागी खेळाडू मास्टर यादी (अद्वितीय मुले व मुली)',
    uniquePlayers,
    meta,
    {
      is12Only: false,
      customNote: `एकूण खेळाडू संख्या: ${summary.total} (👦 मुले: ${summary.boys} | 👧 मुली: ${summary.girls}) - कोणतीही पुनरावृत्ती नाही`,
      headerSportName: 'सर्व स्पर्धा खेळ'
    }
  );

  XLSX.utils.book_append_sheet(wb, ws, 'एकूण_सहभागी_खेळाडू');

  const filename = `शालेय_क्रीडा_स्पर्धा_एकूण_${summary.total}_खेळाडू_मास्टर_यादी_${meta.academicYear || '2026-27'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

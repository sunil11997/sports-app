import * as XLSX from 'xlsx';
import { SheetRow, UnderCategoryDef, OFFICIAL_CATEGORIES, SPORT_MARATHI_MAP, is12SquadSport } from '@/components/features/OfficialTournamentSheetModal';
import { resolveStudentDetails, getPlayerAgeCategoryLabel, formatAadharGrouped, formatDobDDMMYYYY } from '@/lib/tournamentStudentResolver';

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
  categoryLabel?: string;
}

export const DEFAULT_UDISE = '27200116503';
export const DEFAULT_TALUKA = 'बागलाण';
export const DEFAULT_SCHOOL_MR = 'शासकीय माध्यमिक आश्रमशाळा वाघांबा';

export const OFFICIAL_MARATHI_COLUMNS = [
  'अनु. क्र.',
  'खेळाडूचे पूर्ण नाव',
  'इयत्ता',
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
 * Build a professionally styled worksheet with the exact 12 Marathi columns:
 * 1. अनु. क्र.
 * 2. खेळाडूचे पूर्ण नाव
 * 3. इयत्ता
 * 4. जनरल रजिस्टर नं.
 * 5. जन्मतारीख
 * 6. आईचे नाव
 * 7. आधार क्र.
 * 8. शाळेचे नाव
 * 9. यु-डायस क्रमांक (27200116503)
 * 10. तालुका (बागलाण)
 * 11. वयोगट (१४ / १७ / १९ वर्षाखालील मुले किंवा मुली)
 * 12. खेळाचा प्रकार
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
    subSectionHeader?: string;
  }
): XLSX.WorkSheet {
  const is12Only = options?.is12Only ?? false;
  const playerRows = is12Only ? rows.slice(0, 12) : rows;

  const defaultSchool = meta.schoolName || DEFAULT_SCHOOL_MR;
  const defaultUdise = meta.uDise || DEFAULT_UDISE;
  const defaultTaluka = meta.taluka || DEFAULT_TALUKA;
  const sportDisplayName = options?.headerSportName || meta.sportName || SPORT_MARATHI_MAP[meta.selectedSportKey] || meta.selectedSportKey;
  const teacherDisplayName = meta.teacherName || 'क्रीडा शिक्षक';
  const academicYear = meta.academicYear || '2026-27';

  // Header metadata rows (Professional Layout)
  const wsData: (string | number)[][] = [
    // Row 0: Department Name (Merged Header 1)
    [meta.departmentName || 'आदिवासी विकास विभाग नाशिक'],
    // Row 1: Project Name (Merged Header 2)
    [meta.projectName || 'एकात्मिक आदिवासी विकास प्रकल्प, कळवण ता.कळवण जि.नाशिक'],
    // Row 2: School Name (Merged Header 3)
    [defaultSchool],
    // Row 3: Subheader metadata bar
    [
      `वयोगट :- ${categoryLabel}`,
      '',
      '',
      `खेळ प्रकार :- ${sportDisplayName}`,
      '',
      '',
      `सन :- २०२६-२७`,
      '',
      `यु-डायस: ${defaultUdise} | तालुका: ${defaultTaluka}`,
      '',
      '',
      ''
    ],
    // Row 4: Clean spacing gap
    [],
    // Row 5: Column Headers (Exact 12 Marathi Headers)
    [...OFFICIAL_MARATHI_COLUMNS]
  ];

  const totalCols = 11; // 0 to 11 = 12 columns
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
    { s: { r: 3, c: 3 }, e: { r: 3, c: 5 } },
    { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 8 }, e: { r: 3, c: totalCols } },
  ];

  const rowHeights: { hpt: number }[] = [
    { hpt: 28 }, // Row 0
    { hpt: 22 }, // Row 1
    { hpt: 22 }, // Row 2
    { hpt: 22 }, // Row 3
    { hpt: 10 }, // Row 4 (gap)
    { hpt: 26 }, // Row 5 (headers)
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
      '-',
      defaultSchool,
      defaultUdise,
      defaultTaluka,
      categoryLabel,
      sportDisplayName
    ]);
    rowHeights.push({ hpt: 22 });
  } else {
    playerRows.forEach((r, idx) => {
      // Resolve student details so Mother Name, Aadhaar, Age Group are ALWAYS present!
      const resolved = resolveStudentDetails(r, sportDisplayName, categoryLabel);

      const sr = r.srNo || String(idx + 1);
      const name = resolved.studentName || r.studentName || '';
      const std = resolved.std || r.std || '-';
      const gr = resolved.grNo || r.grNo || '-';
      const dob = (resolved.dob && resolved.dob !== '-') ? formatDobDDMMYYYY(resolved.dob) : (r.dob ? formatDobDDMMYYYY(r.dob) : '-');
      const mother = (resolved.motherName && resolved.motherName !== '-' ? resolved.motherName : (r.motherName || '-'));
      const aadhar = (resolved.aadhar && resolved.aadhar !== '-' ? resolved.aadhar : (r.aadhar || '-'));
      const school = resolved.schoolName || r.schoolName || defaultSchool;
      const udise = resolved.uDise || r.uDise || defaultUdise;
      const taluka = resolved.taluka || r.taluka || defaultTaluka;
      
      // CRITICAL: Ensure Age Category is NEVER just 'मुले' or 'मुली'
      let vyogat = resolved.ageCategoryLabel;
      if (!vyogat || vyogat === 'मुले' || vyogat === 'मुली' || vyogat === '-') {
        vyogat = getPlayerAgeCategoryLabel(r, categoryLabel);
      }

      const khel = resolved.sportOrEvent || r.sportOrEvent || sportDisplayName || '-';

      wsData.push([
        sr,
        name,
        std,
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
      rowHeights.push({ hpt: 22 });
    });
  }

  // Footer & Signatures
  if (options?.includeSignatures !== false) {
    // 2 gap rows
    wsData.push([]);
    rowHeights.push({ hpt: 14 });
    wsData.push([]);
    rowHeights.push({ hpt: 14 });

    const signRowIndex = wsData.length;
    wsData.push([
      '',
      `क्रीडा शिक्षक (स्वाक्षरी)\n(${teacherDisplayName})`,
      '',
      '',
      '',
      '',
      '',
      `मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)\n(${defaultSchool})`,
      '',
      '',
      '',
      ''
    ]);
    rowHeights.push({ hpt: 42 });

    // Merges for signature blocks
    merges.push({ s: { r: signRowIndex, c: 1 }, e: { r: signRowIndex, c: 4 } });
    merges.push({ s: { r: signRowIndex, c: 7 }, e: { r: signRowIndex, c: totalCols } });
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths (wch = character width)
  ws['!cols'] = [
    { wch: 8 },  // अनु. क्र.
    { wch: 32 }, // खेळाडूचे पूर्ण नाव
    { wch: 12 }, // इयत्ता
    { wch: 16 }, // जनरल रजिस्टर नं.
    { wch: 14 }, // जन्मतारीख
    { wch: 22 }, // आईचे नाव
    { wch: 20 }, // आधार क्र.
    { wch: 36 }, // शाळेचे नाव
    { wch: 16 }, // यु-डायस क्रमांक
    { wch: 14 }, // तालुका
    { wch: 20 }, // वयोगट
    { wch: 18 }  // खेळाचा प्रकार
  ];

  ws['!merges'] = merges;
  ws['!rows'] = rowHeights;

  // Format all data cells explicitly to string type where appropriate to avoid Excel formatting bugs
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:L10');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef];
      if (cell && cell.v !== undefined) {
        // GR No, Aadhaar, UDISE as strings
        if (C === 3 || C === 6 || C === 8) {
          cell.t = 's';
          cell.v = String(cell.v);
        }
      }
    }
  }

  return ws;
}

/**
 * Build 12 Players Combined Worksheet (Section 1: Boys 12, Section 2: Girls 12)
 */
/**
 * Build 12 Players Combined Worksheet (Section 1: Boys 12, Section 2: Girls 12)
 */
export function buildCombined12BoysGirlsWorksheet(
  sportMr: string,
  top12Boys: SheetRow[],
  top12Girls: SheetRow[],
  meta: TournamentExcelMetadata
): XLSX.WorkSheet {
  const defaultSchool = meta.schoolName || DEFAULT_SCHOOL_MR;
  const defaultUdise = meta.uDise || DEFAULT_UDISE;
  const defaultTaluka = meta.taluka || DEFAULT_TALUKA;
  const teacherDisplayName = meta.teacherName || 'क्रीडा शिक्षक';

  const wsData: (string | number)[][] = [
    [meta.departmentName || 'आदिवासी विकास विभाग नाशिक'],
    [meta.projectName || 'एकात्मिक आदिवासी विकास प्रकल्प, कळवण ता.कळवण जि.नाशिक'],
    [defaultSchool],
    [
      `वयोगट :- ${meta.categoryLabel ? `${meta.categoryLabel} ` : ''}१२ खेळाडू संघ (प्रथम मुले, नंतर मुली)`,
      '',
      '',
      `खेळ प्रकार :- ${sportMr}`,
      '',
      '',
      `सन :- २०२६-२७`,
      '',
      `यु-डायस: ${defaultUdise} | तालुका: ${defaultTaluka}`,
      '',
      '',
      ''
    ],
    [],
    // Section 1 Header: 12 Boys
    [`👦 १. मुले संघ (${meta.categoryLabel ? `${meta.categoryLabel} ` : ''}१२ खेळाडू)`],
    [...OFFICIAL_MARATHI_COLUMNS]
  ];

  const totalCols = 11;
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
    { s: { r: 3, c: 3 }, e: { r: 3, c: 5 } },
    { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 8 }, e: { r: 3, c: totalCols } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: totalCols } }, // Boys section header
  ];

  const rowHeights: { hpt: number }[] = [
    { hpt: 28 }, // 0
    { hpt: 22 }, // 1
    { hpt: 22 }, // 2
    { hpt: 22 }, // 3
    { hpt: 10 }, // 4 gap
    { hpt: 24 }, // 5 boys section
    { hpt: 26 }, // 6 columns
  ];

  // Append Boys 12
  top12Boys.forEach((b, idx) => {
    const resolved = resolveStudentDetails(b, sportMr, 'मुले');
    const sr = String(idx + 1);
    const name = resolved.studentName || b.studentName || '';
    const std = resolved.std || b.std || '-';
    const gr = resolved.grNo || b.grNo || '-';
    const dob = (resolved.dob && resolved.dob !== '-') ? formatDobDDMMYYYY(resolved.dob) : (b.dob ? formatDobDDMMYYYY(b.dob) : '-');
    const mother = (resolved.motherName && resolved.motherName !== '-' ? resolved.motherName : (b.motherName || '-'));
    const aadhar = (resolved.aadhar && resolved.aadhar !== '-' ? resolved.aadhar : (b.aadhar || '-'));
    const school = resolved.schoolName || defaultSchool;
    const udise = resolved.uDise || defaultUdise;
    const taluka = resolved.taluka || defaultTaluka;
    const vyogat = getPlayerAgeCategoryLabel(b, 'Male');

    wsData.push([sr, name, std, gr, dob, mother, aadhar, school, udise, taluka, vyogat, sportMr]);
    rowHeights.push({ hpt: 22 });
  });

  // Gap row
  wsData.push([]);
  rowHeights.push({ hpt: 14 });

  // Section 2 Header: 12 Girls
  const girlsSectionRow = wsData.length;
  wsData.push([`👧 २. मुली संघ (${meta.categoryLabel ? `${meta.categoryLabel} ` : ''}१२ खेळाडू)`]);
  merges.push({ s: { r: girlsSectionRow, c: 0 }, e: { r: girlsSectionRow, c: totalCols } });
  rowHeights.push({ hpt: 24 });

  wsData.push([...OFFICIAL_MARATHI_COLUMNS]);
  rowHeights.push({ hpt: 26 });

  // Append Girls 12
  top12Girls.forEach((g, idx) => {
    const resolved = resolveStudentDetails(g, sportMr, 'मुली');
    const sr = String(idx + 1);
    const name = resolved.studentName || g.studentName || '';
    const std = resolved.std || g.std || '-';
    const gr = resolved.grNo || g.grNo || '-';
    const dob = (resolved.dob && resolved.dob !== '-') ? formatDobDDMMYYYY(resolved.dob) : (g.dob ? formatDobDDMMYYYY(g.dob) : '-');
    const mother = (resolved.motherName && resolved.motherName !== '-' ? resolved.motherName : (g.motherName || '-'));
    const aadhar = (resolved.aadhar && resolved.aadhar !== '-' ? resolved.aadhar : (g.aadhar || '-'));
    const school = resolved.schoolName || defaultSchool;
    const udise = resolved.uDise || defaultUdise;
    const taluka = resolved.taluka || defaultTaluka;
    const vyogat = getPlayerAgeCategoryLabel(g, 'Female');

    wsData.push([sr, name, std, gr, dob, mother, aadhar, school, udise, taluka, vyogat, sportMr]);
    rowHeights.push({ hpt: 22 });
  });

  // Signatures
  wsData.push([]);
  rowHeights.push({ hpt: 14 });
  wsData.push([]);
  rowHeights.push({ hpt: 14 });

  const signRow = wsData.length;
  wsData.push([
    '',
    `क्रीडा शिक्षक (स्वाक्षरी)\n(${teacherDisplayName})`,
    '',
    '',
    '',
    '',
    '',
    `मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)\n(${defaultSchool})`,
    '',
    '',
    '',
    ''
  ]);
  rowHeights.push({ hpt: 42 });

  merges.push({ s: { r: signRow, c: 1 }, e: { r: signRow, c: 4 } });
  merges.push({ s: { r: signRow, c: 7 }, e: { r: signRow, c: totalCols } });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 8 },  // अनु. क्र.
    { wch: 32 }, // खेळाडूचे पूर्ण नाव
    { wch: 12 }, // इयत्ता
    { wch: 16 }, // जनरल रजिस्टर नं.
    { wch: 14 }, // जन्मतारीख
    { wch: 22 }, // आईचे नाव
    { wch: 20 }, // आधार क्र.
    { wch: 36 }, // शाळेचे नाव
    { wch: 16 }, // यु-डायस क्रमांक
    { wch: 14 }, // तालुका
    { wch: 20 }, // वयोगट
    { wch: 18 }  // खेळाचा प्रकार
  ];

  ws['!merges'] = merges;
  ws['!rows'] = rowHeights;

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
 * Export 12 BOYS ONLY (.xlsx)
 */
export function exportBoysOnly12Excel(
  sportKey: string,
  boysRows: SheetRow[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();
  const sportMr = meta.sportName || SPORT_MARATHI_MAP[sportKey] || sportKey;
  const top12Boys = boysRows.slice(0, 12).map((b, i) => ({
    ...b,
    srNo: String(i + 1),
    ageCategoryLabel: getPlayerAgeCategoryLabel(b, 'Male'),
    sportOrEvent: sportMr
  }));

  const catLabel = meta.categoryLabel ? `${meta.categoryLabel} (१२ खेळाडू संघ)` : '१२ मुले संघ (Boys 12 Squad)';
  const ws = buildOfficialWorksheet(
    catLabel,
    top12Boys,
    meta,
    { is12Only: true, headerSportName: sportMr }
  );

  XLSX.utils.book_append_sheet(wb, ws, '१२_मुले_संघ');
  const cleanSport = sportMr.replace(/\s+/g, '_');
  XLSX.writeFile(wb, `${cleanSport}_१२_मुले_संघ_${meta.academicYear || '2026-27'}.xlsx`);
}

/**
 * Export 12 GIRLS ONLY (.xlsx)
 */
export function exportGirlsOnly12Excel(
  sportKey: string,
  girlsRows: SheetRow[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();
  const sportMr = meta.sportName || SPORT_MARATHI_MAP[sportKey] || sportKey;
  const top12Girls = girlsRows.slice(0, 12).map((g, i) => ({
    ...g,
    srNo: String(i + 1),
    ageCategoryLabel: getPlayerAgeCategoryLabel(g, 'Female'),
    sportOrEvent: sportMr
  }));

  const catLabel = meta.categoryLabel ? `${meta.categoryLabel} (१२ खेळाडू संघ)` : '१२ मुली संघ (Girls 12 Squad)';
  const ws = buildOfficialWorksheet(
    catLabel,
    top12Girls,
    meta,
    { is12Only: true, headerSportName: sportMr }
  );

  XLSX.utils.book_append_sheet(wb, ws, '१२_मुली_संघ');
  const cleanSport = sportMr.replace(/\s+/g, '_');
  XLSX.writeFile(wb, `${cleanSport}_१२_मुली_संघ_${meta.academicYear || '2026-27'}.xlsx`);
}

/**
 * Export 12 Players for Current Sport:
 * Creates a professional 3-tab workbook:
 * Tab 1: १२_खेळाडू_मुले_व_मुली (Combined with section headers)
 * Tab 2: १२_मुले_संघ (12 Boys Only)
 * Tab 3: १२_मुली_संघ (12 Girls Only)
 */
export function exportGame12PlayersBoysGirlsExcel(
  sportKey: string,
  boysRows: SheetRow[],
  girlsRows: SheetRow[],
  meta: TournamentExcelMetadata
) {
  const wb = XLSX.utils.book_new();
  const sportMr = meta.sportName || SPORT_MARATHI_MAP[sportKey] || sportKey;

  const top12Boys = boysRows.slice(0, 12).map((b, i) => ({
    ...b,
    srNo: String(i + 1),
    ageCategoryLabel: getPlayerAgeCategoryLabel(b, 'Male'),
    sportOrEvent: sportMr
  }));

  const top12Girls = girlsRows.slice(0, 12).map((g, i) => ({
    ...g,
    srNo: String(i + 1),
    ageCategoryLabel: getPlayerAgeCategoryLabel(g, 'Female'),
    sportOrEvent: sportMr
  }));

  // Tab 1: Combined Worksheet (Section 1: Boys 12, Section 2: Girls 12)
  const combinedWs = buildCombined12BoysGirlsWorksheet(sportMr, top12Boys, top12Girls, meta);
  XLSX.utils.book_append_sheet(wb, combinedWs, '१२_खेळाडू_मुले_व_मुली');

  // Tab 2: Boys 12 Only
  if (top12Boys.length > 0) {
    const boysCatLabel = meta.categoryLabel ? `${meta.categoryLabel} मुले संघ (१२ खेळाडू)` : '१२ मुले संघ (Boys 12 Squad)';
    const boysWs = buildOfficialWorksheet(
      boysCatLabel,
      top12Boys,
      meta,
      { is12Only: true, headerSportName: sportMr }
    );
    XLSX.utils.book_append_sheet(wb, boysWs, '१२_मुले_संघ');
  }

  // Tab 3: Girls 12 Only
  if (top12Girls.length > 0) {
    const girlsCatLabel = meta.categoryLabel ? `${meta.categoryLabel} मुली संघ (१२ खेळाडू)` : '१२ मुली संघ (Girls 12 Squad)';
    const girlsWs = buildOfficialWorksheet(
      girlsCatLabel,
      top12Girls,
      meta,
      { is12Only: true, headerSportName: sportMr }
    );
    XLSX.utils.book_append_sheet(wb, girlsWs, '१२_मुली_संघ');
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
 * Export ALL 6 Official Tournament Categories into a single multi-worksheet Excel workbook.
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
    const top12Boys = item.boysRows.slice(0, 12).map((b, i) => ({
      ...b,
      srNo: String(i + 1),
      sportOrEvent: item.sportNameMr,
      ageCategoryLabel: getPlayerAgeCategoryLabel(b, 'Male')
    }));

    const top12Girls = item.girlsRows.slice(0, 12).map((g, i) => ({
      ...g,
      srNo: String(i + 1),
      sportOrEvent: item.sportNameMr,
      ageCategoryLabel: getPlayerAgeCategoryLabel(g, 'Female')
    }));

    const sportMeta: TournamentExcelMetadata = {
      ...meta,
      selectedSportKey: item.sportKey,
      sportName: item.sportNameMr
    };

    const combinedWs = buildCombined12BoysGirlsWorksheet(item.sportNameMr, top12Boys, top12Girls, sportMeta);
    const sheetName = sanitizeSheetName(item.sportNameMr || item.sportKey);
    XLSX.utils.book_append_sheet(wb, combinedWs, sheetName);
  });

  const filename = `सर्व_खेळ_१२_खेळाडू_मुले_व_मुली_वर्कबुक_${meta.academicYear || '2026-27'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Build clean 4-column Master Submission Worksheet for Game Management:
 * 1. अनु. क्र.
 * 2. खेळाडूचे पूर्ण नाव
 * 3. जनरल रजिस्टर नं.
 * 4. खेळाचा प्रकार (सहभागी खेळ)
 */
export function buildMasterPlayersWorksheet(
  title: string,
  players: SheetRow[],
  meta: TournamentExcelMetadata,
  summary: { total: number; boys: number; girls: number },
  genderFilter: 'all' | 'boys' | 'girls' = 'all'
): XLSX.WorkSheet {
  const defaultSchool = meta.schoolName || DEFAULT_SCHOOL_MR;
  const teacherDisplayName = meta.teacherName || 'क्रीडा शिक्षक';
  const academicYear = meta.academicYear || '2026-27';

  const metaRight = genderFilter === 'boys'
    ? `एकूण मुले खेळाडू: ${summary.boys || players.length}`
    : genderFilter === 'girls'
    ? `एकूण मुली खेळाडू: ${summary.girls || players.length}`
    : `एकूण खेळाडू संख्या: ${summary.total} (👦 मुले: ${summary.boys} | 👧 मुली: ${summary.girls})`;

  const wsData: (string | number)[][] = [
    [meta.departmentName || 'आदिवासी विकास विभाग नाशिक'],
    [meta.projectName || 'एकात्मिक आदिवासी विकास प्रकल्प, कळवण ता.कळवण जि.नाशिक'],
    [defaultSchool],
    [
      `शालेय क्रीडा स्पर्धा सन :- ${academicYear} | ${title}`,
      '',
      metaRight,
      ''
    ],
    [],
    // Column Headers (4 Columns: Sr No, Player Name, GR No, Game)
    ['अनु. क्र.', 'खेळाडूचे पूर्ण नाव', 'जनरल रजिस्टर नं.', 'खेळाचा प्रकार']
  ];

  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } },
  ];

  const rowHeights: { hpt: number }[] = [
    { hpt: 28 }, // 0
    { hpt: 22 }, // 1
    { hpt: 22 }, // 2
    { hpt: 22 }, // 3
    { hpt: 10 }, // 4 gap
    { hpt: 26 }, // 5 headers
  ];

  if (players.length === 0) {
    wsData.push(['१', '-- खेळाडू यादी उपलब्ध नाही --', '-', '-']);
    rowHeights.push({ hpt: 22 });
  } else if (genderFilter === 'all') {
    const boys = players.filter(p => p.gender === 'Male' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुले')));
    const girls = players.filter(p => p.gender === 'Female' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुली')));

    if (boys.length > 0) {
      const boysSecIdx = wsData.length;
      wsData.push([`👦 १. मुले खेळाडू यादी (एकूण मुले: ${boys.length})`, '', '', '']);
      merges.push({ s: { r: boysSecIdx, c: 0 }, e: { r: boysSecIdx, c: 3 } });
      rowHeights.push({ hpt: 24 });

      boys.forEach((b, idx) => {
        wsData.push([idx + 1, b.studentName || '', b.grNo || '-', b.sportOrEvent || '-']);
        rowHeights.push({ hpt: 22 });
      });
    }

    if (girls.length > 0) {
      if (boys.length > 0) {
        wsData.push([]);
        rowHeights.push({ hpt: 10 });
      }
      const girlsSecIdx = wsData.length;
      wsData.push([`👧 २. मुली खेळाडू यादी (एकूण मुली: ${girls.length})`, '', '', '']);
      merges.push({ s: { r: girlsSecIdx, c: 0 }, e: { r: girlsSecIdx, c: 3 } });
      rowHeights.push({ hpt: 24 });

      girls.forEach((g, idx) => {
        wsData.push([idx + 1, g.studentName || '', g.grNo || '-', g.sportOrEvent || '-']);
        rowHeights.push({ hpt: 22 });
      });
    }
  } else {
    players.forEach((p, idx) => {
      wsData.push([idx + 1, p.studentName || '', p.grNo || '-', p.sportOrEvent || '-']);
      rowHeights.push({ hpt: 22 });
    });
  }

  // Signatures
  wsData.push([]);
  rowHeights.push({ hpt: 14 });
  wsData.push([]);
  rowHeights.push({ hpt: 14 });

  const signRow = wsData.length;
  wsData.push([
    '',
    `क्रीडा शिक्षक (स्वाक्षरी)\n(${teacherDisplayName})`,
    '',
    `मुख्याध्यापक / प्राचार्य (स्वाक्षरी व शिक्का)\n(${defaultSchool})`
  ]);
  rowHeights.push({ hpt: 42 });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 10 }, // अनु. क्र.
    { wch: 38 }, // खेळाडूचे पूर्ण नाव
    { wch: 22 }, // जनरल रजिस्टर नं.
    { wch: 28 }, // खेळाचा प्रकार
  ];

  ws['!merges'] = merges;
  ws['!rows'] = rowHeights;

  // Make sure GR No is treated as text
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:D10');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef];
      if (cell && cell.v !== undefined && C === 2) {
        cell.t = 's';
        cell.v = String(cell.v);
      }
    }
  }

  return ws;
}

/**
 * Master Tournament Participation Sheet for Game Management Submission:
 * Lists all UNIQUE players on the 12-player teams (no duplicate entries).
 * Columns: Sr No, Player Name, GR No, Sport
 */
export function exportUniqueTournamentPlayersExcel(
  uniquePlayers: SheetRow[],
  meta: TournamentExcelMetadata,
  summary: { total: number; boys: number; girls: number },
  genderFilter: 'all' | 'boys' | 'girls' = 'all'
) {
  const wb = XLSX.utils.book_new();

  let targetPlayers = uniquePlayers;
  if (genderFilter === 'boys') {
    targetPlayers = uniquePlayers.filter(p => p.gender === 'Male' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुले')));
  } else if (genderFilter === 'girls') {
    targetPlayers = uniquePlayers.filter(p => p.gender === 'Female' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुली')));
  }

  const formattedPlayers = targetPlayers.map((p, idx) => {
    const isGirl = p.gender === 'Female' || (p.ageCategoryLabel && p.ageCategoryLabel.includes('मुली'));
    const defaultCat = isGirl ? '१४ वर्षाखालील मुली' : '१४ वर्षाखालील मुले';
    const resolved = resolveStudentDetails(p, p.sportOrEvent || 'सर्व खेळ', defaultCat);

    return {
      ...p,
      srNo: String(idx + 1),
      studentName: resolved.studentName || p.studentName || '',
      std: resolved.std || p.std || '-',
      grNo: resolved.grNo || p.grNo || '-',
      dob: (resolved.dob && resolved.dob !== '-') ? formatDobDDMMYYYY(resolved.dob) : (p.dob ? formatDobDDMMYYYY(p.dob) : '-'),
      motherName: (resolved.motherName && resolved.motherName !== '-' ? resolved.motherName : (p.motherName || '-')),
      aadhar: (resolved.aadhar && resolved.aadhar !== '-' ? resolved.aadhar : (p.aadhar || '-')),
      schoolName: resolved.schoolName || p.schoolName || meta.schoolName || DEFAULT_SCHOOL_MR,
      uDise: resolved.uDise || p.uDise || meta.uDise || DEFAULT_UDISE,
      taluka: resolved.taluka || p.taluka || meta.taluka || DEFAULT_TALUKA,
      ageCategoryLabel: resolved.ageCategoryLabel || getPlayerAgeCategoryLabel(p, isGirl ? 'Female' : 'Male'),
      sportOrEvent: p.sportOrEvent || resolved.sportOrEvent || 'सर्व खेळ',
      gender: isGirl ? 'Female' : 'Male'
    };
  });

  const title = genderFilter === 'boys' 
    ? 'सहभागी मुले खेळाडू मास्टर यादी (सर्व खेळ)' 
    : genderFilter === 'girls'
    ? 'सहभागी मुली खेळाडू मास्टर यादी (सर्व खेळ)'
    : 'एकूण सहभागी खेळाडू मास्टर यादी (सर्व खेळ)';

  const sheetName = genderFilter === 'boys' 
    ? 'सहभागी_मुले_खेळाडू' 
    : genderFilter === 'girls' 
    ? 'सहभागी_मुली_खेळाडू' 
    : 'एकूण_सहभागी_खेळाडू';

  // Build clean 4-column Master Sheet for Game Management Submission
  const ws = buildMasterPlayersWorksheet(
    title,
    formattedPlayers,
    meta,
    summary,
    genderFilter
  );

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const fileCount = genderFilter === 'boys' 
    ? (summary.boys || formattedPlayers.length) 
    : genderFilter === 'girls' 
    ? (summary.girls || formattedPlayers.length) 
    : (summary.total || formattedPlayers.length);
  const genderSuffix = genderFilter === 'boys' ? 'मुले_खेळाडू' : genderFilter === 'girls' ? 'मुली_खेळाडू' : 'खेळाडू';
  const filename = `शालेय_क्रीडा_स्पर्धा_एकूण_${fileCount}_${genderSuffix}_मास्टर_यादी_${meta.academicYear || '2026-27'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

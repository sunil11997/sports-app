import type { Player } from '@/lib/types';

export type StudentAuditFilter =
  | 'all'
  | 'boys'
  | 'girls'
  | 'missing-apaar'
  | 'missing-pen-saral'
  | 'missing-photo'
  | 'missing-dob'
  | 'archived';

export function isPlayerArchived(p: Partial<Player>): boolean {
  return p.status === 'tc_issued' || p.status === 'left' || p.status === 'alumni';
}

export function matchesAuditFilter(p: Partial<Player>, filter: StudentAuditFilter): boolean {
  const archived = isPlayerArchived(p);
  if (filter === 'archived') return archived;
  if (archived) return false;

  switch (filter) {
    case 'boys':
      return p.gender === 'Male';
    case 'girls':
      return p.gender === 'Female';
    case 'missing-apaar':
      return !(p.apaarId || '').trim();
    case 'missing-pen-saral':
      return !(p.penNumber || '').trim() && !(p.saralId || '').trim();
    case 'missing-photo':
      return !(p.photoUrl || '').trim();
    case 'missing-dob':
      return !(p.dob || '').trim();
    case 'all':
    default:
      return true;
  }
}

export interface AuditCounts {
  active: number;
  boys: number;
  girls: number;
  missingApaar: number;
  missingPenSaral: number;
  missingPhoto: number;
  missingDob: number;
  archived: number;
}

export function getAuditCounts(players: Partial<Player>[]): AuditCounts {
  const counts: AuditCounts = {
    active: 0,
    boys: 0,
    girls: 0,
    missingApaar: 0,
    missingPenSaral: 0,
    missingPhoto: 0,
    missingDob: 0,
    archived: 0,
  };

  for (const p of players) {
    if (isPlayerArchived(p)) {
      counts.archived++;
      continue;
    }
    counts.active++;
    if (p.gender === 'Male') counts.boys++;
    else if (p.gender === 'Female') counts.girls++;
    if (!(p.apaarId || '').trim()) counts.missingApaar++;
    if (!(p.penNumber || '').trim() && !(p.saralId || '').trim()) counts.missingPenSaral++;
    if (!(p.photoUrl || '').trim()) counts.missingPhoto++;
    if (!(p.dob || '').trim()) counts.missingDob++;
  }

  return counts;
}

export interface DuplicateWarning {
  field: string;
  value: string;
  existingName: string;
  existingStd: string;
}

const normalizeIdVal = (v?: string) => (v || '').replace(/\s+/g, '').trim().toLowerCase();

/**
 * Checks for duplicate G.R. No., Saral ID, APAAR ID, or Aadhaar against existing active students.
 */
export function findDuplicateStudentIds(
  players: Partial<Player>[],
  candidate: Partial<Player>,
  excludeId?: string
): DuplicateWarning[] {
  const warnings: DuplicateWarning[] = [];
  const fields: Array<{ key: keyof Player; label: string }> = [
    { key: 'generalRegisterNumber', label: 'G.R. No.' },
    { key: 'saralId', label: 'Saral ID' },
    { key: 'apaarId', label: 'APAAR ID' },
    { key: 'aadharNumber', label: 'Aadhaar No.' },
  ];

  for (const { key, label } of fields) {
    const val = normalizeIdVal(candidate[key] as string | undefined);
    if (!val || val === 'none' || val === '---') continue;

    const match = players.find((p) => {
      if (excludeId && p.id === excludeId) return false;
      if (isPlayerArchived(p)) return false;
      return normalizeIdVal(p[key] as string | undefined) === val;
    });

    if (match) {
      warnings.push({
        field: label,
        value: String(candidate[key]).trim(),
        existingName: match.nameMarathi || match.name || 'Unknown',
        existingStd: match.std || '?',
      });
    }
  }

  return warnings;
}

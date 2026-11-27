"use client";

import React from 'react';
import { ClassesSection } from './ClassesSection';

/**
 * Unified ClassesHub delegating to ClassesSection so both entry points
 * share Student Profiles, Exam Marks, Marathi Directory, and Excel Import/Export.
 */
export function ClassesHub({ store, language = 'English' }: { store: any; language?: string }) {
  return <ClassesSection store={store} language={language} />;
}

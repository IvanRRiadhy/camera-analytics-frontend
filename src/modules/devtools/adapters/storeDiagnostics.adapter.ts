/**
 * Store Diagnostics Adapter Layer (ADR-011 Phase 8A)
 * Decouples DevToolsService from core RealtimeStoreRegistry implementation details.
 */

import { realtimeStoreRegistry } from '../../../store/storeRegistry';
import type { BaseStoreStatistics } from '../../../store/baseRealtime.store';

export interface StoreDiagnosticSummary {
  name: string;
  entityCount: number;
  statistics: BaseStoreStatistics;
}

export class StoreDiagnosticsAdapter {
  /** Adapt store instances into read-only diagnostic summaries */
  public getDiagnosticsSummaries(): StoreDiagnosticSummary[] {
    const rawStores = realtimeStoreRegistry.getStores();
    const summaries: StoreDiagnosticSummary[] = [];

    rawStores.forEach((store, name) => {
      const state = store.getState() as Record<string, unknown>;
      const keys = Object.keys(state);
      summaries.push({
        name,
        entityCount: keys.length,
        statistics: store.getStatistics(),
      });
    });

    return summaries;
  }
}

export const storeDiagnosticsAdapter = new StoreDiagnosticsAdapter();

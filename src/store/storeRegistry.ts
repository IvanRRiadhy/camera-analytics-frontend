/**
 * Global Realtime Store Registry & Diagnostics Manager (ADR-011 Phase 4.5)
 * Centralizes all active real-time stores for unified DevTools diagnostics.
 */

import type { BaseRealtimeStore, BaseStoreStatistics } from './baseRealtime.store';

export interface RegistryDiagnostics {
  registeredStoreCount: number;
  stores: Record<string, {
    name: string;
    statistics: BaseStoreStatistics;
  }>;
}

export class RealtimeStoreRegistry {
  private stores: Map<string, BaseRealtimeStore<unknown, BaseStoreStatistics>> = new Map();

  /** Register a real-time store instance */
  public registerStore<TState, TStats extends BaseStoreStatistics>(
    store: BaseRealtimeStore<TState, TStats>
  ): void {
    this.stores.set(store.getName(), store as unknown as BaseRealtimeStore<unknown, BaseStoreStatistics>);
  }

  /** Get all registered stores map */
  public getStores(): Map<string, BaseRealtimeStore<unknown, BaseStoreStatistics>> {
    return this.stores;
  }

  /** Get unified diagnostics for all registered stores */
  public getDiagnostics(): RegistryDiagnostics {
    const storeInfo: Record<string, { name: string; statistics: BaseStoreStatistics }> = {};

    this.stores.forEach((store, name) => {
      storeInfo[name] = {
        name,
        statistics: store.getStatistics(),
      };
    });

    return {
      registeredStoreCount: this.stores.size,
      stores: storeInfo,
    };
  }

  /** Print human-readable diagnostics table for all stores */
  public printDiagnostics(): void {
    console.group('📊 [RealtimeStoreRegistry Unified Diagnostics]');
    const diag = this.getDiagnostics();
    console.log(`Registered Stores: ${diag.registeredStoreCount}`);
    console.table(diag.stores);
    console.groupEnd();
  }
}

export const realtimeStoreRegistry = new RealtimeStoreRegistry();

// Expose registry to browser window for developer debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__realtimeStoreRegistry = realtimeStoreRegistry;
}

/**
 * Base Abstract Realtime Store (ADR-011 Phase 4.5)
 * Extracts common subscription, notification, state access, statistics, and debug mechanisms.
 */

export interface BaseStoreStatistics {
  totalReceived: number;
  totalStored: number;
  duplicateIgnored: number;
  outOfOrderIgnored: number;
  invalidPayloadsRejected: number;
  lastTimestamp: string | null;
}

type Listener = () => void;

export abstract class BaseRealtimeStore<TState, TStats extends BaseStoreStatistics = BaseStoreStatistics> {
  protected state: TState;
  protected listeners: Set<Listener> = new Set();
  protected name: string;

  constructor(name: string, initialState: TState) {
    this.name = name;
    this.state = initialState;
  }

  public getName(): string {
    return this.name;
  }

  /** Get current immutable state reference */
  public getState(): TState {
    return this.state;
  }

  /** Get telemetry statistics */
  public abstract getStatistics(): TStats;

  /** Subscribe to store state changes */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Notify all active subscriber listeners */
  protected notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /** Print store diagnostics to developer console */
  public debug(): void {
    console.group(`🔍 [Store Debug: ${this.name}]`);
    console.log('State:', this.state);
    console.log('Statistics:', this.getStatistics());
    console.groupEnd();
  }
}

/**
 * Developer-Only Runtime Store Inspector & Stress Testing Harness (Phase 2.5)
 * Allows standalone validation of RuntimeStore throughput, memory estimation, and payload validation.
 */

import { runtimeStore, type RuntimeSnapshot } from '../store/runtime.store';

export interface StoreDiagnostics {
  cameraCount: number;
  latestCameraIdUpdated: string | null;
  latestTimestamp: string | null;
  estimatedMemoryBytes: number;
  statistics: ReturnType<typeof runtimeStore.getStatistics>;
  sampleSnapshots: RuntimeSnapshot[];
}

export class RuntimeStoreInspector {
  private lastUpdatedCameraId: string | null = null;

  constructor() {
    runtimeStore.subscribe(() => {
      const state = runtimeStore.getState();
      const keys = Object.keys(state.snapshotsByCameraId);
      if (keys.length > 0) {
        this.lastUpdatedCameraId = keys[keys.length - 1];
      }
    });
  }

  /** Calculate diagnostics and estimated memory consumption */
  public getDiagnostics(): StoreDiagnostics {
    const state = runtimeStore.getState();
    const snapshots = Object.values(state.snapshotsByCameraId);
    const jsonString = JSON.stringify(state);
    const estimatedMemoryBytes = new Blob([jsonString]).size;

    return {
      cameraCount: snapshots.length,
      latestCameraIdUpdated: this.lastUpdatedCameraId,
      latestTimestamp: state.statistics.lastSnapshotTimestamp,
      estimatedMemoryBytes,
      statistics: runtimeStore.getStatistics(),
      sampleSnapshots: snapshots.slice(0, 5),
    };
  }

  /** Log human-readable diagnostic report to console */
  public printReport(): void {
    const diag = this.getDiagnostics();
    console.group('🔍 [RuntimeStore Diagnostics Report]');
    console.log(`Active Camera Count : ${diag.cameraCount}`);
    console.log(`Estimated Store Size: ${(diag.estimatedMemoryBytes / 1024).toFixed(2)} KB`);
    console.log(`Latest Update Camera: ${diag.latestCameraIdUpdated || 'None'}`);
    console.log(`Latest Timestamp    : ${diag.latestTimestamp || 'None'}`);
    console.table(diag.statistics);
    console.log('Sample Snapshots (Up to 5):', diag.sampleSnapshots);
    console.groupEnd();
  }

  /** Run automated stress test with N simulated high-frequency snapshots */
  public runStressTest(count: number = 1000): {
    durationMs: number;
    throughputPerSec: number;
    passed: boolean;
    report: StoreDiagnostics;
  } {
    console.log(`⚡ Starting RuntimeStore Stress Test with ${count} snapshots...`);
    const startT = performance.now();

    const dummyCameraIds = [
      'cam-5c75fe46-01',
      'cam-5c75fe46-02',
      'cam-5c75fe46-03',
      'cam-5c75fe46-04',
      'cam-5c75fe46-05',
    ];

    for (let i = 0; i < count; i++) {
      const camId = dummyCameraIds[i % dummyCameraIds.length];
      const mockSnapshot: RuntimeSnapshot = {
        engineId: 'engine_edge_01',
        cameraId: camId,
        cameraName: `CAM-${i % 5 + 1} Lobby`,
        streamUri: `rtsp://admin:pass@192.168.1.64/live/${camId}`,
        peopleCount: (i % 10) + 1,
        queueLength: i % 3,
        loiteringCount: i % 2,
        pipelineFps: 29.8,
        latencyMs: 14.5,
        health: 'OK',
        timestampUtc: new Date(Date.now() + i * 100).toISOString(),
      };

      runtimeStore.upsertSnapshot(mockSnapshot);
    }

    const elapsedMs = performance.now() - startT;
    const throughputPerSec = Math.round((count / elapsedMs) * 1000);
    const diag = this.getDiagnostics();

    const passed =
      diag.cameraCount === dummyCameraIds.length &&
      diag.statistics.totalSnapshotsReceived >= count &&
      elapsedMs < 2000;

    console.group('✅ [Stress Test Results]');
    console.log(`Total Snapshots Processed : ${count}`);
    console.log(`Total Duration            : ${elapsedMs.toFixed(2)} ms`);
    console.log(`Throughput Rate           : ${throughputPerSec.toLocaleString()} ops/sec`);
    console.log(`Store Memory Footprint    : ${(diag.estimatedMemoryBytes / 1024).toFixed(2)} KB`);
    console.log(`Stress Test Passed?       : ${passed ? 'YES ✅' : 'NO ❌'}`);
    console.groupEnd();

    return {
      durationMs: elapsedMs,
      throughputPerSec,
      passed,
      report: diag,
    };
  }
}

export const runtimeStoreInspector = new RuntimeStoreInspector();

// Expose inspector on global window for developer debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__runtimeStoreInspector = runtimeStoreInspector;
}

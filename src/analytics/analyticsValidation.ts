/**
 * Realtime Analytics Subsystem Runtime Verification Suite (Sprint 1)
 */

import { RealtimeAnalyticsAggregator } from './aggregator/RealtimeAnalyticsAggregator';
import { reduceAnalyticsSnapshot } from './aggregator/AnalyticsReducer';
import { runtimeAnalyticsStore } from './store/runtimeAnalyticsStore';
import {
  selectAllPlugins,
  selectPlugin,
  selectPluginByName,
  selectAllZones,
  selectZone,
  selectStatistics,
  selectCamera,
} from './selectors/analyticsSelectors';
import type { CameraAnalyticsSnapshot } from './models/AnalyticsSnapshot';

export interface ValidationStepResult {
  step: string;
  passed: boolean;
  message: string;
}

export function runAnalyticsSubsystemValidation(): ValidationStepResult[] {
  const results: ValidationStepResult[] = [];
  runtimeAnalyticsStore.reset();

  const mockSnapshot1: CameraAnalyticsSnapshot = {
    messageId: 'msg-001',
    schemaVersion: '1.0',
    engineId: 'engine_edge_01',
    cameraId: 'cam-lobby-01',
    pipelineId: 'pipe_01',
    timestamp: '2026-08-03T12:00:00.000Z',
    health: {
      fps: 30,
      latencyMs: 15,
      status: 'OK',
    },
    plugins: {
      peopleCounting: {
        current: 12,
        entered: 45,
        exited: 33,
      },
      queueDetection: {
        queueLength: 4,
        waitingPeople: 4,
      },
      zoneOccupancy: {
        occupancyByZone: {
          'zone-lobby-north': 8,
          'zone-lobby-south': 4,
        },
      },
    },
  };

  const mockSnapshot2: CameraAnalyticsSnapshot = {
    messageId: 'msg-002',
    schemaVersion: '1.0',
    engineId: 'engine_edge_01',
    cameraId: 'cam-gate-02',
    pipelineId: 'pipe_02',
    timestamp: '2026-08-03T12:00:02.000Z',
    health: {
      fps: 29.5,
      latencyMs: 18,
      status: 'OK',
    },
    plugins: {
      peopleCounting: {
        current: 8,
        entered: 30,
        exited: 22,
      },
      loitering: {
        active: 2,
        trackIds: [101, 105],
      },
      zoneOccupancy: {
        occupancyByZone: {
          'zone-gate-main': 8,
        },
      },
    },
  };

  // Step 1: Aggregator Validation
  const aggregator = RealtimeAnalyticsAggregator.getInstance();
  const v1 = aggregator.validateSnapshot(mockSnapshot1);
  const v2 = aggregator.validateSnapshot({});
  results.push({
    step: '1. Aggregator Validation',
    passed: v1 && !v2,
    message: v1 && !v2 ? 'Snapshot validation succeeded' : 'Snapshot validation failed',
  });

  // Step 2: Generic Reducer Aggregation
  const initialState = runtimeAnalyticsStore.getState();
  const state1 = reduceAnalyticsSnapshot(initialState, mockSnapshot1);
  const state2 = reduceAnalyticsSnapshot(state1, mockSnapshot2);

  const pCount = state2.plugins.peopleCounting;
  const loiteringP = state2.plugins.loitering;
  const passedReducer = Boolean(
    pCount &&
    pCount.totalCamerasReporting === 2 &&
    loiteringP &&
    state2.zones['zone-lobby-north']?.occupancyCount === 8
  );

  results.push({
    step: '2. Generic Reducer Aggregation',
    passed: passedReducer,
    message: passedReducer ? 'Reducer successfully aggregated generic plugins' : 'Reducer aggregation failed',
  });

  // Step 3: Store State & Subscriptions
  let notifyFired = false;
  const unsub = runtimeAnalyticsStore.subscribe(() => {
    notifyFired = true;
  });
  runtimeAnalyticsStore.applySnapshot(mockSnapshot1);
  unsub();

  results.push({
    step: '3. Store State & Subscriptions',
    passed: notifyFired && runtimeAnalyticsStore.getState().statistics.totalSnapshotsProcessed === 1,
    message: notifyFired ? 'Store subscription & applySnapshot verified' : 'Store notify failed',
  });

  // Step 4: Selectors Verification
  runtimeAnalyticsStore.applySnapshot(mockSnapshot2);
  const finalState = runtimeAnalyticsStore.getState();
  const allPlugins = selectAllPlugins(finalState);
  const peoplePlugin = selectPlugin(finalState, 'peopleCounting');
  const pluginByName = selectPluginByName(finalState, 'People Counting');
  const allZones = selectAllZones(finalState);
  const zoneNorth = selectZone(finalState, 'zone-lobby-north');
  const stats = selectStatistics(finalState);
  const cam1Contrib = selectCamera(finalState, 'cam-lobby-01');

  const passedSelectors = Boolean(
    allPlugins.length === 4 &&
    peoplePlugin &&
    pluginByName &&
    allZones.length === 3 &&
    zoneNorth?.occupancyCount === 8 &&
    stats.activeCamerasCount === 2 &&
    cam1Contrib.peopleCounting
  );

  results.push({
    step: '4. Selectors Verification',
    passed: passedSelectors,
    message: passedSelectors ? 'All selectors returned accurate slices' : 'Selector verification failed',
  });

  return results;
}

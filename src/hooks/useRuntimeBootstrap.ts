/**
 * Centralized Runtime Bootstrap Hydration Hook (ADR-011 Phase 7A.5)
 * Orchestrates initial REST payload hydration into domain stores without page-level coupling.
 */

import { useEffect, useRef } from 'react';
import { runtimeStore } from '../store/runtime.store';
import { analyticsEventStore } from '../store/analyticsEvent.store';
import { incidentStore } from '../store/incident.store';
import { engineStore } from '../store/engine.store';
import { cameraStore } from '../store/camera.store';
import { pipelineStore } from '../store/pipeline.store';
import { runtimeTelemetrySink } from '../modules/devtools/services/telemetry/runtimeTelemetrySink';
import type { MonitoringOverview, MonitoringEvent, MonitoringIncident } from './useMonitoring';
import type { EngineFleetHealthOverview } from './useEngineHealth';

export interface RuntimeBootstrapPayloads {
  overview?: MonitoringOverview;
  events?: MonitoringEvent[];
  incidents?: MonitoringIncident[];
  engineHealth?: EngineFleetHealthOverview;
  cameras?: unknown[];
  pipelines?: unknown[];
}

export function useRuntimeBootstrap(payloads: RuntimeBootstrapPayloads): void {
  const { overview, events, incidents, engineHealth, cameras, pipelines } = payloads;

  const lastCamerasRef = useRef<unknown[] | null>(null);
  const lastEngineRef = useRef<unknown[] | null>(null);
  const lastPipelineRef = useRef<unknown[] | null>(null);

  // Hydrate RuntimeStore from Overview payload
  useEffect(() => {
    if (overview) {
      const t0 = performance.now();
      runtimeStore.hydrateFromOverview(overview);
      runtimeTelemetrySink.recordBootstrap('RuntimeStore', performance.now() - t0);
    }
  }, [overview]);

  // Hydrate AnalyticsEventStore from Events payload
  useEffect(() => {
    if (events) {
      const t0 = performance.now();
      analyticsEventStore.hydrateEvents(events);
      runtimeTelemetrySink.recordBootstrap('AnalyticsEventStore', performance.now() - t0);
    }
  }, [events]);

  // Hydrate IncidentStore from Incidents payload
  useEffect(() => {
    if (incidents) {
      const t0 = performance.now();
      incidentStore.hydrateIncidents(incidents);
      runtimeTelemetrySink.recordBootstrap('IncidentStore', performance.now() - t0);
    }
  }, [incidents]);

  // Hydrate EngineStore from Engine Health payload
  useEffect(() => {
    if (engineHealth?.engines && lastEngineRef.current !== engineHealth.engines) {
      lastEngineRef.current = engineHealth.engines;
      const t0 = performance.now();
      engineStore.hydrate(engineHealth.engines);
      runtimeTelemetrySink.recordBootstrap('EngineStore', performance.now() - t0);
    }
  }, [engineHealth]);

  // Hydrate CameraStore from Cameras payload (Ref-guarded against infinite loops)
  useEffect(() => {
    const targetCameras = Array.isArray(cameras) ? cameras : overview?.cameras;
    if (Array.isArray(targetCameras) && targetCameras.length > 0 && lastCamerasRef.current !== targetCameras) {
      lastCamerasRef.current = targetCameras;
      const t0 = performance.now();
      cameraStore.hydrate(targetCameras);
      runtimeTelemetrySink.recordBootstrap('CameraStore', performance.now() - t0);
    }
  }, [cameras, overview]);

  // Hydrate PipelineStore from Pipelines payload (Ref-guarded against infinite loops)
  useEffect(() => {
    const targetPipelines = Array.isArray(pipelines) ? pipelines : overview?.pipelines;
    if (Array.isArray(targetPipelines) && targetPipelines.length > 0 && lastPipelineRef.current !== targetPipelines) {
      lastPipelineRef.current = targetPipelines;
      const t0 = performance.now();
      pipelineStore.hydrate(targetPipelines);
      runtimeTelemetrySink.recordBootstrap('PipelineStore', performance.now() - t0);
    }
  }, [pipelines, overview]);
}

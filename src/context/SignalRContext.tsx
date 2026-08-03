import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { getConfig } from '../config';
import { realtimeDispatcher } from '../services/realtimeDispatcher';
import { runtimeTelemetrySink } from '../modules/devtools/services/telemetry/runtimeTelemetrySink';

export type SignalRConnectionState = 'Connected' | 'Reconnecting' | 'Disconnected';

interface SignalRContextType {
  connectionState: SignalRConnectionState;
  lastEvent: { eventName: string; payload: unknown; timestamp: string } | null;
}

const SignalRContext = createContext<SignalRContextType>({
  connectionState: 'Disconnected',
  lastEvent: null,
});

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('Disconnected');
  const [lastEvent, setLastEvent] = useState<{ eventName: string; payload: unknown; timestamp: string } | null>(null);
  const queryClient = useQueryClient();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    let hubUrl = '/hubs/telemetry';
    try {
      const config = getConfig();
      if (config.API_BASE_URL) {
        const baseUrl = config.API_BASE_URL.replace(/\/$/, '');
        hubUrl = `${baseUrl}/hubs/telemetry`;
      }
    } catch {
      /* fallback to relative /hubs/telemetry */
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const logAndDispatch = (eventName: string, payload: unknown) => {
      const timestamp = new Date().toLocaleTimeString();
      const currentConnState = connection.state === signalR.HubConnectionState.Connected ? 'Connected' : 'Reconnecting';
      
      // Sprint 3.5 Developer Diagnostics Console Logging Requirement
      console.log(`[${timestamp}] [SignalR:${eventName}] State: ${currentConnState}`, payload);

      setLastEvent({ eventName, payload, timestamp });

      const correlationId = runtimeTelemetrySink.recordSignalR(eventName, payload);

      // Phase 5: Dispatch event to RealtimeDispatcher
      realtimeDispatcher.dispatch(eventName, payload, correlationId);

      // Complete Realtime Architecture (ADR-011): All High-Frequency & Lifecycle Events Route via Dispatcher
      if (
        eventName === 'SnapshotUpdated' ||
        eventName === 'AnalyticsEventPublished' ||
        eventName === 'IncidentEscalated' ||
        eventName === 'ReceiveEngineHeartbeat' ||
        eventName === 'EngineOffline' ||
        eventName === 'EngineRecovered' ||
        eventName === 'PipelineAssigned' ||
        eventName === 'PipelineStarted' ||
        eventName === 'PipelineStopped' ||
        eventName === 'PipelineMoved' ||
        eventName === 'PipelineFailed'
      ) {
        return;
      }

      // Realtime Cache Synchronization with React Query
      switch (eventName) {
        case 'TelemetryUpdated':
        case 'ReceiveEngineHeartbeat':
        case 'HealthChanged':
        case 'EngineOffline':
        case 'EngineRecovered':
        case 'EngineRegistered':
        case 'EngineUpdated':
        case 'EngineDisconnected':
          queryClient.invalidateQueries({ queryKey: ['engineHealth'] });
          queryClient.invalidateQueries({ queryKey: ['engineNodes'] });
          break;
        case 'PipelineAssigned':
        case 'PipelineStarted':
        case 'PipelineStopped':
        case 'PipelineMoved':
        case 'PipelineFailed':
          queryClient.invalidateQueries({ queryKey: ['pipelines'] });
          break;
        default:
          queryClient.invalidateQueries();
          break;
      }
    };

    // Register all supported SignalR events
    const supportedEvents = [
      'EngineRegistered',
      'EngineUpdated',
      'EngineDisconnected',
      'TelemetryUpdated',
      'ReceiveEngineHeartbeat',
      'HealthChanged',
      'EngineOffline',
      'EngineRecovered',
      'PipelineAssigned',
      'PipelineStarted',
      'PipelineStopped',
      'PipelineMoved',
      'PipelineFailed',
      'NodeStatusChanged',
      'SnapshotUpdated',
      'AnalyticsSnapshotPublished',
      'AnalyticsEventPublished',
      'IncidentEscalated'
    ];

    supportedEvents.forEach((evt) => {
      connection.on(evt, (data: unknown) => logAndDispatch(evt, data));
    });

    connection
      .start()
      .then(() => {
        setConnectionState('Connected');
        console.log('[SignalR] Connected successfully to hub:', hubUrl);
      })
      .catch((err) => {
        console.warn('[SignalR] Connection initial warning:', err);
        setConnectionState('Disconnected');
      });

    connection.onreconnecting(() => setConnectionState('Reconnecting'));
    connection.onreconnected(() => {
      setConnectionState('Connected');
      queryClient.invalidateQueries();
    });
    connection.onclose(() => setConnectionState('Disconnected'));

    return () => {
      connection.stop();
    };
  }, [queryClient]);

  return (
    <SignalRContext.Provider value={{ connectionState, lastEvent }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalRContext = () => useContext(SignalRContext);

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export interface EngineTelemetry {
  instanceId: string;
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  vramUsedMb: number;
  vramTotalMb: number;
  activePipelines: number;
  timestampUtc: string;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export const useEngineTelemetry = (hubUrl: string = '/hubs/telemetry') => {
  const [telemetryMap, setTelemetryMap] = useState<Record<string, EngineTelemetry>>({});
  const [nodeStatusMap, setNodeStatusMap] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveEngineHeartbeat', (data: EngineTelemetry) => {
      setTelemetryMap((prev) => ({ ...prev, [data.instanceId]: data }));
    });

    connection.on('NodeStatusChanged', (instanceId: string, status: string) => {
      setNodeStatusMap((prev) => ({ ...prev, [instanceId]: status }));
    });

    connection
      .start()
      .then(() => setConnectionStatus('CONNECTED'))
      .catch((err) => {
        console.warn('SignalR Telemetry Connection Warning:', err);
        setConnectionStatus('DISCONNECTED');
      });

    connection.onreconnecting(() => setConnectionStatus('CONNECTING'));
    connection.onreconnected(() => setConnectionStatus('CONNECTED'));
    connection.onclose(() => setConnectionStatus('DISCONNECTED'));

    return () => {
      connection.stop();
    };
  }, [hubUrl]);

  return { telemetryMap, nodeStatusMap, connectionStatus };
};

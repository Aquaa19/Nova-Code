// src/services/VersionCheckService.ts

import { useSettingsStore } from '../store/useSettingsStore';

export interface VersionStatus {
  compatible: boolean;
  clientVersion: string;
  engineVersion: string;
  error?: string;
}

class VersionCheckServiceClass {
  private readonly CLIENT_VERSION = '1.2.0';
  private readonly COMPATIBLE_RANGE = '1.2.'; // Simple prefix match for 1.2.x compatibility

  /**
   * Checks version compatibility with the active Piston/Engine backend server.
   */
  async checkCompatibility(): Promise<VersionStatus> {
    const engineUrl = useSettingsStore.getState().engineUrl || 'http://localhost:3000';
    const pistonApiUrl = engineUrl.replace(/^ws/, 'http');

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${pistonApiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(id);

      const engineVersionHeader = response.headers.get('x-nova-engine-version');
      let engineVersion = engineVersionHeader || '';

      if (response.ok) {
        const body = await response.json();
        if (body && body.version) {
          engineVersion = body.version;
        }
      }

      if (!engineVersion) {
        return {
          compatible: true, // Warn-on-mismatch, default to true if we cannot reach or read version to avoid blocking users
          clientVersion: this.CLIENT_VERSION,
          engineVersion: 'unknown',
          error: 'Could not resolve engine version from health check response',
        };
      }

      // Check if engine version matches the compatible prefix
      const isCompatible = engineVersion.startsWith(this.COMPATIBLE_RANGE);

      return {
        compatible: isCompatible,
        clientVersion: this.CLIENT_VERSION,
        engineVersion,
      };
    } catch (e: any) {
      return {
        compatible: true, // Graceful degradation: don't fail/alert if the server is offline or unreachable here, let other flows handle offline
        clientVersion: this.CLIENT_VERSION,
        engineVersion: 'unreachable',
        error: e.message || 'Network request failed',
      };
    }
  }
}

export const VersionCheckService = new VersionCheckServiceClass();

import { getCompleteUrlV1 } from "../utils";
import { httpClient } from "./ApiService";

export interface SettingItem {
  key: string;
  value: any;
  description?: string;
  [key: string]: any;
}

export interface SettingsApiResponse {
  type?: string;
  message?: string;
  data?: SettingItem[];
  [key: string]: any;
}

export class SettingsService {
  /**
   * Fetch system settings from backend API.
   * Target endpoint: GET /api/settings
   */
  static async getSettings(): Promise<{
    success: boolean;
    data: SettingItem[];
    message?: string;
    status?: number;
  }> {
    try {
      const url = getCompleteUrlV1("settings");
      const res = await httpClient.get(url);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          data: [],
          message:
            errJson.message ||
            errJson.error ||
            `Backend returned HTTP ${res.status} when fetching /api/settings`,
          status: res.status,
        };
      }

      const json: SettingsApiResponse = await res.json().catch(() => ({}));

      if (json && Array.isArray(json.data)) {
        return {
          success: true,
          data: json.data,
          message: json.message || "Settings fetched successfully",
          status: res.status,
        };
      } else {
        return {
          success: false,
          data: [],
          message: json?.message || "Invalid settings response format from backend.",
          status: res.status,
        };
      }
    } catch (error: any) {
      console.error("API Error in SettingsService.getSettings():", error);
      return {
        success: false,
        data: [],
        message: error?.message || "Network connectivity error while calling GET /api/settings.",
      };
    }
  }

  /**
   * Helper to find a specific setting key from settings array.
   */
  static findSettingByKey(settings: SettingItem[], key: string): SettingItem | undefined {
    if (!Array.isArray(settings)) return undefined;
    return settings.find((item) => item.key === key);
  }

  /**
   * Update Commission Transfer Delay setting in backend API.
   * Target endpoint: PUT /api/settings/commission-transfer-delay
   */
  static async updateCommissionTransferDelay(
    commissionTransferDelayDays: number
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    status?: number;
  }> {
    try {
      const url = getCompleteUrlV1("settings/commission-transfer-delay");
      const res = await httpClient.put(url, {
        commissionTransferDelayDays,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          data: json?.data,
          message:
            json?.message ||
            json?.error ||
            `Backend returned HTTP ${res.status} when updating commission transfer delay setting`,
          status: res.status,
        };
      }

      return {
        success: true,
        data: json?.data,
        message: json?.message || "Commission transfer delay setting updated successfully",
        status: res.status,
      };
    } catch (error: any) {
      console.error(
        "API Error in SettingsService.updateCommissionTransferDelay():",
        error
      );
      return {
        success: false,
        message:
          error?.message ||
          "Network connectivity error while calling PUT /api/settings/commission-transfer-delay.",
      };
    }
  }
}


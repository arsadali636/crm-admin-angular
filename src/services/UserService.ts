import { getCompleteUrlV1 } from "../utils";
import { httpClient } from "./ApiService";

let cachedProfiles: any[] | null = null;
let profileFetchPromise: Promise<any[]> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

export function normalizeUserRoles(user: {
  role?: any;
  roles?: any;
  seller?: any;
  promoter?: any;
  promoterInfo?: any;
  connector?: any;
  connectorInfo?: any;
  businessName?: string;
  businessAddress?: string;
  gstin?: string;
}): string[] {
  let rolesArray: string[] = [];
  if (Array.isArray(user.role)) {
    rolesArray = user.role.map((r: any) => String(r).toLowerCase().trim());
  } else if (typeof user.role === "string") {
    rolesArray = [user.role.toLowerCase().trim()];
  } else if (Array.isArray(user.roles)) {
    rolesArray = user.roles.map((r: any) => String(r).toLowerCase().trim());
  }

  // Detect Seller attributes from API or seller object
  const hasSellerInfo = !!(
    (user.seller && (
      user.seller.businessName || 
      user.seller.gstNumber || 
      user.seller.address || 
      user.seller.pan || 
      user.seller.panNumber || 
      user.seller.verificationStatus ||
      user.seller.typeOfBusiness ||
      user.seller.industry
    )) ||
    user.businessName ||
    user.businessAddress ||
    user.gstin
  );
  if (hasSellerInfo && !rolesArray.includes("seller")) {
    rolesArray.push("seller");
  }

  // Detect Promoter attributes
  if ((user.promoterInfo || user.promoter) && !rolesArray.includes("promoter")) {
    rolesArray.push("promoter");
  }

  // Detect Connector attributes
  if ((user.connector || user.connectorInfo) && !rolesArray.includes("connector")) {
    rolesArray.push("connector");
  }

  if (rolesArray.length === 0) {
    rolesArray = ["user"];
  }

  // Priority sort: admin > seller > promoter > connector > buyer > user
  const priorityOrder: Record<string, number> = {
    admin: 1,
    seller: 2,
    promoter: 3,
    connector: 4,
    buyer: 5,
    user: 6,
  };
  rolesArray = Array.from(new Set(rolesArray));
  rolesArray.sort((a, b) => (priorityOrder[a] || 99) - (priorityOrder[b] || 99));

  return rolesArray;
}

export class UserService {
  /**
   * Fetches all user profiles from backend API.
   * Target endpoint: GET /api/profile/getAllProfiles
   */
  static async getAllProfiles(forceRefresh = false): Promise<any[]> {
    const now = Date.now();
    if (!forceRefresh && cachedProfiles && now - lastFetchTime < CACHE_TTL_MS) {
      return cachedProfiles;
    }

    if (!forceRefresh && profileFetchPromise) {
      return profileFetchPromise;
    }

    profileFetchPromise = (async () => {
      try {
        const url = getCompleteUrlV1("profile/getAllProfiles");
        const res = await httpClient.get(url);
        if (res.ok) {
          const json = await res.json();
          const rawData = json.data ?? [];
          cachedProfiles = rawData;
          lastFetchTime = Date.now();
          return rawData;
        }
      } catch (err) {
        console.error("UserService.getAllProfiles error:", err);
      } finally {
        profileFetchPromise = null;
      }
      return cachedProfiles || [];
    })();

    return profileFetchPromise;
  }

  /**
   * Finds a specific user by their ID (_id or id)
   */
  static async getUserById(userId: string): Promise<any | null> {
    if (!userId) return null;
    try {
      const profiles = await this.getAllProfiles();
      const user = profiles.find(
        (u: any) =>
          u._id === userId ||
          u.id === userId ||
          String(u._id) === String(userId) ||
          String(u.id) === String(userId)
      );

      if (!user) return null;

      let resultUser = { ...user };
      // Apply any local storage admin override if available
      if (user.email) {
        try {
          const storageKey = `crm_user_data_${user.email}`;
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.userOverride) {
              const override = { ...parsed.userOverride };
              // Preserve specialized roles if override only has generic "user"
              let mergedRole = user.role;
              if (Array.isArray(override.role) && override.role.length > 0) {
                const overrideRoles = override.role.map((r: any) => String(r).toLowerCase().trim());
                const hasSpecialized = overrideRoles.some((r: string) => ["seller", "promoter", "connector", "admin"].includes(r));
                if (hasSpecialized) {
                  mergedRole = overrideRoles;
                }
              }

              resultUser = {
                ...user,
                ...override,
                role: mergedRole,
                seller: user.seller
                  ? { ...user.seller, ...override.seller }
                  : (override.seller || user.seller),
              };
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      resultUser.role = normalizeUserRoles(resultUser);
      return resultUser;
    } catch (err) {
      console.error(`UserService.getUserById failed for ${userId}:`, err);
      return null;
    }
  }

  /**
   * Clears the in-memory cache
   */
  static clearCache() {
    cachedProfiles = null;
    profileFetchPromise = null;
    lastFetchTime = 0;
  }
}

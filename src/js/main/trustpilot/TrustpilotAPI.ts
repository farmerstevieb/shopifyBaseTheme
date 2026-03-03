/**
 * Trustpilot API Client
 * Handles fetching reviews from Trustpilot Public API with caching
 */

const CACHE_KEY_PREFIX = "trustpilot_reviews_";
const CACHE_KEY_BUSINESS_PREFIX = "trustpilot_business_";
const DEFAULT_CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds

export interface TrustpilotReview {
  id: string;
  stars: number;
  title: string;
  text: string;
  createdAt: string;
  consumer: {
    displayName: string;
    id: string;
  };
  businessUnit: {
    id: string;
    identifyingName: string;
    displayName: string;
  };
  isVerified: boolean;
  language: string;
  links: Array<{
    href: string;
    method: string;
    rel: string;
  }>;
}

export interface TrustpilotResponse {
  reviews: TrustpilotReview[];
  links: Array<{
    href: string;
    method: string;
    rel: string;
  }>;
}

export interface BusinessUnitData {
  id: string;
  displayName: string;
  name: {
    identifying: string;
    referring: string[];
  };
  numberOfReviews: {
    total: number;
    usedForTrustScoreCalculation: number;
    oneStar: number;
    twoStars: number;
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
  score: {
    trustScore: number;
    stars: number;
  };
  status: string;
}

interface CachedData {
  data: TrustpilotResponse;
  timestamp: number;
}

interface CachedBusinessData {
  data: BusinessUnitData;
  timestamp: number;
}

export class TrustpilotAPI {
  apiKey: string;
  businessUnitId: string;
  cacheExpiration: number;

  constructor(
    apiKey: string,
    businessUnitId: string,
    cacheExpiration: number = DEFAULT_CACHE_EXPIRATION,
  ) {
    this.apiKey = apiKey;
    this.businessUnitId = businessUnitId;
    this.cacheExpiration = cacheExpiration;
  }

  getCacheKey = (): string => {
    return `${CACHE_KEY_PREFIX}${this.businessUnitId}`;
  };

  getBusinessCacheKey = (): string => {
    return `${CACHE_KEY_BUSINESS_PREFIX}${this.businessUnitId}`;
  };

  getCachedReviews = (): TrustpilotResponse | null => {
    try {
      const cached = localStorage.getItem(this.getCacheKey());
      if (!cached) return null;

      const cachedData = JSON.parse(cached) as CachedData;
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedData.timestamp > this.cacheExpiration) {
        localStorage.removeItem(this.getCacheKey());
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.warn("Error reading cached reviews:", error);
      return null;
    }
  };

  setCachedReviews = (data: TrustpilotResponse): void => {
    try {
      const cachedData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.getCacheKey(), JSON.stringify(cachedData));
    } catch (error) {
      console.warn("Error caching reviews:", error);
    }
  };

  fetchReviews = async (count?: number): Promise<TrustpilotResponse> => {
    const baseUrl = `https://api.trustpilot.com/v1/business-units/${this.businessUnitId}/reviews`;
    const params = new URLSearchParams();

    if (count) {
      params.append("perPage", count.toString());
    }

    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Trustpilot API error: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as TrustpilotResponse;
  };

  getReviews = async (fetchCount?: number): Promise<TrustpilotResponse> => {
    // Try to get from cache first
    const cached = this.getCachedReviews();
    if (cached) {
      return cached;
    }

    // Fetch from API if no cache
    const data = await this.fetchReviews(fetchCount);

    // Cache the result
    this.setCachedReviews(data);

    return data;
  };

  getCachedBusinessData = (): BusinessUnitData | null => {
    try {
      const cached = localStorage.getItem(this.getBusinessCacheKey());
      if (!cached) return null;

      const cachedData = JSON.parse(cached) as CachedBusinessData;
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedData.timestamp > this.cacheExpiration) {
        localStorage.removeItem(this.getBusinessCacheKey());
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.warn("Error reading cached business data:", error);
      return null;
    }
  };

  setCachedBusinessData = (data: BusinessUnitData): void => {
    try {
      const cachedData: CachedBusinessData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        this.getBusinessCacheKey(),
        JSON.stringify(cachedData),
      );
    } catch (error) {
      console.warn("Error caching business data:", error);
    }
  };

  fetchBusinessUnit = async (): Promise<BusinessUnitData> => {
    const url = `https://api.trustpilot.com/v1/business-units/${this.businessUnitId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Trustpilot API error: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as BusinessUnitData;
  };

  getBusinessUnit = async (): Promise<BusinessUnitData> => {
    // Try to get from cache first
    const cached = this.getCachedBusinessData();
    if (cached) {
      return cached;
    }

    // Fetch from API if no cache
    const data = await this.fetchBusinessUnit();

    // Cache the result
    this.setCachedBusinessData(data);

    return data;
  };

  clearCache = (): void => {
    localStorage.removeItem(this.getCacheKey());
    localStorage.removeItem(this.getBusinessCacheKey());
  };
}

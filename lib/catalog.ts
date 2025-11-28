// src/lib/catalog.ts
const API = process.env.NEXT_PUBLIC_API_URL!;
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE!;

// Item coming from BrandNewMobilePhone (public /phones)
type AdminAppleItem = {
  _id: string;
  brand?: string;
  categoryType?: string;
  model: string;
  price: number;

  // Discount fields from BrandNewMobilePhone
  discountType?: "percent" | "amount" | null;
  discountValue?: number | null;

  os?: string;
  storageGB?: number;
  ramGB?: number;
  batteryMah?: number;

  colors?: string[];

  deviceStatus?: "used" | "not used";

  display?: { sizeInches?: number; type?: string; resolution?: string };
  mainImageUrl?: string;
  galleryImageUrls?: string[];
};

export type StorefrontProduct = {
  id: string;
  brand: string;
  name: string;
  model: string;
  price: number;
  specs: string[];
  images: string[];

  brandId?: string;
  originalPrice?: number;
  offerType?: "percent" | "amount" | null;
  offerValue?: number;
  colors?: string[];

  // extra info for UI
  categoryType?: string;
  deviceStatus?: string;
};

export type StorefrontBrand = {
  id: string;
  name: string;
  status: string;
  imageUrl?: string;
};

type AdminSpeakerItem = {
  _id: string;
  brand: string; // ObjectId
  brandName: string;
  model: string;
  price: number;
  offerType?: "percent" | "amount" | null;
  offerValue?: number;
  description?: string;
  colors?: string[];
  mainImageUrl?: string;
  galleryImageUrls?: string[];
};

function mapSpeakerToStorefront(item: AdminSpeakerItem): StorefrontProduct {
  const images: string[] = [];

  if (item.mainImageUrl) {
    images.push(`${ASSET_BASE}${item.mainImageUrl}`);
  }
  if (Array.isArray(item.galleryImageUrls)) {
    images.push(...item.galleryImageUrls.map((u) => `${ASSET_BASE}${u}`));
  }
  if (images.length === 0) {
    images.push("/placeholder.svg?height=400&width=400");
  }

  const rawPrice = item.price ?? 0;
  let finalPrice = rawPrice;

  if (item.offerType === "percent" && item.offerValue) {
    finalPrice = rawPrice * (1 - item.offerValue / 100);
  } else if (item.offerType === "amount" && item.offerValue) {
    finalPrice = rawPrice - item.offerValue;
  }
  if (finalPrice < 0) finalPrice = 0;

  const specs: string[] = [];
  if (item.description) specs.push(item.description);
  if (item.colors?.length) specs.push(item.colors.join(", "));

  return {
    id: item._id,
    brandId: item.brand,
    brand: item.brandName,
    name: item.model,
    model: item.model,
    price: finalPrice,
    specs,
    images,
    originalPrice: rawPrice,
    offerType: item.offerType ?? null,
    offerValue: item.offerValue ?? 0,
    colors: item.colors ?? [],
  };
}

/** Generic mapper for any BrandNewMobilePhone document to storefront product */
function mapDeviceToStorefront(item: AdminAppleItem): StorefrontProduct {
  const specs: string[] = [];

  if (item.display?.sizeInches || item.display?.type) {
    const size = item.display?.sizeInches ? `${item.display.sizeInches}"` : "";
    const typ = item.display?.type ? ` ${item.display.type}` : "";
    const label = `${size}${typ}`.trim();
    if (label) specs.push(label);
  }
  if (item.ramGB) specs.push(`${item.ramGB}GB RAM`);
  if (item.storageGB) specs.push(`${item.storageGB}GB Storage`);
  if (item.display?.resolution) specs.push(item.display.resolution);
  if (item.os) specs.push(item.os);
  if (item.batteryMah) specs.push(`${item.batteryMah}mAh`);

  const images: string[] = [];
  if (item.mainImageUrl) images.push(`${ASSET_BASE}${item.mainImageUrl}`);
  if (Array.isArray(item.galleryImageUrls)) {
    images.push(...item.galleryImageUrls.map((u) => `${ASSET_BASE}${u}`));
  }
  if (images.length === 0) {
    images.push("/placeholder.svg?height=400&width=400");
  }

  const rawPrice = item.price ?? 0;
  let finalPrice = rawPrice;
  let offerType: "percent" | "amount" | null = null;
  let offerValue = 0;

  if (item.discountType === "percent" && item.discountValue) {
    offerType = "percent";
    offerValue = item.discountValue;
    finalPrice = rawPrice * (1 - item.discountValue / 100);
  } else if (item.discountType === "amount" && item.discountValue) {
    offerType = "amount";
    offerValue = item.discountValue;
    finalPrice = rawPrice - item.discountValue;
  }

  if (finalPrice < 0) finalPrice = 0;

  return {
    id: item._id,
    brand: item.brand || "Unknown",
    name: item.model,
    model: item.model,
    price: finalPrice,
    specs,
    images,
    originalPrice: rawPrice,
    offerType,
    offerValue,
    colors: item.colors ?? [],
    categoryType: item.categoryType,
    deviceStatus: item.deviceStatus,
  };
}

/** Apple-specific helper (still used by AppleProducts) */
export function mapApplePhone(item: AdminAppleItem): StorefrontProduct {
  const base = mapDeviceToStorefront(item);
  // Force label to "Apple" for storefront
  return { ...base, brand: item.brand || "Apple" };
}

/**
 * Fetch Apple phones (BrandNewMobilePhone collection)
 * Only:
 *  - brand: Apple
 *  - deviceStatus: not used
 *  - status: Active
 *  - inStock: true
 */
export async function fetchApplePhones(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    brand: "Apple",
    deviceStatus: "not used",
    status: "Active",
    inStock: "true",
    limit: "100",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const url = `${API}/phones?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminAppleItem[] = data?.items ?? [];
  return items.map(mapApplePhone);
}

export async function fetchBrands(): Promise<StorefrontBrand[]> {
  const url = `${API}/brands?status=Active&limit=50&sortBy=createdAt&sortOrder=asc`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Brands fetch failed: ${res.status}`);

  const data = await res.json();
  const brands = data?.brands ?? [];

  return brands.map((b: any) => ({
    id: b._id,
    name: b.name,
    status: b.status,
    imageUrl: b.imageUrl ? `${ASSET_BASE}${b.imageUrl}` : undefined,
  }));
}

export async function fetchAndroidPhonesByBrand(
  brandName: string
): Promise<StorefrontProduct[]> {
  // Reuse /public/phones by brand
  const params = new URLSearchParams({
    brand: brandName,
    status: "Active",
    inStock: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: "100",
  });

  const url = `${API}/phones?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Android catalog fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminAppleItem[] = data?.items ?? [];
  return items.map(mapDeviceToStorefront);
}

export async function fetchSpeakerBrands(): Promise<StorefrontBrand[]> {
  const url = `${API}/speaker-brands?status=Active&limit=50&sortBy=createdAt&sortOrder=asc`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Speaker brands fetch failed: ${res.status}`);

  const data = await res.json();
  const brands = data?.brands ?? [];

  return brands.map((b: any) => ({
    id: b._id,
    name: b.name,
    status: b.status,
    imageUrl: b.imageUrl ? `${ASSET_BASE}${b.imageUrl}` : undefined,
  }));
}

// All active speakers (we’ll filter by brand on the front-end)
export async function fetchSpeakers(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    status: "Active",
    inStock: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: "200",
  });

  const url = `${API}/speakers?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Speakers fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminSpeakerItem[] = data?.items ?? [];
  return items.map(mapSpeakerToStorefront);
}

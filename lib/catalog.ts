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

  discountType?: "percent" | "amount" | "" | null;
  discountValue?: number | null;

  os?: string;

  // storage (old + new)
  storageGB?: number | null;
  storageOptions?: any[]; // populated objects or ids

  ramGB?: number | null;
  batteryMah?: number | null;

  display?: { sizeInches?: string; type?: string; resolution?: string };
  cameras?: { rearMP?: string; frontMP?: string };

  colors?: any[]; // populated objects or strings/ids

  deviceStatus?: "used" | "not used";

  inStock?: boolean;
  stockCount?: number | null;

  status?: string;

  shortDescription?: string;
  longDescription?: string;

  warrantyType?: string;
  warrantyPeriod?: string;

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

  categoryType?: string;
  deviceStatus?: string;

  // ✅ details used by ProductView
  shortDescription?: string;
  longDescription?: string;

  os?: string;
  ramGB?: number | null;
  batteryMah?: number | null;

  display?: {
    sizeInches?: string;
    type?: string;
    resolution?: string;
  };

  cameras?: {
    rearMP?: string;
    frontMP?: string;
  };

  warrantyType?: string;
  warrantyPeriod?: string;

  inStock?: boolean;
  stockCount?: number | null;

  colors?: any[];
  storageOptions?: any[];
};

export type StorefrontBrand = {
  id: string;
  name: string;
  status: string;
  imageUrl?: string;
};

// ⬇️ UPDATED: shape coming from BrandNewSpeaker collection
type AdminSpeakerItem = {
  _id: string;
  brand: string;
  categoryType?: string;
  model: string;
  price: number;

  discountType?: "percent" | "amount" | null;
  discountValue?: number | null;

  colors?: string[];
  mainImageUrl?: string;
  galleryImageUrls?: string[];

  shortDescription?: string;
  longDescription?: string;

  inStock?: boolean;
  status?: string;
};

type AdminCoolerItem = {
  _id: string;
  brand: string;
  categoryType?: string;
  model: string;
  price: number;

  discountType?: "percent" | "amount" | null;
  discountValue?: number | null;

  colors?: string[];
  mainImageUrl?: string;
  galleryImageUrls?: string[];

  shortDescription?: string;
  longDescription?: string;

  inStock?: boolean;
  status?: string;

  warrantyType?: string;
  warrantyPeriod?: string;
};

function mapSpeakerToStorefront(item: AdminSpeakerItem): StorefrontProduct {
  const images: string[] = [];

  if (item.mainImageUrl) images.push(`${ASSET_BASE}${item.mainImageUrl}`);
  if (Array.isArray(item.galleryImageUrls)) {
    images.push(...item.galleryImageUrls.map((u) => `${ASSET_BASE}${u}`));
  }
  if (images.length === 0) images.push("/placeholder.svg?height=400&width=400");

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

  const specs: string[] = [];
  if (item.shortDescription) specs.push(item.shortDescription);
  if (item.longDescription) specs.push(item.longDescription);
  if (item.colors?.length) specs.push(item.colors.join(", "));

  return {
    id: item._id,
    brand: item.brand,
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

    shortDescription: item.shortDescription || "",
    longDescription: item.longDescription || "",
    inStock: item.inStock,
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
  if (images.length === 0) images.push("/placeholder.svg?height=400&width=400");

  const rawPrice = Number(item.price ?? 0);
  let finalPrice = rawPrice;

  const dtype = String(item.discountType ?? "").trim().toLowerCase();
  const dval =
    item.discountValue === undefined || item.discountValue === null
      ? null
      : Number(item.discountValue);

  let offerType: "percent" | "amount" | null = null;
  let offerValue = 0;

  if (dtype === "percent" && dval !== null && Number.isFinite(dval) && dval > 0) {
    offerType = "percent";
    offerValue = dval;
    finalPrice = rawPrice * (1 - dval / 100);
  } else if (dtype === "amount" && dval !== null && Number.isFinite(dval) && dval > 0) {
    offerType = "amount";
    offerValue = dval;
    finalPrice = rawPrice - dval;
  }

  if (!Number.isFinite(finalPrice) || finalPrice < 0) finalPrice = 0;

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

    categoryType: item.categoryType,
    deviceStatus: item.deviceStatus,

    shortDescription: item.shortDescription || "",
    longDescription: item.longDescription || "",

    os: item.os || "",
    ramGB: item.ramGB ?? null,
    batteryMah: item.batteryMah ?? null,
    display: item.display,
    cameras: item.cameras,

    warrantyType: item.warrantyType || "",
    warrantyPeriod: item.warrantyPeriod || "",

    inStock: item.inStock,
    stockCount: item.stockCount ?? null,

    colors: item.colors ?? [],
    storageOptions: item.storageOptions ?? [],
  };
}

/** Apple-specific helper (still used by AppleProducts) */
export function mapApplePhone(item: AdminAppleItem): StorefrontProduct {
  const base = mapDeviceToStorefront(item);
  return { ...base, brand: item.brand || "Apple" };
}

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

export async function fetchUsedApplePhones(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    brand: "Apple",
    deviceStatus: "used",
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

export async function fetchUsedItems(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    deviceStatus: "used",
    status: "Active",
    inStock: "true",
    limit: "200",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const url = `${API}/used-items?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Used items fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminAppleItem[] = data?.items ?? [];
  return items.map(mapDeviceToStorefront);
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

export async function fetchAndroidPhonesByBrand(brandName: string): Promise<StorefrontProduct[]> {
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

function mapCoolerToStorefront(item: AdminCoolerItem): StorefrontProduct {
  const images: string[] = [];

  if (item.mainImageUrl) images.push(`${ASSET_BASE}${item.mainImageUrl}`);
  if (Array.isArray(item.galleryImageUrls)) {
    images.push(...item.galleryImageUrls.map((u) => `${ASSET_BASE}${u}`));
  }
  if (images.length === 0) images.push("/placeholder.svg?height=400&width=400");

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

  const specs: string[] = [];
  if (item.shortDescription) specs.push(item.shortDescription);
  if (item.longDescription) specs.push(item.longDescription);
  if (item.warrantyType || item.warrantyPeriod) {
    specs.push([item.warrantyType, item.warrantyPeriod].filter(Boolean).join(" "));
  }

  return {
    id: item._id,
    brand: item.brand,
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
    shortDescription: item.shortDescription || "",
    longDescription: item.longDescription || "",
    inStock: item.inStock,
    warrantyType: item.warrantyType,
    warrantyPeriod: item.warrantyPeriod,
  };
}

export async function fetchCoolers(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    status: "Active",
    inStock: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: "200",
    page: "1",
  });

  const url = `${API}/coolers?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Coolers fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminCoolerItem[] = data?.items ?? [];
  return items.map(mapCoolerToStorefront);
}

export async function fetchAndroidPhones(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    status: "Active",
    inStock: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: "200",
  });

  const url = `${API}/phones?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Android catalog fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminAppleItem[] = data?.items ?? [];

  const androidOnly = items.filter(
    (p) => String(p?.brand || "").toLowerCase().trim() !== "apple"
  );

  return androidOnly.map(mapDeviceToStorefront);
}

function normCat(v: any) {
  return String(v ?? "").trim().toLowerCase();
}

function categoryIn(item: StorefrontProduct, allowed: string[]) {
  const c = normCat(item.categoryType);
  return allowed.some((x) => normCat(x) === c);
}

export async function fetchUsedItemsByCategoryTypes(
  allowedCategoryTypes: string[]
): Promise<StorefrontProduct[]> {
  const all = await fetchUsedItems();
  return (all || []).filter((p) => categoryIn(p, allowedCategoryTypes));
}

export async function fetchUsedAppleItemsByCategoryTypes(
  allowedCategoryTypes: string[]
): Promise<StorefrontProduct[]> {
  const all = await fetchUsedItems();
  const appleOnly = (all || []).filter(
    (p) => String(p.brand || "").trim().toLowerCase() === "apple"
  );
  return appleOnly.filter((p) => categoryIn(p, allowedCategoryTypes));
}

export async function fetchUsedAndroidItemsByCategoryTypes(
  allowedCategoryTypes: string[]
): Promise<StorefrontProduct[]> {
  const all = await fetchUsedItems();
  const androidOnly = (all || []).filter(
    (p) => String(p.brand || "").trim().toLowerCase() !== "apple"
  );
  return androidOnly.filter((p) => categoryIn(p, allowedCategoryTypes));
}

type AdminAccessoryItem = {
  _id: string;
  brand: string;
  categoryType?: string;
  model: string;
  price: number;

  discountType?: "percent" | "amount" | null;
  discountValue?: number | null;

  colors?: string[];
  mainImageUrl?: string;
  galleryImageUrls?: string[];

  shortDescription?: string;
  longDescription?: string;

  inStock?: boolean;
  status?: string;
};

function mapAccessoryToStorefront(item: AdminAccessoryItem): StorefrontProduct {
  const images: string[] = [];

  if (item.mainImageUrl) images.push(`${ASSET_BASE}${item.mainImageUrl}`);
  if (Array.isArray(item.galleryImageUrls)) {
    images.push(...item.galleryImageUrls.map((u) => `${ASSET_BASE}${u}`));
  }
  if (images.length === 0) images.push("/placeholder.svg?height=400&width=400");

  const rawPrice = Number(item.price ?? 0);
  let finalPrice = rawPrice;

  let offerType: "percent" | "amount" | null = null;
  let offerValue = 0;

  if (item.discountType === "percent" && item.discountValue) {
    offerType = "percent";
    offerValue = Number(item.discountValue);
    finalPrice = rawPrice * (1 - Number(item.discountValue) / 100);
  } else if (item.discountType === "amount" && item.discountValue) {
    offerType = "amount";
    offerValue = Number(item.discountValue);
    finalPrice = rawPrice - Number(item.discountValue);
  }

  if (!Number.isFinite(finalPrice) || finalPrice < 0) finalPrice = 0;

  const specs: string[] = [];
  if (item.shortDescription) specs.push(item.shortDescription);
  if (item.longDescription) specs.push(item.longDescription);
  if (item.colors?.length) specs.push(item.colors.join(", "));

  return {
    id: item._id,
    brand: item.brand,
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
    shortDescription: item.shortDescription || "",
    longDescription: item.longDescription || "",
    inStock: item.inStock,
  };
}

export async function fetchAccessories(): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams({
    status: "Active",
    inStock: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: "200",
  });

  const url = `${API}/accessories?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) throw new Error(`Accessories fetch failed: ${res.status}`);

  const data = await res.json();
  const items: AdminAccessoryItem[] = data?.items ?? [];
  return items.map(mapAccessoryToStorefront);
}

// ✅ Product by id (public) — return full details (NOT apple-only mapping)
export async function fetchPublicPhoneById(id: string): Promise<StorefrontProduct | null> {
  if (!id) return null;

  const url = `${API}/phones/${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Product fetch failed: ${res.status}`);

  const item = await res.json();
  return mapDeviceToStorefront(item as any);
}

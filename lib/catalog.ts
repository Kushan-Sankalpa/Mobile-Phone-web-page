const API = process.env.NEXT_PUBLIC_API_URL!;
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE!;

type AdminAppleItem = {
  _id: string;
  brand?: string;
  model: string;
  price: number;
  storageGB?: number;
  ramGB?: number;
  display?: { sizeInches?: number; type?: string; resolution?: string };
  mainImageUrl?: string;
  galleryImageUrls?: string[];
};

export type StorefrontProduct = {
  id: string;
  brand: "apple";
  name: string;
  model: string;
  price: number;
  specs: string[];
  images: string[];
};

export function mapApplePhone(item: AdminAppleItem): StorefrontProduct {
  const specs: string[] = [];
  if (item.display?.sizeInches || item.display?.type) {
    const size = item.display?.sizeInches ? `${item.display.sizeInches}"` : "";
    const typ  = item.display?.type ? ` ${item.display.type}` : "";
    const label = `${size}${typ}`.trim();
    if (label) specs.push(label);
  }
  if (item.ramGB) specs.push(`${item.ramGB}GB RAM`);
  if (item.storageGB) specs.push(`${item.storageGB}GB Storage`);
  if (item.display?.resolution) specs.push(item.display.resolution);

  const images: string[] = [];
  if (item.mainImageUrl) images.push(`${ASSET_BASE}${item.mainImageUrl}`);
  if (Array.isArray(item.galleryImageUrls)) {
    images.push(...item.galleryImageUrls.map((u) => `${ASSET_BASE}${u}`));
  }
  if (images.length === 0) {
    images.push("/placeholder.svg?height=400&width=400");
  }

  return {
    id: item._id,
    brand: "apple",
    name: item.model,
    model: item.model,
    price: item.price,
    specs,
    images,
  };
}

export async function fetchApplePhones(): Promise<StorefrontProduct[]> {
  const url = `${API}/apple/iphone?status=Active&inStock=true&limit=100&sortBy=createdAt&sortOrder=desc`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data = await res.json();
  const items: AdminAppleItem[] = data?.items ?? [];
  return items.map(mapApplePhone);
}

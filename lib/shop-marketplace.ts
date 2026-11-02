import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { slugifyShopName } from "@/lib/shop-utils";
import type {
  AcceptedPaymentMethod,
  CustomerInfo,
  OrderFulfillmentStatus,
  PayoutScheduleInterval,
  Product,
  SellerShop,
  ShopCurrency,
  ShopOrder,
  ShopOrderItem,
  ShopShippingPolicy,
  ShopStatus,
  Variant,
} from "@/types/shop";

function normalizeShopDoc(id: string, data: Record<string, any>): SellerShop {
  return {
    ownerId: data.ownerId || id,
    shopName: data.shopName || "Otaku Shop",
    slug: data.slug || slugifyShopName(data.shopName || id),
    tagline: data.tagline || "",
    description: data.description || "",
    logoUrl: data.logoUrl || "",
    bannerUrl: data.bannerUrl || "",
    contactEmail: data.contactEmail || "",
    country: data.country || "US",
    currency: (data.currency as ShopCurrency) || "USD",
    status: (data.status as ShopStatus) || "active",
    stripeAccountId: data.stripeAccountId || null,
    stripeOnboardingComplete: Boolean(data.stripeOnboardingComplete),
    stripeChargesEnabled: Boolean(data.stripeChargesEnabled),
    stripePayoutsEnabled: Boolean(data.stripePayoutsEnabled),
    stripeDetailsSubmitted: Boolean(data.stripeDetailsSubmitted),
    acceptedPaymentMethods: Array.isArray(data.acceptedPaymentMethods)
      ? data.acceptedPaymentMethods
      : ["card", "apple_google_pay", "link"],
    payoutSchedule:
      (data.payoutSchedule as PayoutScheduleInterval) || "daily",
    shippingPolicy: {
      flatRate: Number(data.shippingPolicy?.flatRate ?? 0),
      freeShippingThreshold:
        data.shippingPolicy?.freeShippingThreshold !== undefined &&
        data.shippingPolicy?.freeShippingThreshold !== null
          ? Number(data.shippingPolicy.freeShippingThreshold)
          : null,
      shipsWorldwide: Boolean(data.shippingPolicy?.shipsWorldwide ?? true),
      estimatedDays: data.shippingPolicy?.estimatedDays || "3–7 business days",
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function normalizeCommunityProductDoc(
  id: string,
  data: Record<string, any>
): Product {
  const imageUrls: string[] = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((u: unknown) => typeof u === "string" && u.length > 0)
    : [];

  return {
    _id: id,
    name: data.name || "Untitled Merch",
    price: Number(data.price || 0),
    currency: (data.currency as ShopCurrency) || "USD",
    imageUrls,
    rating: Number(data.rating ?? 5),
    description: data.description || "",
    category: data.category || "Collectibles",
    stock: Number(data.stock ?? 0),
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    variants: Array.isArray(data.variants) ? (data.variants as Variant[]) : null,
    animeTitle: data.animeTitle || "",
    title: data.animeTitle
      ? {
          _id: slugifyShopName(data.animeTitle),
          name: data.animeTitle,
        }
      : undefined,
    source: "community",
    ownerId: data.ownerId,
    shopId: data.shopId || data.ownerId,
    shopName: data.shopName || "Creator Shop",
    shopSlug: data.shopSlug || "",
    stripeAccountId: data.stripeAccountId || null,
    stripeChargesEnabled: Boolean(data.stripeChargesEnabled),
    acceptedPaymentMethods: Array.isArray(data.acceptedPaymentMethods)
      ? data.acceptedPaymentMethods
      : ["card", "apple_google_pay", "link"],
    isPublished: data.isPublished !== false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getShopByOwnerId(ownerId: string): Promise<SellerShop | null> {
  if (!ownerId) return null;
  try {
    const snap = await getDoc(doc(db, "shops", ownerId));
    if (!snap.exists()) return null;
    return normalizeShopDoc(snap.id, snap.data());
  } catch (err) {
    console.warn("[shop-marketplace] getShopByOwnerId failed:", err);
    return null;
  }
}

export async function getShopBySlug(slug: string): Promise<SellerShop | null> {
  if (!slug) return null;
  try {
    const q = query(
      collection(db, "shops"),
      where("slug", "==", slug),
      where("status", "==", "active"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return normalizeShopDoc(first.id, first.data());
  } catch (err) {
    console.warn("[shop-marketplace] getShopBySlug failed:", err);
    return null;
  }
}

export async function listActiveShops(maxCount = 50): Promise<SellerShop[]> {
  try {
    const q = query(
      collection(db, "shops"),
      where("status", "==", "active"),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeShopDoc(d.id, d.data()));
  } catch (err) {
    console.warn("[shop-marketplace] listActiveShops failed:", err);
    return [];
  }
}

export async function isShopSlugAvailable(
  slug: string,
  currentOwnerId: string
): Promise<boolean> {
  const clean = slugifyShopName(slug);
  if (clean.length < 2) return false;
  try {
    const q = query(collection(db, "shops"), where("slug", "==", clean), limit(5));
    const snap = await getDocs(q);
    return snap.docs.every((d) => d.id === currentOwnerId);
  } catch {
    return true;
  }
}

export interface UpsertSellerShopInput {
  shopName: string;
  slug: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  country?: string;
  currency?: ShopCurrency;
  status?: ShopStatus;
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeDetailsSubmitted?: boolean;
  acceptedPaymentMethods?: AcceptedPaymentMethod[];
  payoutSchedule?: PayoutScheduleInterval;
  shippingPolicy?: ShopShippingPolicy;
}

export async function saveSellerShop(
  ownerId: string,
  input: UpsertSellerShopInput
): Promise<SellerShop> {
  const shopRef = doc(db, "shops", ownerId);
  const existingSnap = await getDoc(shopRef);
  const existing = existingSnap.exists()
    ? normalizeShopDoc(existingSnap.id, existingSnap.data())
    : null;

  const cleanSlug =
    slugifyShopName(input.slug || input.shopName) ||
    `shop-${ownerId.slice(0, 6).toLowerCase()}`;

  const mergedPayload = {
    ownerId,
    shopName: input.shopName.trim(),
    slug: cleanSlug,
    tagline: input.tagline?.trim() ?? existing?.tagline ?? "",
    description: input.description?.trim() ?? existing?.description ?? "",
    logoUrl: input.logoUrl ?? existing?.logoUrl ?? "",
    bannerUrl: input.bannerUrl ?? existing?.bannerUrl ?? "",
    contactEmail: input.contactEmail?.trim() ?? existing?.contactEmail ?? "",
    country: input.country ?? existing?.country ?? "US",
    currency: input.currency ?? existing?.currency ?? "USD",
    status: input.status ?? existing?.status ?? "active",
    stripeAccountId:
      input.stripeAccountId !== undefined
        ? input.stripeAccountId
        : existing?.stripeAccountId ?? null,
    stripeOnboardingComplete:
      input.stripeOnboardingComplete ?? existing?.stripeOnboardingComplete ?? false,
    stripeChargesEnabled:
      input.stripeChargesEnabled ?? existing?.stripeChargesEnabled ?? false,
    stripePayoutsEnabled:
      input.stripePayoutsEnabled ?? existing?.stripePayoutsEnabled ?? false,
    stripeDetailsSubmitted:
      input.stripeDetailsSubmitted ?? existing?.stripeDetailsSubmitted ?? false,
    acceptedPaymentMethods:
      input.acceptedPaymentMethods ??
      existing?.acceptedPaymentMethods ?? ["card", "apple_google_pay", "link"],
    payoutSchedule: input.payoutSchedule ?? existing?.payoutSchedule ?? "daily",
    shippingPolicy: input.shippingPolicy ??
      existing?.shippingPolicy ?? {
        flatRate: 0,
        freeShippingThreshold: null,
        shipsWorldwide: true,
        estimatedDays: "3–7 business days",
      },
    ...(existing ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  };

  await setDoc(shopRef, mergedPayload, { merge: true });

  // Propagate denormalized shop metadata to seller's existing products
  try {
    const productsQuery = query(
      collection(db, "shopProducts"),
      where("ownerId", "==", ownerId)
    );
    const productsSnap = await getDocs(productsQuery);
    if (!productsSnap.empty) {
      const batch = writeBatch(db);
      productsSnap.docs.forEach((pDoc) => {
        batch.update(pDoc.ref, {
          shopName: mergedPayload.shopName,
          shopSlug: mergedPayload.slug,
          stripeAccountId: mergedPayload.stripeAccountId,
          stripeChargesEnabled: mergedPayload.stripeChargesEnabled,
          acceptedPaymentMethods: mergedPayload.acceptedPaymentMethods,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }
  } catch (syncErr) {
    console.warn("[shop-marketplace] Could not sync denormalized product shop info:", syncErr);
  }

  return normalizeShopDoc(ownerId, mergedPayload);
}

export async function uploadShopImage(
  ownerId: string,
  folder: "branding" | "products",
  file: File
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `shops/${ownerId}/${folder}/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, file, {
    contentType: file.type || "image/jpeg",
  });
  return getDownloadURL(fileRef);
}

export interface UpsertSellerProductInput {
  name: string;
  description: string;
  price: number;
  currency: ShopCurrency;
  imageUrls: string[];
  category: string;
  animeTitle?: string;
  stock: number;
  sizes?: string[];
  isPublished: boolean;
}

export async function createSellerProduct(
  ownerId: string,
  shop: SellerShop,
  input: UpsertSellerProductInput
): Promise<Product> {
  const payload = {
    ownerId,
    shopId: ownerId,
    shopName: shop.shopName,
    shopSlug: shop.slug,
    stripeAccountId: shop.stripeAccountId,
    stripeChargesEnabled: shop.stripeChargesEnabled,
    acceptedPaymentMethods: shop.acceptedPaymentMethods,
    name: input.name.trim(),
    description: input.description.trim(),
    price: Number(input.price),
    currency: input.currency || shop.currency || "USD",
    imageUrls: input.imageUrls,
    category: input.category,
    animeTitle: input.animeTitle?.trim() || "",
    stock: Math.max(0, Math.floor(Number(input.stock))),
    sizes: input.sizes ?? [],
    variants: null,
    rating: 5,
    isPublished: Boolean(input.isPublished),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "shopProducts"), payload);
  return normalizeCommunityProductDoc(docRef.id, payload);
}

export async function updateSellerProduct(
  productId: string,
  ownerId: string,
  shop: SellerShop,
  input: UpsertSellerProductInput
): Promise<void> {
  const productRef = doc(db, "shopProducts", productId);
  await updateDoc(productRef, {
    ownerId,
    shopId: ownerId,
    shopName: shop.shopName,
    shopSlug: shop.slug,
    stripeAccountId: shop.stripeAccountId,
    stripeChargesEnabled: shop.stripeChargesEnabled,
    acceptedPaymentMethods: shop.acceptedPaymentMethods,
    name: input.name.trim(),
    description: input.description.trim(),
    price: Number(input.price),
    currency: input.currency || shop.currency || "USD",
    imageUrls: input.imageUrls,
    category: input.category,
    animeTitle: input.animeTitle?.trim() || "",
    stock: Math.max(0, Math.floor(Number(input.stock))),
    sizes: input.sizes ?? [],
    isPublished: Boolean(input.isPublished),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSellerProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, "shopProducts", productId));
}

export async function listPublishedCommunityProducts(
  maxCount = 200
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "shopProducts"),
      where("isPublished", "==", true),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeCommunityProductDoc(d.id, d.data()));
  } catch (err) {
    console.warn("[shop-marketplace] listPublishedCommunityProducts failed:", err);
    return [];
  }
}

export async function listShopPublishedProducts(
  shopOwnerId: string
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "shopProducts"),
      where("ownerId", "==", shopOwnerId),
      where("isPublished", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeCommunityProductDoc(d.id, d.data()));
  } catch (err) {
    console.warn("[shop-marketplace] listShopPublishedProducts failed:", err);
    return [];
  }
}

export async function listSellerOwnProducts(ownerId: string): Promise<Product[]> {
  if (!ownerId) return [];
  try {
    const q = query(
      collection(db, "shopProducts"),
      where("ownerId", "==", ownerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeCommunityProductDoc(d.id, d.data()));
  } catch (err) {
    console.warn("[shop-marketplace] listSellerOwnProducts failed:", err);
    return [];
  }
}

export async function getCommunityProductById(
  productId: string
): Promise<Product | null> {
  if (!productId) return null;
  try {
    const snap = await getDoc(doc(db, "shopProducts", productId));
    if (!snap.exists()) return null;
    return normalizeCommunityProductDoc(snap.id, snap.data());
  } catch (err) {
    console.warn("[shop-marketplace] getCommunityProductById failed:", err);
    return null;
  }
}

export async function createPendingShopOrder(params: {
  buyerId: string;
  buyerEmail: string;
  sellerIds: string[];
  items: ShopOrderItem[];
  currency: ShopCurrency;
  subtotal: number;
  shippingAmount: number;
  platformFeeAmount: number;
  sellerNetAmount: number;
  total: number;
  customerInfo: CustomerInfo;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "shopOrders"), {
    ...params,
    stripeSessionId: null,
    stripePaymentIntentId: null,
    paymentStatus: "pending",
    fulfillmentStatus: "processing",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function attachStripeSessionToOrder(
  orderId: string,
  stripeSessionId: string
): Promise<void> {
  await updateDoc(doc(db, "shopOrders", orderId), {
    stripeSessionId,
    updatedAt: serverTimestamp(),
  });
}

export async function confirmBuyerOrderPayment(
  orderId: string,
  stripeSessionId: string,
  stripePaymentIntentId: string | null
): Promise<void> {
  await updateDoc(doc(db, "shopOrders", orderId), {
    stripeSessionId,
    stripePaymentIntentId,
    paymentStatus: "paid",
    updatedAt: serverTimestamp(),
  });
}

function normalizeOrderDoc(id: string, data: Record<string, any>): ShopOrder {
  return {
    id,
    buyerId: data.buyerId || "",
    buyerEmail: data.buyerEmail || "",
    sellerIds: Array.isArray(data.sellerIds) ? data.sellerIds : [],
    items: Array.isArray(data.items) ? data.items : [],
    currency: (data.currency as ShopCurrency) || "USD",
    subtotal: Number(data.subtotal || 0),
    shippingAmount: Number(data.shippingAmount || 0),
    platformFeeAmount: Number(data.platformFeeAmount || 0),
    sellerNetAmount: Number(data.sellerNetAmount || 0),
    total: Number(data.total || 0),
    customerInfo: data.customerInfo || {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
    stripeSessionId: data.stripeSessionId || null,
    stripePaymentIntentId: data.stripePaymentIntentId || null,
    paymentStatus: data.paymentStatus || "pending",
    fulfillmentStatus: data.fulfillmentStatus || "processing",
    trackingNumber: data.trackingNumber || "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getShopOrderById(orderId: string): Promise<ShopOrder | null> {
  if (!orderId) return null;
  try {
    const snap = await getDoc(doc(db, "shopOrders", orderId));
    if (!snap.exists()) return null;
    return normalizeOrderDoc(snap.id, snap.data());
  } catch (err) {
    console.warn("[shop-marketplace] getShopOrderById failed:", err);
    return null;
  }
}

export async function listSellerOrders(sellerId: string): Promise<ShopOrder[]> {
  if (!sellerId) return [];
  try {
    const q = query(
      collection(db, "shopOrders"),
      where("sellerIds", "array-contains", sellerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeOrderDoc(d.id, d.data()));
  } catch (err) {
    console.warn("[shop-marketplace] listSellerOrders failed:", err);
    return [];
  }
}

export async function listBuyerOrders(buyerId: string): Promise<ShopOrder[]> {
  if (!buyerId) return [];
  try {
    const q = query(
      collection(db, "shopOrders"),
      where("buyerId", "==", buyerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeOrderDoc(d.id, d.data()));
  } catch (err) {
    console.warn("[shop-marketplace] listBuyerOrders failed:", err);
    return [];
  }
}

export async function updateSellerOrderFulfillment(
  orderId: string,
  fulfillmentStatus: OrderFulfillmentStatus,
  trackingNumber?: string
): Promise<void> {
  if (trackingNumber !== undefined) {
    await updateDoc(doc(db, "shopOrders", orderId), {
      fulfillmentStatus,
      trackingNumber: trackingNumber.trim(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(doc(db, "shopOrders", orderId), {
      fulfillmentStatus,
      updatedAt: serverTimestamp(),
    });
  }
}

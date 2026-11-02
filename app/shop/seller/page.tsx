"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit3,
  ExternalLink,
  ImagePlus,
  Layers,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  useMySellerShop,
  useSellerOrders,
  useSellerOwnProducts,
  useStripeConnectStatus,
} from "@/hooks/shop/use-marketplace";
import {
  createSellerProduct,
  deleteSellerProduct,
  isShopSlugAvailable,
  saveSellerShop,
  updateSellerOrderFulfillment,
  updateSellerProduct,
  uploadShopImage,
} from "@/lib/shop-marketplace";
import {
  PAYMENT_METHOD_OPTIONS,
  SHOP_CATEGORIES,
  STRIPE_CONNECT_COUNTRIES,
  SUPPORTED_SHOP_CURRENCIES,
  formatShopPrice,
  resolveProductImage,
  slugifyShopName,
} from "@/lib/shop-utils";
import type {
  AcceptedPaymentMethod,
  OrderFulfillmentStatus,
  PayoutScheduleInterval,
  Product,
  ShopCurrency,
  ShopStatus,
} from "@/types/shop";

const APPAREL_SIZE_PRESETS = ["XS", "SM", "M", "L", "XL", "2XL", "3XL"];

function SellerStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const initialTab = searchParams.get("tab") || "merch";
  const stripeReturnFlag = searchParams.get("stripe");
  const returnedAccountId = searchParams.get("account_id");

  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: shop, isLoading: shopLoading } = useMySellerShop(user?.uid);
  const { data: myProducts = [], isLoading: productsLoading } =
    useSellerOwnProducts(user?.uid);
  const { data: sellerOrders = [], isLoading: ordersLoading } = useSellerOrders(
    user?.uid
  );
  const {
    data: stripeStatus,
    isLoading: stripeStatusLoading,
    refetch: refetchStripeStatus,
  } = useStripeConnectStatus(shop?.stripeAccountId || returnedAccountId);

  // Storefront form state (used for both initial Seller Signup and Storefront Settings tab)
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState<ShopCurrency>("USD");
  const [shopStatus, setShopStatus] = useState<ShopStatus>("active");
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    AcceptedPaymentMethod[]
  >(["card", "apple_google_pay", "link"]);
  const [payoutSchedule, setPayoutSchedule] =
    useState<PayoutScheduleInterval>("daily");
  const [flatShippingRate, setFlatShippingRate] = useState("0");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("3–7 business days");
  const [shipsWorldwide, setShipsWorldwide] = useState(true);

  const [isSavingShop, setIsSavingShop] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isOpeningStripeDashboard, setIsOpeningStripeDashboard] =
    useState(false);

  // Merch Product Modal state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<string>(SHOP_CATEGORIES[0]);
  const [prodAnimeTitle, setProdAnimeTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("10");
  const [prodDescription, setProdDescription] = useState("");
  const [prodImageUrls, setProdImageUrls] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [prodSizes, setProdSizes] = useState<string[]>([]);
  const [prodPublished, setProdPublished] = useState(true);
  const [isUploadingProdImg, setIsUploadingProdImg] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const prodImgInputRef = useRef<HTMLInputElement>(null);

  // Sync existing shop data into form fields
  useEffect(() => {
    if (shop) {
      setShopName(shop.shopName);
      setSlug(shop.slug);
      setSlugTouched(true);
      setTagline(shop.tagline);
      setDescription(shop.description);
      setLogoUrl(shop.logoUrl);
      setBannerUrl(shop.bannerUrl);
      setContactEmail(shop.contactEmail || user?.email || "");
      setCountry(shop.country || "US");
      setCurrency(shop.currency || "USD");
      setShopStatus(shop.status || "active");
      setAcceptedPaymentMethods(
        shop.acceptedPaymentMethods?.length
          ? shop.acceptedPaymentMethods
          : ["card", "apple_google_pay", "link"]
      );
      setPayoutSchedule(shop.payoutSchedule || "daily");
      setFlatShippingRate(String(shop.shippingPolicy?.flatRate ?? 0));
      setFreeShippingThreshold(
        shop.shippingPolicy?.freeShippingThreshold != null
          ? String(shop.shippingPolicy.freeShippingThreshold)
          : ""
      );
      setEstimatedDays(
        shop.shippingPolicy?.estimatedDays || "3–7 business days"
      );
      setShipsWorldwide(shop.shippingPolicy?.shipsWorldwide ?? true);
    } else if (user && !contactEmail) {
      setContactEmail(user.email || "");
      if (user.displayName && !shopName) {
        const defaultName = `${user.displayName}'s Merch Vault`;
        setShopName(defaultName);
        setSlug(slugifyShopName(defaultName));
      }
    }
  }, [shop, user]);

  // Sync live Stripe Connect account flags back to Firestore when returning from Stripe onboarding
  useEffect(() => {
    if (
      !user?.uid ||
      !shop ||
      !stripeStatus?.account ||
      stripeStatusLoading
    ) {
      return;
    }

    const acct = stripeStatus.account;
    const changed =
      shop.stripeAccountId !== acct.id ||
      shop.stripeChargesEnabled !== acct.chargesEnabled ||
      shop.stripePayoutsEnabled !== acct.payoutsEnabled ||
      shop.stripeDetailsSubmitted !== acct.detailsSubmitted ||
      shop.stripeOnboardingComplete !== acct.onboardingComplete;

    if (changed) {
      saveSellerShop(user.uid, {
        shopName: shop.shopName,
        slug: shop.slug,
        stripeAccountId: acct.id,
        stripeChargesEnabled: acct.chargesEnabled,
        stripePayoutsEnabled: acct.payoutsEnabled,
        stripeDetailsSubmitted: acct.detailsSubmitted,
        stripeOnboardingComplete: acct.onboardingComplete,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["sellerShop", user.uid] });
        queryClient.invalidateQueries({ queryKey: ["publicShops"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        if (stripeReturnFlag === "return") {
          toast.success(
            acct.chargesEnabled
              ? "Stripe Connect verified! Your shop can now receive split payouts."
              : "Stripe Connect details saved. Finish any remaining verification items when ready."
          );
          router.replace("/shop/seller?tab=payments");
        }
      });
    }
  }, [
    user?.uid,
    shop,
    stripeStatus,
    stripeStatusLoading,
    stripeReturnFlag,
    queryClient,
    router,
  ]);

  const paidOrders = useMemo(
    () => sellerOrders.filter((o) => o.paymentStatus === "paid"),
    [sellerOrders]
  );

  const grossRevenue = useMemo(
    () => paidOrders.reduce((sum, o) => sum + (o.sellerNetAmount || o.total), 0),
    [paidOrders]
  );

  const totalInventoryUnits = useMemo(
    () => myProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
    [myProducts]
  );

  const handleTogglePaymentMethod = (method: AcceptedPaymentMethod) => {
    if (method === "card") return; // Cards are always enabled on Stripe Checkout
    setAcceptedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleUploadBrandAsset = async (
    file: File | undefined,
    target: "logo" | "banner"
  ) => {
    if (!file || !user?.uid) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }

    target === "logo" ? setIsUploadingLogo(true) : setIsUploadingBanner(true);
    try {
      const url = await uploadShopImage(user.uid, "branding", file);
      if (target === "logo") {
        setLogoUrl(url);
      } else {
        setBannerUrl(url);
      }
      toast.success(
        `${target === "logo" ? "Shop logo" : "Storefront banner"} uploaded!`
      );
    } catch (err: any) {
      console.error("Upload brand asset error:", err);
      toast.error("Could not upload image. You can also paste an image URL.");
    } finally {
      target === "logo"
        ? setIsUploadingLogo(false)
        : setIsUploadingBanner(false);
    }
  };

  const handleSaveShopProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user?.uid) return;

    const cleanName = shopName.trim();
    const cleanSlug = slugifyShopName(slug || cleanName);
    if (cleanName.length < 2) {
      toast.error("Shop name must be at least 2 characters.");
      return;
    }
    if (cleanSlug.length < 2) {
      toast.error("Storefront URL handle must be at least 2 characters.");
      return;
    }

    setIsSavingShop(true);
    try {
      const available = await isShopSlugAvailable(cleanSlug, user.uid);
      if (!available) {
        toast.error(
          `The handle "${cleanSlug}" is already taken. Try another storefront handle.`
        );
        setIsSavingShop(false);
        return;
      }

      const isFirstTimeSetup = !shop;
      await saveSellerShop(user.uid, {
        shopName: cleanName,
        slug: cleanSlug,
        tagline,
        description,
        logoUrl,
        bannerUrl,
        contactEmail: contactEmail || user.email || "",
        country,
        currency,
        status: shopStatus,
        acceptedPaymentMethods,
        payoutSchedule,
        shippingPolicy: {
          flatRate: Math.max(0, Number(flatShippingRate || 0)),
          freeShippingThreshold: freeShippingThreshold.trim()
            ? Math.max(0, Number(freeShippingThreshold))
            : null,
          shipsWorldwide,
          estimatedDays: estimatedDays.trim() || "3–7 business days",
        },
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sellerShop", user.uid] }),
        queryClient.invalidateQueries({ queryKey: ["publicShops"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);

      toast.success(
        isFirstTimeSetup
          ? "Your Otakuz Shop is live! Next, connect Stripe payouts or add your first merch."
          : "Shop settings & payment preferences saved!"
      );

      if (isFirstTimeSetup) {
        setActiveTab("payments");
      }
    } catch (err: any) {
      console.error("Save shop error:", err);
      toast.error(err?.message || "Failed to save shop settings.");
    } finally {
      setIsSavingShop(false);
    }
  };

  const handleConnectStripeExpress = async () => {
    if (!user?.uid || !shop) {
      toast.info("Save your shop profile first before connecting Stripe.");
      return;
    }

    setIsConnectingStripe(true);
    try {
      const res = await fetch("/api/stripe/connect/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: user.uid,
          email: shop.contactEmail || user.email || "",
          shopName: shop.shopName,
          shopSlug: shop.slug,
          country: shop.country || country || "US",
          existingStripeAccountId: shop.stripeAccountId,
          payoutSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Unable to start Stripe Connect onboarding.");
        setIsConnectingStripe(false);
        return;
      }

      // Persist stripeAccountId immediately before redirecting to Stripe KYC
      await saveSellerShop(user.uid, {
        shopName: shop.shopName,
        slug: shop.slug,
        stripeAccountId: data.stripeAccountId,
        stripeChargesEnabled: Boolean(data.chargesEnabled),
        stripePayoutsEnabled: Boolean(data.payoutsEnabled),
        stripeDetailsSubmitted: Boolean(data.detailsSubmitted),
        acceptedPaymentMethods,
        payoutSchedule,
      });

      window.location.href = data.onboardingUrl;
    } catch (err: any) {
      console.error("Stripe Connect onboarding error:", err);
      toast.error(err?.message || "Failed to connect to Stripe.");
      setIsConnectingStripe(false);
    }
  };

  const handleOpenStripeExpressDashboard = async () => {
    if (!shop?.stripeAccountId) return;
    setIsOpeningStripeDashboard(true);
    try {
      const res = await fetch("/api/stripe/connect/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeAccountId: shop.stripeAccountId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not open Stripe dashboard.");
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast.error(err?.message || "Could not open Stripe Express Dashboard.");
    } finally {
      setIsOpeningStripeDashboard(false);
    }
  };

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategory(SHOP_CATEGORIES[0]);
    setProdAnimeTitle("");
    setProdPrice("");
    setProdStock("10");
    setProdDescription("");
    setProdImageUrls([]);
    setManualImageUrl("");
    setProdSizes([]);
    setProdPublished(true);
    setIsProductDialogOpen(true);
  };

  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCategory(product.category || SHOP_CATEGORIES[0]);
    setProdAnimeTitle(product.animeTitle || "");
    setProdPrice(String(product.price));
    setProdStock(String(product.stock ?? 0));
    setProdDescription(product.description || "");
    setProdImageUrls(product.imageUrls || []);
    setManualImageUrl("");
    setProdSizes(product.sizes || []);
    setProdPublished(product.isPublished !== false);
    setIsProductDialogOpen(true);
  };

  const handleUploadProductFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user?.uid) return;
    setIsUploadingProdImg(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 6)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10 MB limit.`);
          continue;
        }
        const url = await uploadShopImage(user.uid, "products", file);
        uploaded.push(url);
      }
      if (uploaded.length > 0) {
        setProdImageUrls((prev) => [...prev, ...uploaded].slice(0, 10));
        toast.success(`Uploaded ${uploaded.length} merch image(s)`);
      }
    } catch (err) {
      console.error("Upload product image error:", err);
      toast.error("Image upload failed. You can also paste an image URL below.");
    } finally {
      setIsUploadingProdImg(false);
    }
  };

  const handleAddManualImageUrl = () => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed.startsWith("http")) {
      toast.error("Enter a valid https:// image URL.");
      return;
    }
    setProdImageUrls((prev) => [...prev, trimmed].slice(0, 10));
    setManualImageUrl("");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !shop) return;

    const numericPrice = Number(prodPrice);
    const numericStock = Number(prodStock);

    if (prodName.trim().length < 2) {
      toast.error("Merch name must be at least 2 characters.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Enter a valid price greater than 0.");
      return;
    }
    if (!Number.isFinite(numericStock) || numericStock < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = {
        name: prodName.trim(),
        description: prodDescription.trim(),
        price: numericPrice,
        currency: shop.currency || "USD",
        imageUrls: prodImageUrls,
        category: prodCategory,
        animeTitle: prodAnimeTitle.trim(),
        stock: numericStock,
        sizes: prodSizes,
        isPublished: prodPublished,
      };

      if (editingProduct) {
        await updateSellerProduct(editingProduct._id, user.uid, shop, payload);
        toast.success(`Updated "${payload.name}"`);
      } else {
        await createSellerProduct(user.uid, shop, payload);
        toast.success(`Published "${payload.name}" to your shop!`);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["sellerOwnProducts", user.uid],
        }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["publicShopProducts", user.uid],
        }),
        queryClient.invalidateQueries({
          queryKey: ["globalSearch", "merchCatalog"],
        }),
      ]);

      setIsProductDialogOpen(false);
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(err?.message || "Could not save merch listing.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!user?.uid) return;
    try {
      await deleteSellerProduct(product._id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["sellerOwnProducts", user.uid],
        }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
      toast.success(`Removed "${product.name}"`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product.");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderFulfillmentStatus,
    trackingNumber?: string
  ) => {
    if (!user?.uid) return;
    try {
      await updateSellerOrderFulfillment(orderId, nextStatus, trackingNumber);
      await queryClient.invalidateQueries({
        queryKey: ["sellerOrders", user.uid],
      });
      toast.success(`Order updated to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update order status.");
    }
  };

  if (authLoading || (user && shopLoading)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Unauthenticated Visitor -> Seller Signup Pitch
  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="overflow-hidden border-border/80 bg-card p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Store className="h-8 w-8" />
          </div>
          <Badge className="mb-3 bg-rose-500 text-white hover:bg-rose-500">
            Otakuz Creator Marketplace
          </Badge>
          <h1 className="mb-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Open Your Own Anime & Manga Merch Shop
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground sm:text-base">
            Sign in to create your custom Otakuz storefront, list figures, apparel, prints, and collectibles, configure buyer payment methods, and receive automatic payouts via Stripe Connect Express.
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <Store className="mb-2 h-5 w-5 text-rose-500" />
              <h3 className="text-sm font-bold">1. Custom Storefront</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Claim your `/shop/store/handle` URL with custom branding and multi-currency pricing.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <CreditCard className="mb-2 h-5 w-5 text-rose-500" />
              <h3 className="text-sm font-bold">2. Stripe Connect Payouts</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Link your bank account or debit card on Stripe Express and choose Cards, Apple/Google Pay, Link, or Klarna.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <Package className="mb-2 h-5 w-5 text-rose-500" />
              <h3 className="text-sm font-bold">3. List & Ship Merch</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload photos, manage stock & sizes, and track incoming orders in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="bg-rose-500 font-semibold text-white hover:bg-rose-600"
            >
              <Link href="/auth">Sign In to Launch Your Shop</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Browse Marketplace</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Authenticated User Who Hasn't Created Their Shop Yet -> Seller Signup Wizard
  if (!shop) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>

        <Card className="border-border/80 bg-card p-6 sm:p-8">
          <div className="mb-6 border-b border-border/80 pb-6">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
              <Sparkles className="h-3.5 w-3.5" />
              Seller Registration • Step 1 of 2
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Set Up Your Otakuz Shop
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure your storefront identity, currency, and accepted buyer payment methods. Right after this step, you&apos;ll connect your Stripe Express payout account and add your merch.
            </p>
          </div>

          <form onSubmit={handleSaveShopProfile} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shop Name *
                </label>
                <Input
                  required
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    if (!slugTouched) {
                      setSlug(slugifyShopName(e.target.value));
                    }
                  }}
                  placeholder="e.g. Akiba Figure Studio"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Storefront Handle *
                </label>
                <div className="flex items-center rounded-md border border-input bg-background px-3 text-sm">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    /shop/store/
                  </span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugifyShopName(e.target.value));
                    }}
                    placeholder="akiba-figure-studio"
                    className="h-9 w-full bg-transparent pl-1 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shop Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as ShopCurrency)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {Object.values(SUPPORTED_SHOP_CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stripe Payout Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {STRIPE_CONNECT_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Seller Contact Email
                </label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="orders@yourshop.com"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Short Tagline
              </label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Handcrafted resin statues, limited streetwear & doujin prints"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                About Your Shop
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell fellow otakus what makes your merch special, shipping origin, and authenticity guarantees..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Accepted Payment Options */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Buyer Payment Options Enabled on Stripe Checkout
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PAYMENT_METHOD_OPTIONS.map((opt) => {
                  const active = acceptedPaymentMethods.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleTogglePaymentMethod(opt.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        active
                          ? "border-rose-500/60 bg-rose-500/5"
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={opt.id === "card"}
                        readOnly
                        className="mt-1 accent-rose-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {opt.label}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {opt.badge}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/80 pt-5">
              <Button
                type="submit"
                size="lg"
                disabled={isSavingShop}
                className="gap-2 bg-rose-500 font-semibold text-white hover:bg-rose-600"
              >
                {isSavingShop ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Your Shop...
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4" />
                    Create My Shop & Continue to Stripe Payouts
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Full Seller Studio Dashboard (for registered shop owners)
  const stripeAccount = stripeStatus?.account;
  const stripeReady = Boolean(
    stripeAccount?.chargesEnabled || shop.stripeChargesEnabled
  );
  const platformFeePct = stripeStatus?.platformFeePercent ?? 5;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Top Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt={shop.shopName}
                fill
                className="object-cover"
              />
            ) : (
              <Store className="h-6 w-6 text-rose-500" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {shop.shopName}
              </h1>
              <Badge
                variant={shop.status === "active" ? "default" : "secondary"}
                className={
                  shop.status === "active"
                    ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                    : ""
                }
              >
                {shop.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">{shop.currency}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Seller Studio • Public URL:{" "}
              <Link
                href={`/shop/store/${shop.slug}`}
                className="font-medium text-rose-500 hover:underline"
              >
                /shop/store/{shop.slug}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/shop/store/${shop.slug}`}>
              <span>View Storefront</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={openNewProductDialog}
            className="gap-1.5 bg-rose-500 font-semibold text-white hover:bg-rose-600"
          >
            <Plus className="h-4 w-4" />
            Add Merch
          </Button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/80 bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Merch Listings
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {myProducts.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {totalInventoryUnits} total units in stock
          </p>
        </Card>

        <Card className="border-border/80 bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Paid Orders
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {paidOrders.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {sellerOrders.length} total order(s)
          </p>
        </Card>

        <Card className="border-border/80 bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Net Seller Earnings
          </p>
          <p className="mt-1 text-2xl font-black text-rose-500">
            {formatShopPrice(grossRevenue, shop.currency)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            After {platformFeePct}% platform fee
          </p>
        </Card>

        <Card className="border-border/80 bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Stripe Payout Status
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            {stripeReady ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Connected
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  Setup Needed
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {shop.stripeAccountId
              ? `Account ${shop.stripeAccountId.slice(0, 12)}...`
              : "Link bank/card in Payment Options"}
          </p>
        </Card>
      </div>

      {/* Main Seller Studio Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-border/80 h-auto p-1 sm:w-auto sm:inline-flex">
          <TabsTrigger value="merch" className="gap-2 py-2">
            <Package className="h-4 w-4" />
            Merch ({myProducts.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 py-2">
            <Wallet className="h-4 w-4" />
            Payment Options & Stripe
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2 py-2">
            <Truck className="h-4 w-4" />
            Orders ({sellerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="storefront" className="gap-2 py-2">
            <Store className="h-4 w-4" />
            Storefront Settings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MERCH & INVENTORY */}
        <TabsContent value="merch" className="space-y-4">
          {!stripeReady && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                <span>
                  Connect your <strong>Stripe Express</strong> payout account in the{" "}
                  <strong>Payment Options & Stripe</strong> tab so customer orders automatically split directly to your bank or debit card.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("payments")}
              >
                Configure Stripe Payouts
              </Button>
            </div>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-72 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : myProducts.length === 0 ? (
            <Card className="border-dashed border-border bg-card p-12 text-center">
              <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-bold">No merch listed yet</h3>
              <p className="mx-auto mt-1 mb-5 max-w-md text-xs text-muted-foreground sm:text-sm">
                Add your first anime figure, hoodie, manga volume, print, or collectible to publish it on your storefront and the main Otakuz Shop.
              </p>
              <Button
                onClick={openNewProductDialog}
                className="gap-2 bg-rose-500 text-white hover:bg-rose-600"
              >
                <Plus className="h-4 w-4" />
                Add Your First Merch
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myProducts.map((item) => (
                <Card
                  key={item._id}
                  className="flex flex-col overflow-hidden border-border/80 bg-card"
                >
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={resolveProductImage(item, 0)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute left-2 top-2 flex gap-1.5">
                      <Badge
                        variant={item.isPublished ? "default" : "secondary"}
                        className={
                          item.isPublished
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <span>Stock: {item.stock}</span>
                    </div>
                    <h3 className="mt-1 line-clamp-1 font-bold text-foreground">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-base font-black text-rose-500">
                      {formatShopPrice(item.price, item.currency || shop.currency)}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => openEditProductDialog(item)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteProduct(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: PAYMENT OPTIONS & STRIPE CONNECT */}
        <TabsContent value="payments" className="space-y-6">
          {/* Stripe Connect Express Card */}
          <Card className="border-border/80 bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-rose-500" />
                  <h2 className="text-lg font-black text-foreground">
                    Stripe Connect Express Payouts
                  </h2>
                  {stripeReady && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Active & Verified
                    </Badge>
                  )}
                </div>
                <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm">
                  Link your bank account or eligible debit card via Stripe-hosted onboarding. When a fan buys your merch, Stripe automatically routes{" "}
                  <strong>{100 - platformFeePct}%</strong> directly to your connected Stripe balance (Otakuz marketplace fee: {platformFeePct}%).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {shop.stripeAccountId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchStripeStatus()}
                    className="gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh Status
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={handleConnectStripeExpress}
                  disabled={isConnectingStripe}
                  className="gap-2 bg-rose-500 font-semibold text-white hover:bg-rose-600"
                >
                  {isConnectingStripe ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Opening Stripe...
                    </>
                  ) : shop.stripeAccountId ? (
                    <>
                      <CreditCard className="h-4 w-4" />
                      {stripeReady
                        ? "Update Stripe Verification"
                        : "Complete Stripe Onboarding"}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Connect Bank / Card with Stripe
                    </>
                  )}
                </Button>

                {shop.stripeAccountId && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isOpeningStripeDashboard}
                    onClick={handleOpenStripeExpressDashboard}
                    className="gap-1.5"
                  >
                    {isOpeningStripeDashboard ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Stripe Payout Dashboard
                  </Button>
                )}
              </div>
            </div>

            {stripeStatus && stripeStatus.configured === false && (
              <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-foreground">
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  Developer Environment Notice: Stripe API Key Not Detected
                </p>
                <p className="mt-1 text-muted-foreground">
                  Add <code className="rounded bg-background px-1.5 py-0.5">STRIPE_SECRET_KEY=sk_test_...</code>{" "}
                  (and optional{" "}
                  <code className="rounded bg-background px-1.5 py-0.5">STRIPE_WEBHOOK_SECRET=whsec_...</code>,{" "}
                  <code className="rounded bg-background px-1.5 py-0.5">STRIPE_PLATFORM_FEE_PERCENT=5</code>) to{" "}
                  <code className="rounded bg-background px-1.5 py-0.5">.env</code> to activate live/test Stripe Connect Express onboarding and Checkout sessions.
                </p>
              </div>
            )}

            {/* Connected Account & External Bank/Card Payout Methods */}
            {stripeAccount && (
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border/80 pt-5 md:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Card & Wallet Charges
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {stripeAccount.chargesEnabled ? "Enabled" : "Pending KYC"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Automatic Bank Payouts
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {stripeAccount.payoutsEnabled ? "Enabled" : "Pending Bank"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Linked Payout Methods
                  </p>
                  {stripeAccount.externalAccounts.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      No bank/card attached yet
                    </p>
                  ) : (
                    <div className="mt-1.5 space-y-1">
                      {stripeAccount.externalAccounts.map((ext) => (
                        <div
                          key={ext.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Building2 className="h-3.5 w-3.5 text-rose-500" />
                            {ext.bankName} •••• {ext.last4}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {ext.currency}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Buyer Payment Methods & Payout Schedule Form */}
          <Card className="border-border/80 bg-card p-6">
            <h3 className="text-base font-black text-foreground">
              Accepted Customer Payment Options & Payout Schedule
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose which payment methods buyers can use at Stripe Checkout for your shop, plus how frequently Stripe settles funds to your bank.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_METHOD_OPTIONS.map((opt) => {
                const active = acceptedPaymentMethods.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTogglePaymentMethod(opt.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-rose-500/60 bg-rose-500/5"
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={opt.id === "card"}
                      readOnly
                      className="mt-1 accent-rose-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {opt.label}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {opt.badge}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border/80 pt-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payout Schedule
                </label>
                <select
                  value={payoutSchedule}
                  onChange={(e) =>
                    setPayoutSchedule(e.target.value as PayoutScheduleInterval)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="daily">Daily Automatic</option>
                  <option value="weekly">Weekly (Every Monday)</option>
                  <option value="monthly">Monthly (1st of Month)</option>
                  <option value="manual">Manual Payouts</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Flat Shipping Rate ({shop.currency})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={flatShippingRate}
                  onChange={(e) => setFlatShippingRate(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimated Delivery Window
                </label>
                <Input
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="3–7 business days"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                disabled={isSavingShop}
                onClick={() => handleSaveShopProfile()}
                className="bg-rose-500 font-semibold text-white hover:bg-rose-600"
              >
                {isSavingShop ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Payment & Shipping Options"
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: ORDERS & FULFILLMENT */}
        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-28 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : sellerOrders.length === 0 ? (
            <Card className="border-dashed border-border bg-card p-12 text-center">
              <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-bold">No customer orders yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Orders placed for your merch through Stripe Checkout will appear here with shipping details and fulfillment controls.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((order) => {
                const myItems = order.items.filter(
                  (i) => i.sellerId === user.uid
                );
                return (
                  <Card
                    key={order.id}
                    className="space-y-4 border-border/80 bg-card p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge
                            variant={
                              order.paymentStatus === "paid"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              order.paymentStatus === "paid"
                                ? "bg-emerald-600 text-white"
                                : ""
                            }
                          >
                            Payment: {order.paymentStatus.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {order.fulfillmentStatus.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ship to: <strong>{order.customerInfo?.name}</strong> •{" "}
                          {order.customerInfo?.address} ({order.customerInfo?.email})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={order.fulfillmentStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order.id,
                              e.target.value as OrderFulfillmentStatus,
                              order.trackingNumber
                            )
                          }
                          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {myItems.map((item, idx) => (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {item.name}{" "}
                            {item.selectedSize ? `(${item.selectedSize})` : ""} ×{" "}
                            {item.quantity}
                          </span>
                          <span className="font-semibold">
                            {formatShopPrice(
                              item.price * item.quantity,
                              order.currency
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: STOREFRONT SETTINGS */}
        <TabsContent value="storefront">
          <Card className="border-border/80 bg-card p-6">
            <form onSubmit={handleSaveShopProfile} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shop Avatar / Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt="Logo preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Store className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadBrandAsset(e.target.files?.[0], "logo")
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="gap-1.5"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload Logo
                      </Button>
                      <Input
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="Or paste logo https:// URL"
                        className="h-8 bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Storefront Cover Banner
                  </label>
                  <div className="space-y-2">
                    <div className="relative h-20 w-full overflow-hidden rounded-2xl border border-border bg-background">
                      {bannerUrl ? (
                        <Image
                          src={bannerUrl}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No banner image set
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadBrandAsset(e.target.files?.[0], "banner")
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingBanner}
                        onClick={() => bannerInputRef.current?.click()}
                        className="shrink-0 gap-1.5"
                      >
                        {isUploadingBanner ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload Banner
                      </Button>
                      <Input
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="Or paste banner https:// URL"
                        className="h-8 bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shop Name
                  </label>
                  <Input
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Storefront Handle
                  </label>
                  <Input
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugifyShopName(e.target.value))}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Visibility Status
                  </label>
                  <select
                    value={shopStatus}
                    onChange={(e) => setShopStatus(e.target.value as ShopStatus)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="active">Active (Public)</option>
                    <option value="paused">Paused (Vacation)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shop Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as ShopCurrency)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  >
                    {Object.values(SUPPORTED_SHOP_CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tagline
                  </label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shop Bio & Policies
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingShop}
                  className="bg-rose-500 font-semibold text-white hover:bg-rose-600"
                >
                  {isSavingShop ? "Saving..." : "Update Storefront"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Merch Modal */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingProduct ? "Edit Merch Listing" : "Add New Merch to Your Shop"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Merch Title *
                </label>
                <Input
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Gojo Satoru Domain Expansion Heavyweight Hoodie"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category *
                </label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {SHOP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Anime / Manga Series (Optional)
                </label>
                <Input
                  value={prodAnimeTitle}
                  onChange={(e) => setProdAnimeTitle(e.target.value)}
                  placeholder="e.g. Jujutsu Kaisen, One Piece, Original"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price ({shop.currency}) *
                </label>
                <Input
                  required
                  type="number"
                  min="0.01"
                  step={shop.currency === "JPY" ? "1" : "0.01"}
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder={shop.currency === "JPY" ? "4500" : "39.99"}
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Stock *
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Sizes (Optional for Apparel / Merch) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sizes (Optional — toggle applicable sizes for apparel)
              </label>
              <div className="flex flex-wrap gap-2">
                {APPAREL_SIZE_PRESETS.map((sz) => {
                  const selected = prodSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        setProdSizes((prev) =>
                          prev.includes(sz)
                            ? prev.filter((s) => s !== sz)
                            : [...prev, sz]
                        )
                      }
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                        selected
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Photos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Photos
              </label>

              {prodImageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {prodImageUrls.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background"
                    >
                      <Image
                        src={url}
                        alt={`Merch photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProdImageUrls((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-90 hover:bg-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <input
                  ref={prodImgInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadProductFiles(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingProdImg}
                  onClick={() => prodImgInputRef.current?.click()}
                  className="gap-1.5"
                >
                  {isUploadingProdImg ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Upload Photos
                </Button>

                <div className="flex min-w-[220px] flex-1 gap-1.5">
                  <Input
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="Or paste image https:// URL"
                    className="h-9 bg-background text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddManualImageUrl}
                  >
                    Add URL
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                rows={3}
                value={prodDescription}
                onChange={(e) => setProdDescription(e.target.value)}
                placeholder="Materials, dimensions, edition details, and care instructions..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={prodPublished}
                onChange={(e) => setProdPublished(e.target.checked)}
                className="accent-rose-500"
              />
              Publish immediately to storefront & Otakuz Marketplace
            </label>

            <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingProduct}
                className="bg-rose-500 font-semibold text-white hover:bg-rose-600"
              >
                {isSavingProduct ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingProduct ? (
                  "Save Changes"
                ) : (
                  "Publish Merch"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SellerStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      }
    >
      <SellerStudioContent />
    </Suspense>
  );
}

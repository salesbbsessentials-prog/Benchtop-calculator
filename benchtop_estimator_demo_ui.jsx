"use client";

import React, { useState } from "react";

// Single functional page: ready for Vercel (Next.js App Router)
// - Shows full benchtop estimator UI
// - Collects customer + material + image URL
// - Button sends data to Make webhook (if configured) OR uses a safe demo response

const MAKE_WEBHOOK_URL = "https://hook.make.com/REPLACE_WITH_YOUR_WEBHOOK"; // <-- replace for real Make scenario

type QuoteResult = {
  slabs: number;
  subtotal: number;
  gst: number;
  total: number;
  currency: string;
};

export default function BenchtopEstimatorDemoUi() {
  // Customer info
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");

  // Benchtop info
  const [material, setMaterial] = useState("");
  const [thickness, setThickness] = useState<string>("");
  const [colour, setColour] = useState("Australis");

  // Image
  const [imageUrl, setImageUrl] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Quote / status
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
  }

  function handleImageUrlChange(value: string) {
    setImageUrl(value);
    if (value.trim()) {
      setLocalPreview(value.trim());
    }
  }

  async function handleRunEstimate() {
    setError(null);
    setLoading(true);
    setQuote(null);

    const payload = {
      customer: {
        name,
        surname,
        address,
        postcode,
        email,
      },
      benchtop: {
        material,
        thickness,
        colour,
      },
      image: {
        url: imageUrl || null,
      },
    };

    try {
      const isPlaceholder = MAKE_WEBHOOK_URL.includes("REPLACE_WITH_YOUR_WEBHOOK");

      if (isPlaceholder) {
        // Demo fallback so UI works even before Make is connected
        const demo: QuoteResult = {
          slabs: 2,
          subtotal: 3450,
          gst: 345,
          total: 3795,
          currency: "AUD",
        };
        await new Promise((r) => setTimeout(r, 500));
        setQuote(demo);
      } else {
        const res = await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Make webhook error: ${res.status}`);
        }

        const data = await res.json();
        const q: QuoteResult =
          data.quote || data || {
            slabs: 2,
            subtotal: 3450,
            gst: 345,
            total: 3795,
            currency: "AUD",
          };
        setQuote(q);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong while getting the quote.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-slate-200">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Kitchen Benchtop Estimator
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Fill details, add image URL, choose material, and run AI estimate.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-500 text-xs flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Ready for Vercel · Single page
          </div>
        </header>

        {/* CUSTOMER INFO */}
        <section className="border border-slate-200 bg-white p-6 rounded-2xl space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Customer Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Surname"
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Post Code"
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <section className="space-y-6">
            {/* IMAGE INPUT */}
            <div className="border border-dashed border-slate-300 bg-slate-50 p-6 rounded-2xl space-y-4">
              <label className="font-medium text-slate-700">
                1. Upload kitchen photo or paste image URL
              </label>
              <input
                type="file"
                accept="image/*"
                className="text-sm text-slate-700"
                onChange={handleFileChange}
              />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="Paste image URL (e.g. real estate listing photo)"
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              {localPreview && (
                <div className="mt-2 border rounded-xl overflow-hidden bg-black/5 max-h-64 flex items-center justify-center">
                  <img
                    src={localPreview}
                    alt="Kitchen preview"
                    className="object-contain max-h-64 w-full"
                  />
                </div>
              )}
            </div>

            {/* MATERIAL / THICKNESS / COLOUR */}
            <div className="border border-slate-200 bg-white p-6 rounded-2xl space-y-4">
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Material"
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                placeholder="Thickness (mm)"
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <select
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
              >
                <option>Australis</option>
                <option>Calacatta Luxe</option>
                <option>Silver Silk</option>
                <option>Other</option>
              </select>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="space-y-6">
            {/* LAYOUT INFO (demo) */}
            <div className="border border-slate-200 bg-white p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-800">
                  5. Layout (example)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px]">
                  demo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Shape</p>
                  <p className="font-medium">L-shape (example)</p>
                </div>
                <div>
                  <p className="text-slate-500">Depth</p>
                  <p className="font-medium">600 mm</p>
                </div>
                <div>
                  <p className="text-slate-500">Main length</p>
                  <p className="font-medium">3250 mm</p>
                </div>
                <div>
                  <p className="text-slate-500">Return length</p>
                  <p className="font-medium">2100 mm</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                Later this section can show real measurements from OpenAI Vision via Make.
              </p>
            </div>

            {/* QUOTE PREVIEW */}
            <div className="border border-slate-200 bg-slate-900 p-6 rounded-2xl text-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold">6. Quote preview</h2>
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full">
                  Stone: {colour}
                </span>
              </div>

              {quote ? (
                <div className="text-xs space-y-1">
                  <p className="flex justify-between">
                    <span>Slabs required</span>
                    <span>{quote.slabs}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Fabrication + install</span>
                    <span>
                      {quote.currency} {quote.subtotal.toLocaleString()}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>GST</span>
                    <span>
                      {quote.currency} {quote.gst.toLocaleString()}
                    </span>
                  </p>
                  <div className="h-px bg-slate-700 my-1" />
                  <p className="flex justify-between text-sm font-semibold">
                    <span>Total (inc GST)</span>
                    <span>
                      {quote.currency} {quote.total.toLocaleString()}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  No quote yet. Fill details and run estimate.
                </p>
              )}

              {error && (
                <p className="text-[11px] text-red-300">{error}</p>
              )}

              <button
                onClick={handleRunEstimate}
                disabled={loading}
                className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-xs rounded-xl px-3 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Requesting estimate..." : "Run AI Estimate"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

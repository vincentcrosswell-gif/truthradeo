import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = (await req.json()) as { lat?: number; lng?: number };

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
    }

    // OpenStreetMap Nominatim reverse geocode (no API key)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "TruthRadeo/1.0 (truthradeo.com)",
        "Accept-Language": "en",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocode failed" }, { status: 502 });
    }

    const data = await res.json();
    const addr = data?.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.municipality ||
      "";
    const region = addr.state || addr.region || "";
    const country = addr.country || "";

    return NextResponse.json({
      city,
      region,
      country,
      display: [city, region].filter(Boolean).join(", "),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
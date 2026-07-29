export async function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const publisher = client.replace(/^ca-/, "");
  const body = publisher
    ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
    : "# Google AdSense publisher ID is not configured yet.\n";
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

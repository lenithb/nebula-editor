export const config = {
  matcher: "/",
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const isSpanish = /^\s*es\b/i.test(acceptLanguage) ||
    /(^|,)es(-|_)[a-z]{0,2}\s*(;q=1|;q=0\.[9]\d?(?!\d)|,|$)/i.test(acceptLanguage);

  const internal = new URL(isSpanish ? "/es.html" : "/index.html", url);
  const upstream = await fetch(internal.toString());
  if (!upstream.ok) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Crawlers require absolute og:image URLs; the static files keep relative ones.
  const html = (await upstream.text()).replaceAll(
    'content="/og-image.png"',
    `content="${url.origin}/og-image.png"`,
  );

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

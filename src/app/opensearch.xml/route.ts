import { NextResponse } from "next/server";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site";
import { xmlEscape } from "@/lib/xml";

export const dynamic = "force-static";

export function GET() {
  const origin = SITE_ORIGIN;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${xmlEscape(SITE_NAME)}</ShortName>
  <Description>Emekli haberlerinde ara</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Url type="text/html" method="get" template="${xmlEscape(origin)}/ara?q={searchTerms}"/>
</OpenSearchDescription>
`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/opensearchdescription+xml; charset=utf-8" },
  });
}

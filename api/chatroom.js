function toInt(v) {
  if (typeof v === "number" && Number.isFinite(v)) return Math.floor(v);
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Math.floor(Number(v));
  return null;
}

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");
  res.end(JSON.stringify(body));
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "accept": "application/json,text/plain,text/html,*/*"
      },
      signal: controller.signal
    });
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonFromJina(text) {
  if (!text) return null;
  const start = text.indexOf("Markdown Content:");
  if (start === -1) return null;
  const tail = text.slice(start + "Markdown Content:".length).trim();
  const line = tail.split(/\r?\n/).find((x) => x.trim().startsWith("{"));
  if (!line) return null;
  try {
    return JSON.parse(line.trim());
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  const channel = (req.query.channel || "Straty").toString().trim();
  if (!channel) return json(res, 400, { error: "Missing channel" });

  const slug = encodeURIComponent(channel);
  const urls = [
    `https://kick.com/api/v2/channels/${slug}`,
    `https://r.jina.ai/http://kick.com/api/v2/channels/${slug}`
  ];

  for (const url of urls) {
    try {
      const body = await fetchText(url);

      let payload = null;
      try {
        payload = JSON.parse(body);
      } catch {
        payload = parseJsonFromJina(body);
      }

      if (payload && payload.chatroom && toInt(payload.chatroom.id)) {
        return json(res, 200, {
          channel,
          chatroomId: toInt(payload.chatroom.id),
          source: url
        });
      }
    } catch {
      // try next source
    }
  }

  return json(res, 502, {
    error: "Unable to resolve chatroom id",
    channel
  });
};

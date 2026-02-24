function toInt(v) {
  if (typeof v === "number" && Number.isFinite(v)) return Math.floor(v);
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Math.floor(Number(v));
  return null;
}

function readGoalFromObject(payload) {
  const currentKeys = [
    "current",
    "current_subs",
    "current_subscriptions",
    "subscription_count",
    "subscriptions_count",
    "subscribers_count",
    "subscriber_count",
    "active_subscribers",
    "subs_count"
  ];
  const goalKeys = ["goal", "target", "max", "subscription_goal", "subscriptions_goal", "subscriber_goal"];
  const remainingKeys = ["remaining", "remaining_subs", "subs_to_go", "subscriptions_to_go", "to_go"];

  const queue = [payload];
  while (queue.length) {
    const node = queue.shift();
    if (!node || typeof node !== "object") continue;

    let current = null;
    let goal = null;
    let remaining = null;

    for (const k of currentKeys) {
      if (k in node) {
        const n = toInt(node[k]);
        if (n !== null) {
          current = n;
          break;
        }
      }
    }

    for (const k of goalKeys) {
      if (k in node) {
        const n = toInt(node[k]);
        if (n !== null) {
          goal = n;
          break;
        }
      }
    }

    for (const k of remainingKeys) {
      if (k in node) {
        const n = toInt(node[k]);
        if (n !== null) {
          remaining = n;
          break;
        }
      }
    }

    if (Number.isFinite(current) && Number.isFinite(goal) && goal > 0 && current <= goal) {
      return { current, goal, remaining: Number.isFinite(remaining) ? remaining : Math.max(0, goal - current) };
    }

    if (Number.isFinite(goal) && Number.isFinite(remaining) && goal > 0 && remaining <= goal) {
      return { current: Math.max(0, goal - remaining), goal, remaining };
    }

    for (const val of Object.values(node)) {
      if (val && typeof val === "object") queue.push(val);
    }
  }

  return null;
}

function readGoalFromText(text, fallbackGoal) {
  if (!text) return null;
  const plain = text.replace(/\s+/g, " ");
  const hasSubWord = (chunk) => /(?:sub|subscription|subscriptions|gift sub)/i.test(chunk);

  const remainingMatch =
    plain.match(/(\d{1,6})\s+subscriptions?\s+to\s+go/i) ||
    plain.match(/(?:subs?|subscriptions?)\D{0,16}(\d{1,6})\D{0,8}(?:to\s*go|remaining)/i);
  const remaining = remainingMatch ? toInt(remainingMatch[1]) : null;

  const pairRegex = /(\d{1,6})\s*\/\s*(\d{1,6})/g;
  let best = null;
  let pair;
  while ((pair = pairRegex.exec(plain)) !== null) {
    const current = toInt(pair[1]);
    const goal = toInt(pair[2]);
    if (!Number.isFinite(current) || !Number.isFinite(goal) || goal < 10 || current > goal) continue;

    const start = Math.max(0, pair.index - 100);
    const end = Math.min(plain.length, pair.index + pair[0].length + 100);
    const around = plain.slice(start, end);
    if (!hasSubWord(around)) continue;

    if (!best || goal > best.goal) best = { current, goal };
  }

  if (best) {
    return { current: best.current, goal: best.goal, remaining: Math.max(0, best.goal - best.current) };
  }

  if (Number.isFinite(remaining) && Number.isFinite(fallbackGoal) && fallbackGoal > 0 && remaining <= fallbackGoal) {
    return { current: Math.max(0, fallbackGoal - remaining), goal: fallbackGoal, remaining };
  }

  return null;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "accept": "application/json,text/plain,text/html,*/*",
        "accept-language": "en-US,en;q=0.9"
      },
      signal: controller.signal
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", "*");
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type");
    return res.end();
  }

  const channelRaw = (req.query.channel || "Straty").toString();
  const channel = channelRaw.trim();
  const fallbackGoal = Math.max(1, toInt(req.query.goal) || 200);

  if (!channel) {
    return json(res, 400, { error: "Missing channel query param" });
  }

  const slug = encodeURIComponent(channel);
  const urls = [
    `https://kick.com/api/v2/channels/${slug}`,
    `https://api.kick.com/private/v1/channels/${slug}`,
    `https://api.kick.com/public/v1/channels/${slug}`,
    `https://kick.com/${slug}`,
    `https://r.jina.ai/http://kick.com/${slug}`
  ];

  const errors = [];

  for (const url of urls) {
    try {
      const result = await fetchText(url);
      if (!result.body) {
        errors.push({ url, status: result.status, reason: "empty body" });
        continue;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(result.body);
      } catch {
        parsed = null;
      }

      if (parsed) {
        const fromObject = readGoalFromObject(parsed);
        if (fromObject) {
          return json(res, 200, { ...fromObject, source: url, mode: "object" });
        }

        const fromJsonText = readGoalFromText(JSON.stringify(parsed), fallbackGoal);
        if (fromJsonText) {
          return json(res, 200, { ...fromJsonText, source: url, mode: "json-text" });
        }
      }

      const fromText = readGoalFromText(result.body, fallbackGoal);
      if (fromText) {
        return json(res, 200, { ...fromText, source: url, mode: "text" });
      }

      errors.push({ url, status: result.status, reason: "not found in payload" });
    } catch (err) {
      errors.push({ url, reason: err && err.message ? err.message : "request failed" });
    }
  }

  return json(res, 502, {
    error: "Unable to read Kick sub goal automatically",
    channel,
    fallbackGoal,
    checked: urls.length,
    details: errors
  });
};

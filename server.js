const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");


function normalizeBaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

function getHostname() {
  const fromDomain = normalizeBaseUrl(process.env.NEXT_PUBLIC_DOMAIN_API_FULL);
  if (fromDomain) {
    try {
      return new URL(fromDomain).hostname;
    } catch (error) {
      return fromDomain
        .replace(/^https?:\/\//i, "")
        .split("/")[0]
        .split(":")[0]
        .trim();
    }
  }

  return String(process.env.HOSTNAME || process.env.HOST || "0.0.0.0").trim();
}

const dev = false;
const hostname = getHostname();
const port = Number(process.env.PORT || process.env.port || 8022);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      if (pathname === "/a") {
        await app.render(req, res, "/a", query);
      } else if (pathname === "/b") {
        await app.render(req, res, "/b", query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

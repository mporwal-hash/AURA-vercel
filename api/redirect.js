const shortLinks = {
  "scholrageis": { brand: "ScholrAgeis", path: "/ScholrAgeis/home" },
};

export default async function handler(req, res) {
  const code = (req.query.code || '').toLowerCase();

  if (!code || !shortLinks[code]) {
    res.status(404).send("Invalid or missing code");
    return;
  }

  const { brand, path: deepPath } = shortLinks[code];
  const redirectUrl = `https://${req.headers.host}${deepPath}`;

  res.writeHead(302, { Location: redirectUrl });
  res.end();
}

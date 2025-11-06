import fs from "fs";
import path from "path";

/**
 * Example mapping for short codes.
 * You could also store this in a DB or external JSON.
 */
const shortLinks = {
  "Scholrageis": { brand: "ScholrAgeis", path: "/ScholrAgeis/home" },
};

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code || !shortLinks[code]) {
    res.status(404).send("Invalid or missing code");
    return;
  }

  const { brand, path: deepPath } = shortLinks[code];

  // Construct final deep link
  const redirectUrl = `https://${req.headers.host}${deepPath}`;

  res.writeHead(302, { Location: redirectUrl });
  res.end();
}

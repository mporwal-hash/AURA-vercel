const shortLinks = {
  "scholrageis": { brand: "ScholrAgeis", path: "/ScholrAgeis/home" },
  // Add more apps here as needed
};

export default async function handler(req, res) {
  // Get code from query parameter or path
  const code = (req.query.code || req.url?.split('/')[1] || '').toLowerCase();

  if (!code || !shortLinks[code]) {
    return res.status(404).json({ 
      error: "Invalid or missing code",
      available: Object.keys(shortLinks)
    });
  }

  const { brand, path: deepPath } = shortLinks[code];
  
  // Build the redirect URL
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const redirectUrl = `${protocol}://${host}${deepPath}`;

  // Redirect
  res.setHeader('Location', redirectUrl);
  return res.status(302).end();
}

// api/redirect.js
import brandConfig from '../brand-config.json';

// Build lookup map from brand config
const shortLinks = {};
brandConfig.brands.forEach(app => {
  const code = app.brand.toLowerCase();
  const basePath = app.paths[0].replace('/*', '/home');
  shortLinks[code] = {
    brand: app.brand,
    path: basePath,
  };
});

export default async function handler(req, res) {
  const code = (req.query.code || req.url?.split('/')[1] || '').toLowerCase();

  if (!code || !shortLinks[code]) {
    return res.status(404).json({
      error: 'Invalid or missing code',
      message: 'Please use format: https://vercelnew-kappa.vercel.app/scholrageis',
      available: Object.keys(shortLinks),
    });
  }

  const { brand, path: deepPath } = shortLinks[code];
  const appConfig = brandConfig.brands.find(app => app.brand === brand);

  const userAgent = req.headers['user-agent'] || '';
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;

  let redirectUrl;

  if (isAndroid && appConfig?.androidPackage) {
    // Android → Play Store
    redirectUrl = `https://play.google.com/store/apps/details?id=${appConfig.androidPackage}`;
  } else if (isIOS) {
    if (appConfig?.iosAppStoreId) {
      // iOS → App Store
      redirectUrl = `https://apps.apple.com/app/id${appConfig.iosAppStoreId}`;
    } else if (appConfig?.iosAppId) {
      // fallback using bundleId (useful for debugging / test builds)
      const bundleId = appConfig.iosAppId.split('.').slice(1).join('.');
      redirectUrl = `https://apps.apple.com/app/${bundleId}`;
    } else {
      // fallback → universal link
      redirectUrl = `${protocol}://${host}${deepPath}`;
    }
  } else {
    // Desktop or unknown → fallback page or deep link
    redirectUrl = `${protocol}://${host}${deepPath}`;
  }

  res.setHeader('Location', redirectUrl);
  return res.status(302).end();
}

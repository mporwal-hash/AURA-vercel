// api/redirect.js
import brandConfig from '../brand-config.json';

// Build lookup map from brand config
const shortLinks = {};
brandConfig.brands.forEach(app => {
  const code = app.brand.toLowerCase();
  // You can keep or remove basePath since we won't redirect to it, but leaving it is harmless
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

  const { brand } = shortLinks[code];
  const appConfig = brandConfig.brands.find(app => app.brand === brand);

  const userAgent = req.headers['user-agent'] || '';
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);

  let redirectUrl;

  if (isAndroid && appConfig?.androidPackage) {
    // Android → Play Store
    redirectUrl = `https://play.google.com/store/apps/details?id=${appConfig.androidPackage}`;
  } else if (isIOS) {
    if (appConfig?.iosAppStoreId) {
      // iOS → App Store
      redirectUrl = `https://apps.apple.com/app/id${appConfig.iosAppStoreId}`;
    } else if (appConfig?.iosAppId) {
      // fallback using bundleId (debug/test)
      const bundleId = appConfig.iosAppId.split('.').slice(1).join('.');
      redirectUrl = `https://apps.apple.com/app/${bundleId}`;
    } else {
      // iOS fallback → App Store homepage or your chosen fallback
      redirectUrl = `https://apps.apple.com/`;
    }
  } else {
    // Desktop or unknown fallback → your website or landing page
    redirectUrl = `https://aura.services/`;
  }

  res.setHeader('Location', redirectUrl);
  return res.status(302).end();
}

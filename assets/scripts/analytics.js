(async () => {
  let ipData = {};
  try {
    const ipResponse = await fetch("https://ipapi.co/json/");
    ipData = await ipResponse.json();
  } catch (e) {}

  const browserData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const analyticsPayload = {
    timestamp: new Date().toISOString(),
    ip: ipData.ip || null,
    city: ipData.city || null,
    region: ipData.region || null,
    country: ipData.country_name || null,
    latitude: ipData.latitude || null,
    longitude: ipData.longitude || null,
    browser: browserData
  };

  console.log("Collected analytics data:", analyticsPayload);
})();
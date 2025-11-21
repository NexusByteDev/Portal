(() => {
  const frontEndOnlyHosts = [
    "github.io",
    "githubusercontent.com",
    "vercel.app",
    "netlify.app",
    "cloudflarepages.dev"
  ];

  const currentHost = window.location.hostname;
  let apiActive = false;

  fetch("/api/status", { method: "GET" })
    .then(res => {
      if (res.ok) apiActive = true;
    })
    .catch(() => {})
    .finally(() => {
      const isFrontEndHost = frontEndOnlyHosts.some(h => currentHost.endsWith(h));

      if (!apiActive && isFrontEndHost) {
        console.warn("No active API detected. This website appears to be using a front-end only host.");
      }
    });
})();
(() => {
  let devtoolsOpen = false;
  let threshold = 160;
  let checkInterval = null;

  const detectDevtools = () => {
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    return widthDiff || heightDiff;
  };

  const collectDebugData = () => {
    console.group("%cDebugging Activated", "color:#9c6bff;font-size:14px;");

    console.group("Network Information");
    if (navigator.connection) {
      console.log("Effective Type:", navigator.connection.effectiveType);
      console.log("Downlink (MBPS):", navigator.connection.downlink);
      console.log("RTT (MS):", navigator.connection.rtt);
      console.log("Save Data:", navigator.connection.saveData);
    } else {
      console.log("Network Information API not supported.");
    }
    console.groupEnd();

    console.group("Browser Information");
    console.log("User Agent:", navigator.userAgent);
    console.log("Platform:", navigator.platform);
    console.log("Language:", navigator.language);
    console.log("Time Zone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log("Screen:", {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    });
    console.groupEnd();

    console.group("Website Statistics");
    console.log("DOM Elements:", document.getElementsByTagName("*").length);
    console.log("Images:", document.images.length);
    console.log("Scripts:", document.scripts.length);
    console.log("Stylesheets:", document.styleSheets.length);

    const perf = performance;

    console.log("Performance Timing:", perf.timing);
    console.log("Navigation Entries:", perf.getEntriesByType("navigation"));
    console.log("Resource Count:", perf.getEntriesByType("resource").length);
    console.log("Resources:", perf.getEntriesByType("resource"));
    console.log("Memory (if supported):", perf.memory || "Not supported");
    console.groupEnd();

    console.groupEnd();
  };

  const startMonitoring = () => {
    if (checkInterval) return;

    checkInterval = setInterval(() => {
      const currentlyOpen = detectDevtools();

      if (currentlyOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        collectDebugData();
      }

      if (!currentlyOpen && devtoolsOpen) {
        devtoolsOpen = false;
      }
    }, 500);
  };

  startMonitoring();
})();
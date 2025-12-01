(async () => {

    function getFingerprint() {
        const saved = localStorage.getItem("nx_fingerprint");
        if (saved) return saved;

        const fp = crypto.randomUUID();
        localStorage.setItem("nx_fingerprint", fp);
        return fp;
    }

    const fingerprint = getFingerprint();

    async function getIPs() {
        let ipv4 = null, ipv6 = null;

        try {
            ipv4 = await fetch("https://api64.ipify.org?format=json").then(r => r.json()).then(d => d.ip);
        } catch {}

        try {
            ipv6 = await fetch("https://api6.ipify.org?format=json").then(r => r.json()).then(d => d.ip);
        } catch {}

        return { ipv4, ipv6 };
    }

    const ipData = await getIPs();

    async function getLocation(ip) {
        if (!ip) return null;

        try {
            return await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
        } catch {
            return null;
        }
    }

    const locationData = await getLocation(ipData.ipv4 || ipData.ipv6);

    const browserInfo = {
        userAgent: navigator.userAgent,
        userAgentData: navigator.userAgentData || null,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled(),
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || null,
        webdriver: navigator.webdriver
    };

    const deviceInfo = {
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
        orientation: (screen.orientation || {}).type || null,
        darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
        touchSupport: {
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchEvent: "ontouchstart" in window,
            msTouchPoints: navigator.msMaxTouchPoints || 0
        }
    };

    function getGPUInfo() {
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!gl) return null;

            const debug = gl.getExtension("WEBGL_debug_renderer_info");

            return debug ? {
                vendor: gl.getParameter(debug.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
            } : null;

        } catch {
            return null;
        }
    }

    const gpuInfo = getGPUInfo();

    const analyticsData = {
        fingerprint,
        ip: ipData,
        location: locationData ? {
            continent: locationData.continent_code || null,
            country: locationData.country_name || null,
            city: locationData.city || null,
            region: locationData.region || null,
            regionCode: locationData.region_code || null,
            postal: locationData.postal || null,
            org: locationData.org || null,
            timezone: locationData.timezone || null
        } : null,
        browserInfo,
        deviceInfo,
        gpuInfo,
        timestamp: new Date().toISOString()
    };

    try {
        await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(analyticsData)
        });
    } catch (err) {
        console.error("Analytics transmission failed:", err);
    }


    console.log("Analytics Collected:", analyticsData);

})();
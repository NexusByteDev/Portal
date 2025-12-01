(() => {
    let debugActive = false;

    function getNetworkState() {
        return {
            online: navigator.onLine,
            connection: navigator.connection ? {
                type: navigator.connection.type || null,
                effectiveType: navigator.connection.effectiveType || null,
                downlink: navigator.connection.downlink || null,
                rtt: navigator.connection.rtt || null,
                saveData: navigator.connection.saveData || null
            } : null
        };
    }

    function getAssetsState() {
        const resources = performance.getEntriesByType("resource");
        return resources.map(r => ({
            name: r.name,
            type: r.initiatorType,
            duration: r.duration,
            size: r.transferSize,
            encoded: r.encodedBodySize,
            decoded: r.decodedBodySize
        }));
    }

    function getTrafficStatus() {
        const timing = performance.getEntriesByType("navigation")[0] || performance.timing;
        return {
            loadTime: timing.loadEventEnd - timing.startTime,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.startTime,
            redirectCount: timing.redirectCount || 0,
            requestStart: timing.requestStart,
            responseStart: timing.responseStart,
            responseEnd: timing.responseEnd
        };
    }

    function showDebug() {
        const data = {
            networkState: getNetworkState(),
            assetsState: getAssetsState(),
            trafficStatus: getTrafficStatus()
        };
        console.log("%c--- Debug Information ---", "color: purple; font-weight: bold;");
        console.log(data);
    }

    const originalLog = console.log;
    console.log = function (...args) {
        if (args.includes("!Debug")) {
            if (!debugActive) {
                debugActive = true;
                showDebug();
            }
            return;
        }
        originalLog.apply(console, args);
    };
})();
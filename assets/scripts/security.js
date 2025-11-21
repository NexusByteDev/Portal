(() => {
  const state = { suspicious: false, reasons: [] };
  const startTime = Date.now();
  let activityCount = 0;
  let keypressCount = 0;
  let mouseMoveCount = 0;

  function addReason(reason) {
    if (state.reasons.indexOf(reason) !== -1) return;
    state.reasons.push(reason);
    state.suspicious = true;
    exposeStatus();
    if (typeof CustomEvent === "function") {
      try {
        window.dispatchEvent(new CustomEvent("security:suspicious", { detail: { reason, status: window.__SECURITY_STATUS__ } }));
      } catch (_) {}
    }
  }

  function exposeStatus() {
    window.__SECURITY_STATUS__ = Object.freeze({
      suspicious: state.suspicious,
      reasons: state.reasons.slice(),
      startedAt: startTime
    });
  }

  function finalizeLog() {
    if (state.suspicious && window.console && typeof console.warn === "function") {
      console.warn("Suspicious activity detected", window.__SECURITY_STATUS__);
    }
  }

  function userAgentHeuristics() {
    const ua = (navigator.userAgent || "").toLowerCase();
    if (!ua) addReason("missing_user_agent");
    const botPattern = /(bot|crawler|spider|scrapy|curl|wget|python|headless|phantom|selenium|playwright|puppeteer)/i;
    if (botPattern.test(ua)) addReason("user_agent_bot_like");
    if (navigator.webdriver === true) addReason("webdriver_detected");
    if (navigator.languages && navigator.languages.length === 0) addReason("no_languages_reported");
    if (!navigator.plugins || navigator.plugins.length === 0) addReason("no_plugins_reported");
  }

  function activityHeuristics() {
    const handlerMouse = () => {
      mouseMoveCount++;
      activityCount++;
    };
    const handlerKey = () => {
      keypressCount++;
      activityCount++;
    };
    window.addEventListener("mousemove", handlerMouse, { passive: true });
    window.addEventListener("keydown", handlerKey, { passive: true });
    setTimeout(() => {
      window.removeEventListener("mousemove", handlerMouse);
      window.removeEventListener("keydown", handlerKey);
      const duration = (Date.now() - startTime) / 1000;
      if (duration > 8 && activityCount === 0) addReason("no_human_activity_detected");
      if (mouseMoveCount > 1500 || keypressCount > 600) addReason("excessive_activity_pattern");
    }, 10000);
  }

  async function externalIpChecks() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return;
      const data = await res.json();
      const org = (data.org || "").toLowerCase();
      const asn = (data.asn || "").toLowerCase();
      const hostname = (data.hostname || "").toLowerCase();
      if (org.includes("vpn") || org.includes("proxy") || org.includes("datacenter") || org.includes("data center")) {
        addReason("ip_org_vpn_or_proxy_like");
      }
      if (org.includes("hosting") || org.includes("cloud") || org.includes("colo")) {
        addReason("ip_org_hosting_like");
      }
      if (asn.includes("vpn") || asn.includes("proxy") || asn.includes("hosting") || asn.includes("cloud")) {
        addReason("asn_vpn_proxy_or_hosting_like");
      }
      if (hostname.includes("tor") || hostname.includes("onion")) {
        addReason("tor_like_hostname");
      }
      if (data.security && typeof data.security === "object") {
        if (data.security.vpn) addReason("api_flag_vpn");
        if (data.security.proxy) addReason("api_flag_proxy");
        if (data.security.tor) addReason("api_flag_tor");
      }
    } catch (_) {}
  }

  async function externalSecondaryChecks() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch("https://ipinfo.io/json?token=", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return;
      const data = await res.json();
      const org = (data.org || "").toLowerCase();
      if (org.includes("vpn") || org.includes("proxy")) addReason("ipinfo_org_vpn_or_proxy_like");
      if (org.includes("hosting") || org.includes("cloud")) addReason("ipinfo_org_hosting_like");
    } catch (_) {}
  }

  function dnsProxyHeuristics() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.type === "none") addReason("connection_type_none");
    if (conn && conn.saveData === true) addReason("save_data_enabled");
    const ua = (navigator.userAgent || "").toLowerCase();
    if (ua.includes("cloudflare") || ua.includes("warp")) addReason("ua_cloudflare_warp_like");
    if (ua.includes("1.1.1.1") || ua.includes("8.8.8.8") || ua.includes("openvpn")) addReason("ua_public_dns_or_vpn_hint");
  }

  async function run() {
    exposeStatus();
    userAgentHeuristics();
    activityHeuristics();
    dnsProxyHeuristics();
    externalIpChecks();
    externalSecondaryChecks();
    setTimeout(finalizeLog, 6000);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    run();
  } else {
    window.addEventListener("DOMContentLoaded", run, { once: true });
  }
})();
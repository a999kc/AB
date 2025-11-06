type Nullable<T> = T | null;

interface WebGLInfo {
  available: boolean;
  vendor?: string;
  renderer?: string;
  version?: string;
  error?: string;
}

interface ToStringCheck {
  permissions_contains_native: boolean | null;
  object_toString_native: boolean | null;
}

interface MediaDeviceInfoShort {
  kind: string;
  label: string;
  deviceId: string;
}

interface DetectionFlag {
  name: string;
  info?: unknown;
}

interface DetectionResult {
  ts: string;
  score: number;
  flags: DetectionFlag[];
  verdict: boolean; // true = антидетект
}

// ---------- Безопасные утилиты ----------

const safe = <T>(fn: () => T, fallback: Nullable<T> = null): Nullable<T> => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

const simpleHash = (s: string): string => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(36);
};

// ---------- Вспомогательные проверки ----------

function getWebGLInfo(): WebGLInfo {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return { available: false };

    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      const vendor = gl.getParameter((dbg as any).UNMASKED_VENDOR_WEBGL) as string;
      const renderer = gl.getParameter((dbg as any).UNMASKED_RENDERER_WEBGL) as string;
      return { available: true, vendor, renderer };
    }

    const version = gl.getParameter(gl.VERSION) as string;
    return { available: true, version };
  } catch (e) {
    return { available: false, error: String(e) };
  }
}

function getCanvasSmallFP(): string | null {
  try {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.textBaseline = "top";
    ctx.font = '14px "Arial"';
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = "#069";
    ctx.fillText("antidetect-check", 2, 2);
    return simpleHash(c.toDataURL().slice(0, 200));
  } catch {
    return null;
  }
}

function checkToStringTamper(): ToStringCheck {
  const result: ToStringCheck = {
    permissions_contains_native: null,
    object_toString_native: null,
  };
  try {
    const s = Function.prototype.toString.call((navigator.permissions?.query as any) ?? (() => {}));
    result.permissions_contains_native = /\[native code\]/.test(s);
  } catch {
    result.permissions_contains_native = null;
  }
  try {
    const s2 = Function.prototype.toString.call(Object.prototype.toString);
    result.object_toString_native = /\[native code\]/.test(s2);
  } catch {
    result.object_toString_native = null;
  }
  return result;
}

async function iframeGetElementsProbe(
  timeout = 300
): Promise<{ called?: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      let called = false;
      const orig = Document.prototype.getElementsByTagName;
      Document.prototype.getElementsByTagName = function (
        tagName: string
      ): HTMLCollectionOf<Element> {
        called = true;
        return orig.call(this, tagName);
      };
      const ifr = document.createElement("iframe");
      ifr.style.width = "2px";
      ifr.style.height = "2px";
      ifr.style.visibility = "hidden";
      document.documentElement.appendChild(ifr);
      setTimeout(() => {
        try {
          ifr.remove();
        } catch {}
        Document.prototype.getElementsByTagName = orig;
        resolve({ called });
      }, timeout);
    } catch (e) {
      resolve({ error: String(e) });
    }
  });
}

async function getMediaDeviceInfo(): Promise<Nullable<MediaDeviceInfoShort[]>> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return null;
    const devs = await navigator.mediaDevices.enumerateDevices();
    return devs.map((d) => ({
      kind: d.kind,
      label: d.label || "",
      deviceId: d.deviceId || "",
    }));
  } catch {
    return null;
  }
}

function tzLangMismatch(): boolean {
  try {
    const tz = safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone) || "";
    const langs = safe(() => navigator.languages || [navigator.language || ""]) || [""];
    const primary = (langs[0] || "").toLowerCase();
    if (!tz) return false;
    if (primary.startsWith("ru") && /(tokyo|japan|korea|australia)/i.test(tz)) return true;
    if (primary.startsWith("zh") && /(europe|moscow|rome|london)/i.test(tz)) return true;
    if (primary.startsWith("en") && /(moscow|riyadh|beijing)/i.test(tz)) return true;
    return false;
  } catch {
    return false;
  }
}

// ---------- Главная функция ----------

export async function detectEnhancedGoLogin(): Promise<DetectionResult> {
  const flags: DetectionFlag[] = [];
  let score = 0;

  const addFlag = (name: string, weight: number, info?: unknown) => {
    flags.push({ name, info });
    score += weight;
  };

  const checks: any = {};

  checks.userAgent = safe(() => navigator.userAgent, "");
  checks.platform = safe(() => navigator.platform, "");
  checks.languages = safe(() => navigator.languages || [navigator.language], []);
  checks.webdriver = safe(() => navigator.webdriver === true, false);
  checks.deviceMemory = safe(() => (navigator as any).deviceMemory, null);
  checks.hardwareConcurrency = safe(() => navigator.hardwareConcurrency, null);
  checks.maxTouchPoints = safe(() => navigator.maxTouchPoints, 0);
  checks.uaData = safe(() => (navigator as any).userAgentData ?? null, null);

  checks.webgl = getWebGLInfo();
  checks.canvasFP = getCanvasSmallFP();
  checks.pluginsLength = safe(() => navigator.plugins?.length || 0, 0);
  checks.mimeTypesLength = safe(() => navigator.mimeTypes?.length || 0, 0);
  checks.toString = checkToStringTamper();
  checks.iframeProbe = await iframeGetElementsProbe(300);
  checks.mediaDevices = await getMediaDeviceInfo();

  if (checks.webdriver) addFlag("navigator.webdriver", 40);
  if (/headless/i.test(checks.userAgent)) addFlag("headless in UA", 30);
  if (checks.pluginsLength === 0 || checks.mimeTypesLength === 0)
    addFlag("no-plugins-or-mimetypes", 8);
  if (checks.hardwareConcurrency && checks.hardwareConcurrency <= 1)
    addFlag("low-hardwareConcurrency", 6);
  if (checks.deviceMemory && checks.deviceMemory <= 0.5) addFlag("low-deviceMemory", 6);

  if (checks.webgl.available) {
    const joint = `${checks.webgl.vendor || ""} ${checks.webgl.renderer || ""} ${
      checks.webgl.version || ""
    }`;
    if (/swiftshader|llvmpipe|software/i.test(joint)) addFlag("webgl-software-renderer", 12);
    if (!checks.webgl.vendor && !checks.webgl.renderer) addFlag("webgl-empty-or-generic", 8);
  } else {
    addFlag("webgl-unavailable", 6);
  }

  if (!checks.canvasFP) addFlag("canvas-blocked-or-empty", 10);
  else if (String(checks.canvasFP).length < 6) addFlag("canvas-fp-anomaly", 4);

  if (checks.toString.permissions_contains_native === false)
    addFlag("Function.prototype.toString patched", 14);
  if (checks.iframeProbe.called) addFlag("iframe-getElements-hook-detected", 10);

  if (checks.mediaDevices?.length) {
    const anyLabel = checks.mediaDevices.some((d: any) => d.label?.length > 0);
    if (!anyLabel) addFlag("mediaDevices-no-labels", 6);
  }

  if (checks.uaData?.brands) {
    try {
      const brands = checks.uaData.brands.map((b: any) => b.brand || b.name || "") as string[];
      if (brands.some((b) => b.includes("Not=A?Brand"))) addFlag("uaData-brand-mismatch", 20);
    } catch {}
  }

  if (tzLangMismatch()) addFlag("tz-language mismatch", 4);

  const verdict = score >= 20;
  const result: DetectionResult = {
    ts: new Date().toISOString(),
    score,
    flags,
    verdict,
  };

  console.log("%c[AntiDetect Check Result]", "color:blue;font-weight:bold;");
  console.log("AntiDetect (true = AB):", verdict);
  console.log("Score:", score);
  console.log("Flags:", flags);

  return result;
}

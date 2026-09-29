import { lang } from "../i18n";

// politica del documento del sandbox: permite cdn y fetch por https, pero
// bloquea formularios, iframes, objetos y <base>
const SANDBOX_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'unsafe-inline' https:",
  "img-src data: blob: https:",
  "font-src data: https:",
  "media-src data: blob: https:",
  "connect-src https:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

// evita que un "</script>" en el codigo del usuario cierre la etiqueta
// del sandbox y se interprete el resto como html
function escaparScript(code: string): string {
  return code.replace(/<\/(script)/gi, "<\\/$1");
}

export function buildSandboxHTML(code: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}" />
  <meta name="referrer" content="no-referrer" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { width: 100%; min-height: 100%; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #111;
      background: #fff;
    }
  </style>
</head>
<body>
<script>
(function() {
  var _log = console.log;
  var _warn = console.warn;
  var _error = console.error;
  var _info = console.info;

  function serialize(args) {
    return Array.from(args).map(function(a) {
      try {
        if (typeof a === 'object' && a !== null) {
          return JSON.stringify(a, null, 2);
        }
        return String(a);
      } catch(e) {
        return '[Unserializable]';
      }
    }).join(' ');
  }

  function send(level, args) {
    try {
      window.parent.postMessage({ type: 'console', level: level, message: serialize(args) }, '*');
    } catch(e) {}
  }

  console.log = function() { send('log', arguments); _log.apply(console, arguments); };
  console.warn = function() { send('warn', arguments); _warn.apply(console, arguments); };
  console.error = function() { send('error', arguments); _error.apply(console, arguments); };
  console.info = function() { send('info', arguments); _info.apply(console, arguments); };

  window.addEventListener('error', function(e) {
    send('error', [e.message + (e.filename ? ' (' + e.filename + ':' + e.lineno + ')' : '')]);
  });

  window.addEventListener('unhandledrejection', function(e) {
    send('error', ['${lang === "es" ? "Promesa rechazada sin manejar: " : "Unhandled Promise Rejection: "}' + (e.reason ? (e.reason.message || e.reason) : '${lang === "es" ? "Desconocido" : "Unknown"}')]);
  });
})();

try {
${escaparScript(code)}
} catch(e) {
  console.error(e.message || String(e));
}
</script>
</body>
</html>`;
}

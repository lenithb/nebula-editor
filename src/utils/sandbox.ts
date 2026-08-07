export function buildSandboxHTML(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
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
    send('error', ['Unhandled Promise Rejection: ' + (e.reason ? (e.reason.message || e.reason) : 'Unknown')]);
  });
})();

try {
${code}
} catch(e) {
  console.error(e.message || String(e));
}
</script>
</body>
</html>`;
}

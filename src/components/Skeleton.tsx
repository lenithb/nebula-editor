export function Skeleton() {
  return (
    <div className="app">
      <div className="skeleton-header">
        <div className="skeleton skeleton-circle" />
        <div className="skeleton skeleton-line" style={{ width: 72 }} />
        <div style={{ flex: 1 }} />
        <div className="skeleton skeleton-btn" style={{ width: 64 }} />
        <div className="skeleton skeleton-btn" style={{ width: 32 }} />
        <div className="skeleton skeleton-btn" style={{ width: 32 }} />
        <div className="skeleton skeleton-btn" style={{ width: 32 }} />
      </div>

      <div className="skeleton-workspace">
        <div className="skeleton-editor">
          {[88, 68, 52, 78, 62, 44, 72, 58, 48, 82, 38, 66].map((w, i) => (
            <div
              key={i}
              className="skeleton skeleton-line"
              style={{
                width: `${w}%`,
                animationDelay: `${i * 0.07}s`,
                opacity: i > 6 ? 0.4 : 0.7,
              }}
            />
          ))}
        </div>

        <div className="skeleton-preview">
          {[100, 58, 76, 38].map((w, i) => (
            <div
              key={i}
              className="skeleton skeleton-line"
              style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className="skeleton-console">
        {[68, 48, 82].map((w, i) => (
          <div
            key={i}
            className="skeleton skeleton-line"
            style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

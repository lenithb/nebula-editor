interface ActivityBarProps {
  sidebarOpen: boolean;
  consoleOpen: boolean;
  onToggleSidebar: () => void;
  onToggleConsole: () => void;
  onRun: () => void;
}

export function ActivityBar({
  sidebarOpen,
  consoleOpen,
  onToggleSidebar,
  onToggleConsole,
  onRun,
}: ActivityBarProps) {
  return (
    <nav className="activity-bar" aria-label="Workspace tools">
      <div className="activity-bar-group">
        <button
          className={`activity-button ${sidebarOpen ? "active" : ""}`}
          onClick={onToggleSidebar}
          aria-label="Toggle explorer"
          aria-pressed={sidebarOpen}
          data-tooltip="Explorer"
        >
          <FilesIcon />
        </button>
        <button
          className="activity-button"
          onClick={onRun}
          aria-label="Run project"
          data-tooltip="Run project"
        >
          <RunIcon />
        </button>
        <button
          className={`activity-button ${consoleOpen ? "active" : ""}`}
          onClick={onToggleConsole}
          aria-label="Toggle console"
          aria-pressed={consoleOpen}
          data-tooltip="Console"
        >
          <TerminalIcon />
        </button>
      </div>

      <div className="activity-language" aria-label="JavaScript workspace">
        JS
      </div>
    </nav>
  );
}

interface ProjectSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ open, onClose }: ProjectSidebarProps) {
  if (!open) return null;

  return (
    <aside className="project-sidebar" aria-label="Project explorer">
      <div className="sidebar-header">
        <span>Explorer</span>
        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close explorer"
          data-tooltip="Close explorer"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="project-tree">
        <div className="project-root">
          <ChevronIcon />
          <span>Nebula workspace</span>
        </div>
        <button className="project-file active" aria-current="page">
          <span className="file-type-icon">JS</span>
          <span>project.js</span>
          <span className="file-saved-dot" aria-label="Saved locally" />
        </button>
      </div>

      <div className="sidebar-footer">
        <span className="storage-status-dot" />
        <div>
          <strong>Local workspace</strong>
          <span>Changes are saved automatically</span>
        </div>
      </div>
    </aside>
  );
}

function FilesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.45">
      <path d="M6.25 2.75h6.5l3 3v9.5a2 2 0 0 1-2 2h-7.5a2 2 0 0 1-2-2V4.75a2 2 0 0 1 2-2Z" />
      <path d="M12.5 2.9V6h3.05M7.2 9h5.6M7.2 12h5.6" />
    </svg>
  );
}

function RunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m7 5 7 5-7 5V5Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="8" opacity=".35" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.45">
      <rect x="2.75" y="4" width="14.5" height="12" rx="2" />
      <path d="m6 8 2.25 2L6 12M10.5 12h3.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="m3.5 4.5 2.5 2.5 2.5-2.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="m3.5 3.5 7 7m0-7-7 7" />
    </svg>
  );
}

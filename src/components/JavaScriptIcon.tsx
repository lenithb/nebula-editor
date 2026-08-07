import javaScriptLogo from "../assets/logos/js.webp";

interface JavaScriptIconProps {
  className?: string;
}

export function JavaScriptIcon({ className = "" }: JavaScriptIconProps) {
  return (
    <img
      className={`javascript-logo ${className}`.trim()}
      src={javaScriptLogo}
      alt=""
      aria-hidden="true"
    />
  );
}

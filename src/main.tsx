import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { lang, t } from "./i18n";
import "./styles/global.css";

document.documentElement.lang = lang;
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute("content", t.metaDescription);
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

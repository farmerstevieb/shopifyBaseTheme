import React from "react";
import { createRoot } from "react-dom/client";

import { get } from "../../utils";
import Category from "./components/category";
import Serp from "./components/serp";
import AppStateProvider from "./contexts/app-state";

// SERP
const SerpApp: React.FC = () => {
  return (
    <AppStateProvider>
      <Serp />
    </AppStateProvider>
  );
};

const serpContent = get("#nosto-serp-content");
if (serpContent) createRoot(serpContent).render(<SerpApp />);

// CATEGORY
const CategoryApp: React.FC = () => {
  return (
    <AppStateProvider>
      <Category />
    </AppStateProvider>
  );
};

const categoryContent = get("#nosto-category-content");
if (categoryContent) createRoot(categoryContent).render(<CategoryApp />);

'use client';

import { useEffect } from "react";
import { useMobxStore } from "lib/mobx/store-provider";

const ClientThemeSetter = () => {
  const store = useMobxStore();

  useEffect(() => {
    const theme = localStorage?.getItem("app_theme") ?? "light";
    if (theme && store?.theme?.theme !== theme) {
      store.theme.setTheme(theme);
    } else {
      localStorage.setItem("app_theme", theme !== "light" ? "dark" : "light");
    }
  }, [store]);

  return null; // nothing to render
};

export default ClientThemeSetter;

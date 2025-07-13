"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useMobxStore } from "lib/mobx/store-provider";
import { RootStore } from "store/root";

const MobxStoreInit = () => {
  const store: RootStore | null = useMobxStore();

  const router = useRouter();
  const { states, labels, priorities } = router.query as {
    states: string[];
    labels: string[];
    priorities: string[];
  };

  useEffect(() => {
    if (!store) return;

    // theme setup
    const _theme = typeof window !== "undefined" && localStorage.getItem("app_theme") || "light";

    if (_theme && store.theme?.theme !== _theme) {
      store.theme.setTheme(_theme);
    } else {
      localStorage.setItem("app_theme", _theme !== "light" ? "dark" : "light");
    }

    // (optional) issue filters
    // store.issue.userSelectedLabels = labels || [];
    // store.issue.userSelectedPriorities = priorities || [];
    // store.issue.userSelectedStates = states || [];

  }, [store, labels, priorities, states]);

  return null;
};

export default MobxStoreInit;

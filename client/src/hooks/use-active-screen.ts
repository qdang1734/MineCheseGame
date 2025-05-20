import { useState } from "react";
import { ActiveScreen } from "@/lib/types";

export const useActiveScreen = (initialScreen: ActiveScreen = "home") => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(initialScreen);
  const [previousScreen, setPreviousScreen] = useState<ActiveScreen | null>(null);

  const changeScreen = (screen: ActiveScreen) => {
    setPreviousScreen(activeScreen);
    setActiveScreen(screen);
  };

  const goBack = () => {
    if (previousScreen) {
      setActiveScreen(previousScreen);
      setPreviousScreen(null);
      return true;
    }
    return false;
  };

  return {
    activeScreen,
    previousScreen,
    changeScreen,
    goBack,
  };
};

export default useActiveScreen;

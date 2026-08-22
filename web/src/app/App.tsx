import type { PropsWithChildren } from "react";
import { ApplicationsProvider } from "../features/applications/context/ApplicationsProvider";
import { ThemeModeProvider } from "./ThemeModeContext";

function App({ children }: PropsWithChildren) {
  return (
    <ThemeModeProvider>
      <ApplicationsProvider>{children}</ApplicationsProvider>
    </ThemeModeProvider>
  );
}

export default App;

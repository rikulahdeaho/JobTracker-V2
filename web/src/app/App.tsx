import type { PropsWithChildren } from "react";
import { ApplicationsProvider } from "../features/applications/context/ApplicationsProvider";

function App({ children }: PropsWithChildren) {
  return <ApplicationsProvider>{children}</ApplicationsProvider>;
}

export default App;

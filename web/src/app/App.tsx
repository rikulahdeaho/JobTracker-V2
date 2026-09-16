import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApplicationsProvider } from "../features/applications/context/ApplicationsProvider";
import { ThemeModeProvider } from "./ThemeModeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: false },
    mutations: { retry: false },
  },
});

function App({ children }: PropsWithChildren) {
  return (
    <ThemeModeProvider>
      <QueryClientProvider client={queryClient}>
        <ApplicationsProvider>{children}</ApplicationsProvider>
      </QueryClientProvider>
    </ThemeModeProvider>
  );
}

export default App;

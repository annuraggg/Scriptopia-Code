import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { dark } from "@clerk/themes";
import { Provider } from "react-redux";
import store from "@/store/store.ts";
import { Toaster as ShadToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider.tsx";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error("Missing Vite Clerk publishable key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <NextUIProvider>
      <Provider store={store}>
        <ClerkProvider
          publishableKey={publishableKey}
          appearance={{
            baseTheme: dark,
          }}
        >
          <Toaster richColors theme="dark" />
          <ShadToaster />
          <App />
        </ClerkProvider>
      </Provider>
    </NextUIProvider>
  </ThemeProvider>
);

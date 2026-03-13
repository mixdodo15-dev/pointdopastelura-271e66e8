import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Phase 1: Test minimal app without any Radix/UI providers
const MinimalTest = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    console.log("[APP_DEBUG] MinimalTest mounted successfully");
    setLoaded(true);
  }, []);
  return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
    <h1>🔧 Debug Mode</h1>
    <p>{loaded ? "✅ React is working!" : "Loading..."}</p>
    <p>React version: {(window as any).__REACT_VERSION || "unknown"}</p>
  </div>;
};

// Phase 2: Try importing one provider at a time
let TooltipProvider: any = null;
let Toaster: any = null;
let Sonner: any = null;
let Index: any = null;

try {
  TooltipProvider = require("@/components/ui/tooltip").TooltipProvider;
  console.log("[APP_DEBUG] TooltipProvider loaded OK");
} catch (e) {
  console.error("[APP_DEBUG] TooltipProvider FAILED:", e);
}

try {
  Toaster = require("@/components/ui/toaster").Toaster;
  console.log("[APP_DEBUG] Toaster loaded OK");
} catch (e) {
  console.error("[APP_DEBUG] Toaster FAILED:", e);
}

try {
  Sonner = require("@/components/ui/sonner").Toaster;
  console.log("[APP_DEBUG] Sonner loaded OK");
} catch (e) {
  console.error("[APP_DEBUG] Sonner FAILED:", e);
}

try {
  Index = require("./pages/Index").default;
  console.log("[APP_DEBUG] Index loaded OK");
} catch (e) {
  console.error("[APP_DEBUG] Index FAILED:", e);
}

const queryClient = new QueryClient();

const App = () => {
  console.log("[APP_DEBUG] App render start");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<MinimalTest />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

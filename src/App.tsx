import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Error boundary to catch and log which component fails
class ErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error(`[APP_DEBUG] ❌ ErrorBoundary caught in "${this.props.name}":`, error.message);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 8, background: '#fee', border: '1px solid #f00', borderRadius: 8, margin: 4, fontSize: 12 }}>
          <b>❌ {this.props.name}</b>: {this.state.error.message}
        </div>
      );
    }
    console.log(`[APP_DEBUG] ✅ "${this.props.name}" rendered OK`);
    return <>{this.props.children}</>;
  }
}

// Lazy imports to isolate failures
const TooltipProvider = React.lazy(() =>
  import("@/components/ui/tooltip").then(m => {
    console.log("[APP_DEBUG] tooltip module loaded");
    return { default: m.TooltipProvider };
  })
);
const Toaster = React.lazy(() =>
  import("@/components/ui/toaster").then(m => {
    console.log("[APP_DEBUG] toaster module loaded");
    return { default: m.Toaster };
  })
);
const Sonner = React.lazy(() =>
  import("@/components/ui/sonner").then(m => {
    console.log("[APP_DEBUG] sonner module loaded");
    return { default: m.Toaster };
  })
);
const Index = React.lazy(() =>
  import("./pages/Index").then(m => {
    console.log("[APP_DEBUG] Index module loaded");
    return { default: m.default };
  })
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <React.Suspense fallback={<div style={{ padding: 40 }}>Carregando...</div>}>
      <ErrorBoundary name="TooltipProvider">
        <TooltipProvider>
          <ErrorBoundary name="Toaster">
            <Toaster />
          </ErrorBoundary>
          <ErrorBoundary name="Sonner">
            <Sonner />
          </ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary name="Index">
                  <Index />
                </ErrorBoundary>
              } />
              <Route path="*" element={
                <div style={{ padding: 40 }}>
                  <p>Debug: outras rotas desabilitadas temporariamente</p>
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </React.Suspense>
  </QueryClientProvider>
);

export default App;

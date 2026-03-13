import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const queryClient = new QueryClient();

const DebugPage = () => {
  useEffect(() => {
    console.log("[APP_DEBUG] DebugPage mounted - React is working!");
  }, []);
  
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>🔧 Debug Mode - Isolando o Erro</h1>
      <p style={{ color: '#4f4' }}>✅ Se você vê isso, React + React Query + React Router estão OK.</p>
      <p style={{ marginTop: 12, color: '#aaa' }}>Próximo passo: habilitar componentes UI um a um.</p>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<DebugPage />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

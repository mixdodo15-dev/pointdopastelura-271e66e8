import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Cadastro from "./pages/Cadastro";
import ClienteLogin from "./pages/ClienteLogin";
import ResetPassword from "./pages/ResetPassword";
import MinhaConta from "./pages/MinhaConta";
import MeusPedidos from "./pages/MeusPedidos";
import AdminPedidos from "./pages/AdminPedidos";
import Entregador from "./pages/Entregador";
import AdminPdv from "./pages/AdminPdv";
import AdminKitchen from "./pages/AdminKitchen";
import AdminComandas from "./pages/AdminComandas";
import AdminCaixa from "./pages/AdminCaixa";
import AdminRelatorios from "./pages/AdminRelatorios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
          <Route path="/pdv" element={<AdminPdv />} />
          <Route path="/admin/pdv" element={<AdminPdv />} />
          <Route path="/admin/kitchen" element={<AdminKitchen />} />
          <Route path="/admin/comandas" element={<AdminComandas />} />
          <Route path="/admin/caixa" element={<AdminCaixa />} />
          <Route path="/admin/relatorios" element={<AdminRelatorios />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cliente-login" element={<ClienteLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
          <Route path="/entregador" element={<Entregador />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import ResetPassword from "./pages/ResetPassword";
import ClienteLogin from "./pages/ClienteLogin";
import MeusPedidos from "./pages/MeusPedidos";
import MinhaConta from "./pages/MinhaConta";
import Admin from "./pages/Admin";
import AdminPedidos from "./pages/AdminPedidos";
import AdminPdv from "./pages/AdminPdv";
import AdminCaixa from "./pages/AdminCaixa";
import AdminComandas from "./pages/AdminComandas";
import AdminKitchen from "./pages/AdminKitchen";
import AdminRelatorios from "./pages/AdminRelatorios";
import AdminMarketing from "./pages/AdminMarketing";
import Entregador from "./pages/Entregador";
import AdminEntrega from "./pages/AdminEntrega";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cliente-login" element={<ClienteLogin />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            <Route path="/minha-conta" element={<MinhaConta />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            <Route path="/admin/pdv" element={<AdminPdv />} />
            <Route path="/admin/caixa" element={<AdminCaixa />} />
            <Route path="/admin/comandas" element={<AdminComandas />} />
            <Route path="/admin/cozinha" element={<AdminKitchen />} />
            <Route path="/admin/relatorios" element={<AdminRelatorios />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            <Route path="/entregador" element={<Entregador />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

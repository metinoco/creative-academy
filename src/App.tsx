import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import Cursos from "./pages/Cursos.tsx";
import Curso from "./pages/Curso.tsx";
import Alumno from "./pages/Alumno.tsx";
import AlumnoCurso from "./pages/AlumnoCurso.tsx";
import Admin from "./pages/Admin.tsx";
import Login from "./pages/Login.tsx";
import Registro from "./pages/Registro.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/curso/:id" element={<Curso />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/alumno"
              element={
                <ProtectedRoute requireRole="student">
                  <Alumno />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alumno/curso/:slug"
              element={
                <ProtectedRoute requireRole="student">
                  <AlumnoCurso />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

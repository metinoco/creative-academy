import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

const Index = lazy(() => import("./pages/Index.tsx"));
const Cursos = lazy(() => import("./pages/Cursos.tsx"));
const Curso = lazy(() => import("./pages/Curso.tsx"));
const Alumno = lazy(() => import("./pages/Alumno.tsx"));
const AlumnoCurso = lazy(() => import("./pages/AlumnoCurso.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Registro = lazy(() => import("./pages/Registro.tsx"));
const Profesores = lazy(() => import("./pages/Profesores.tsx"));
const PagoExito = lazy(() => import("./pages/PagoExito.tsx"));
const Certificado = lazy(() => import("./pages/Certificado.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/curso/:id" element={<Curso />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/profesores" element={<Profesores />} />
              <Route path="/pago/exito" element={<PagoExito />} />
              <Route path="/certificado/:codigo" element={<Certificado />} />
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

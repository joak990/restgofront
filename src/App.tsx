// filepath: src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LoginDuenoPage from "./pages/LoginDuenoPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import PendientePage from "./pages/PendientePage";
import MisRestaurantesPage from "./pages/MisRestaurantesPage";
import RestauranteDetallePage from "./pages/RestauranteDetallePage";
import RestauranteInfoPage from "./components/RestauranteInfoPage";
import HorariosPage from "./pages/HorariosPage";
import MesasPage from "./pages/MesasPage";
import CartaPage from "./pages/CartaPage";
import ReservasPage from "./pages/ReservasPage";
import ClientesPage from "./pages/ClientesPage";
import PerfilPage from "./pages/PerfilPage";
import VistaMesaPage from "./pages/VistaMesaPage";
import TimelineDemoPage from "./pages/TimelineDemoPage";
import OwnerLayout from "./layouts/OwnerLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminPendientesPage from "./pages/AdminPendientesPage";
import AdminClientesPage from "./pages/AdminClientesPage";
import AdminRestaurantesPage from "./pages/AdminRestaurantesPage";
import RequireDuenoVerificado from "./components/RequireDuenoVerificado";
import RequireAdmin from "./components/RequireAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-dueno" element={<LoginDuenoPage />} />
      {/* Registro exclusivo para dueños de restaurante */}
      <Route path="/register/duenos" element={<RegisterPage />} />
      {/* Compat: redirige el path viejo al nuevo */}
      <Route path="/register" element={<Navigate to="/register/duenos" replace />} />
      <Route path="/onboarding/dueno" element={<OnboardingPage />} />
      <Route path="/dueno/pendiente" element={<PendientePage />} />
      {/* Demo: timeline de reservas del día (cronograma por mesa y hora) */}
      <Route
        path="/demo/timeline"
        element={
          <RequireDuenoVerificado>
            <OwnerLayout />
          </RequireDuenoVerificado>
        }
      >
        <Route index element={<TimelineDemoPage />} />
      </Route>
      {/* Compat: la URL vieja /demo/reservas ahora redirige al dashboard */}
      <Route
        path="/demo/reservas"
        element={<Navigate to="/dueno" replace />}
      />

      <Route
        path="/dueno"
        element={
          <RequireDuenoVerificado>
            <OwnerLayout />
          </RequireDuenoVerificado>
        }
      >
        <Route index element={<MisRestaurantesPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="carta" element={<CartaPage />} />
        <Route path="restaurantes/:id" element={<RestauranteDetallePage />}>
          <Route index element={<RestauranteInfoPage />} />
          <Route path="clientes" element={<ClientesPage />} />
        </Route>
        <Route path="restaurantes/:id/horarios" element={<HorariosPage />} />
        <Route path="restaurantes/:id/mesas" element={<MesasPage />} />
        <Route path="restaurantes/:id/carta" element={<CartaPage />} />
        <Route path="restaurantes/:id/reservas" element={<ReservasPage />} />
        <Route
          path="restaurantes/:restauranteId/vista-mesa"
          element={<VistaMesaPage />}
        />
      </Route>
      <Route
        path="/demo/clientes"
        element={
          <RequireDuenoVerificado>
            <OwnerLayout />
          </RequireDuenoVerificado>
        }
      >
        <Route index element={<ClientesPage />} />
      </Route>

      {/* Panel de admin — ruta oculta para no quedar visible en el navbar */}
      <Route
        path="/dueno-panel-adm-7x9z"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminPendientesPage />} />
        <Route path="clientes" element={<AdminClientesPage />} />
        <Route path="restaurantes" element={<AdminRestaurantesPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login-dueno" replace />} />
      <Route path="*" element={<Navigate to="/login-dueno" replace />} />
    </Routes>
  );
}

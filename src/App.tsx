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
import ReservasPage from "./pages/ReservasPage";
import ClientesPage from "./pages/ClientesPage";
import PerfilPage from "./pages/PerfilPage";
import ReservationsDemoPage from "./pages/ReservationsDemoPage";
import OwnerLayout from "./layouts/OwnerLayout";
import { auth } from "./api/client";
import type { LoginResponse, UserRole } from "./api/auth";

function getUserType(): UserRole | null {
  return auth.getUser<LoginResponse>()?.tipo ?? null;
}

/**
 * Guard genérico: exige sesión y, opcionalmente, que el rol esté en la lista.
 */
function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const token = auth.getToken();
  const tipo = getUserType();
  if (!token || !tipo || !roles.includes(tipo)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const RequireDueno = ({ children }: { children: React.ReactNode }) => (
  <RequireRole roles={["DUENO"]}>{children}</RequireRole>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-dueno" element={<LoginDuenoPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding/dueno" element={<OnboardingPage />} />
      <Route path="/dueno/pendiente" element={<PendientePage />} />
      {/* Demo: visualizador de reservaciones + 3 mesas con datos mockeados */}
      <Route path="/demo/reservas" element={<ReservationsDemoPage />} />

      <Route
        path="/dueno"
        element={
          <RequireDueno>
            <OwnerLayout />
          </RequireDueno>
        }
      >
        <Route index element={<MisRestaurantesPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="restaurantes/:id" element={<RestauranteDetallePage />}>
          <Route index element={<RestauranteInfoPage />} />
          <Route path="clientes" element={<ClientesPage />} />
        </Route>
        <Route path="restaurantes/:id/horarios" element={<HorariosPage />} />
        <Route path="restaurantes/:id/mesas" element={<MesasPage />} />
        <Route path="restaurantes/:id/reservas" element={<ReservasPage />} />
      </Route>
      <Route path="/demo/clientes" element={<ClientesPage />} />

      <Route path="/" element={<Navigate to="/login-dueno" replace />} />
      <Route path="*" element={<Navigate to="/login-dueno" replace />} />
    </Routes>
  );
}

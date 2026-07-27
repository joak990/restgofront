// filepath: src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MisRestaurantesPage from "./pages/MisRestaurantesPage";
import RestauranteDetallePage from "./pages/RestauranteDetallePage";
import RestauranteInfoPage from "./components/RestauranteInfoPage";
import HorariosPage from "./pages/HorariosPage";
import MesasPage from "./pages/MesasPage";
import ReservasPage from "./pages/ReservasPage";
import PerfilPage from "./pages/PerfilPage";
import OwnerLayout from "./layouts/OwnerLayout";
import { auth } from "./api/client";
import type { LoginResponse } from "./api/auth";

type UserType = LoginResponse["tipo"];

function getUserType(): UserType | null {
  return auth.getUser<LoginResponse>()?.tipo ?? null;
}

function RequireDueno({ children }: { children: React.ReactNode }) {
  const token = auth.getToken();
  const tipo = getUserType();
  if (!token || tipo !== "DUENO") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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
        </Route>
        <Route path="restaurantes/:id/horarios" element={<HorariosPage />} />
        <Route path="restaurantes/:id/mesas" element={<MesasPage />} />
        <Route path="restaurantes/:id/reservas" element={<ReservasPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

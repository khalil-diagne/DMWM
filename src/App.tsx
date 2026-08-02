import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import MapPage from "./pages/MapPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { EventsProvider } from "./store";
import { AuthProvider } from "./auth";

export default function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/evenements" element={<Events />} />
              <Route path="/evenement/:id" element={<EventDetail />} />
              <Route path="/carte" element={<MapPage />} />
              <Route path="/apropos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/connexion-admin" element={<AdminLogin />} />
              <Route
                path="/espace-prive-d8a9x"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </HashRouter>
      </EventsProvider>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "./lib/auth.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { SessionsPage } from "./pages/SessionsPage";
import { CreateSessionPage } from "./pages/CreateSessionPage";
import { SessionDetailPage } from "./pages/SessionDetailPage";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConvexProvider client={convex}>
          <AppRoutes />
        </ConvexProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/sessions"
          element={isAuthenticated ? <SessionsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/sessions/new"
          element={
            isAuthenticated ? <CreateSessionPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/sessions/:sessionId"
          element={
            isAuthenticated ? <SessionDetailPage /> : <Navigate to="/" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

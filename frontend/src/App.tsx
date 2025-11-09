import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { AuthProvider } from "./lib/auth.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { SessionsPage } from "./pages/SessionsPage";
import { CreateSessionPage } from "./pages/CreateSessionPage";
import { SessionDetailPage } from "./pages/SessionDetailPage";
import { Logo } from "./components/Logo";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import { useMemo } from "react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";


const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConvexProviderWithAuth0 client={convex}>
          <AppRoutes />
          <Toaster />
        </ConvexProviderWithAuth0>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Wrapper to integrate Auth0 with Convex
function ConvexAuth({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const useAuthFromAuth0 = useMemo(
    () => () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken: async ({
        forceRefreshToken,
      }: {
        forceRefreshToken: boolean;
      }) => {
        try {
          return await getAccessTokenSilently({
            cacheMode: forceRefreshToken ? "off" : "on",
          });
        } catch (error) {
          return null;
        }
      },
    }),
    [isLoading, isAuthenticated, getAccessTokenSilently]
  );

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuth0}>
      {children}
    </ConvexProviderWithAuth>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted gap-4">
        <Logo size={64} />
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

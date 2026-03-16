/**
 * @file App.tsx
 * @description Root Application Component.
 * Defines the high-level routing architecture, implements code-splitting (Lazy Loading),
 * handles global error boundaries, and enforces protected route access.
 */
import { Suspense } from "react";
import { lazyRetry } from "./lib/lazyRetry";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { ToastContainer } from "./components/shared/ToastContainer";
import { ConfirmModal } from "./components/shared/ConfirmModal";
import { GlobalLoading } from "./components/shared/GlobalLoading";

import { Loader2 } from "lucide-react";

/**
 * Route Splitting (Lazy Loading)
 * Components are only loaded when the user navigates to the respective route.
 */
const Overview = lazyRetry(() => import("./features/overview/pages/Overview"));
const Conversations = lazyRetry(
  () => import("./features/conversations/pages/Conversations"),
);
const Persona = lazyRetry(() => import("./features/persona/pages/Persona"));
const KnowledgeBase = lazyRetry(
  () => import("./features/knowledge/pages/KnowledgeBase"),
);
const WidgetConfig = lazyRetry(
  () => import("./features/widget/pages/WidgetConfig"),
);
const Tours = lazyRetry(() => import("./features/tours/pages/Tours"));
const Login = lazyRetry(() => import("./features/auth/pages/Login"));
const AIDebugger = lazyRetry(
  () => import("./features/devtools/pages/AIDebugger"),
);
const EmbedChat = lazyRetry(() => import("./features/widget/pages/EmbedChat"));

/**
 * Global Intermediate Loader
 */
const PageLoader = () => (
  <div
    className="flex-center"
    style={{ minHeight: "100vh", width: "100%", flex: 1 }}
  >
    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <ConfirmModal />
      <GlobalLoading />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Entryway */}
            <Route path="/login" element={<Login />} />
            <Route path="/embed/chat" element={<EmbedChat />} />

            {/* Protected Administration Area */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route
                          path="/conversations"
                          element={<Conversations />}
                        />
                        <Route path="/knowledge" element={<KnowledgeBase />} />
                        <Route path="/persona" element={<Persona />} />
                        <Route path="/tours" element={<Tours />} />
                        <Route path="/widget" element={<WidgetConfig />} />
                        {import.meta.env.VITE_ENABLE_DEV_LOGIN === "true" && (
                          <Route path="/debugger" element={<AIDebugger />} />
                        )}

                        {/* Fallback redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

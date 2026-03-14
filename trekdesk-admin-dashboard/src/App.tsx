/**
 * @file App.tsx
 * @description Root Application Component.
 * Defines the high-level routing architecture, implements code-splitting (Lazy Loading),
 * handles global error boundaries, and enforces protected route access.
 */
import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { Loader2 } from "lucide-react";

/**
 * Route Splitting (Lazy Loading)
 * Components are only loaded when the user navigates to the respective route.
 */
const Overview = lazy(() => import("./features/overview/pages/Overview"));
const Conversations = lazy(
  () => import("./features/conversations/pages/Conversations"),
);
const Persona = lazy(() => import("./features/persona/pages/Persona"));
const KnowledgeBase = lazy(
  () => import("./features/knowledge/pages/KnowledgeBase"),
);
const WidgetConfig = lazy(() => import("./features/widget/pages/WidgetConfig"));
const Tours = lazy(() => import("./features/tours/pages/Tours"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const AIDebugger = lazy(() => import("./features/devtools/pages/AIDebugger"));
const EmbedChat = lazy(() => import("./features/widget/pages/EmbedChat"));

/**
 * Global Intermediate Loader
 */
const PageLoader = () => (
  <div className="flex-center h-full">
    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
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
                        <Route path="/debugger" element={<AIDebugger />} />

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

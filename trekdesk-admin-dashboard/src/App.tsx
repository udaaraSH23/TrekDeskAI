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
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { Loader2 } from "lucide-react";

/**
 * Route Splitting (Lazy Loading)
 * Components are only loaded when the user navigates to the respective route.
 * This significantly improves the initial "Time to Interactive" (TTI) for the dashboard.
 */
const Overview = lazy(() => import("./pages/Overview"));
const Conversations = lazy(() => import("./pages/Conversations"));
const Persona = lazy(() => import("./pages/Persona"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const WidgetConfig = lazy(() => import("./pages/WidgetConfig"));
const Login = lazy(() => import("./pages/Login"));

/**
 * Global Intermediate Loader
 * Displayed during chunk fetching between navigation events.
 */
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
  </div>
);

/**
 * App Main Component
 * Implements a standard flat-then-nested layout:
 * - /login: Publicly accessible entry point.
 * - /* : Root catch-all for the dashboard, wrapped in security and layout constraints.
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        {/* Top-level Suspense handles the initial application chunk loading */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Entryway */}
            <Route path="/login" element={<Login />} />

            {/* 
              Protected Administration Area 
              All sub-routes within this section require a valid user session.
              The Layout component provides the Sidebar and Header infrastructure.
            */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* Inner Suspense allows for granular loading states per dashboard view */}
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route
                          path="/conversations"
                          element={<Conversations />}
                        />
                        <Route path="/knowledge" element={<KnowledgeBase />} />
                        <Route path="/persona" element={<Persona />} />
                        <Route path="/widget" element={<WidgetConfig />} />

                        {/* Fallback redirect for authenticated users targeting invalid sub-paths */}
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

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Card, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <Card
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <CardContent
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                }}
              >
                <AlertTriangle size={32} />
              </div>
              <CardTitle style={{ color: "#ef4444" }}>
                Something went wrong
              </CardTitle>
              <p
                style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}
              >
                {this.state.error?.message ||
                  "An unexpected error occurred in the application."}
              </p>
              <div style={{ marginTop: "1rem" }}>
                <Button
                  onClick={() => window.location.reload()}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <RefreshCcw size={16} />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

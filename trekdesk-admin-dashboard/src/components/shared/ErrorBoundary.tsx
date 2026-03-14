import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Card, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

import styles from "./ErrorBoundary.module.css";

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
        <div className={styles.container}>
          <Card className={styles.errorCard}>
            <CardContent className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <AlertTriangle size={32} />
              </div>
              <CardTitle className={styles.errorTitle}>
                Something went wrong
              </CardTitle>
              <p className={styles.errorMessage}>
                {this.state.error?.message ||
                  "An unexpected error occurred in the application."}
              </p>
              <div className={styles.reloadButtonContainer}>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-sm"
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

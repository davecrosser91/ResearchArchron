import { AlertCircle, WifiOff } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../features/shared/hooks/useToast";
import { cn } from "../../lib/utils";
import { credentialsService } from "../../services/credentialsService";
import { isLmConfigured } from "../../utils/onboarding";
import { BackendStartupError } from "../BackendStartupError";
import { useBackendHealth } from "./hooks/useBackendHealth";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface BackendStatusProps {
  isHealthLoading: boolean;
  isBackendError: boolean;
  healthData: { ready: boolean } | undefined;
}

function BackendStatus({ isHealthLoading, isBackendError, healthData }: BackendStatusProps) {
  if (isHealthLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs border border-yellow-500/20">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (isBackendError) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-500 text-xs border border-red-500/20">
        <WifiOff className="w-3 h-3" />
        <span>Offline</span>
      </div>
    );
  }

  if (healthData?.ready === false) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs border border-yellow-500/20">
        <AlertCircle className="w-3 h-3" />
        <span>Starting...</span>
      </div>
    );
  }

  return null;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const {
    data: healthData,
    isError: isBackendError,
    error: backendError,
    isLoading: isHealthLoading,
    failureCount,
  } = useBackendHealth();

  const backendStartupFailed = isBackendError && failureCount >= 5;

  useEffect(() => {
    const checkOnboarding = async () => {
      if (backendStartupFailed) return;
      if (!healthData?.ready || location.pathname === "/onboarding") return;
      if (localStorage.getItem("onboardingDismissed") === "true") return;

      try {
        const [ragCreds, apiKeyCreds] = await Promise.all([
          credentialsService.getCredentialsByCategory("rag_strategy"),
          credentialsService.getCredentialsByCategory("api_keys"),
        ]);

        const configured = isLmConfigured(ragCreds, apiKeyCreds);
        if (!configured) {
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("ONBOARDING_CHECK_FAILED:", error);
        showToast(`Configuration check failed. You can manually configure in Settings.`, "warning");
      }
    };

    checkOnboarding();
  }, [healthData?.ready, backendStartupFailed, location.pathname, navigate, showToast]);

  useEffect(() => {
    if (isBackendError && backendError) {
      const errorMessage = backendError instanceof Error ? backendError.message : "Backend connection failed";
      showToast(`Backend unavailable: ${errorMessage}. Some features may not work.`, "error");
    }
  }, [isBackendError, backendError, showToast]);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {backendStartupFailed && <BackendStartupError />}

      <Sidebar />

      <div className="pl-64 transition-all duration-300">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-end px-6">
            <BackendStatus isHealthLoading={isHealthLoading} isBackendError={isBackendError} healthData={healthData} />
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}

export function MinimalLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background flex items-center justify-center", className)}>
      <div className="relative w-full max-w-4xl px-6">{children}</div>
    </div>
  );
}

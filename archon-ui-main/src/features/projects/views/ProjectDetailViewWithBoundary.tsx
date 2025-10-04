import { ErrorBoundary } from "react-error-boundary";
import { ProjectDetailView } from "./ProjectDetailView";

function ProjectDetailErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-400">Project Detail Error</h2>
        <p className="mb-6 text-gray-400">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-2 text-white transition-colors bg-cyan-500 rounded-lg hover:bg-cyan-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function ProjectDetailViewWithBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={ProjectDetailErrorFallback}
      onReset={() => {
        window.location.href = "/projects";
      }}
    >
      <ProjectDetailView />
    </ErrorBoundary>
  );
}

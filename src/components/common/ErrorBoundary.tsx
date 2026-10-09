import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[DisasterGuard AI ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private handleClearCacheAndReset = (): void => {
    try {
      // Clear relevant local storage keys that might cause deserialization issues
      localStorage.removeItem('disasterguard_damage_assessments_v1');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900 font-sans">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
            {/* Header Badge & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    DisasterGuard AI Guard
                  </span>
                  <span className="text-xs text-slate-400 font-mono">PS-53 Resilient Mode</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {this.props.fallbackTitle || 'Component Intercepted Safely'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {this.props.fallbackMessage ||
                    'An unexpected runtime issue occurred while rendering this module. The application safeguarded your session to prevent a system crash.'}
                </p>
              </div>
            </div>

            {/* Suggested Recovery Actions */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Recommended Recovery Options:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Page</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Back to Dashboard</span>
                </button>

                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                >
                  <span>Retry Component</span>
                </button>

                <button
                  onClick={this.handleClearCacheAndReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition ml-auto"
                  title="Reset local cached demo data and refresh"
                >
                  <span>Clear Cache & Reset</span>
                </button>
              </div>
            </div>

            {/* Collapsible Technical Details for Judges/Devs */}
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="flex items-center justify-between w-full text-left text-xs font-mono text-slate-500 hover:text-slate-800 transition py-1"
              >
                <span>Technical Diagnostic Details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto space-y-2 border border-slate-800">
                  <div className="text-rose-400 font-bold">
                    {this.state.error?.name}: {this.state.error?.message}
                  </div>
                  {this.state.error?.stack && (
                    <pre className="text-[11px] text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                      <span className="text-slate-400 font-semibold block mb-1">Component Stack:</span>
                      <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

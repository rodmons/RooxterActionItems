import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center font-mono">
                    <h1 className="text-4xl font-bold mb-4">SYSTEM CRITICAL FAILURE</h1>
                    <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/50 max-w-2xl w-full overflow-auto">
                        <h2 className="text-xl font-bold mb-2">Error Log:</h2>
                        <pre className="whitespace-pre-wrap text-sm mb-4">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <details className="text-xs opacity-70 cursor-pointer">
                            <summary>Stack Trace</summary>
                            <pre className="mt-2 text-[10px] leading-relaxed">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

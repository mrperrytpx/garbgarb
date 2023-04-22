import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-screen-2xl flex-1 flex-col items-center justify-center gap-4 p-4 text-center text-gray-200">
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1>Well, well, well, if it isn't the consequences of my own actions</h1>
                        <h2>Let me know what happened 😒</h2>
                    </div>
                    <button className="rounded-md border border-slate-200 px-4 py-2" type="button">
                        Report
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

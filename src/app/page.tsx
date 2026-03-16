export default function LandingPage() {
    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col gap-6 text-center">
                <div className="flex justify-center">
                    <svg viewBox="0 0 24 24" className="size-10 fill-foreground" aria-label="X">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Happening now</h1>
                    <p className="text-sm text-muted-foreground">Join X today.</p>
                </div>
                <div className="flex flex-col gap-3">
                    <a
                        href="/login"
                        className="inline-flex items-center justify-center h-10 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Sign in
                    </a>
                    <a
                        href="/signup"
                        className="inline-flex items-center justify-center h-10 w-full rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors"
                    >
                        Create account
                    </a>
                </div>
            </div>
        </div>
    );
}

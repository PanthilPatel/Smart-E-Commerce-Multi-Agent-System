import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import { supabase } from './lib/supabase';

class RouteErrorBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('A route failed to render:', error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <main role="alert" className="min-h-screen flex items-center justify-center bg-[#0D0D10] p-6 text-white">
                    <section className="max-w-md rounded-3xl border border-white/10 bg-[#121215] p-7 text-center shadow-2xl">
                        <h1 className="text-xl font-bold font-display">This page could not be displayed</h1>
                        <p className="mt-3 text-sm text-zinc-300">A page module or component failed while loading. Reload to retry the page.</p>
                        <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] text-[#09090B] px-5 py-3 font-bold hover:brightness-110 shadow-sm">Reload page</button>
                    </section>
                </main>
            );
        }
        return this.props.children;
    }
}

const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function PageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D0D10]">
            <div className="w-8 h-8 border-4 border-[#E5C878] border-t-transparent rounded-full animate-spin" aria-label="Loading page" />
        </div>
    );
}

const PrivateRoute = ({ children }) => {
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem('seamas_user_session') || 'null');
    } catch {
        localStorage.removeItem('seamas_user_session');
    }
    if (!session?.isLoggedIn && !session?.isGuest) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const PublicRoute = ({ children }) => {
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem('seamas_user_session') || 'null');
    } catch {
        localStorage.removeItem('seamas_user_session');
    }
    if (session?.isLoggedIn || session?.isGuest) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const ProtectedLayout = () => {
    const location = useLocation();
    
    // Redirect unknown authenticated routes to dashboard
    if (location.pathname !== '/dashboard' && location.pathname !== '/profile' && location.pathname !== '/admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Suspense fallback={<PageLoading />}>
            {location.pathname === '/admin' ? <AdminDashboard />
                : location.pathname === '/profile' ? <ProfilePage />
                    : <UserDashboard />}
        </Suspense>
    );
};

export default function App() {
    const [isAuthLoading, setIsAuthLoading] = React.useState(true);

    useEffect(() => {
        // Initial session check
        const syncSession = (session) => {
            if (session) {
                const profileName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
                const existing = localStorage.getItem('seamas_user_session');
                let parsedExisting = {};
                try { parsedExisting = existing ? JSON.parse(existing) : {}; } catch { /* ignore stale local data */ }
                localStorage.setItem('seamas_user_session', JSON.stringify({
                    id: session.user.id,
                    name: profileName,
                    email: session.user.email,
                    isLoggedIn: true,
                    tier: parsedExisting.id === session.user.id ? parsedExisting.tier || 'Free' : 'Free',
                    credits: parsedExisting.id === session.user.id ? parsedExisting.credits ?? 0 : 0
                }));
            }
        };
        const SESSION_TIMEOUT_MS = 4000;
        const sessionTimeout = new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null }, timedOut: true }), SESSION_TIMEOUT_MS)
        );
        Promise.race([supabase.auth.getSession(), sessionTimeout])
            .then((result) => {
                if (result?.timedOut) {
                    console.warn('Supabase getSession timed out — proceeding as unauthenticated.');
                    return;
                }
                syncSession(result?.data?.session ?? null);
            })
            .catch((error) => console.error('Session restore failed:', error))
            .finally(() => setIsAuthLoading(false));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const profileName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
                const existing = localStorage.getItem('seamas_user_session');
                let parsedExisting = {};
                try { parsedExisting = existing ? JSON.parse(existing) : {}; } catch { /* ignore stale local data */ }
                localStorage.setItem('seamas_user_session', JSON.stringify({
                    id: session.user.id,
                    name: profileName,
                    email: session.user.email,
                    isLoggedIn: true,
                    tier: parsedExisting.id === session.user.id ? parsedExisting.tier || 'Free' : 'Free',
                    credits: parsedExisting.id === session.user.id ? parsedExisting.credits ?? 0 : 0
                }));
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('seamas_user_session');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
                <div className="w-8 h-8 border-4 border-[#E5C878] border-t-transparent rounded-full animate-spin" aria-label="Loading session" />
            </div>
        );
    }

    return (
        <Router>
            <div className="relative min-h-screen text-[#F8FAFC] antialiased">
                <div className="seamas-ambient" aria-hidden="true" />
                <div className="seamas-grid" aria-hidden="true" />
                <div 
                    className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
                    style={{
                        background: 'radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.06), transparent 70%)'
                    }}
                    aria-hidden="true"
                />
                <div className="relative z-10 w-full h-full">
                    <RouteErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <AuthPage defaultIsLogin={true} />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicRoute>
                                    <AuthPage defaultIsLogin={false} />
                                </PublicRoute>
                            }
                        />
                        <Route 
                            path="/*" 
                            element={
                                <PrivateRoute>
                                    <ProtectedLayout />
                                </PrivateRoute>
                            } 
                        />
                    </Routes>
                    </RouteErrorBoundary>
                </div>
            </div>
        </Router>
    );
}

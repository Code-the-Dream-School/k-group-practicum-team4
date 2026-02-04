import type {FormEvent} from "react";
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {loginUser, setAuthFromToken} from "../api/apiClient";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import Input from "../components/Input";

function SignInPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") || "").trim();
            const password = String(formData.get("password") || "");

            const {token} = await loginUser({email, password});
            setAuthFromToken(token);
            navigate("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to sign in.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <Header primaryCtaLabel="Sign up" />

            <main className="px-4">
                <div className="mx-auto flex max-w-5xl flex-col items-center py-14">
                    <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-[var(--color-primary)] md:text-4xl">
                        Sign in to <span className="text-[var(--color-primary)]">AI STUDY APP</span>
                    </h1>

                    <Card>
                        <div className="mb-8 text-center">
                            <h2 className="text-lg font-bold text-gray-800">Welcome back</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Don&apos;t have an account?{" "}
                                <Link to="/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
                                    Sign up →
                                </Link>
                            </p>
                        </div>

                        {error && (
                            <div
                                className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                aria-live="assertive"
                            >
                                {error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <Input type="email" name="email" placeholder="Email" autoComplete="email" required />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                required
                            />

                            <div className="pt-4 flex justify-center">
                                <Button type="submit" className="min-w-[170px]" disabled={loading}>
                                    {loading ? "Signing in..." : "Sign in"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default SignInPage;

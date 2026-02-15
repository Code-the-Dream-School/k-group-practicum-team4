import type {FormEvent} from "react";
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {registerUser, setAuthFromToken} from "../api/apiClient";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import Input from "../components/Input";
import type {Avatar} from "../data/avatars";
import {avatars} from "../data/avatars";

function SignUpPage() {
    const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0].id);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const firstName = String(formData.get("firstName") || "").trim();
            const lastName = String(formData.get("lastName") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const password = String(formData.get("password") || "");
            const confirmPassword = String(formData.get("confirmPassword") || "");

            if (!firstName && !lastName) {
                throw new Error("Please enter your name.");
            }

            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }

            const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();

            const {token} = await registerUser({
                displayName,
                email,
                password,
                avatarId: selectedAvatar,
            });
            setAuthFromToken(token);
            navigate("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to create account.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <Header secondaryCtaLabel="Sign in" />

            <main className="px-4">
                <div className="mx-auto flex max-w-5xl flex-col items-center py-14">
                    <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-[var(--color-text)] md:text-4xl">
                        Sign up to AI STUDY APP
                    </h1>

                    <Card>
                        <div className="mb-8 text-center">
                            <h2 className="text-lg font-bold text-gray-800">Welcome to registration</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Have an account?{" "}
                                <Link to="/signin" className="font-semibold text-[var(--color-primary)] hover:underline">
                                    Sign in
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
                            <Input type="text" name="firstName" placeholder="First Name" autoComplete="given-name" />
                            <Input type="text" name="lastName" placeholder="Last Name" autoComplete="family-name" />
                            <Input type="email" name="email" placeholder="Email" autoComplete="email" required />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                autoComplete="new-password"
                                required
                            />
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                required
                            />

                            <div className="pt-3">
                                <div className="mb-3 text-sm font-semibold text-gray-700">Choose your avatar</div>
                                <div className="flex flex-wrap gap-3">
                                    {avatars.map((avatar: Avatar) => {
                                        const isActive = avatar.id === selectedAvatar;
                                        return (
                                            <button
                                                key={avatar.id}
                                                type="button"
                                                onClick={() => setSelectedAvatar(avatar.id)}
                                                className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] shadow-sm transition duration-200 focus:outline-none ${
                                                    isActive
                                                        ? "ring-2 ring-offset-2 ring-[var(--color-primary)]"
                                                        : "hover:translate-y-[-1px] hover:scale-[1.05] hover:shadow-md"
                                                }`}
                                                aria-label={`Choose avatar ${avatar.label}`}
                                                aria-pressed={isActive}
                                            >
                                                <img src={avatar.src} alt={avatar.label} className="h-full w-full object-cover" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-center">
                                <Button type="submit" className="min-w-[170px]" disabled={loading}>
                                    {loading ? "Creating account..." : "Sign up"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default SignUpPage;

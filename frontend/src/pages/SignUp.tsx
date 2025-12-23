import {useState} from "react";
import {Link} from "react-router-dom";

type Avatar = {
    id: string;
    emoji: string;
    gradient: string;
};

const avatars: Avatar[] = [
    {id: "sunny", emoji: "🌞", gradient: "from-amber-200 via-yellow-200 to-orange-300"},
    {id: "astro", emoji: "🧑‍🚀", gradient: "from-indigo-200 via-purple-200 to-indigo-300"},
    {id: "paws", emoji: "🐾", gradient: "from-emerald-200 via-teal-200 to-green-200"},
    {id: "spark", emoji: "⚡", gradient: "from-orange-200 via-amber-200 to-pink-200"},
    {id: "wave", emoji: "🌊", gradient: "from-sky-200 via-blue-200 to-indigo-200"},
    {id: "star", emoji: "⭐", gradient: "from-yellow-200 via-amber-200 to-orange-200"},
    {id: "cape", emoji: "🦸‍♂️", gradient: "from-violet-200 via-purple-200 to-indigo-200"},
];

function SignUpPage() {
    const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0].id);

    return (
        <div className="min-h-screen bg-[#f4f4f6] text-gray-900">
            <header className="bg-[#5a45ff] text-white shadow-lg">
                <div className="flex w-full items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-sm bg-[#f6c344] shadow-[0_10px_24px_rgba(0,0,0,0.2)]" />
                        <div className="leading-tight">
                            <div className="text-lg font-extrabold uppercase tracking-wide">Logotype</div>
                            <div className="text-[11px] text-white/80">Brand Descriptor</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/signin"
                            className="rounded-full border border-[#f6c344] px-5 py-2 text-sm font-semibold text-[#f6c344] transition duration-200 hover:bg-[#f6c344]/15 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c344] focus-visible:ring-offset-0"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/signup"
                            className="rounded-full bg-[#f6c344] px-5 py-2 text-sm font-semibold text-[#3b2f8d] shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[#ffd867] hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c344] focus-visible:ring-offset-0"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </header>

            <main className="px-4">
                <div className="mx-auto flex max-w-5xl flex-col items-center py-14">
                    <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-[#1d1d1f] md:text-4xl">
                        Sign up to App name
                    </h1>

                    <div className="w-full max-w-xl rounded-[20px] border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_26px_70px_rgba(0,0,0,0.08)] transition duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.12)] animate-fade-slide">
                        <div className="px-9 py-10">
                            <div className="mb-8 text-center">
                                <h2 className="text-lg font-bold text-gray-800">Welcome to registration</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Have an account?{" "}
                                    <Link to="/signin" className="font-semibold text-[#5a45ff] hover:underline">
                                        Sign in →
                                    </Link>
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    className="w-full rounded-2xl border border-[#cfd3f0] bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none ring-[#7058ff] transition focus:ring-2"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    className="w-full rounded-2xl border border-[#cfd3f0] bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none ring-[#7058ff] transition focus:ring-2"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className="w-full rounded-2xl border border-[#cfd3f0] bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none ring-[#7058ff] transition focus:ring-2"
                                />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    className="w-full rounded-2xl border border-[#cfd3f0] bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none ring-[#7058ff] transition focus:ring-2"
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    className="w-full rounded-2xl border border-[#cfd3f0] bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none ring-[#7058ff] transition focus:ring-2"
                                />

                                <div className="pt-3">
                                    <div className="mb-3 text-sm font-semibold text-gray-700">Choose your avatar</div>
                                    <div className="flex flex-wrap gap-3">
                                        {avatars.map((avatar) => {
                                            const isActive = avatar.id === selectedAvatar;
                                            return (
                                                <button
                                                    key={avatar.id}
                                                    type="button"
                                                    onClick={() => setSelectedAvatar(avatar.id)}
                                                    className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} text-2xl shadow-sm transition duration-200 focus:outline-none ${
                                                        isActive
                                                            ? "ring-2 ring-offset-2 ring-[#5a45ff]"
                                                            : "hover:translate-y-[-1px] hover:scale-[1.05] hover:shadow-md"
                                                    }`}
                                                    aria-label={`Choose avatar ${avatar.id}`}
                                                >
                                                    <span>{avatar.emoji}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-center">
                                    <button
                                        type="submit"
                                        className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-[#5a45ff] px-6 py-[10px] text-sm font-semibold text-white shadow-[0_12px_26px_rgba(90,69,255,0.35)] transition hover:translate-y-[-1px] hover:bg-[#4d3be6]"
                                    >
                                        Sign up
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SignUpPage;

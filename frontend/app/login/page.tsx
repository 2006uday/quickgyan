"use client"

import { useState } from "react";
import axios from "axios";

export default function Login() {
    const [identify, setIdentify] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function onLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8080/login",
                { identify, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            console.log("Login success:", response.data);
        } catch (err) {
            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <form
                onSubmit={onLogin}
                className="w-full max-w-md border border-black rounded-2xl flex flex-col gap-4 p-6 mx-4"
                autoComplete="off"
            >
                <input
                    type="text"
                    placeholder="Username or Email"
                    value={identify}
                    onChange={(e) => setIdentify(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`text-white py-2 rounded-md transition
            ${loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-black hover:bg-gray-800 active:bg-gray-900"}
          `}
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}

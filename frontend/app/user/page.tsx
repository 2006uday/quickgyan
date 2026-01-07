"use client";

import axios from "axios";
import { useState } from "react";

type FormDataType = {
    username: string;
    email: string;
    dob: string;
    password: string;
    passwordConfirm: string;
};

export default function UserPage() {
    const [formData, setFormData] = useState<FormDataType>({
        username: "skybird",
        email: "skybird@gmail.com",
        dob: "2006-01-01",
        password: "123456",
        passwordConfirm: "123456",
    });

    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // basic validation
        if (!formData.username.trim()) return setError("Username is required");
        if (!formData.email.trim()) return setError("Email is required");
        if (!formData.dob.trim()) return setError("DOB is required");
        if (!formData.password) return setError("Password is required");
        if (!formData.passwordConfirm)
            return setError("Confirm password is required");
        if (formData.password !== formData.passwordConfirm)
            return setError("Passwords do not match");

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/login/user-register",
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    dob: formData.dob,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            ); // [web:35]

            console.log(response.data);

            setSuccess("User registered successfully");
            setError("");

            setFormData({
                username: "",
                email: "",
                dob: "",
                password: "",
                passwordConfirm: "",
            });
        } catch (err) {
            console.error(err);
            setError("Registration failed");
            setSuccess("");
        } finally {
            setLoading(false);
        }
    }

    const fields = [
        { label: "USERNAME", name: "username", type: "text" },
        { label: "EMAIL", name: "email", type: "email" },
        { label: "DOB", name: "dob", type: "date" },
        { label: "PASSWORD", name: "password", type: "password" },
        {
            label: "CONFIRM PASSWORD",
            name: "passwordConfirm",
            type: "password",
        },
    ] as const;

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md border border-black rounded-2xl flex flex-col gap-3 p-6 mx-4"
                autoComplete="off"
            >
                {fields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                        <label className="font-medium">{field.label}</label>
                        <input
                            type={field.type}
                            value={formData[field.name as keyof FormDataType]}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    [field.name]: e.target.value,
                                }))
                            }
                            className="border px-3 py-2 rounded-md w-full"
                            required
                        />
                    </div>
                ))}

                {error && <p className="text-red-600">{String(error)}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <button
                    type="submit"
                    className="bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}

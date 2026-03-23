import { cookies } from "next/headers";

export const me = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Cookie"] = `accessToken=${token}`;
    }

    try {
        const res = await fetch("http://localhost:8060auth/me", {
            method: "GET",
            headers: headers,
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();

        // Map backend data to our frontend User interface
        if (data && data.user) {
            return {
                id: data.user.id || data.user._id,
                name: data.user.username,
                email: data.user.email,
                enrollmentNo: data.user.enrollment_no,
                role: data.user.role || "student",
                createdAt: data.user.createdAt || new Date().toISOString(),
            };
        }

        return null;
    } catch (error) {
        console.error("Error fetching user data on server:", error);
        return null;
    }
}

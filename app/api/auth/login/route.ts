import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();
        const adminAuth = await getAdminAuth();

        // Create session cookie (5 days)
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax", // important for navigating between pages
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

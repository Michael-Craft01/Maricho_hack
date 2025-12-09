import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const { role, idToken } = await req.json();

        if (!role || (role !== 'buyer' && role !== 'seller')) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const adminAuth = await getAdminAuth();

        // Check if the token is valid and get the UID
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Optional constraint: Prevent changing role if already set?
        // For now, we allow setting it (e.g. initial onboarding)

        // Set custom user claims
        await adminAuth.setCustomUserClaims(uid, { role });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Set Role Error:", error);
        return NextResponse.json({ error: "Unauthorized or Internal Error" }, { status: 500 });
    }
}

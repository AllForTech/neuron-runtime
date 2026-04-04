import {createClient} from "@supabase/supabase-js";
import {getUserFromRequest} from "../services/supabase/supabase.services";

export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY! // backend only
);

export async function authenticate(req: any, res: any, next: any) {
    try {
        const user = await getUserFromRequest(req);

        // If getUserFromRequest returns null (due to timeout OR invalid token)
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: Session expired or service unavailable." });
        }

        req.user = user;
        return next();
    } catch (e) {
        // This is your safety net for the middleware itself
        return res.status(503).json({ error: "Authentication service currently unavailable." });
    }
}
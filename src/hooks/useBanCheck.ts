import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BanInfo {
  isBanned: boolean;
  reason: string;
  ruleCode: string;
}

export const useBanCheck = (userId: string | undefined) => {
  const [banInfo, setBanInfo] = useState<BanInfo>({ isBanned: false, reason: "", ruleCode: "" });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!userId) {
      setChecking(false);
      return;
    }

    const checkBan = async () => {
      try {
        const { data } = await supabase
          .from("banned_users")
          .select("reason, rule_code")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (data) {
          setBanInfo({
            isBanned: true,
            reason: data.reason || "Нарушение правил платформы",
            ruleCode: data.rule_code || "2.19",
          });
          // Auto sign out banned user
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error("Ban check error:", e);
      } finally {
        setChecking(false);
      }
    };

    checkBan();
  }, [userId]);

  return { ...banInfo, checking };
};

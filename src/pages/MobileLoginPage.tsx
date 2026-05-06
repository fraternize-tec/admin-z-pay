import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MobileLoginPage() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      const hash = window.location.hash;

      const query =
        hash.split("?")[1] ?? "";

      const code =
        new URLSearchParams(query)
          .get("code");

      if (!code) {
        window.location.replace("/#/login");
        return;
      }

      const { data, error } =
        await supabase.rpc(
          "consume_web_login_token",
          { p_code: code }
        );

      if (error || !data?.length) {
        window.location.replace("/#/login");
        return;
      }

      const session = data[0];

      await supabase.auth.setSession({
        access_token:
          session.access_token,
        refresh_token:
          session.refresh_token,
      });

      const { data: userData } =
        await supabase.auth.getUser();

      if (!userData.user) {
        window.location.replace("/#/login");
        return;
      }

      window.location.replace("/");
    }

    run();
  }, []);

  return <div>Entrando...</div>;
}
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: any) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        navigate("/login", { replace: true });
      } else if (mounted) {
        setLoading(false);
      }
    }

    checkSession();

    // LISTENER PARA LOGIN / LOGOUT
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/login", { replace: true });
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <div className="p-6">A verificar sessão...</div>;

  return children;
}

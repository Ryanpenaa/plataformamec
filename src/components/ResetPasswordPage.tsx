import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "../auth.css";
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState("Verificando seu link...");
  const navigate = useNavigate();
  useEffect(() => {
    const check = async () => {
      const recovery =
        window.location.hash.includes("type=recovery") ||
        new URLSearchParams(window.location.search).get("type") === "recovery";
      const { data } = await supabase.auth.getSession();
      setValid(recovery || Boolean(data.session));
      setMessage(
        recovery || data.session
          ? "Crie uma nova senha para continuar."
          : "Este link é inválido ou expirou.",
      );
    };
    void check();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Senha atualizada. Você já pode entrar.");
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/auth", replace: true }), 800);
  }
  return (
    <main className="auth-page auth-single">
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mark">
            <Wrench /> FORMAÇÃO MECÂNICO <span>AUTOMOTIVO</span>
          </div>
          <p className="auth-kicker">NOVO ACESSO</p>
          <h1>Defina sua senha</h1>
          <p>{message}</p>
          {valid && (
            <form onSubmit={submit}>
              <div>
                <Label htmlFor="password">Nova senha</Label>
                <div className="auth-field">
                  <KeyRound />
                  <Input
                    id="password"
                    type="password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button type="submit" size="lg">
                Salvar nova senha
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

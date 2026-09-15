import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Mail,
  UserRound,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "../auth.css";

type Mode = "login" | "signup" | "recover";
export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "recover") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          { redirectTo: `${window.location.origin}/reset-password` },
        );
        if (resetError) throw resetError;
        setMessage(
          "Se o email estiver cadastrado, você receberá um link para criar uma nova senha.",
        );
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: name.trim() },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) await supabase.auth.signOut();
        setMessage(
          "Cadastro recebido. Confirme seu email antes de entrar. O cadastro não libera cursos sem uma compra válida.",
        );
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (loginError) throw loginError;
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setError("Confirme seu email antes de acessar a área do aluno.");
          return;
        }
        await navigate({ to: "/academy", replace: true });
      }
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Não foi possível concluir. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="auth-mark">
          <Wrench /> FORMAÇÃO MECÂNICO <span>AUTOMOTIVO</span>
        </div>
        <div>
          <p className="auth-eyebrow">ÁREA DO ALUNO</p>
          <h1>Conhecimento para transformar sua prática.</h1>
          <p>Acesse suas aulas e materiais conforme as permissões da sua compra.</p>
          <ul>
            <li>
              <CheckCircle2 />
              Email confirmado
            </li>
            <li>
              <CheckCircle2 />
              Acesso vinculado à compra
            </li>
            <li>
              <CheckCircle2 />
              Conteúdo protegido
            </li>
          </ul>
        </div>
        <BookOpen className="auth-watermark" />
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="auth-kicker">
            {mode === "login"
              ? "BEM-VINDO DE VOLTA"
              : mode === "signup"
                ? "CRIAR CONTA"
                : "RECUPERAR ACESSO"}
          </p>
          <h2>
            {mode === "login"
              ? "Entre na sua conta"
              : mode === "signup"
                ? "Cadastre-se como aluno"
                : "Receba o link por email"}
          </h2>
          <p>
            {mode === "signup"
              ? "Use o mesmo email informado na compra da Vega."
              : mode === "recover"
                ? "Informe seu email cadastrado para definir uma nova senha."
                : "Use seu email confirmado para continuar."}
          </p>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <div className="auth-field">
                  <UserRound />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="auth-field">
                <Mail />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            {mode !== "recover" && (
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="auth-field">
                  <KeyRound />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>
              </div>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="auth-success" role="status">
                {message}
              </p>
            )}
            <Button type="submit" size="lg" disabled={busy}>
              {busy
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : mode === "signup"
                    ? "Criar conta"
                    : "Enviar link"}
              <ArrowRight />
            </Button>
          </form>
          <div className="auth-links">
            {mode === "login" ? (
              <>
                <button onClick={() => setMode("recover")}>
                  Primeiro acesso ou esqueci minha senha
                </button>
                <button onClick={() => setMode("signup")}>Ainda não tenho cadastro</button>
              </>
            ) : (
              <button onClick={() => setMode("login")}>Voltar para entrar</button>
            )}
          </div>
          <p className="auth-note">
            O cadastro não concede cursos automaticamente. O acesso depende de uma compra aprovada
            vinculada ao mesmo email.
          </p>
          <Link to="/auth" className="auth-home">
            Formação Mecânico Automotivo
          </Link>
        </div>
      </section>
    </main>
  );
}

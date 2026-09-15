import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "@/components/AuthPage";
export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email_confirmed_at) throw redirect({ to: "/academy" });
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acesso do aluno | Formação Mecânico" },
      {
        name: "description",
        content: "Entre, cadastre-se ou recupere o acesso à Formação Mecânico Automotivo.",
      },
      { property: "og:title", content: "Acesso do aluno | Formação Mecânico" },
      {
        property: "og:description",
        content: "Entre, cadastre-se ou recupere o acesso à Formação Mecânico Automotivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

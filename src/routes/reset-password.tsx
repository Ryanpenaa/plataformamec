import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/components/ResetPasswordPage";
export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Nova senha | Formação Mecânico" },
      { name: "description", content: "Defina uma nova senha para a área do aluno." },
      { property: "og:title", content: "Nova senha | Formação Mecânico" },
      { property: "og:description", content: "Defina uma nova senha para a área do aluno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

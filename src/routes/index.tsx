import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/auth" }); },
  head: () => ({ meta: [
    { title: "Formação Mecânico Automotivo | Área do aluno" },
    { name: "description", content: "Acesso seguro aos cursos e materiais da Formação Mecânico Automotivo." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Formação Mecânico Automotivo | Área do aluno" },
    { property: "og:description", content: "Acesso seguro aos cursos e materiais da Formação Mecânico Automotivo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
});

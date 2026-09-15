import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import Academy from "@/components/Academy";
import { getStudentAcademy } from "@/lib/student.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/academy")({
  component: AcademyRoute,
  head: () => ({
    meta: [
      { title: "Meus cursos | Formação Mecânico" },
      { name: "description", content: "Cursos e materiais liberados para o aluno." },
      { property: "og:title", content: "Meus cursos | Formação Mecânico" },
      { property: "og:description", content: "Cursos e materiais liberados para o aluno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
function AcademyRoute() {
  const fetchAcademy = useServerFn(getStudentAcademy);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useSuspenseQuery({ queryKey: ["student-academy"], queryFn: () => fetchAcademy() });
  useEffect(() => {
    return () => {};
  }, []);
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  return <Academy data={query.data} onSignOut={signOut} />;
}

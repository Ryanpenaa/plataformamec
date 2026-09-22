import { createFileRoute } from "@tanstack/react-router";
import Academy from "@/components/Academy";
import courseData from "@/data/courses.json";
import materialsData from "@/data/materials.json";
import type { AcademyData } from "@/lib/academy.server";

const data: AcademyData = {
  studentName: "Bons estudos!",
  courseSummaries: [],
  courses: courseData as AcademyData["courses"],
  materials: materialsData as AcademyData["materials"],
  entitlements: [],
  developmentPreview: false,
};
export const Route = createFileRoute("/_authenticated/academy")({
  component: () => <Academy data={data} />,
  head: () => ({ meta: [
    { title: "Cursos | Formação Mecânico" },
    { name: "description", content: "Todos os cursos e materiais da Formação Mecânico Automotivo." },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
});

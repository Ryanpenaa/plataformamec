import courseData from "@/data/courses.json";
import materialsData from "@/data/materials.json";

export type CourseId = "auto" | "motos" | "eletrica" | "ar" | "som";
export type Lesson = { order: number; title: string; youtubeId: string; durationSeconds: number | null; optional: boolean };
export type Course = { id: string; title: string; subtitle: string; modules: { order: number; title: string; lessons: Lesson[] }[] };
export type Material = { file: string; title: string; kind: string; size: number; entitlement?: string };
export type AcademyData = {
  studentName: string;
  courseSummaries: Array<{ id: CourseId; title: string }>;
  courses: Course[];
  materials: Material[];
  entitlements: string[];
  developmentPreview: boolean;
};

const courses = courseData as Course[];
const materials = materialsData as Material[];

export function buildAcademyData(studentName: string, entitlements: string[], developmentPreview: boolean): AcademyData {
  const allowedCourses = new Set(
    entitlements.filter((item) => item.startsWith("course:")).map((item) => item.slice(7)),
  );
  const apostilas = entitlements.includes("materials:apostilas");
  const imprimiveis = entitlements.includes("materials:imprimiveis");
  const canUseMaterial = (material: Material) => {
    if (material.entitlement === "som" && !allowedCourses.has("som")) return false;
    return material.kind === "apostila" ? apostilas : material.kind === "imprimivel" && imprimiveis;
  };

  return {
    studentName,
    courseSummaries: courses.map(({ id, title }) => ({ id: id as CourseId, title })),
    courses: developmentPreview ? courses : courses.filter((course) => allowedCourses.has(course.id)),
    materials: developmentPreview ? materials : materials.filter(canUseMaterial),
    entitlements,
    developmentPreview,
  };
}

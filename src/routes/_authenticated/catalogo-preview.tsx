import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, GraduationCap, Home, LockKeyhole, Play, Search, Wrench } from "lucide-react";
import courseData from "@/data/courses.json";

const catalog = courseData.map((course) => ({
  ...course,
  lessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
}));
const accents = ["#f97316", "#3b82f6", "#eab308", "#14b8a6", "#a855f7"];
const backgrounds = [
  "linear-gradient(135deg,#292524,#78350f)",
  "linear-gradient(135deg,#172554,#1e40af)",
  "linear-gradient(135deg,#422006,#854d0e)",
  "linear-gradient(135deg,#042f2e,#115e59)",
  "linear-gradient(135deg,#3b0764,#6b21a8)",
];

function StreamingPreview() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const matches = catalog.filter((course) => course.title.toLowerCase().includes(search.toLowerCase()));
  const current = catalog.find((course) => course.id === selected);
  return (
    <div style={{ minHeight: "100vh", background: "#090b10", color: "#f8fafc", fontFamily: "Inter,system-ui,sans-serif", paddingBottom: 90 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px max(20px,5vw)", borderBottom: "1px solid #242631" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 850, letterSpacing: ".04em" }}><Wrench color="#f97316" /> MECÂNICO <span style={{ color: "#f97316" }}>PLAY</span></div>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#a1a1aa" }}><GraduationCap size={18} /> Área do aluno</span>
      </header>
      <main style={{ maxWidth: 1200, margin: "auto", padding: "30px max(20px,5vw)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".15em", color: "#fb923c" }}>NOVA EXPERIÊNCIA DE APRENDIZADO</div>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: 1.1, margin: "14px 0" }}>Sua oficina de conhecimento.</h1>
        <p style={{ color: "#a1a1aa", maxWidth: 540 }}>Aprenda no seu ritmo, escolha um curso e avance módulo por módulo.</p>
        <div style={{ background: "linear-gradient(110deg,#431407,#18181b 72%)", border: "1px solid #7c2d12", borderRadius: 22, marginTop: 30, padding: "clamp(22px,5vw,48px)" }}>
          <span style={{ color: "#fdba74", fontSize: 12, fontWeight: 800 }}>EM DESTAQUE</span>
          <h2 style={{ fontSize: "clamp(24px,4vw,38px)", margin: "14px 0" }}>Mecânica Automotiva</h2>
          <p style={{ color: "#d4d4d8", maxWidth: 420 }}>Explore motores, transmissão, suspensão, diagnóstico e manutenção automotiva.</p>
          <button onClick={() => setSelected("auto")} style={{ border: 0, borderRadius: 10, background: "#f97316", color: "#111", padding: "12px 18px", fontWeight: 800, display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}><Play size={18} /> Ver módulos</button>
        </div>
        <h2 style={{ marginTop: 38, fontSize: 23 }}>Catálogo de cursos</h2>
        <label style={{ display: "flex", gap: 10, alignItems: "center", background: "#171923", border: "1px solid #30313b", borderRadius: 12, padding: "10px 14px", maxWidth: 450, marginBottom: 22 }}><Search size={18} color="#a1a1aa" /><input aria-label="Buscar cursos" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cursos..." style={{ background: "transparent", border: 0, outline: "none", color: "white", width: "100%" }} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 16 }}>
          {matches.map((course, index) => {
            const originalIndex = catalog.findIndex((c) => c.id === course.id);
            return <button key={course.id} onClick={() => setSelected(course.id)} style={{ textAlign: "left", background: "#171923", border: "1px solid #30313b", borderRadius: 16, overflow: "hidden", padding: 0, color: "white", cursor: "pointer" }}>
              <div style={{ aspectRatio: "16/10", background: backgrounds[originalIndex], display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 18 }}>
                <Wrench size={30} color={accents[originalIndex]} />
                <strong style={{ fontSize: 21, lineHeight: 1.15 }}>{course.title}</strong>
              </div>
              <div style={{ padding: 16 }}><div style={{ fontWeight: 750 }}>{course.title}</div><div style={{ color: "#a1a1aa", fontSize: 13, marginTop: 7 }}>{course.modules.length} módulos · {course.lessons} aulas</div><div style={{ display: "flex", gap: 5, alignItems: "center", color: "#fb923c", fontSize: 12, marginTop: 12 }}><LockKeyhole size={13} /> Acesso conforme sua compra</div></div>
            </button>;
          })}
        </div>
        {current && <section style={{ marginTop: 32, padding: 22, borderRadius: 16, background: "#171923", border: "1px solid #30313b" }}>
          <button onClick={() => setSelected(null)} style={{ background: "transparent", border: 0, color: "#fb923c", cursor: "pointer" }}>← Voltar ao catálogo</button>
          <h2>{current.title}</h2>
          <p style={{ color: "#a1a1aa" }}>Prévia dos módulos. A reprodução será liberada apenas após validação da compra.</p>
          {current.modules.map((module) => <div key={module.order} style={{ padding: "15px 0", borderTop: "1px solid #30313b", display: "flex", justifyContent: "space-between", gap: 15 }}><span>{String(module.order).padStart(2,"0")} · {module.title}</span><span style={{ color: "#a1a1aa", whiteSpace: "nowrap" }}>{module.lessons.length} aulas</span></div>)}
        </section>}
        <p style={{ color: "#71717a", fontSize: 12, marginTop: 30 }}>Prévia de interface. Nenhum curso é liberado nesta tela; a integração segura de compras será feita separadamente.</p>
        <Link to="/academy" style={{ color: "#fb923c", fontSize: 13 }}>Voltar à plataforma atual</Link>
      </main>
      <nav aria-label="Navegação do aplicativo" style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", background: "#101116", borderTop: "1px solid #30313b", padding: "12px 8px" }}>
        <span style={{ display: "grid", justifyItems: "center", gap: 4, color: "#fb923c", fontSize: 11 }}><Home size={21} /> Início</span>
        <span style={{ display: "grid", justifyItems: "center", gap: 4, color: "#a1a1aa", fontSize: 11 }}><BookOpen size={21} /> Cursos</span>
        <span style={{ display: "grid", justifyItems: "center", gap: 4, color: "#a1a1aa", fontSize: 11 }}><GraduationCap size={21} /> Perfil</span>
      </nav>
    </div>
  );
}
export const Route = createFileRoute("/_authenticated/catalogo-preview")({ component: StreamingPreview });

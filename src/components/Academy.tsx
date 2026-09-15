import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bike,
  BookOpen,
  Car,
  Check,
  ChevronRight,
  CirclePlay,
  FileText,
  GraduationCap,
  LockKeyhole,
  LogOut,
  Snowflake,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AcademyData, CourseId } from "@/lib/academy.server";
import "../academy.css";

type Section = CourseId | "materials";
const tabs = [
  { id: "auto", label: "Mecânica Automotiva", icon: Car },
  { id: "motos", label: "Mecânica de Motos", icon: Bike },
  { id: "eletrica", label: "Elétrica Automotiva", icon: Zap },
  { id: "ar", label: "Ar-condicionado", icon: Snowflake },
  { id: "som", label: "Som Automotivo", icon: Volume2 },
  { id: "materials", label: "Material de apoio", icon: BookOpen },
] as const;

export default function Academy({ data, onSignOut }: { data: AcademyData; onSignOut: () => void }) {
  const [section, setSection] = useState<Section>("auto");
  const [complete, setComplete] = useState(false);
  const [bumps, setBumps] = useState<CourseId[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string[]>([]);
  const [category, setCategory] = useState("apostila");
  const entitlements = useMemo(() => {
    const current = [...data.entitlements];
    if (data.developmentPreview && complete) current.push("course:auto", "materials:apostilas");
    if (data.developmentPreview)
      for (const bump of bumps)
        current.push(
          "course:auto",
          `course:${bump}`,
          "materials:apostilas",
          "materials:imprimiveis",
        );
    return new Set(current);
  }, [data.entitlements, data.developmentPreview, complete, bumps]);
  const allowedCourses = new Set(
    Array.from(entitlements)
      .filter((x) => x.startsWith("course:"))
      .map((x) => x.slice(7)),
  );
  const apostilas = entitlements.has("materials:apostilas");
  const imprimiveis = entitlements.has("materials:imprimiveis");
  const course = data.courses.find((c) => c.id === section);
  const lessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const selected = lessons.find((l) => l.youtubeId === selection[course?.id ?? ""]) ?? lessons[0];
  const module = course?.modules.find((m) =>
    m.lessons.some((l) => l.youtubeId === selected?.youtubeId),
  );
  const key = course && selected ? `${course.id}:${selected.youtubeId}` : "";
  const finished = course
    ? lessons.filter((l) => done.includes(`${course.id}:${l.youtubeId}`)).length
    : 0;
  const unlocked = section === "materials" ? apostilas || imprimiveis : allowedCourses.has(section);
  const visibleMaterials = data.materials.filter(
    (m) =>
      (m.entitlement !== "som" || allowedCourses.has("som")) &&
      (m.kind === "apostila" ? apostilas : imprimiveis),
  );
  const pdfCount = visibleMaterials.filter((m) => m.kind === "apostila").length;
  const printableCount = visibleMaterials.filter((m) => m.kind === "imprimivel").length;
  const active = tabs.find((t) => t.id === section);
  return (
    <div className="academy" lang="pt-BR">
      <header className="academy-header">
        <div className="academy-brand">
          <span className="brand-icon">
            <Wrench size={24} />
          </span>
          <div>
            FORMAÇÃO MECÂNICO<span>AUTOMOTIVO</span>
          </div>
        </div>
        <div className="student-account">
          <span className="student-label">
            <GraduationCap size={19} />
            {data.studentName}
          </span>
          <Button variant="ghost" size="sm" onClick={onSignOut} title="Sair">
            <LogOut />
            Sair
          </Button>
        </div>
      </header>
      <nav className="academy-nav" aria-label="Cursos e biblioteca">
        {tabs.map((t) => {
          const has = t.id === "materials" ? apostilas || imprimiveis : allowedCourses.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              aria-current={section === t.id ? "page" : undefined}
            >
              <t.icon size={18} />
              <span>{t.label}</span>
              {!has && <LockKeyhole size={13} aria-label="Não adquirido" />}
            </button>
          );
        })}
      </nav>
      {data.developmentPreview && (
        <aside className="demo-banner">
          <details>
            <summary>
              <span className="demo-dot" /> Prévia de desenvolvimento{" "}
              <span className="demo-caption">· Simular permissões sem gravar</span>
            </summary>
            <div className="demo-settings">
              <label>
                Produto principal
                <select
                  value={complete ? "owned" : "none"}
                  onChange={(e) => setComplete(e.target.value === "owned")}
                >
                  <option value="none">Sem acesso simulado</option>
                  <option value="owned">3MKJ1N — auto + apostilas</option>
                </select>
              </label>
              <fieldset>
                <legend>Bumps simulados</legend>
                {tabs
                  .filter((t) => t.id !== "auto" && t.id !== "materials")
                  .map((t) => (
                    <label key={t.id}>
                      <input
                        type="checkbox"
                        checked={bumps.includes(t.id)}
                        onChange={(e) =>
                          setBumps(
                            e.target.checked ? [...bumps, t.id] : bumps.filter((id) => id !== t.id),
                          )
                        }
                      />
                      {t.label}
                    </label>
                  ))}
              </fieldset>
              <p>
                Disponível somente no desenvolvimento. Não cria compras, clientes ou permissões
                reais.
              </p>
            </div>
          </details>
          <span className="access-badge">Desenvolvimento</span>
        </aside>
      )}
      <main className="academy-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              {section === "materials" ? "SUA BIBLIOTECA" : "APRENDA. PRATIQUE. EVOLUA."}
            </p>
            <h1>{active?.label}</h1>
            <p className="heading-description">
              {section === "materials"
                ? "Seu conhecimento também acompanha você na oficina."
                : (course?.subtitle ?? "Conteúdo disponível após a confirmação da sua compra.")}
            </p>
          </div>
          {unlocked && (
            <span className="course-badge">
              {section === "materials"
                ? `${pdfCount} apostilas · ${printableCount} imprimíveis`
                : `${course?.modules.length ?? 0} módulos · ${lessons.length} aulas`}
            </span>
          )}
        </div>
        {!unlocked || (section !== "materials" && (!course || !selected || !module)) ? (
          <section className="locked-panel">
            <span className="lock-icon">
              <LockKeyhole size={32} />
            </span>
            <p className="eyebrow">ACESSO PROTEGIDO</p>
            <h2>
              {section === "materials"
                ? "Biblioteca não incluída nas suas permissões"
                : `${active?.label ?? "Este curso"} ainda não está disponível`}
            </h2>
            <p>
              Sua conta está ativa, mas não encontramos uma compra aprovada que libere este
              conteúdo. Compras pendentes, recusadas ou estornadas não concedem acesso.
            </p>
          </section>
        ) : section === "materials" ? (
          <section>
            <div className="library-tabs">
              {[
                ["apostila", "Apostilas", pdfCount],
                ["imprimivel", "Guias e checklists", printableCount],
              ].map(([id, label, count]) => {
                const available = id === "apostila" ? apostilas : imprimiveis;
                return (
                  <button
                    key={id}
                    disabled={!available}
                    aria-pressed={category === id}
                    onClick={() => setCategory(String(id))}
                  >
                    {label}
                    <span>{count}</span>
                    {!available && <LockKeyhole size={13} />}
                  </button>
                );
              })}
            </div>
            <p className="library-note">
              Os arquivos ainda não foram enviados. Downloads permanecerão indisponíveis até a
              publicação segura dos materiais.
            </p>
            <div className="material-grid">
              {visibleMaterials
                .filter((m) => m.kind === category)
                .map((m, i) => (
                  <article className="material-card" key={m.file}>
                    <div className="material-cover">
                      <div className="cover-brand">
                        <Wrench size={17} /> FORMAÇÃO MECÂNICO
                      </div>
                      <FileText size={38} />
                      <h2>{m.title}</h2>
                      <span>
                        {m.kind === "apostila" ? "APOSTILA DIGITAL" : "GUIA PARA IMPRIMIR"}
                      </span>
                      <div className="cover-number">{String(i + 1).padStart(2, "0")}</div>
                    </div>
                    <div className="material-info">
                      <p>
                        {m.file.endsWith(".pdf") ? "PDF" : "PNG"} ·{" "}
                        {(m.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      <span>Indisponível no momento</span>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ) : (
          <div className="learning-layout">
            <section className="lesson-area">
              <div className="video-frame">
                <iframe
                  key={key}
                  src={`https://www.youtube-nocookie.com/embed/${selected?.youtubeId}`}
                  title={selected?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="lesson-info">
                <p className="eyebrow">
                  MÓDULO {module?.order} · AULA {selected?.order}
                </p>
                <h2>{selected?.title}</h2>
                <div className="lesson-actions">
                  <button
                    className={done.includes(key) ? "completed-button" : "primary-button"}
                    onClick={() =>
                      setDone(done.includes(key) ? done.filter((d) => d !== key) : [...done, key])
                    }
                    aria-pressed={done.includes(key)}
                  >
                    <Check size={17} />
                    {done.includes(key) ? "Aula concluída" : "Marcar como concluída"}
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${selected?.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir no YouTube <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
              <button className="support-shortcut" onClick={() => setSection("materials")}>
                <span className="support-icon">
                  <BookOpen size={23} />
                </span>
                <span>
                  <strong>Material de apoio</strong>
                  <small>
                    {apostilas || imprimiveis
                      ? "Explore suas apostilas e guias de consulta."
                      : "Disponível conforme as permissões da sua compra."}
                  </small>
                </span>
                {apostilas || imprimiveis ? <ChevronRight size={20} /> : <LockKeyhole size={18} />}
              </button>
            </section>
            <section className="course-outline">
              <div className="outline-heading">
                <h2>Conteúdo do curso</h2>
                <span>
                  {finished}/{lessons.length}
                </span>
              </div>
              <progress value={finished} max={lessons.length} aria-label="Aulas concluídas" />
              <p className="progress-caption" aria-live="polite">
                {finished} de {lessons.length} aulas concluídas
              </p>
              {course?.modules.map((m) => (
                <details className="module" key={`${course.id}:${m.order}`}>
                  <summary>
                    <span className="module-number">{String(m.order).padStart(2, "0")}</span>
                    <span>
                      <strong>{m.title}</strong>
                      <small>{m.lessons.length} aulas</small>
                    </span>
                    <ChevronRight size={17} />
                  </summary>
                  <div>
                    {m.lessons.map((l) => (
                      <button
                        className="lesson-row"
                        aria-pressed={selected?.youtubeId === l.youtubeId}
                        key={l.youtubeId}
                        onClick={() => setSelection({ ...selection, [course.id]: l.youtubeId })}
                      >
                        {done.includes(`${course.id}:${l.youtubeId}`) ? (
                          <Check size={16} />
                        ) : (
                          <CirclePlay size={16} />
                        )}
                        <span>
                          {l.order}. {l.title}
                          {l.optional && <small>Conteúdo opcional</small>}
                        </span>
                        {l.durationSeconds && (
                          <small>
                            {Math.floor(l.durationSeconds / 60)}:
                            {String(l.durationSeconds % 60).padStart(2, "0")}
                          </small>
                        )}
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </section>
          </div>
        )}
      </main>
      <footer className="academy-footer">
        Formação Mecânico Automotivo <span>Conhecimento para transformar sua prática.</span>
      </footer>
    </div>
  );
}

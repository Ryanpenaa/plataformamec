import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Bike,
  BookOpen,
  Car,
  Check,
  ChevronRight,
  ChevronLeft,
  CirclePlay,
  FileText,
  GraduationCap,
  Snowflake,
  Volume2,
  Wrench,
  Zap,
  Play,
  ArrowLeft,
  Search,
  Award,
  Settings,
  TrendingUp,
  UserRound,
  LockKeyhole,
} from "lucide-react";
import type { AcademyData, CourseId } from "@/lib/academy.server";
import "../academy.css";
import "../streaming.css";
import "../library-premium.css";

type Section = CourseId | "materials";
const tabs = [
  { id: "auto", label: "Mecânica Automotiva", icon: Car },
  { id: "motos", label: "Mecânica de Motos", icon: Bike },
  { id: "eletrica", label: "Elétrica Automotiva", icon: Zap },
  { id: "ar", label: "Ar-condicionado", icon: Snowflake },
  { id: "som", label: "Som Automotivo", icon: Volume2 },
  { id: "materials", label: "Material de apoio", icon: BookOpen },
] as const;

export default function Academy({ data }: { data: AcademyData }) {
  const [section, setSection] = useState<Section>("auto");
  const [showCatalog, setShowCatalog] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const courseCarouselRef = useRef<HTMLDivElement>(null);
  const moveCarousel = (direction: number) => {
    const node = courseCarouselRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>(".streaming-card");
    const step = (card?.getBoundingClientRect().width ?? 280) + 16;
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string[]>([]);
  const [category, setCategory] = useState("apostila");
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
  const visibleMaterials = data.materials;
  const pdfCount = visibleMaterials.filter((m) => m.kind === "apostila").length;
  const printableCount = visibleMaterials.filter((m) => m.kind === "imprimivel").length;
  const active = tabs.find((t) => t.id === section);
  const catalog = data.courses.filter((c) => c.title.toLowerCase().includes(catalogSearch.toLowerCase()));
  const apostilaCovers: Record<string,string> = {
    "material-01.html": "/Imagem do ChatGPT 15 de out. de 2026, 11_13_39-1.png",
    "material-02.html": "/Imagem do ChatGPT 15 de out. de 2026, 11_13_42-2.png",
    "material-03.html": "/Imagem do ChatGPT 15 de out. de 2026, 11_13_49-5.png",
    "material-04.html": "/Imagem do ChatGPT 15 de out. de 2026, 11_13_57-6.png",
    "material-05.html": "/Imagem do ChatGPT 15 de out. de 2026, 11_13_46-4.png",
    "material-06.html": "/Imagem do ChatGPT 15 de out. de 2026, 11_13_44-3.png",
  };
  const openCourse = (id: Section) => { setSection(id); setShowCatalog(false); };
  const courseImages: Record<string,string> = {
    auto: "/auto.webp",
    motos: "/motos.webp",
    eletrica: "/eletrica.webp",
    ar: "/ar.webp",
    som: "/som.webp",
  };
  const fallbackImages: Record<string,string> = {
    auto: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=850&q=80",
    motos: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=850&q=80",
    eletrica: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=850&q=80",
    ar: "https://images.unsplash.com/photo-1631545806609-8e1f9b1b3a24?auto=format&fit=crop&w=850&q=80",
    som: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=850&q=80",
  };
  if (showCatalog) return (
    <div className="streaming-app" lang="pt-BR">
      <header className="streaming-header"><div className="streaming-logo"><Wrench size={25}/> MECÂNICO <span>PLAY</span></div><div className="streaming-account"><GraduationCap size={18}/>{data.studentName}</div></header>
      <main className="streaming-content">
        <section className="streaming-hero">
          <div className="streaming-hero-copy">
            <div className="streaming-eyebrow"><GraduationCap size={19}/> SUA PLATAFORMA DE CURSOS</div>
            <h1>Aprenda mecânica.<br/><em>Evolua no seu ritmo.</em></h1>
            <p>Videoaulas organizadas por módulos, <strong>materiais técnicos</strong> e todo o conhecimento em um só lugar.</p>
            <button className="streaming-hero-cta" onClick={() => openCourse("auto")}><Play size={20} fill="currentColor"/> Começar a estudar</button>
            <div className="streaming-benefits"><span><BookOpen/> Videoaulas<br/>organizadas</span><span><Settings/> Materiais<br/>técnicos</span><span><TrendingUp/> Evolua<br/>no seu ritmo</span><span><Award/> Certificado<br/>de conclusão</span></div>
          </div>
          <div className="streaming-hero-visual" role="img" aria-label="Oficina mecânica"><span className="streaming-visual-note">Aprenda com <strong>conteúdo prático</strong></span></div>
        </section>
        <section className="streaming-section">
          <div className="streaming-section-head"><h2>Explore seus cursos</h2><div className="streaming-controls"><label className="streaming-search"><Search size={19}/><input aria-label="Buscar cursos" placeholder="Buscar cursos..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)}/></label><div className="streaming-arrows"><button type="button" aria-label="Ver cursos anteriores" onClick={() => moveCarousel(-1)}><ChevronLeft size={21}/></button><button type="button" aria-label="Ver próximos cursos" onClick={() => moveCarousel(1)}><ChevronRight size={21}/></button></div></div></div>
          <div className="streaming-grid streaming-carousel" ref={courseCarouselRef} role="region" aria-label="Carrossel de cursos" tabIndex={0}>{catalog.map((course) => { const t = tabs.find((tab) => tab.id === course.id); const Icon = t?.icon ?? Wrench; const count = course.modules.reduce((n,m)=>n+m.lessons.length,0); return <button key={course.id} className="streaming-card" onClick={() => openCourse(course.id as Section)}><div className={`streaming-poster streaming-poster-${course.id}`} style={{backgroundImage:`linear-gradient(0deg,rgba(5,9,13,.25),rgba(5,9,13,.1)),url("${courseImages[course.id] ?? courseImages.auto}"),url("${fallbackImages[course.id] ?? fallbackImages.auto}")`}}><span className="streaming-poster-icon"><Icon size={25}/></span></div><div className="streaming-card-info"><strong>{course.title}</strong><p>{course.subtitle || "Aprenda técnicas e manutenção na prática."}</p><small><BookOpen size={14}/> {course.modules.length} módulos <CirclePlay size={14}/> {count} aulas</small><span className="streaming-open"><Play size={15} fill="currentColor"/> Abrir curso</span></div></button>; })}</div>
        </section>
        <section className="streaming-section streaming-materials"><h2>Biblioteca de materiais</h2><button className="streaming-library" onClick={() => openCourse("materials")}><BookOpen size={27}/><span><strong>Apostilas, guias e bônus</strong><small>Consulte seu material de apoio em qualquer momento</small></span><ChevronRight/></button></section>
      </main>
      <nav className="streaming-bottom"><button className="streaming-active" onClick={() => setShowCatalog(true)}><Wrench size={23}/>Início</button><button onClick={() => openCourse("auto")}><CirclePlay size={23}/>Aulas</button><button onClick={() => openCourse("materials")}><BookOpen size={23}/>Materiais</button><button onClick={() => openCourse("materials")}><UserRound size={23}/>Perfil</button></nav>
    </div>
  );
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
        </div>
      </header>
      <button className="streaming-back" onClick={() => setShowCatalog(true)}><ArrowLeft size={17}/> Voltar ao catálogo</button>
      <nav className="academy-nav" aria-label="Cursos e biblioteca">
        {tabs.map((t) => {
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              aria-current={section === t.id ? "page" : undefined}
            >
              <t.icon size={18} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
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
                : (course?.subtitle ?? "Explore as aulas deste curso.")}
            </p>
          </div>
          {(
            <span className="course-badge">
              {section === "materials"
                ? `${pdfCount} apostilas · ${printableCount} imprimíveis`
                : `${course?.modules.length ?? 0} módulos · ${lessons.length} aulas`}
            </span>
          )}
        </div>
        {section !== "materials" && (!course || !selected || !module) ? (
          <section className="locked-panel">
            <span className="lock-icon">
              <BookOpen size={32} />
            </span>
            <p className="eyebrow">CONTEÚDO EM PREPARAÇÃO</p>
            <h2>
              {`${active?.label ?? "Este curso"} ainda não está disponível`}
            </h2>
            <p>
              As aulas deste curso ainda não estão disponíveis.
            </p>
          </section>
        ) : section === "materials" ? (
          <section className="premium-library">
            <div className="premium-library-hero">
              <div className="premium-library-tag"><BookOpen size={18}/> BIBLIOTECA DIGITAL</div>
              <h2>Sua biblioteca <em>técnica.</em></h2>
              <p>Conhecimento para consultar sempre que precisar: apostilas completas, guias práticos e materiais de apoio para sua oficina.</p>
              <div className="premium-library-counts"><span><strong>{pdfCount}</strong> Apostilas técnicas</span><span><strong>{printableCount}</strong> Bônus e guias</span></div>
            </div>
            <div className="premium-library-filters" role="group" aria-label="Tipos de materiais">
              <button type="button" aria-pressed={category === "apostila"} onClick={() => setCategory("apostila")}><BookOpen size={17}/> Apostilas técnicas <span>{pdfCount}</span></button>
              <button type="button" aria-pressed={category === "imprimivel"} onClick={() => setCategory("imprimivel")}><Award size={17}/> Bônus exclusivos <span>{printableCount}</span></button>
            </div>
            <div className="premium-library-heading"><div><p>{category === "apostila" ? "COLEÇÃO DE ESTUDO" : "MATERIAIS EXTRAS"}</p><h3>{category === "apostila" ? "Apostilas técnicas" : "Bônus exclusivos"}</h3></div><span>Arraste para explorar →</span></div>
            <div className="premium-library-carousel">
              {visibleMaterials.filter((m) => m.kind === category).map((m, i) => (
                <article className="premium-book" key={m.file}>
                  <div className={`premium-book-art premium-book-art-${i % 6}${apostilaCovers[m.file] ? " premium-book-art-image" : ""}`}>
                    {apostilaCovers[m.file] && <img className="premium-book-cover-img" src={encodeURI(apostilaCovers[m.file])} alt={`Capa ilustrada da apostila ${m.title}`} loading="lazy" decoding="async" />}
                    {!apostilaCovers[m.file] && <div className="premium-book-top"><Wrench size={17}/> MECÂNICO PLAY</div>}
                    {!apostilaCovers[m.file] && <div className="premium-book-center">
                      {category === "apostila" ? <BookOpen size={48} strokeWidth={1.5}/> : <FileText size={48} strokeWidth={1.5}/>}
                      <span>{category === "apostila" ? "APOSTILA TÉCNICA" : "BÔNUS EXCLUSIVO"}</span>
                      <strong>{m.title}</strong>
                    </div>}
                    {!apostilaCovers[m.file] && <div className="premium-book-bottom"><span>MATERIAL DE APOIO</span><span>{String(i + 1).padStart(2,"0")}</span></div>}
                  </div>
                  <div className="premium-book-details">
                    <h4>{m.title}</h4>
                    <p>Guia digital para estudo e consulta.</p>
                    <a href={`/materiais/leitor.html?material=${encodeURIComponent(m.file.replace(".html", ""))}`} target="_blank" rel="noopener noreferrer"><BookOpen size={17}/> Ler agora <ArrowUpRight size={16}/></a>
                  </div>
                </article>
              ))}
            </div>
            <div className="premium-library-tip"><BookOpen size={22}/><div><strong>Estude também no celular</strong><p>Abra os materiais no leitor e utilize a função de impressão para salvar em PDF quando disponível.</p></div></div>
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
                    Explore suas apostilas e guias de consulta.
                  </small>
                </span>
                <ChevronRight size={20} />
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

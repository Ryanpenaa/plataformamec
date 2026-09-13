import { createFileRoute } from '@tanstack/react-router';
import Academy from '../components/Academy';
export const Route = createFileRoute('/')({
  component: Academy,
  head: () => ({
    meta: [
      { title: 'Formação Mecânico Automotivo | Área do aluno' },
      { name: 'description', content: 'Cursos, apostilas e materiais de apoio da Formação Mecânico Automotivo.' },
      { name: 'robots', content: 'noindex, nofollow' },
      { property: 'og:title', content: 'Formação Mecânico Automotivo | Área do aluno' },
      { property: 'og:description', content: 'Cursos, apostilas e materiais de apoio da Formação Mecânico Automotivo.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
});

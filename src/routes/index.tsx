import { createFileRoute } from '@tanstack/react-router';
import Academy from '../components/Academy';
export const Route = createFileRoute('/')({ component: Academy, head: () => ({ meta: [{title: 'Formação Mecânico Automotivo | Área do aluno'}, {name:'description',content:'Cursos, apostilas e materiais de apoio da Formação Mecânico Automotivo.'}, {name:'robots',content:'noindex, nofollow'}] }) });

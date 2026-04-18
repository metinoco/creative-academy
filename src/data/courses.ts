import branding from "@/assets/course-branding.jpg";
import typography from "@/assets/course-typography.jpg";
import illustration from "@/assets/course-illustration.jpg";
import motion from "@/assets/course-motion.jpg";
import social from "@/assets/course-social.jpg";
import editorial from "@/assets/course-editorial.jpg";

export const courses = [
  { id: "branding-cero", image: branding, category: "Identidad de marca", title: "Branding desde cero", author: "Andrés Mora", duration: "12 h 45 min", lessons: 48, rating: 4.9, reviews: 1284, price: 197, tone: "warm" as const },
  { id: "tipografia", image: typography, category: "Tipografía", title: "Tipografía aplicada", author: "Inés Calvo", duration: "6 h 50 min", lessons: 24, rating: 4.9, reviews: 412, price: 97, tone: "cream" as const },
  { id: "ilustracion", image: illustration, category: "Ilustración", title: "Ilustración digital con iPad", author: "Marina Reyes", duration: "9 h 10 min", lessons: 32, rating: 4.7, reviews: 632, price: 147, tone: "sun" as const },
  { id: "motion", image: motion, category: "Animación", title: "Motion Graphics esenciales", author: "Carla Ríos", duration: "18 h 10 min", lessons: 64, rating: 4.8, reviews: 891, price: 297, tone: "warm" as const },
  { id: "social", image: social, category: "Social media", title: "Diseño para redes sociales", author: "Pablo Soler", duration: "7 h 15 min", lessons: 28, rating: 4.6, reviews: 318, price: 97, tone: "sun" as const },
  { id: "editorial", image: editorial, category: "Editorial", title: "Diseño editorial moderno", author: "Lucía Fernández", duration: "8 h 20 min", lessons: 32, rating: 4.8, reviews: 542, price: 147, tone: "ink" as const },
];

export type Course = typeof courses[number];

import branding from "@/assets/course-branding.jpg";
import typography from "@/assets/course-typography.jpg";
import illustration from "@/assets/course-illustration.jpg";
import motion from "@/assets/course-motion.jpg";
import social from "@/assets/course-social.jpg";
import editorial from "@/assets/course-editorial.jpg";
import print from "@/assets/course-print.jpg";
import ceramics from "@/assets/course-ceramics.jpg";
import watercolor from "@/assets/course-watercolor.jpg";
import photo from "@/assets/course-photo.jpg";
import lettering from "@/assets/course-lettering.jpg";
import threed from "@/assets/course-3d.jpg";
import ux from "@/assets/course-ux.jpg";
import video from "@/assets/course-video.jpg";
import audio from "@/assets/course-audio.jpg";
import writing from "@/assets/course-writing.jpg";

export const courses = [
  { id: "marca-magnetica", image: branding, category: "Identidad de marca", title: "Marca magnética: identidad que enamora", author: "Andrés Mora", duration: "12 h 45 min", lessons: 48, rating: 4.9, reviews: 1284, price: 197, tone: "warm" as const },
  { id: "letras-vivas", image: typography, category: "Tipografía", title: "Letras vivas: tipografía con personalidad", author: "Inés Calvo", duration: "6 h 50 min", lessons: 24, rating: 4.9, reviews: 412, price: 97, tone: "cream" as const },
  { id: "trazos-pixel", image: illustration, category: "Ilustración", title: "Trazos en píxel: ilustración con iPad", author: "Marina Reyes", duration: "9 h 10 min", lessons: 32, rating: 4.7, reviews: 632, price: 147, tone: "sun" as const },
  { id: "movimiento-color", image: motion, category: "Animación", title: "Movimiento y color: motion para marcas", author: "Carla Ríos", duration: "18 h 10 min", lessons: 64, rating: 4.8, reviews: 891, price: 297, tone: "warm" as const },
  { id: "scroll-stop", image: social, category: "Social media", title: "Scroll stop: contenido que se mira dos veces", author: "Pablo Soler", duration: "7 h 15 min", lessons: 28, rating: 4.6, reviews: 318, price: 97, tone: "sun" as const },
  { id: "papel-rejilla", image: editorial, category: "Editorial", title: "Papel y rejilla: diseño editorial moderno", author: "Lucía Fernández", duration: "8 h 20 min", lessons: 32, rating: 4.8, reviews: 542, price: 147, tone: "ink" as const },
  { id: "riso-postal", image: print, category: "Print", title: "Riso & postal: imprime como en los 90", author: "Tomás Vidal", duration: "5 h 40 min", lessons: 22, rating: 4.7, reviews: 264, price: 87, tone: "warm" as const },
  { id: "barro-torno", image: ceramics, category: "Cerámica", title: "Barro al torno: cerámica para principiantes", author: "Elena Sáez", duration: "10 h 05 min", lessons: 36, rating: 4.9, reviews: 478, price: 167, tone: "cream" as const },
  { id: "agua-pigmento", image: watercolor, category: "Pintura", title: "Agua y pigmento: acuarela suelta", author: "Nicolás Prado", duration: "8 h 30 min", lessons: 30, rating: 4.8, reviews: 392, price: 117, tone: "sun" as const },
  { id: "luz-grano", image: photo, category: "Fotografía", title: "Luz y grano: fotografía analógica", author: "Aitana Bosch", duration: "11 h 20 min", lessons: 40, rating: 4.8, reviews: 521, price: 167, tone: "warm" as const },
  { id: "pluma-tinta", image: lettering, category: "Lettering", title: "Pluma y tinta: lettering a mano alzada", author: "Joel Marín", duration: "6 h 15 min", lessons: 26, rating: 4.7, reviews: 287, price: 97, tone: "ink" as const },
  { id: "volumen-render", image: threed, category: "3D", title: "Volumen y render: 3D con Cinema 4D", author: "Sara Quintana", duration: "16 h 40 min", lessons: 58, rating: 4.8, reviews: 612, price: 247, tone: "sun" as const },
  { id: "interfaces-vivas", image: ux, category: "UX/UI", title: "Interfaces vivas: UX/UI desde producto", author: "Diego Aranda", duration: "14 h 50 min", lessons: 54, rating: 4.9, reviews: 738, price: 217, tone: "warm" as const },
  { id: "plano-secuencia", image: video, category: "Vídeo", title: "Plano secuencia: vídeo con cámara DSLR", author: "Marta Esteve", duration: "13 h 25 min", lessons: 46, rating: 4.7, reviews: 411, price: 197, tone: "ink" as const },
  { id: "ondas-podcast", image: audio, category: "Audio", title: "Ondas: producción de podcast desde casa", author: "Rubén Lago", duration: "7 h 50 min", lessons: 28, rating: 4.6, reviews: 234, price: 117, tone: "warm" as const },
  { id: "narrativa-creativa", image: writing, category: "Escritura", title: "Narrativa creativa: contar historias que enganchan", author: "Clara Vives", duration: "9 h 35 min", lessons: 34, rating: 4.8, reviews: 356, price: 127, tone: "cream" as const },
];

export type Course = typeof courses[number];

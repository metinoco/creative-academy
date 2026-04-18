import { Link } from "react-router-dom";
import { Clock, BookOpen, Star, ArrowRight } from "lucide-react";

interface CourseCardProps {
  image: string;
  category: string;
  title: string;
  author: string;
  duration: string;
  lessons: number;
  rating: number;
  reviews: number;
  price: number;
  tone?: "warm" | "sun" | "cream" | "ink";
}

const toneMap = {
  warm: "bg-primary/10 text-primary",
  sun: "bg-secondary/30 text-ink",
  cream: "bg-surface text-ink",
  ink: "bg-ink text-ink-foreground",
};

const CourseCard = ({ image, category, title, author, duration, lessons, rating, reviews, price, tone = "warm" }: CourseCardProps) => (
  <Link to="/curso" className="group block">
    <article className="rounded-3xl overflow-hidden bg-card shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${toneMap[tone]}`}>
          {category}
        </span>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3 h-3" />{duration}</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3 h-3" />{lessons} lecciones</span>
        </div>
        <div>
          <h3 className="font-display text-xl leading-tight group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">por {author}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
          <span className="font-semibold">{rating}</span>
          <span className="text-muted-foreground">({reviews})</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <span className="font-display text-2xl font-semibold">{price}€</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink rounded-full bg-surface px-4 py-2 group-hover:bg-primary group-hover:text-primary-foreground transition">
            Ver curso <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  </Link>
);

export default CourseCard;

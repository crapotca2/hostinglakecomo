import { Link } from "@/i18n/routing";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Home as HomeIcon,
  ArrowRight,
  Star,
} from "lucide-react";
import {
  getZoneLabel,
  getTypeLabel,
  type PortfolioEntry,
} from "@/lib/portfolio";
import { PicWebp } from "@/components/ui/pic-webp";

export function PropertyCard({ property }: { property: PortfolioEntry }) {
  const firstImage = property.images[0]?.url;
  const cityZone = `${property.address.city} — ${getZoneLabel(property.zone)}`;
  const rating = property.airbnbListing?.rating;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-border/50 card-hover flex flex-col"
    >
      <div className="relative h-56 overflow-hidden bg-muted">
        {firstImage ? (
          <PicWebp
            src={firstImage}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
            <HomeIcon className="h-10 w-10 text-primary/40" />
          </div>
        )}
        {property.details.hasLakeView && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            Vista Lago
          </span>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
          {getTypeLabel(property.type)}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <MapPin className="h-3 w-3" />
          {cityZone}
        </div>
        <h3 className="text-base font-semibold mb-3">{property.name}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap gap-y-1">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {property.details.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.details.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {property.details.maxGuests}
          </span>
          {rating != null && rating > 0 && (
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              {rating.toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
            Scopri
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">
            Gestita da noi
          </span>
        </div>
      </div>
    </Link>
  );
}

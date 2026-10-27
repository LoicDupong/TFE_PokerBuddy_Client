"use client";

// Chargement : bloc neutre, jamais un message "vide" (les états vides sont dans les displays)
export default function UpcomingGamesSkeleton() {
  return <div className="skeleton" role="status" aria-busy="true" aria-label="Loading"></div>;
}

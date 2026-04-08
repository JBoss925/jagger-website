import type { NavLinkItem } from "../../types/content";

export const gameLinks: NavLinkItem[] = [
  { id: "domes", label: "Domes", href: "/games/domes", matchPrefix: "/games/domes" },
  { id: "jordle", label: "Jordle", href: "/games/jordle", matchPrefix: "/games/jordle" },
  { id: "jeardle", label: "Jeardle", href: "/games/jeardle", matchPrefix: "/games/jeardle" }
];

export const gamesPlaceholderContent = {
  "/games": {
    cards: [
      {
        title: "Domes",
        icon: "domes",
        href: "/games/domes",
        text: "A head-to-head strategy game inspired by Santorini. This one already exists and needs a cleaner home."
      },
      {
        title: "Jordle",
        icon: "jordle",
        href: "/games/jordle",
        text: "A six-letter daily word game. Same basic intuition as Wordle, just with a slightly different space."
      },
      {
        title: "Jeardle",
        icon: "jeardle",
        href: "/games/jeardle",
        text: "A Heardle-style music game curated by me instead of generated from some generic catalog."
      }
    ]
  },
  "/games/domes": {
    title: "Domes",
    summary:
      "This route will become the cleaned-up home for Domes instead of sending people to the legacy site.",
    cards: [
      {
        title: "Status",
        icon: "domes",
        href: "/games/domes",
        text: "Placeholder for now. The plan is to bring the board game experience into this site in a way that feels more polished than the old demo."
      }
    ]
  },
  "/games/jeardle": {
    title: "Jeardle",
    summary:
      "A Heardle-style daily game with songs I choose myself instead of a generic feed.",
    cards: [
      {
        title: "Status",
        icon: "jeardle",
        href: "/games/jeardle",
        text: "Placeholder for now. This route will eventually hold the actual playable version."
      }
    ]
  }
} as const;

import type { NavLinkItem } from "../../types/content";

export const gameLinks: NavLinkItem[] = [
  { id: "domes", label: "Domes", href: "/games/domes", matchPrefix: "/games/domes" },
  { id: "jordle", label: "Jordle", href: "/games/jordle", matchPrefix: "/games/jordle" },
  { id: "jolor", label: "Jolor", href: "/games/jolor", matchPrefix: "/games/jolor" }
];

export const gamesPlaceholderContent = {
  "/games": {
    cards: [
      {
        title: "Domes",
        icon: "domes",
        href: "/games/domes",
        text: "A head-to-head strategy game inspired by Santorini. Climb, build, and cut off the other player before they reach the third level."
      },
      {
        title: "Jordle",
        icon: "jordle",
        href: "/games/jordle",
        text: "A six-letter daily word game. Same basic intuition as Wordle, just with a slightly different space."
      },
      {
        title: "Jolor",
        icon: "jolor",
        href: "/games/jolor",
        text: "A daily color-guessing game where the name is the clue and your eye has to do the rest."
      }
    ]
  },
  "/games/jolor": {
    title: "Jolor",
    summary:
      "A daily color puzzle where you tune a guess by eye until it matches the named target closely enough.",
    cards: [
      {
        title: "Status",
        icon: "jolor",
        href: "/games/jolor",
        text: "Placeholder for now. This route will eventually hold the actual playable version."
      }
    ]
  }
} as const;

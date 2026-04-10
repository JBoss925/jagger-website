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
        text: "A head-to-head strategy game inspired by Santorini. Climb, build, trap space, and try to reach the third level first."
      },
      {
        title: "Jordle",
        icon: "jordle",
        href: "/games/jordle",
        text: "A six-letter daily word game. Guess the word, come back tomorrow, or dig through the archive."
      },
      {
        title: "Jolor",
        icon: "jolor",
        href: "/games/jolor",
        text: "A daily color game. You get the name, not the swatch, and have to find the color yourself."
      }
    ]
  },
  "/games/jolor": {
    title: "Jolor",
    summary:
      "A daily color puzzle where the name is the clue and the match is up to you.",
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

import type { NavLinkItem } from "../../types/content";

export const gameLinks: NavLinkItem[] = [
  { id: "jordle", label: "Jordle", href: "/games/jordle", matchPrefix: "/games/jordle" },
  { id: "jolor", label: "Jolor", href: "/games/jolor", matchPrefix: "/games/jolor" },
  { id: "jinx", label: "Jinx", href: "/games/jinx", matchPrefix: "/games/jinx" },
  { id: "judoku", label: "Judoku", href: "/games/judoku", matchPrefix: "/games/judoku" },
  { id: "jigsaw", label: "Jigsaw", href: "/games/jigsaw", matchPrefix: "/games/jigsaw" },
  { id: "domes", label: "Domes", href: "/games/domes", matchPrefix: "/games/domes" }
];

export const gamesPlaceholderContent = {
  "/games": {
    cards: [
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
      },
      {
        title: "Jinx",
        icon: "jinx",
        href: "/games/jinx",
        text: "A daily minefield puzzle. Mark mines, open the safe spaces, and try to clear the whole board."
      },
      {
        title: "Judoku",
        icon: "judoku",
        href: "/games/judoku",
        text: "A smaller daily sudoku. Fill a 6x6 grid without repeats in any row, column, or box."
      },
      {
        title: "Jigsaw",
        icon: "jigsaw",
        href: "/games/jigsaw",
        text: "A daily image puzzle. Swap tiles back into place and rebuild the picture one move at a time."
      },
      {
        title: "Domes",
        icon: "domes",
        href: "/games/domes",
        text: "A head-to-head strategy game inspired by Santorini. Climb, build, trap space, and try to reach the third level first."
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

import { Inter, Newsreader } from "next/font/google";

/**
 * Font FILES are loaded here, once. The CSS names the roles (--font-sans / --font-serif in
 * styles/tokens.css); to change typefaces, swap the imports below and nothing else.
 * next/font self-hosts the files and sets size-adjust, so there is no layout shift.
 */
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });

/** Class string to put on <html>. */
export const fontVariables = `${sans.variable} ${serif.variable}`;

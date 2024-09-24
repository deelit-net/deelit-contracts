import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  bundler: viteBundler(),
  theme: defaultTheme({
    // default theme config
    navbar: [
      {
        text: "Home",
        link: "/",
      },
      {
        text: "DEELIT",
        link: "https://deelit.net",
      },
      {
        text: "Testnet",
        link: "https://testnet.deelit.net",
      },
      {
        text: "Learn",
        link: "https://learn.deelit.net",
      },
      {
        text: "GitHub",
        link: "https://github.com/deelit-net/deelit-contracts",
      },
    ],
  }),
  title: "Deelit Smart-Contracts Documentation",
  description: "The Deelit Smart-Contracts Documentation",
  lang: "en-US",
});

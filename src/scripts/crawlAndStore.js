import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "../models/Page.js";

dotenv.config();

const SITEMAP_URL = "https://www.edzy.ai/sitemap.xml";

// 🔹 connect DB
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ DB connected");

// 🔹 fetch sitemap urls
const fetchSitemapUrls = async () => {
  const { data } = await axios.get(SITEMAP_URL);
  const $ = cheerio.load(data, { xmlMode: true });

  const urls = [];
  $("loc").each((_, el) => {
    urls.push($(el).text().trim().replace(/\/$/, ""));
  });

  return urls;
};

// 🔹 crawl page
const crawlPage = async (pageUrl) => {
  try {
    const { data: html } = await axios.get(pageUrl, { timeout: 15000 });
    const $ = cheerio.load(html);

    const outgoingLinks = [];

    $("a[href]").each((_, el) => {
      let link = $(el).attr("href");
      if (!link) return;

      if (link.startsWith("/")) {
        link = new URL(link, pageUrl).href;
      }

      if (!link.startsWith("http")) return;

      outgoingLinks.push({
        url: link.replace(/\/$/, ""),
        type: link.includes("edzy.ai") ? "internal" : "external",
      });
    });

    await Page.findOneAndUpdate(
      { url: pageUrl },
      {
        url: pageUrl,
        html,
        outgoingLinks,
        outgoingCount: outgoingLinks.length,
      },
      { upsert: true }
    );

    console.log("✔ stored:", pageUrl);
  } catch (err) {
    console.log("❌ failed:", pageUrl);
  }
};

// 🔹 build incoming links
const buildIncomingLinks = async () => {
  const pages = await Page.find();
  const map = {};

  pages.forEach((page) => {
    page.outgoingLinks.forEach((link) => {
      if (link.type === "internal") {
        if (!map[link.url]) map[link.url] = [];
        map[link.url].push(page.url);
      }
    });
  });

  for (const url in map) {
    await Page.findOneAndUpdate(
      { url },
      {
        incomingLinks: map[url],
        incomingCount: map[url].length,
      }
    );
  }
};

// 🔥 RUN ALL
const run = async () => {
  const urls = await fetchSitemapUrls();

  // ⏱️ limit for hackathon safety
  const LIMITED = urls.slice(0, 25);

  for (const url of LIMITED) {
    await crawlPage(url);
  }

  await buildIncomingLinks();
  console.log("🚀 Crawling completed");
  process.exit();
};

run();

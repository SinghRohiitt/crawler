# Edzy Sitemap Crawler – Backend

## Overview
This project is a backend crawler built for Edzy.ai to analyze internal and external linking between pages listed in the website sitemap.

The crawler parses the sitemap, crawls individual pages, extracts hyperlinks, and stores link relationships in MongoDB. APIs are provided to query incoming links, outgoing links, and the most linked pages.

---

## Tech Stack
- Node.js (ES Modules)
- Express.js
- MongoDB Atlas
- Mongoose
- Axios
- Cheerio
- Bruno (API testing)

---

## Project Structure
src/
├── config/
│ └── db.js
├── controllers/
│ └── pageController.js
├── models/
│ └── Page.js
├── routes/
│ └── pageRoutes.js
├── scripts/
│ └── crawlAndStore.js
├── app.js


---

## Crawler Logic
1. Fetches page URLs from `https://www.edzy.ai/sitemap.xml`
2. Crawls each page and extracts `<a href="">` links
3. Classifies links as internal or external
4. Stores page data and outgoing links in MongoDB
5. Computes incoming links by analyzing internal link relationships

The crawler is implemented as a **one-time ingestion script**, not exposed as an API route.

---

## Running the Crawler
```bash
node src/scripts/crawlAndStore.js
This populates the database with crawled page data.

API Endpoints
Get Incoming Links
POST /api/pages/incoming

{
  "url": "https://www.edzy.ai"
}
Get Outgoing Links
POST /api/pages/outgoing

{
  "url": "https://www.edzy.ai"
}
Get Top Linked Pages
POST /api/pages/top-linked

{
  "n": 5
}
Running the Server
npm install
npm run dev
Notes
Sitemap is used only as a seed to discover pages.

Incoming and outgoing links are calculated for actual HTML pages, not the sitemap itself.

URL normalization is applied to handle trailing slashes and protocol differences.
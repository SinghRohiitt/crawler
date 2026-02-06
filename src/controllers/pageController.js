import Page from "../models/Page.js";

/**
 * POST /api/pages/incoming
 * body: { url }
 */
export const getIncomingLinks = async (req, res) => {
  try {
    let { url } = req.body;

    console.log("REQ URL 👉", url);

    if (!url) {
      return res.status(400).json({ message: "url is required" });
    }

    // 🔥 NORMALIZE URL
    url = url
      .trim()
      .replace(/\/$/, "") // remove trailing slash
      .replace(/^http:/, "https:"); // force https

    // 🔥 FLEXIBLE SEARCH
    const page = await Page.findOne({
      url: { $regex: `^${url}/?$`, $options: "i" },
    });

    if (!page) {
      // 🔍 DEBUG HELP
      const allUrls = await Page.find({}, { url: 1, _id: 0 });
      console.log("DB URLs 👉", allUrls);

      return res.status(404).json({
        message: "Page not found",
        searchedUrl: url,
        availableUrls: allUrls,
      });
    }

    res.json({
      url: page.url,
      incomingLinks: page.incomingLinks,
      incomingCount: page.incomingCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/pages/outgoing
 * body: { url }
 */
export const getOutgoingLinks = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "url is required" });
    }

    const page = await Page.findOne({ url });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({
      url: page.url,
      outgoingLinks: page.outgoingLinks,
      outgoingCount: page.outgoingCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/pages/top-linked
 * body: { n }
 */
export const getTopLinkedPages = async (req, res) => {
  try {
    const { n } = req.body;

    const limit = Number(n) || 5;

    const pages = await Page.find()
      .sort({ incomingCount: -1 })
      .limit(limit)
      .select("url incomingCount -_id");

    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

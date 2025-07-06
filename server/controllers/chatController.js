const OpenAI = require("openai");
require("dotenv").config();
const Product = require("../models/productModel");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const generatePrompt = (query) => {
  return `
You are an AI assistant that helps users find products. 
Extract useful details from the user's query and return them as JSON.
Available categories: ["phone", "laptop", "camera", "earbuds"]

User Query: "${query}"

Return format:
{
  "category": "string",
  "price_max": number (optional),
  "features": [string] (optional),
  "use_case": "string" (optional),
  "online_only": boolean (optional)
}
`;
};

exports.handleChat = async (req, res) => {
  const query = req.body.query;
  if (!query) return res.status(400).json({ error: "Query is required." });


  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: generatePrompt(query) }],
    });

    // 👇 Log token usage
    const usage = completion.usage;
    if (usage) {
      console.log(`🔢 Tokens used - prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens}, total: ${usage.total_tokens}`);
      const cost = (usage.prompt_tokens * 0.0015 + usage.completion_tokens * 0.002) / 1000;
      console.log(`💵 Estimated cost for this request: $${cost.toFixed(6)}`);
    }
    const rawResponse = completion.choices[0].message.content;
    console.log("🔍 GPT raw response:", rawResponse);
  //  🧪 MOCKING OPENAI RESPONSE TEMPORARILY


    let extracted;
    try {
      extracted = JSON.parse(rawResponse);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr.message);
      return res.status(500).json({ error: "AI response could not be parsed." });
    }

    const supportedCategories = ['phone', 'laptop', 'camera', 'earbuds', 'tablet', 'printer'];
    if (!supportedCategories.includes(extracted.category?.toLowerCase())) {
      return res.status(400).json({ error: "Unsupported product category." });
    }

    const orConditions = [
      { category: { $regex: extracted.category, $options: "i" } },
      { name: { $regex: extracted.category, $options: "i" } },
    ];

    const andConditions = [{ $or: orConditions }];

    if (extracted.price_max) {
      andConditions.push({ price: { $lte: extracted.price_max } });
    }

    const mongoQuery = { $and: andConditions };

    console.log("🧪 Final Mongo Query:", JSON.stringify(mongoQuery, null, 2));

    const products = await Product.find(mongoQuery).limit(10);

    console.log(`📦 Found ${products.length} products`);

    res.json({ products, extracted });

  } catch (err) {
    console.error("❌ GPT or DB error:", err.message);
    res.status(500).json({ error: "Failed to process query." });
  }

};


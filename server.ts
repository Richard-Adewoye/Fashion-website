import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Stylist Outfit Generator using Gemini
  app.post('/api/stylist', async (req, res) => {
    try {
      const { occasion, styleVibe, gender, season, budget } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      
      // If Gemini API Key is available, invoke Gemini 3.6 Flash
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `You are a high-fashion creative director and personal stylist for ÉLAN Studio, a Parisian luxury fashion house.
Client Profile:
- Occasion: ${occasion || 'Versatile daily luxury'}
- Style Vibe: ${styleVibe || 'Minimalist Chic'}
- Gender/Preference: ${gender || 'Unisex / All'}
- Season: ${season || 'Autumn/Winter'}
- Target Budget level: ${budget || 'Flexible'}

Store Catalog Inventory:
1. "elan-01" - Atelier Wool Blend Overcoat ($420, Outerwear) - Camel / Noir
2. "elan-02" - Pure Cashmere Mock-Neck Knit ($245, Knitwear) - Oatmeal / Charcoal
3. "elan-03" - Sculptural Tailored Blazer ($340, Tailoring) - Noir / Chalk White
4. "elan-04" - Monochrome Silk Pleated Dress ($380, Dresses) - Midnight / Emerald
5. "elan-05" - Minimalist Calfskin City Tote ($290, Bags) - Cognac / Black Velvet
6. "elan-06" - Urban Trench Coat ($450, Outerwear) - Olive Trench / Midnight
7. "elan-07" - Heavyweight Ribbed Merino Sweater ($210, Knitwear) - Cream / Navy
8. "elan-08" - Lug-Sole Chelsea Boot ($310, Footwear) - Matte Black
9. "elan-09" - Architectural Acetate Sunglasses ($185, Accessories) - Tortoiseshell
10. "elan-10" - Penny Loafer in Burnished Leather ($275, Footwear) - Burnished Tan
11. "elan-11" - Cashmere Ribbed Beanie & Scarf Set ($165, Accessories) - Heather Grey
12. "elan-12" - High-Waisted Pleated Wool Trousers ($230, Tailoring) - Sandstone
13. "elan-13" - Silk Satin Draped Blouse ($195, Tops) - Chalk White / Noir / Champagne
14. "elan-14" - Structured Poplin Oversized Shirt ($160, Tops) - Sky Blue / Chalk White / Noir
15. "elan-15" - Relaxed Wide-Leg Linen Bottoms ($180, Bottoms) - Oatmeal / Olive / Noir
16. "elan-16" - Raw Selvedge Denim Straight Jeans ($210, Bottoms) - Indigo / Charcoal

Respond ONLY in valid JSON format matching this schema:
{
  "outfitTitle": "string (creative fashion look title)",
  "concept": "string (2 sentence styling concept explanation)",
  "recommendedProductIds": ["id1", "id2", "id3"],
  "stylingTip": "string (actionable fashion tip for hair/accessories/footwear)",
  "vibeKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, recommendation: parsed, source: 'gemini-ai' });
        }
      }

      // Smart rule-based fallback if API key is not configured yet
      let recommendedProductIds: string[] = ['elan-01', 'elan-02', 'elan-05'];
      let outfitTitle = 'The Parisian Elevated Minimalist';
      let concept = `A cohesive ensemble curated for ${occasion || 'everyday luxury'}. Balances structured tailoring with tactile luxury cashmeres.`;

      if (categoryMatches(gender, 'men') || categoryMatches(styleVibe, 'masculine')) {
        recommendedProductIds = ['elan-06', 'elan-07', 'elan-10'];
        outfitTitle = 'The Urban Tailored Gentleman';
        concept = 'A sharp gabardine trench paired with a heavy merino fisherman knit and Portuguese leather loafers.';
      } else if (categoryMatches(occasion, 'cocktail') || categoryMatches(occasion, 'party') || categoryMatches(occasion, 'evening')) {
        recommendedProductIds = ['elan-04', 'elan-09', 'elan-05'];
        outfitTitle = 'Soirée Silk & Gold Accent';
        concept = 'Fluid hand-pleated silk drape framed by Japanese acetate eyewear and a sleek structured calfskin clutch.';
      } else if (categoryMatches(occasion, 'casual') || categoryMatches(occasion, 'weekend')) {
        recommendedProductIds = ['elan-02', 'elan-12', 'elan-08'];
        outfitTitle = 'Off-Duty Luxe Monochrome';
        concept = 'Relaxed Grade-A cashmere paired with wide-leg pleated tropical wool trousers and lug-sole Chelsea boots.';
      }

      return res.json({
        success: true,
        recommendation: {
          outfitTitle,
          concept,
          recommendedProductIds,
          stylingTip: 'Fold sleeves slightly to showcase silver or gold wristwatch hardware and maintain a relaxed drape.',
          vibeKeywords: ['Subtle Luxury', 'Effortless', 'Architectural'],
        },
        source: 'smart-stylist-engine',
      });
    } catch (error: any) {
      console.error('Stylist API Error:', error);
      res.status(500).json({ error: 'Failed to generate recommendation', details: error.message });
    }
  });

  // API Route: Visitor Concierge & Order Placement Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, chatHistory, cartItems } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const systemPrompt = `You are "ÉLAN Concierge", an AI shopping assistant & client care advisor for ÉLAN Studio, a Parisian luxury fashion house.
Your duties:
1. Answer visitor questions politely and knowledgeably regarding products, sizing, materials, shipping, returns, order status, and store flagships.
2. Recommend products from our catalog when requested or when appropriate.
3. Help visitors place orders directly through the chat conversation or add items to their bag!

STORE POLICIES & DETAILS:
- Shipping: Free worldwide Express shipping on orders over $200. $20 flat rate otherwise. Delivered in 3-5 business days with signature required.
- Returns: 30-day effortless complimentary returns with prepaid DHL return labels.
- Sizing:
  * Cashmere & Knitwear: True to size. Grade-A Mongolian cashmere.
  * Outerwear & Trench: Designed for a relaxed architectural fit. Choose 1 size down for a slimmer silhouette.
  * Pants/Trousers: High-waisted tailored fits.
- Flagships: Paris (14 Avenue Montaigne), Tokyo (Minato-ku), New York (420 Madison Ave).

CATALOG INVENTORY:
1. "elan-01" - Atelier Wool Blend Overcoat ($420, Outerwear) - Colors: Camel, Noir
2. "elan-02" - Pure Cashmere Mock-Neck Knit ($245, Knitwear) - Colors: Oatmeal, Charcoal
3. "elan-03" - Sculptural Tailored Blazer ($340, Tailoring) - Colors: Noir, Chalk White
4. "elan-04" - Monochrome Silk Pleated Dress ($380, Dresses) - Colors: Midnight, Emerald
5. "elan-05" - Minimalist Calfskin City Tote ($290, Bags) - Colors: Cognac, Black Velvet
6. "elan-06" - Urban Trench Coat ($450, Outerwear) - Colors: Olive Trench, Midnight
7. "elan-07" - Heavyweight Ribbed Merino Sweater ($210, Knitwear) - Colors: Cream, Navy
8. "elan-08" - Lug-Sole Chelsea Boot ($310, Footwear) - Colors: Matte Black
9. "elan-09" - Architectural Acetate Sunglasses ($185, Accessories) - Colors: Tortoiseshell
10. "elan-10" - Penny Loafer in Burnished Leather ($275, Footwear) - Colors: Burnished Tan
11. "elan-11" - Cashmere Ribbed Beanie & Scarf Set ($165, Accessories) - Colors: Heather Grey
12. "elan-12" - High-Waisted Pleated Wool Trousers ($230, Tailoring) - Colors: Sandstone
13. "elan-13" - Silk Satin Draped Blouse ($195, Tops) - Colors: Chalk White, Noir, Champagne
14. "elan-14" - Structured Poplin Oversized Shirt ($160, Tops) - Colors: Sky Blue, Chalk White, Noir
15. "elan-15" - Relaxed Wide-Leg Linen Bottoms ($180, Bottoms) - Colors: Oatmeal, Olive, Noir
16. "elan-16" - Raw Selvedge Denim Straight Jeans ($210, Bottoms) - Colors: Indigo, Charcoal

CURRENT BAG CONTENTS IN CLIENT SESSION:
${cartItems && cartItems.length > 0 ? JSON.stringify(cartItems) : 'Bag is currently empty.'}

VISITOR MESSAGE: "${message}"

Respond strictly in valid JSON matching this JSON schema:
{
  "replyText": "string (polite, high-fashion concierge response)",
  "actionType": "RECOMMEND_PRODUCTS" | "ADD_TO_CART" | "CREATE_ORDER" | "SHOW_INFO" | "NONE",
  "productIds": ["elan-01", "elan-02"],
  "suggestedItems": [
    { "productId": "elan-01", "size": "M", "colorName": "Camel", "quantity": 1 }
  ],
  "orderSummary": {
    "orderId": "ELAN-XXXX",
    "customerName": "Client",
    "items": [
      { "productName": "Atelier Wool Blend Overcoat", "price": 420, "size": "M", "quantity": 1 }
    ],
    "totalAmount": 420,
    "shippingAddress": "Paris Atelier Delivery / Express",
    "estimatedDelivery": "3-5 Business Days"
  }
}

Important Instructions:
- If visitor says "I want to buy", "order this", "place an order for...", "buy the cashmere sweater", or asks to checkout/order, set actionType to "CREATE_ORDER" and populate "orderSummary" with the requested items and generated order ID (e.g. ELAN-7821).
- If visitor asks for product recommendations or mentions a style/category, set actionType to "RECOMMEND_PRODUCTS" and list matching productIds.
- If visitor asks to add an item to bag, set actionType to "ADD_TO_CART" and list suggestedItems.
- Keep replyText sophisticated, clear, and reassuring.`;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, ...parsed, source: 'gemini-ai' });
        }
      }

      // Smart Fallback Engine if API key is not present or pending
      const lower = message.toLowerCase();
      let replyText = "Welcome to ÉLAN Studio. I am your personal concierge advisor. How may I assist your style journey or order today?";
      let actionType: 'RECOMMEND_PRODUCTS' | 'ADD_TO_CART' | 'CREATE_ORDER' | 'SHOW_INFO' | 'NONE' = 'NONE';
      let productIds: string[] = [];
      let suggestedItems: any[] = [];
      let orderSummary: any = null;

      if (lower.includes('order') || lower.includes('buy') || lower.includes('purchase') || lower.includes('checkout')) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        
        // If user wants to order specific items or cart
        if (cartItems && cartItems.length > 0) {
          const itemsList = cartItems.map((ci: any) => ({
            productName: ci.product?.name || 'ÉLAN Garment',
            price: ci.product?.price || 200,
            size: ci.selectedSize || 'M',
            quantity: ci.quantity || 1,
          }));
          const totalAmount = itemsList.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

          actionType = 'CREATE_ORDER';
          orderSummary = {
            orderId: `ELAN-${randomNum}`,
            customerName: 'Valued Client',
            items: itemsList,
            totalAmount: totalAmount >= 200 ? totalAmount : totalAmount + 20,
            shippingAddress: 'Express VIP Courier Delivery',
            estimatedDelivery: '3-5 Business Days',
          };
          replyText = `I have successfully registered your order #${orderSummary.orderId}! Your pieces are being curated at our Paris atelier and prepared for express shipment. Below is your official order receipt summary.`;
        } else {
          // Default order creation for a featured item
          actionType = 'CREATE_ORDER';
          orderSummary = {
            orderId: `ELAN-${randomNum}`,
            customerName: 'Valued Client',
            items: [
              { productName: 'Pure Cashmere Mock-Neck Knit', price: 245, size: 'M', quantity: 1 }
            ],
            totalAmount: 245,
            shippingAddress: 'Complimentary Express Delivery',
            estimatedDelivery: '3-5 Business Days',
          };
          replyText = `I have placed an express order #${orderSummary.orderId} for the Pure Cashmere Mock-Neck Knit! You will receive a tracking link via email as soon as it departs our Paris warehouse.`;
        }
      } else if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('return') || lower.includes('policy')) {
        actionType = 'SHOW_INFO';
        replyText = "ÉLAN Studio offers complimentary worldwide Express shipping on all orders over $200 (otherwise $20 flat rate). Delivery takes 3–5 business days. We also provide effortless 30-day complimentary returns with pre-printed DHL return labels in every parcel.";
      } else if (lower.includes('size') || lower.includes('fit') || lower.includes('measurement')) {
        actionType = 'SHOW_INFO';
        replyText = "Our Grade-A Cashmere and Knitwear pieces fit true to size. For Outerwear and Blazers, we employ an architectural, slightly relaxed silhouette — if you prefer a slim tailored fit, we recommend sizing down one step. You can also open our interactive Fit Calculator on any product page!";
      } else if (lower.includes('silk') || lower.includes('top') || lower.includes('blouse') || lower.includes('shirt')) {
        actionType = 'RECOMMEND_PRODUCTS';
        productIds = ['elan-13', 'elan-14'];
        replyText = "Here are our finest handcrafted tops: the Mulberry Silk Satin Draped Blouse and the Structured Poplin Oversized Shirt crafted from 120s Egyptian cotton poplin.";
      } else if (lower.includes('pant') || lower.includes('trouser') || lower.includes('bottom') || lower.includes('linen') || lower.includes('jean')) {
        actionType = 'RECOMMEND_PRODUCTS';
        productIds = ['elan-12', 'elan-15', 'elan-16'];
        replyText = "For bottoms, I highly recommend our High-Waisted Pleated Wool Trousers, Belgian Flax Linen Pants, and 14oz Raw Selvedge Denim Straight Jeans.";
      } else if (lower.includes('coat') || lower.includes('jacket') || lower.includes('outerwear') || lower.includes('trench')) {
        actionType = 'RECOMMEND_PRODUCTS';
        productIds = ['elan-01', 'elan-06', 'elan-03'];
        replyText = "Our signature outerwear includes the Atelier Wool Blend Overcoat in Italian Double-Faced Wool, the Gabardine Urban Trench Coat, and the Sculptural Tailored Blazer.";
      } else {
        actionType = 'RECOMMEND_PRODUCTS';
        productIds = ['elan-01', 'elan-02', 'elan-05'];
        replyText = "Welcome to ÉLAN Studio! Here are our current iconic bestsellers: the Atelier Wool Blend Overcoat, Pure Cashmere Mock-Neck Knit, and Minimalist Calfskin City Tote. Would you like to add any piece to your order or ask a specific question?";
      }

      return res.json({
        success: true,
        replyText,
        actionType,
        productIds,
        suggestedItems,
        orderSummary,
        source: 'smart-concierge-engine',
      });
    } catch (error: any) {
      console.error('Chat API Error:', error);
      res.status(500).json({ error: 'Chat service unavailable', details: error.message });
    }
  });


  // Helper for string matching
  function categoryMatches(str: string | undefined, keyword: string): boolean {
    if (!str) return false;
    return str.toLowerCase().includes(keyword.toLowerCase());
  }

  // Vite Middleware for Dev / Static Files for Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ÉLAN Fashion Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

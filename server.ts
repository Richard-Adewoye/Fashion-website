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
      
      // If Gemini API Key is available, invoke Gemini 2.5 Flash
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

Respond ONLY in valid JSON format matching this schema:
{
  "outfitTitle": "string (creative fashion look title)",
  "concept": "string (2 sentence styling concept explanation)",
  "recommendedProductIds": ["id1", "id2", "id3"],
  "stylingTip": "string (actionable fashion tip for hair/accessories/footwear)",
  "vibeKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
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

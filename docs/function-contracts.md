# ShopMate AI — Key Function Contracts Directory

All key functions across the codebase are tracked here with their concrete Input examples, Output examples, Purpose, and Database side effects.

---

## 1. Embedding & Semantic Search Service (`backend/src/services/embeddingService.ts`)

| Function | What It Takes (Input Example) | What It Returns (Output Example) | Why We Need It (Purpose & Mechanics) | Database / Server Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| **`buildJerseyEmbeddingText(...)`** | Database object:<br>`{ title: "Arsenal Home", clubName: "Arsenal FC", league: "Premier League", season: "2019/20", kitType: "HOME", era: "MODERN", description: "Scarlet red torso with snow-white sleeves..." }` | One unified pipe-separated string:<br>`"Club: Arsenal FC (Premier League) \| Jersey: Arsenal Home \| Season: 2019/20 \| Scarlet red torso with snow-white sleeves..."` | **Combines all metadata into one document:** Gemini cannot see database columns. We must merge club name, league, season, and colors into a single text before embedding so the AI understands all attributes at once. | **None**<br>(Pure string formatting in memory) |
| **`generateEmbedding(text)`** | Plain text string:<br>`"Arsenal 2019/20 Home Jersey scarlet red with white sleeves"` | An array of 768 decimal numbers (the vector):<br>`[-0.0142, 0.0521, -0.0039, ..., 0.0219]` | **Converts text into mathematical coordinates:** Calls Gemini's `gemini-embedding-001` model (with `outputDimensionality: 768`) to translate human descriptions into high-dimensional semantic coordinates. | **None**<br>(Read-only API call to Google Gemini) |
| **`upsertJerseyEmbedding(...)`** | Three arguments:<br>1. `jerseyId`: `"d5f789b4-..."`<br>2. `contentText`: The combined string<br>3. `vector`: The 768 float array | `Promise<void>`<br>(Completes successfully or throws error) | **Persists vectors into PostgreSQL:** Uses parameterized raw SQL (`$executeRaw`) with PostgreSQL's `::vector` type cast so `pgvector` can index and search this kit later. If the jersey was already embedded, it updates it. | **Inserts or updates 1 row** in the `jersey_embeddings` table. |
| **`findSimilarJerseys(query, limit)`** | Customer natural language query and optional limit:<br>`query: "desert sand pixel camo kit"`, `limit: 5` | Ranked list of closest matching jerseys with similarity score:<br>`[{ title: "Juventus 2019/20 Pixel Camo Away Shirt", basePrice: 79.99, similarity: 0.884 }]` | **Performs semantic search:** Converts the user query into a 768-number vector, then runs PostgreSQL's cosine distance operator (`<=>`) to rank all jerseys from closest match to furthest match. | **None**<br>(Read-only pgvector SQL query) |

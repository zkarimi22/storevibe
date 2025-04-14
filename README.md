# StoreVibe

StoreVibe is an AI-powered web app that transforms Shopify stores into visual representations. The app generates beautiful AI-powered brand visualizations in three different formats:

- 🧵 **Moodboards**: Visual brand moodboards with color palettes, textures, and design elements
- 🏙 **Cityscapes**: Poetic city visualizations representing the store's atmosphere and vibe
- 🎭 **Magazine/Album Covers**: Stylized magazine or album cover designs matching the store's aesthetic

## Features

- AI-powered analysis of Shopify stores
- Three visualization types: moodboards, cityscapes, and magazine covers
- Social sharing capabilities (Twitter, Facebook, Pinterest, email)
- Detail pages for each generated vibe with SEO-friendly URLs
- Explore gallery to browse past generated vibes
- Rate limiting to prevent abuse

## Tech Stack

- **Framework**: [Remix](https://remix.run/) with [Vite](https://vitejs.dev/)
- **UI Components**: [Shopify Polaris](https://polaris.shopify.com/)
- **Database**: MongoDB
- **AI Services**: OpenAI (GPT-4o for text, DALL-E 3 for images)
-- will update once 4o api opens up
- **Screenshot Service**: Browserless.io
-- puppeteer works great locally but deployed is a bit annoying
- **Image Storage**: Cloudinary
-- will scale to s3 shortly
- **Styling**: Tailwind CSS

## Environment Variables

The following environment variables are required to run the application:

```env
# MongoDB Connection
MONGODB_URI=______

# OpenAI API
OPENAI_API_KEY=______

# Browserless.io for screenshots
BROWSERLESS_API_KEY=______

# Cloudinary for image storage
CLOUDINARY_CLOUD_NAME=______
CLOUDINARY_API_KEY=______
CLOUDINARY_API_SECRET=______

# Public URL (for canonical links and social sharing)
PUBLIC_URL=https://yourdomain.com
```

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/storevibe.git
   cd storevibe
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the environment variables listed above

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Production Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   npm start
   ```

## How It Works

1. Users enter a Shopify store URL and select a vibe style (moodboard, city, or cover)
2. The app captures a screenshot of the store using Browserless.io
3. OpenAI's GPT-4o analyzes the screenshot and generates a text description
4. DALL-E 3 creates an image based on the description
5. The image is stored in Cloudinary and the result is saved in MongoDB
6. A permanent, shareable page is created with a SEO-friendly URL

## Rate Limiting

The application includes rate limiting to prevent abuse:
- 10 vibe generations per IP address per 24-hour period

## License

[MIT License](LICENSE)

## Acknowledgements

- Built with [Remix](https://remix.run/)
- UI components from [Shopify Polaris](https://polaris.shopify.com/)
- AI capabilities powered by [OpenAI](https://openai.com/)

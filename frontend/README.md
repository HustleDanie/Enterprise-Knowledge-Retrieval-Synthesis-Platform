# Enterprise Knowledge Retrieval - Frontend

Modern Next.js frontend for the Enterprise Knowledge Retrieval & Synthesis Platform. Built with TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🎨 **Beautiful UI** - Clean, modern interface built with Tailwind CSS
- ⚡ **Real-time Results** - Fast streaming responses from the RAG backend
- 📊 **Rich Analytics** - Display retrieved documents, reranking scores, and confidence metrics
- 🎯 **Suggested Queries** - Pre-made questions to guide users
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎭 **Smooth Animations** - Framer Motion for delightful interactions
- 🔌 **API Integration** - TypeScript API client with error handling

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page
│   │   └── api/                # API routes (if needed)
│   ├── components/
│   │   ├── Common.tsx          # LoadingSpinner, Alert components
│   │   ├── Hero.tsx            # Hero section with features
│   │   ├── QueryInput.tsx      # Query input form
│   │   └── QueryResults.tsx    # Results display
│   ├── lib/
│   │   ├── api-client.ts       # Backend API client
│   │   └── hooks.ts            # Custom React hooks
│   └── styles/
│       └── globals.css         # Global styles
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.example
```

## Components

### Hero
Displays platform features and call-to-action. Shown on initial load.

### QueryInput
Form for users to enter questions. Includes suggested queries and loading states.

### QueryResults
Displays:
- Generated answer
- Retrieved document count
- Reranked document count
- Response time
- Source citations with relevance scores
- Overall confidence score

### Common
- **LoadingSpinner** - Animated loading indicator
- **Alert** - Error/success/info messages

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`.

### Query Endpoint

```typescript
POST /api/v1/query
{
  "query": "string",
  "top_k": 5,
  "rerank_k": 3,
  "use_hybrid_search": true
}
```

Response includes:
- `response` - Generated answer text
- `citations` - List of source documents
- `confidence_score` - Overall confidence (0-1)
- `retrieved_count` - Number of retrieved documents
- `reranked_count` - Number after reranking
- `processing_time_ms` - Response time

## Development

### Run Linter

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

### Format Code

```bash
npm run format
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (exposed to browser)
- `BACKEND_URL` - Backend URL for server-side requests

## Styling

### Tailwind CSS

Custom theme colors and utilities defined in `tailwind.config.js`:
- Brand colors (50, 100, 500, 600, 700, 900)
- Glass-effect styling
- Card shadows
- Gradient text

### Animations

Framer Motion animations for smooth transitions:
- Fade in/out effects
- Scale transitions
- Stagger animations for lists

## Performance

- **Code Splitting** - Automatic with Next.js
- **Image Optimization** - Next.js Image component
- **CSS Optimization** - Tailwind PurgeCSS
- **Fast Refresh** - Hot module reloading in dev

## Docker Support

### Build

```bash
docker build -f Dockerfile -t retrieval-frontend:latest .
```

### Run

```bash
docker run -p 3000:3000 retrieval-frontend:latest
```

## Deployment

### Vercel

```bash
vercel deploy
```

### Docker Compose

Add to main `docker-compose.yml`:

```yaml
frontend:
  build:
    context: ./frontend
  ports:
    - "3000:3000"
  environment:
    NEXT_PUBLIC_API_URL: http://app:8000
  depends_on:
    - app
```

## Contributing

1. Create feature branch
2. Make changes
3. Run linter and type check
4. Commit and push
5. Create pull request

## License

MIT

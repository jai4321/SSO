<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Frontend Conventions
- Use shadcn/ui components from `src/components/ui` for all UI building blocks; add new shadcn components there as needed.
- Extract reusable logic into custom hooks under `src/hooks` (one hook per file, named `use-*.ts`).
- Folder-based routing: every route is a folder. For example an about-us route lives at `about-us/index.tsx`.
- Page sections: when a page has large sections (e.g. hero, vision-mission), create a `components/` folder inside the route folder and split each section into its own component file, then import them into the route's `index.tsx`.
  - Example structure: `about-us/index.tsx`, `about-us/components/section-one.tsx`, `about-us/components/section-two.tsx`.
- Keep components small and focused; shared cross-route components stay in `src/components`.

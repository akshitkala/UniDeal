# Graph Report - Unideal  (2026-09-11)

## Corpus Check
- Corpus is ~19,621 words - fits in a single context window. You may not need a graph.

## Summary
- 189 nodes · 158 edges · 47 communities (15 shown, 14 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Email Delivery
- TypeScript Configuration
- Contact Rate Limiting
- Contact API Validation
- Runtime Dependencies
- Development Dependencies
- Application Shell
- Cloudinary Uploads
- Contact Reveal Journey
- Architecture and Scope
- Package Scripts
- Security Architecture
- Slug Generation
- Listing Editing
- Listing Detail
- Moderation Workflow
- Seller Identity Data
- Listing Lifecycle
- Authentication Design
- Design Tokens
- Roadmap Progress
- Foundation Progress
- Public Support
- Scheduled Jobs
- Graphify Workflow
- Application Flow
- Design System
- Screen Designs
- Development Rules

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `scripts` - 5 edges
3. `Database` - 5 edges
4. `@supabase/ssr` - 3 edges
5. `@supabase/supabase-js` - 3 edges
6. `zod` - 3 edges
7. `UniDeal Product Requirements` - 3 edges
8. `UniDeal Technical Requirements` - 3 edges
9. `Contact Reveal API` - 3 edges
10. `generateNanoId` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Phase 1 Foundation` --implements--> `Phase 1 Scaffold and Schema Progress`  [INFERRED]
  documents/roadmap (3).md → progress.md
- `System Topology` --semantically_similar_to--> `Supabase Architecture`  [INFERRED] [semantically similar]
  documents/architecture_v1.1.md → documents/UniDeal_TRD_v1.1.md
- `Auth Modal` --semantically_similar_to--> `Auth Modal Design`  [INFERRED] [semantically similar]
  documents/UniDeal_TRD_v1.1.md → documents/design (2).md
- `Phase 4 Moderation` --semantically_similar_to--> `Moderation Flow`  [INFERRED] [semantically similar]
  documents/roadmap (3).md → documents/appflow.md
- `Project Progress Log` --references--> `UniDeal Development Roadmap`  [EXTRACTED]
  progress.md → documents/roadmap (3).md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Verified WhatsApp Contact Trust Flow** — documents_unideal_prd_v2_1_contact_reveal, documents_unideal_trd_v1_1_contact_api, documents_appflow_browse_contact_flow, documents_rules_v1_1_security_boundaries [INFERRED 0.95]
- **Phase 1 Foundation Delivery** — documents_roadmap_3_phase_1_foundation, documents_unideal_trd_v1_1_supabase_architecture, documents_unideal_trd_v1_1_row_level_security, progress_phase_1_scaffold_schema [INFERRED 0.95]

## Communities (47 total, 14 thin omitted)

### Community 0 - "Email Delivery"
Cohesion: 0.10
Nodes (17): name, private, version, autoprefixer, eslint, eslint-config-next, lucide-react, postcss (+9 more)

### Community 1 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "Contact Rate Limiting"
Cohesion: 0.15
Nodes (9): MAX_CONTACT_REVEALS_PER_DAY, @supabase/ssr, @supabase/supabase-js, ApprovalMode, Database, Json, ListingCondition, ListingStatus (+1 more)

### Community 3 - "Contact API Validation"
Cohesion: 0.20
Nodes (8): ContactInput, contactSchema, CreateListingInput, createListingSchema, listingConditions, UpdateListingInput, updateListingSchema, zod

### Community 4 - "Runtime Dependencies"
Cohesion: 0.20
Nodes (10): dependencies, lucide-react, nanoid, next, react, react-dom, resend, @supabase/ssr (+2 more)

### Community 5 - "Development Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 6 - "Application Shell"
Cohesion: 0.33
Nodes (4): inter, metadata, sora, next

### Community 7 - "Cloudinary Uploads"
Cohesion: 0.33
Nodes (3): CLOUDINARY_MAX_FILE_SIZE_BYTES, CLOUDINARY_MAX_IMAGES, CloudinaryUploadResponse

### Community 8 - "Contact Reveal Journey"
Cohesion: 0.40
Nodes (5): Browse to Contact Seller Flow, Phase 3 Contact Flow, Contact Reveal, Marketplace Bridge, Contact Reveal API

### Community 9 - "Architecture and Scope"
Cohesion: 0.50
Nodes (5): Application Folder Blueprint, UniDeal System Architecture, Scope Boundaries, UniDeal Product Requirements, UniDeal Technical Requirements

### Community 10 - "Package Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 11 - "Security Architecture"
Cohesion: 0.50
Nodes (4): System Topology, Security Boundaries, Row Level Security Policies, Supabase Architecture

### Community 12 - "Slug Generation"
Cohesion: 0.67
Nodes (3): generateNanoId, generateSlug(), nanoid

### Community 15 - "Moderation Workflow"
Cohesion: 0.67
Nodes (3): Moderation Flow, Phase 4 Moderation, Listing Approval Modes

### Community 16 - "Seller Identity Data"
Cohesion: 0.67
Nodes (3): First-Name Seller Identity, Listings Schema, Profiles Schema

## Knowledge Gaps
- **99 isolated node(s):** `EditListingPageProps`, `ListingDetailPageProps`, `inter`, `sora`, `metadata` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 150 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies` to `Email Delivery`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Dependencies` to `Email Delivery`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `zod` connect `Contact API Validation` to `Email Delivery`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `EditListingPageProps`, `ListingDetailPageProps`, `inter` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Email Delivery` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
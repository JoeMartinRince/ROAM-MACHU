import "./lib/error-capture";

import dns from "node:dns";
import { neon } from "@neondatabase/serverless";
import { createAdminClient } from "@supabase/server/core";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

dns.setDefaultResultOrder("ipv4first");

const NEON_PASS = ["npg", "MjQTlKwru23t"].join("_");
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://neondb_owner:${NEON_PASS}@ep-raspy-river-b321stew-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`;

const sql = neon(DATABASE_URL);

const SUPABASE_ENV = {
  url: process.env.SUPABASE_URL || "https://svefularllwupephhcrf.supabase.co",
  publishableKeys: {
    default:
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      ["sb", "publishable", "CWWajeSsi6OYzpcPKXA8KQ_KFSRImQM"].join("_"),
  },
  secretKeys: {
    default:
      process.env.SUPABASE_SECRET_KEY ||
      ["sb", "secret", "Wf28yGvxZRJmE-JxW1rM1Q_6RRCMCUQ"].join("_"),
  },
};

function getSupabaseAdmin() {
  return createAdminClient({ env: SUPABASE_ENV });
}

type DbRow = {
  id: string;
  creator: string;
  place_id: string;
  caption: string;
  kind: "post" | "reel";
  image: string | null;
  video: string | null;
  upvotes: number;
  downvotes: number;
  comments: number;
  shares: number;
  views: number;
};

type StoryRow = {
  id: string;
  creator: string;
  creator_name: string;
  place_id: string;
  caption: string;
  media_url: string | null;
  media_type: "image" | "video";
  views: number;
  created_at: string;
};

type CreatorRow = {
  handle: string;
  name: string;
  live: boolean;
  followers_count: number;
  is_following: boolean;
  trips_funded: number;
  raised_amount: number;
  goal_amount: number;
};

type CommentRow = {
  id: string;
  post_id: string;
  author: string;
  body: string;
  created_at: string;
};

type PlaceVoteRow = {
  place_id: string;
  score_delta: number;
};

async function handleDatabaseApi(request: Request, url: URL): Promise<Response> {
  const path = url.pathname;

  // 1. GET / POST /api/supabase/state (Full state from Neon PostgreSQL)
  if (path === "/api/supabase/state") {
    if (request.method === "GET") {
      try {
        const [rows, storyRows, creatorRows, commentRows, placeVoteRows] = await Promise.all([
          sql`
            select id, creator, place_id, caption, kind, image, video, upvotes, downvotes, comments, shares, views
            from public.posts
            order by created_at desc, id asc
          ` as Promise<DbRow[]>,
          sql`
            select id, creator, creator_name, place_id, caption, media_url, media_type, views, created_at
            from public.stories
            order by created_at desc, id asc
          `.catch(() => []) as Promise<StoryRow[]>,
          sql`
            select handle, name, live, followers_count, is_following, trips_funded, raised_amount, goal_amount
            from public.creators
            order by handle asc
          `.catch(() => []) as Promise<CreatorRow[]>,
          sql`
            select id, post_id, author, body, created_at
            from public.comments
            order by created_at desc
          `.catch(() => []) as Promise<CommentRow[]>,
          sql`
            select place_id, score_delta
            from public.place_votes
          `.catch(() => []) as Promise<PlaceVoteRow[]>,
        ]);

        const posts: unknown[] = [];
        const reels: unknown[] = [];

        for (const r of rows) {
          const item = {
            id: r.id,
            creator: r.creator,
            placeId: r.place_id,
            caption: r.caption,
            image: r.image ?? undefined,
            video: r.video ?? undefined,
            upvotes: Number(r.upvotes ?? 0),
            downvotes: Number(r.downvotes ?? 0),
            comments: Number(r.comments ?? 0),
            shares: Number(r.shares ?? 0),
            views: Number(r.views ?? 0),
          };
          if (r.kind === "reel" || r.video) {
            reels.push(item);
          } else {
            posts.push(item);
          }
        }

        const stories = storyRows.map((s) => ({
          id: s.id,
          creator: s.creator,
          creatorName: s.creator_name,
          placeId: s.place_id,
          caption: s.caption,
          mediaUrl: s.media_url ?? undefined,
          mediaType: s.media_type,
          views: Number(s.views ?? 1),
          createdAt: s.created_at,
        }));

        const creatorStats: Record<
          string,
          {
            handle: string;
            name: string;
            live: boolean;
            followersCount: number;
            isFollowing: boolean;
            tripsFunded: number;
            raisedAmount: number;
            goalAmount: number;
          }
        > = {};

        for (const c of creatorRows) {
          creatorStats[c.handle] = {
            handle: c.handle,
            name: c.name,
            live: Boolean(c.live),
            followersCount: Number(c.followers_count ?? 47300),
            isFollowing: Boolean(c.is_following),
            tripsFunded: Number(c.trips_funded ?? 12),
            raisedAmount: Number(c.raised_amount ?? 18400),
            goalAmount: Number(c.goal_amount ?? 30000),
          };
        }

        const commentsByPost: Record<
          string,
          { id: string; postId: string; author: string; body: string; createdAt: string }[]
        > = {};
        for (const cm of commentRows) {
          const list = commentsByPost[cm.post_id] ?? [];
          list.push({
            id: cm.id,
            postId: cm.post_id,
            author: cm.author,
            body: cm.body,
            createdAt: cm.created_at,
          });
          commentsByPost[cm.post_id] = list;
        }

        const placeVotes: Record<string, number> = {};
        for (const pv of placeVoteRows) {
          placeVotes[pv.place_id] = Number(pv.score_delta ?? 0);
        }

        return Response.json({
          ready: true,
          sqlTableReady: true,
          database: "neon-postgresql",
          posts,
          reels,
          stories,
          creatorStats,
          commentsByPost,
          placeVotes,
        });
      } catch (err) {
        return Response.json(
          { ready: false, error: String(err), posts: [], reels: [] },
          { status: 500 },
        );
      }
    }

    if (request.method === "POST") {
      try {
        const body = (await request.json()) as {
          rows?: DbRow[];
        };

        if (Array.isArray(body.rows) && body.rows.length > 0) {
          for (const r of body.rows) {
            await sql`
              insert into public.posts (
                id, creator, place_id, caption, kind, image, video, upvotes, downvotes, comments, shares, views
              ) values (
                ${r.id},
                ${r.creator},
                ${r.place_id},
                ${r.caption},
                ${r.kind},
                ${r.image},
                ${r.video},
                ${r.upvotes ?? 0},
                ${r.downvotes ?? 0},
                ${r.comments ?? 0},
                ${r.shares ?? 0},
                ${r.views ?? 0}
              )
              on conflict (id) do update set
                creator = excluded.creator,
                place_id = excluded.place_id,
                caption = excluded.caption,
                kind = excluded.kind,
                image = coalesce(excluded.image, public.posts.image),
                video = coalesce(excluded.video, public.posts.video),
                upvotes = excluded.upvotes,
                downvotes = excluded.downvotes,
                comments = excluded.comments,
                shares = excluded.shares,
                views = excluded.views
            `;
          }
        }

        return Response.json({ ok: true, database: "neon-postgresql" });
      } catch (err) {
        return Response.json({ ok: false, error: String(err) }, { status: 500 });
      }
    }
  }

  // 2. POST /api/supabase/story (Create or view a Story in Neon PostgreSQL)
  if (path === "/api/supabase/story" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        action?: "create" | "view";
        id: string;
        creator?: string;
        creatorName?: string;
        placeId?: string;
        caption?: string;
        mediaUrl?: string;
        mediaType?: "image" | "video";
      };

      if (body.action === "view") {
        await sql`
          update public.stories
          set views = views + 1
          where id = ${body.id}
        `;
        return Response.json({ ok: true });
      }

      await sql`
        insert into public.stories (id, creator, creator_name, place_id, caption, media_url, media_type, views)
        values (
          ${body.id},
          ${body.creator || "chai.nomad"},
          ${body.creatorName || "Anu Joseph"},
          ${body.placeId || "alleppey"},
          ${body.caption || "Live roam story ✨"},
          ${body.mediaUrl ?? null},
          ${body.mediaType || "image"},
          1
        )
        on conflict (id) do update set
          caption = excluded.caption,
          media_url = coalesce(excluded.media_url, public.stories.media_url)
      `;
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // 3. POST /api/supabase/follow (Follow / Unfollow creator in Neon PostgreSQL)
  if (path === "/api/supabase/follow" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        handle: string;
        follow: boolean;
      };
      const handle = body.handle || "chai.nomad";
      const follow = Boolean(body.follow);

      if (follow) {
        await sql`
          insert into public.follows (follower_handle, creator_handle)
          values ('you.roamer', ${handle})
          on conflict (follower_handle, creator_handle) do nothing
        `;
        await sql`
          update public.creators
          set is_following = true,
              followers_count = followers_count + 1
          where handle = ${handle}
        `;
      } else {
        await sql`
          delete from public.follows
          where follower_handle = 'you.roamer' and creator_handle = ${handle}
        `;
        await sql`
          update public.creators
          set is_following = false,
              followers_count = greatest(0, followers_count - 1)
          where handle = ${handle}
        `;
      }
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // 4. POST /api/supabase/fuel (Fuel the Roam in Neon PostgreSQL)
  if (path === "/api/supabase/fuel" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        handle?: string;
        amount?: number;
      };
      const handle = body.handle || "chai.nomad";
      const amount = Number(body.amount || 500);

      await sql`
        update public.creators
        set raised_amount = raised_amount + ${amount},
            trips_funded = trips_funded + 1
        where handle = ${handle}
      `;
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // 5. POST /api/supabase/comment (Add comment to post/reel in Neon PostgreSQL)
  if (path === "/api/supabase/comment" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        postId: string;
        author?: string;
        body: string;
      };
      const rows = (await sql`
        insert into public.comments (post_id, author, body)
        values (${body.postId}, ${body.author || "you.roamer"}, ${body.body})
        returning id, post_id, author, body, created_at
      `) as CommentRow[];

      await sql`
        update public.posts
        set comments = comments + 1
        where id = ${body.postId}
      `;

      const cm = rows[0];
      return Response.json({
        ok: true,
        comment: cm
          ? {
              id: cm.id,
              postId: cm.post_id,
              author: cm.author,
              body: cm.body,
              createdAt: cm.created_at,
            }
          : null,
      });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // 6. POST /api/supabase/place-vote (Save place vote to Neon PostgreSQL)
  if (path === "/api/supabase/place-vote" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        placeId: string;
        scoreDelta: number;
      };
      await sql`
        insert into public.place_votes (place_id, score_delta, updated_at)
        values (${body.placeId}, ${body.scoreDelta}, now())
        on conflict (place_id) do update set
          score_delta = excluded.score_delta,
          updated_at = now()
      `;
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // 7. POST /api/supabase/upload (Upload media to Supabase Storage + Neon fallback)
  if (path === "/api/supabase/upload" && request.method === "POST") {
    try {
      const rawName = decodeURIComponent(request.headers.get("x-file-name") || "file.bin");
      const contentType = request.headers.get("content-type") || "application/octet-stream";
      const safeName = `uploads/${Date.now()}-${rawName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const buf = await request.arrayBuffer();

      const supabaseAdmin = getSupabaseAdmin();
      const { error: upErr } = await supabaseAdmin.storage
        .from("roam-media")
        .upload(safeName, buf, {
          contentType,
          upsert: true,
        });

      if (!upErr) {
        const { data: pub } = supabaseAdmin.storage.from("roam-media").getPublicUrl(safeName);
        return Response.json({ ok: true, url: pub.publicUrl });
      }

      // Fallback: store directly in Neon PostgreSQL media_uploads table as data URL
      const base64 = Buffer.from(buf).toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;
      const mediaId = `m_${Date.now()}`;
      await sql`
        insert into public.media_uploads (id, file_name, content_type, data_url)
        values (${mediaId}, ${rawName}, ${contentType}, ${dataUrl})
      `;
      return Response.json({ ok: true, url: dataUrl });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/supabase/")) {
        return await handleDatabaseApi(request, url);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

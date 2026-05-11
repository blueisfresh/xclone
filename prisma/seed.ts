import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcrypt"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d
}

// ─── constants ────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "password123"
const BCRYPT_ROUNDS = 12

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
    const existing = await prisma.user.count()
    if (existing > 0) {
        console.log(`⏭  Database already has ${existing} users — skipping seed.`)
        return
    }

    console.log("🌱 Seeding database…\n")

    const hash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS)

    // ── 1. Roles ──────────────────────────────────────────────────────────────

    const [roleUser, roleAdmin] = await Promise.all([
        prisma.role.create({ data: { id: 1, name: "USER" } }),
        prisma.role.create({ data: { id: 2, name: "ADMIN" } }),
    ])

    console.log(`   ✓ ${2} roles created (USER, ADMIN)`)

    // ── 2. Users ──────────────────────────────────────────────────────────────

    const userData = [
        {
            email: "elias@example.com",
            username: "elias_g",
            name: "Elias G.",
            bio: "Building things on the web. Next.js enthusiast.",
            website: "https://elias.dev",
            dob: new Date("1995-03-12"),
        },
        {
            email: "sarah@example.com",
            username: "sarah_dev",
            name: "Sarah Chen",
            bio: "Frontend dev. CSS witch. I turn Figma files into pixels.",
            website: "https://sarahchen.io",
            dob: new Date("1993-07-22"),
        },
        {
            email: "mike@example.com",
            username: "mike_codes",
            name: "Mike Rodriguez",
            bio: "Fullstack @ startups. Rust on weekends.",
            website: null,
            dob: new Date("1990-11-05"),
        },
        {
            email: "emma@example.com",
            username: "emma_js",
            name: "Emma Wilson",
            bio: "JavaScript forever. React + Node. She/her.",
            website: "https://emmawilson.dev",
            dob: new Date("1997-01-30"),
        },
        {
            email: "alex@example.com",
            username: "alex_tech",
            name: "Alex Thompson",
            bio: "DevOps & infra. Kubernetes whisperer.",
            website: null,
            dob: new Date("1988-05-14"),
        },
        {
            email: "priya@example.com",
            username: "priya_builds",
            name: "Priya Patel",
            bio: "Product engineer. Building in public.",
            website: "https://priyapatel.co",
            dob: new Date("1994-09-18"),
        },
        {
            email: "tom@example.com",
            username: "tom_react",
            name: "Tom Anderson",
            bio: "React core contributor (jk). Just a guy who likes hooks.",
            website: null,
            dob: new Date("1992-12-03"),
        },
        {
            email: "lisa@example.com",
            username: "lisa_ux",
            name: "Lisa Kim",
            bio: "UX engineer. Design systems and accessibility.",
            website: "https://lisakim.design",
            dob: new Date("1996-04-27"),
        },
        {
            email: "dave@example.com",
            username: "dave_systems",
            name: "Dave Martinez",
            bio: "Backend engineer. Postgres is my love language.",
            website: null,
            dob: new Date("1987-08-09"),
        },
        {
            email: "nat@example.com",
            username: "nat_fullstack",
            name: "Natalie Brown",
            bio: "Fullstack dev. tRPC evangelist. Coffee dependent.",
            website: "https://natbrown.dev",
            dob: new Date("1995-06-16"),
        },
        {
            email: "ryan@example.com",
            username: "ryan_backend",
            name: "Ryan O'Brien",
            bio: "Go + Postgres in prod. I write the boring code that works.",
            website: null,
            dob: new Date("1991-02-20"),
        },
        {
            email: "zoe@example.com",
            username: "zoe_frontend",
            name: "Zoe Taylor",
            bio: "UI dev. Tailwind CSS fan. Making the web pretty.",
            website: "https://zoetaylor.xyz",
            dob: new Date("1998-10-11"),
        },
    ]

    const users = await Promise.all(
        userData.map(({ email, username }) =>
            prisma.user.create({
                data: {
                    email,
                    username,
                    hashedPassword: hash,
                    newUser: false,
                    roleId: username === "elias_g" ? roleAdmin.id : roleUser.id,
                },
            })
        )
    )

    console.log(`   ✓ ${users.length} users created (1 admin, ${users.length - 1} regular)`)

    // ── 3. Profiles ───────────────────────────────────────────────────────────

    await Promise.all(
        users.map((user, i) =>
            prisma.profile.create({
                data: {
                    name: userData[i].name,
                    bio: userData[i].bio,
                    website: userData[i].website,
                    dob: userData[i].dob,
                    userId: user.id,
                },
            })
        )
    )

    console.log(`   ✓ ${users.length} profiles created`)

    // ── 4. Posts ──────────────────────────────────────────────────────────────

    const postData = [
        // userIdx 0 — elias_g
        {
            userIdx: 0,
            content:
                "Just shipped a new feature using Next.js App Router. Server components are genuinely a game changer once it clicks.",
            daysAgoN: 1,
        },
        {
            userIdx: 0,
            content:
                "PSA: stop using parseInt() in JS. Use Number() or the unary + operator. parseInt does weird things with non-obvious inputs.",
            daysAgoN: 7,
        },
        {
            userIdx: 0,
            content:
                "Working on a Twitter clone as a side project. Sometimes the best way to understand a product is to rebuild it.",
            daysAgoN: 13,
        },
        // userIdx 1 — sarah_dev
        {
            userIdx: 1,
            content:
                "Hot take: CSS Grid is still underused. Most layouts I see are flex-only when grid would be so much cleaner.",
            daysAgoN: 1,
        },
        {
            userIdx: 1,
            content:
                "Just redesigned my portfolio. Went full minimalist — black, white, and one accent color. Sometimes less really is more.",
            daysAgoN: 7,
        },
        {
            userIdx: 1,
            content:
                "Container queries are going to change how we build responsive components. No more media queries based on viewport when you care about the parent.",
            daysAgoN: 13,
        },
        // userIdx 2 — mike_codes
        {
            userIdx: 2,
            content: "Spent 3 hours debugging a race condition. Turned out to be a missing await. I'm fine.",
            daysAgoN: 2,
        },
        {
            userIdx: 2,
            content:
                "Unpopular opinion: ORMs are fine. Raw SQL everywhere doesn't make you a better engineer, it makes your codebase harder to maintain.",
            daysAgoN: 8,
        },
        {
            userIdx: 2,
            content:
                "git blame is a tool for understanding history, not assigning blame. Act accordingly.",
            daysAgoN: 16,
        },
        // userIdx 3 — emma_js
        {
            userIdx: 3,
            content:
                "useEffect with an empty dependency array is not 'componentDidMount'. Please stop teaching it that way.",
            daysAgoN: 2,
        },
        {
            userIdx: 3,
            content:
                "If your component needs more than 3 props to render correctly, it's probably doing too much.",
            daysAgoN: 8,
        },
        {
            userIdx: 3,
            content:
                "Just learned about the React compiler. If it works as advertised, we're deleting a lot of useMemo calls soon.",
            daysAgoN: 14,
        },
        // userIdx 4 — alex_tech
        {
            userIdx: 4,
            content:
                "Kubernetes tip: if your pod keeps restarting, check your resource limits before anything else. 90% of the time it's OOM.",
            daysAgoN: 3,
        },
        {
            userIdx: 4,
            content:
                "Docker tip: always pin your base image versions. 'node:latest' in production is asking for trouble.",
            daysAgoN: 9,
        },
        {
            userIdx: 4,
            content:
                "Your staging environment should be identical to production. If it isn't, you don't have a staging environment.",
            daysAgoN: 16,
        },
        // userIdx 5 — priya_builds
        {
            userIdx: 5,
            content:
                "Building in public day 14: hit 200 users on my side project. Still can't believe people are actually using it 🎉",
            daysAgoN: 3,
        },
        {
            userIdx: 5,
            content:
                "I've been journaling my side project progress every day for 2 weeks. Highly recommend — it keeps you accountable.",
            daysAgoN: 9,
        },
        {
            userIdx: 5,
            content:
                "Building in public day 7: first paying customer! It's $5/mo but it means more than any VC meeting ever could.",
            daysAgoN: 14,
        },
        // userIdx 6 — tom_react
        {
            userIdx: 6,
            content: "React Query v5 is so good. The devtools alone are worth it.",
            daysAgoN: 4,
        },
        {
            userIdx: 6,
            content:
                "The fact that React still doesn't have a built-in way to do data fetching is wild to me.",
            daysAgoN: 10,
        },
        {
            userIdx: 6,
            content:
                "memo() doesn't prevent renders, it prevents renders *with the same props*. Know the difference.",
            daysAgoN: 17,
        },
        // userIdx 7 — lisa_ux
        {
            userIdx: 7,
            content:
                "Accessibility is not a feature, it's a requirement. If your app can't be navigated by keyboard you have a bug.",
            daysAgoN: 4,
        },
        {
            userIdx: 7,
            content:
                "Design systems tip: start with typography and spacing tokens. Everything else derives from those two.",
            daysAgoN: 10,
        },
        {
            userIdx: 7,
            content:
                "Every time I audit an app for accessibility I find the same 5 things: missing labels, poor contrast, no focus styles, div buttons, and missing alt text.",
            daysAgoN: 15,
        },
        // userIdx 8 — dave_systems
        {
            userIdx: 8,
            content:
                "Postgres row-level security is criminally underrated. Your app server should not be the only thing standing between users and each other's data.",
            daysAgoN: 5,
        },
        {
            userIdx: 8,
            content: "EXPLAIN ANALYZE is the most important SQL command you're not using enough.",
            daysAgoN: 11,
        },
        {
            userIdx: 8,
            content:
                "Indexing strategy that works 90% of the time: index foreign keys, index columns you filter/sort by, composite index for common query patterns.",
            daysAgoN: 15,
        },
        // userIdx 9 — nat_fullstack
        {
            userIdx: 9,
            content:
                "tRPC + Next.js is the best DX I've ever had. End-to-end type safety without a single line of manual type definition.",
            daysAgoN: 5,
        },
        {
            userIdx: 9,
            content: "Hot take: Next.js is a backend framework that happens to do SSR. Treat it like one.",
            daysAgoN: 11,
        },
        {
            userIdx: 9,
            content:
                "Zod is the library I didn't know I needed until I used it. Runtime validation + TypeScript types from one schema? Yes please.",
            daysAgoN: 17,
        },
        // userIdx 10 — ryan_backend
        {
            userIdx: 10,
            content:
                "Go's error handling is verbose, but after 2 years it's actually made me write more reliable code. The friction is the point.",
            daysAgoN: 6,
        },
        {
            userIdx: 10,
            content:
                "A service that is boring and reliable is infinitely more valuable than one that is clever and fragile.",
            daysAgoN: 12,
        },
        {
            userIdx: 10,
            content:
                "The best code review comment I ever received: 'this is clever, which means it'll confuse everyone including you in 6 months'",
            daysAgoN: 18,
        },
        // userIdx 11 — zoe_frontend
        {
            userIdx: 11,
            content:
                "Tailwind CSS v4 dropped and the new config system is *chef's kiss*. No more tailwind.config.js.",
            daysAgoN: 6,
        },
        {
            userIdx: 11,
            content:
                "One thing I love about Tailwind: it forces you to think in a consistent spacing/sizing scale. No more magic numbers.",
            daysAgoN: 12,
        },
        {
            userIdx: 11,
            content: "Serif fonts in UI are having a moment and I'm here for it.",
            daysAgoN: 18,
        },
    ]

    const posts = []
    for (const { userIdx, content, daysAgoN } of postData) {
        const post = await prisma.post.create({
            data: {
                content,
                createdAt: daysAgo(daysAgoN),
                userId: users[userIdx].id,
            },
        })
        posts.push(post)
    }

    console.log(`   ✓ ${posts.length} posts created`)

    // ── 5. Replies ────────────────────────────────────────────────────────────

    const replyData = [
        {
            userIdx: 1,
            parentIdx: 0,
            content:
                "Agreed — the mental model shift takes a while. Spent a week confused before it finally clicked.",
        },
        {
            userIdx: 3,
            parentIdx: 0,
            content:
                "Server components + Suspense is the combo that sold me. Streaming feels like magic.",
        },
        {
            userIdx: 0,
            parentIdx: 3,
            content: "100%. I rewrote a flex layout in grid last week and cut the CSS by half.",
        },
        {
            userIdx: 4,
            parentIdx: 6,
            content:
                "Classic. I once spent a day on a bug that was a missing semicolon inside a template string.",
        },
        {
            userIdx: 2,
            parentIdx: 9,
            content: "Thank you! This misconception is everywhere in beginner tutorials.",
        },
        {
            userIdx: 7,
            parentIdx: 9,
            content:
                "Even worse: people using useEffect for derived state instead of just computing it inline.",
        },
        {
            userIdx: 9,
            parentIdx: 15,
            content: "Congrats! 200 users is huge. What's the product if you don't mind sharing?",
        },
        {
            userIdx: 5,
            parentIdx: 15,
            content:
                "It's a habit tracker with a public streak profile. Still in beta — DM me if you want early access!",
        },
        {
            userIdx: 1,
            parentIdx: 21,
            content:
                "This. I do accessibility audits and the keyboard navigation issues alone are staggering.",
        },
        {
            userIdx: 2,
            parentIdx: 7,
            content:
                "Exactly. Prisma has saved me from so many silly typos in SQL strings. Worth the abstraction.",
        },
        {
            userIdx: 6,
            parentIdx: 19,
            content: "Server components fix this entirely. Fetch in the component, no useEffect needed.",
        },
        {
            userIdx: 10,
            parentIdx: 24,
            content:
                "EXPLAIN ANALYZE + pganalyze together are unbeatable. Find the slow query, understand why, fix it.",
        },
        {
            userIdx: 0,
            parentIdx: 2,
            content: "Which parts are you finding hardest to replicate? I'd guess the feed algorithm.",
        },
        {
            userIdx: 3,
            parentIdx: 17,
            content: "That first dollar is everything. Validates the whole thing is real.",
        },
        {
            userIdx: 5,
            parentIdx: 17,
            content: "From $5 to $500 is the same mental leap. You've already done the hard part.",
        },
        {
            userIdx: 8,
            parentIdx: 27,
            content:
                "tRPC is great but I'm curious how you handle auth in server actions vs tRPC procedures.",
        },
        {
            userIdx: 11,
            parentIdx: 33,
            content: "The CSS-first config is so much better. Feels like it was always meant to work this way.",
        },
        {
            userIdx: 4,
            parentIdx: 13,
            content:
                "Also: never use 'latest' for Postgres either. Learned that one the hard way on a Friday deploy.",
        },
    ]

    const replies = []
    for (const { userIdx, parentIdx, content } of replyData) {
        const reply = await prisma.post.create({
            data: {
                content,
                createdAt: daysAgo(Math.floor(Math.random() * 5)),
                userId: users[userIdx].id,
                parentPostId: posts[parentIdx].id,
            },
        })
        replies.push(reply)
    }

    console.log(`   ✓ ${replies.length} replies created`)

    const allPosts = [...posts, ...replies]

    // ── 6. Likes ──────────────────────────────────────────────────────────────

    const likeSet = new Set<string>()
    const likePairs: { postId: number; userId: number }[] = []

    // Popular posts get more likes
    const popularPostIndices = [0, 3, 9, 15, 21, 24, 27, 31, 33]
    for (const postIdx of popularPostIndices) {
        const post = allPosts[postIdx]
        for (const user of users) {
            if (user.id === post.userId) continue
            if (Math.random() < 0.8) {
                const key = `${post.id}-${user.id}`
                if (!likeSet.has(key)) {
                    likeSet.add(key)
                    likePairs.push({ postId: post.id, userId: user.id })
                }
            }
        }
    }

    // Random likes on all other posts
    for (const post of allPosts) {
        for (const user of users) {
            if (user.id === post.userId) continue
            if (Math.random() < 0.3) {
                const key = `${post.id}-${user.id}`
                if (!likeSet.has(key)) {
                    likeSet.add(key)
                    likePairs.push({ postId: post.id, userId: user.id })
                }
            }
        }
    }

    await prisma.like.createMany({
        data: likePairs.map(({ postId, userId }) => ({
            postId,
            userId,
            createdAt: daysAgo(Math.floor(Math.random() * 20)),
        })),
    })

    console.log(`   ✓ ${likePairs.length} likes created`)

    // ── 7. Reposts ────────────────────────────────────────────────────────────

    const repostSet = new Set<string>()
    const repostPairs: { postId: number; userId: number }[] = []

    for (const post of allPosts) {
        for (const user of users) {
            if (user.id === post.userId) continue
            if (Math.random() < 0.15) {
                const key = `${post.id}-${user.id}`
                if (!repostSet.has(key)) {
                    repostSet.add(key)
                    repostPairs.push({ postId: post.id, userId: user.id })
                }
            }
        }
    }

    await prisma.repost.createMany({
        data: repostPairs.map(({ postId, userId }) => ({
            postId,
            userId,
            createdAt: daysAgo(Math.floor(Math.random() * 20)),
        })),
    })

    console.log(`   ✓ ${repostPairs.length} reposts created`)

    // ── 8. Follows ────────────────────────────────────────────────────────────

    const followSet = new Set<string>()
    const followPairs: { userId: number; followerId: number }[] = []

    // elias_g is followed by everyone
    for (let i = 1; i < users.length; i++) {
        const key = `${users[0].id}-${users[i].id}`
        followSet.add(key)
        followPairs.push({ userId: users[0].id, followerId: users[i].id })
    }

    // Random follow graph
    for (let a = 0; a < users.length; a++) {
        for (let b = 0; b < users.length; b++) {
            if (a === b) continue
            const key = `${users[b].id}-${users[a].id}`
            if (!followSet.has(key) && Math.random() < 0.35) {
                followSet.add(key)
                followPairs.push({ userId: users[b].id, followerId: users[a].id })
            }
        }
    }

    await prisma.userFollows.createMany({ data: followPairs })

    console.log(`   ✓ ${followPairs.length} follows created`)

    // ── 9. Chats + Messages ───────────────────────────────────────────────────

    const chatConvos = [
        {
            userIdx: 0,
            participantIdx: 1,
            messages: [
                { fromIdx: 0, text: "hey! loved your CSS Grid post", daysAgoN: 3 },
                { fromIdx: 1, text: "thanks!! been wanting to write that one for a while", daysAgoN: 3 },
                { fromIdx: 0, text: "do you have any resource recommendations for learning it properly?", daysAgoN: 3 },
                {
                    fromIdx: 1,
                    text: "CSS Tricks complete guide is still the best IMO. And just building stuff with it honestly",
                    daysAgoN: 2,
                },
                { fromIdx: 0, text: "nice, I'll check it out. thanks!", daysAgoN: 2 },
            ],
        },
        {
            userIdx: 5,
            participantIdx: 9,
            messages: [
                { fromIdx: 9, text: "congrats on the paying customer! that's huge", daysAgoN: 14 },
                { fromIdx: 5, text: "thanks so much!! honestly still surreal", daysAgoN: 14 },
                { fromIdx: 9, text: "how are you handling payments? Stripe?", daysAgoN: 13 },
                {
                    fromIdx: 5,
                    text: "yeah Stripe with their hosted checkout. made it super easy to get started",
                    daysAgoN: 13,
                },
                { fromIdx: 9, text: "smart. no point reinventing that wheel", daysAgoN: 13 },
                { fromIdx: 5, text: "exactly! keep the infra boring so you can focus on the product", daysAgoN: 12 },
            ],
        },
        {
            userIdx: 8,
            participantIdx: 10,
            messages: [
                {
                    fromIdx: 10,
                    text: "your postgres tips are gold. any good books you'd recommend?",
                    daysAgoN: 7,
                },
                {
                    fromIdx: 8,
                    text: "The Art of PostgreSQL by Dimitri Fontaine is excellent. Also just reading the official docs — they're surprisingly good",
                    daysAgoN: 7,
                },
                { fromIdx: 10, text: "added to my reading list, cheers", daysAgoN: 6 },
                { fromIdx: 8, text: "let me know what you think once you get into it", daysAgoN: 6 },
            ],
        },
        {
            userIdx: 3,
            participantIdx: 6,
            messages: [
                {
                    fromIdx: 6,
                    text: "fellow React nerd here 👋 what do you think of the new compiler?",
                    daysAgoN: 5,
                },
                {
                    fromIdx: 3,
                    text: "cautiously optimistic. the auto-memoization sounds great but I want to see how it handles edge cases in real codebases",
                    daysAgoN: 5,
                },
                {
                    fromIdx: 6,
                    text: "same. I'll wait for the dust to settle before migrating anything at work",
                    daysAgoN: 4,
                },
                { fromIdx: 3, text: "exactly. let others find the bugs first lol", daysAgoN: 4 },
            ],
        },
        {
            userIdx: 2,
            participantIdx: 7,
            messages: [
                {
                    fromIdx: 7,
                    text: "saw your ORM post — curious what you use day to day?",
                    daysAgoN: 8,
                },
                { fromIdx: 2, text: "Prisma mostly. drizzle for smaller projects where I want less overhead", daysAgoN: 8 },
                { fromIdx: 7, text: "interesting combo. do you ever miss writing raw SQL?", daysAgoN: 7 },
                {
                    fromIdx: 2,
                    text: "sometimes for complex queries. but honestly Prisma's $queryRaw covers 95% of those cases",
                    daysAgoN: 7,
                },
            ],
        },
    ]

    let totalMessages = 0
    for (const convo of chatConvos) {
        const chat = await prisma.chat.create({
            data: {
                userId: users[convo.userIdx].id,
                participantId: users[convo.participantIdx].id,
            },
        })
        for (const msg of convo.messages) {
            await prisma.message.create({
                data: {
                    content: msg.text,
                    createdAt: daysAgo(msg.daysAgoN),
                    read: true,
                    userId: users[msg.fromIdx].id,
                    chatId: chat.id,
                },
            })
            totalMessages++
        }
    }

    console.log(`   ✓ ${chatConvos.length} chats / ${totalMessages} messages created`)

    // ── 10. Notifications ─────────────────────────────────────────────────────

    type NotificationInput = {
        type: string
        objectType: string
        objectUri: number
        read: boolean
        senderId: number
        recipientId: number
        createdAt: Date
    }

    const notifications: NotificationInput[] = []

    // Like notifications
    for (const { postId, userId } of likePairs) {
        const post = allPosts.find((p) => p.id === postId)
        if (!post?.userId || post.userId === userId) continue
        notifications.push({
            type: "like",
            objectType: "post",
            objectUri: postId,
            read: Math.random() > 0.4,
            senderId: userId,
            recipientId: post.userId,
            createdAt: daysAgo(Math.floor(Math.random() * 15)),
        })
    }

    // Follow notifications
    for (const { userId, followerId } of followPairs) {
        notifications.push({
            type: "follow",
            objectType: "user",
            objectUri: followerId,
            read: Math.random() > 0.4,
            senderId: followerId,
            recipientId: userId,
            createdAt: daysAgo(Math.floor(Math.random() * 20)),
        })
    }

    // Reply notifications
    for (const reply of replies) {
        const parent = allPosts.find((p) => p.id === reply.parentPostId)
        if (!parent?.userId || !reply.userId || parent.userId === reply.userId) continue
        notifications.push({
            type: "reply",
            objectType: "post",
            objectUri: reply.id,
            read: Math.random() > 0.3,
            senderId: reply.userId,
            recipientId: parent.userId,
            createdAt: reply.createdAt,
        })
    }

    await prisma.notification.createMany({ data: notifications })

    console.log(`   ✓ ${notifications.length} notifications created`)

    // ── Summary ───────────────────────────────────────────────────────────────

    console.log(`
✅ Seed complete!

   Users:         ${users.length}
   Posts:         ${posts.length}
   Replies:       ${replies.length}
   Likes:         ${likePairs.length}
   Reposts:       ${repostPairs.length}
   Follows:       ${followPairs.length}
   Chats:         ${chatConvos.length}
   Messages:      ${totalMessages}
   Notifications: ${notifications.length}

   All accounts use password: "${SEED_PASSWORD}"

   Accounts:
${userData.map((u) => `   • ${u.username.padEnd(16)} ${u.email}`).join("\n")}
`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => pool.end())

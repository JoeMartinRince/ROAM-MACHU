#  Roam Machu — Social Travel Discovery & Community Trip Funding

**Roam Machu** (`മച്ചു`) is a mobile-first social travel discovery and creator trip-funding web application built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Leaflet**. Travellers share visual stories and reels across Kerala and India, vote on places using **Pwoli** (upvote) and **Waste** (downvote), climb the live destination leaderboard, and crowd-fund upcoming creator expeditions through **Trip Funds**.
               
---

## ✨ Key Features

- **Discover Feed & Live Trips (`/`)**:
  - Story-style live trip circles, destination & creator feed, and interactive **ActionStack** controls.
  - Custom **Pwoli** paper-plane takeoff animation (curved flight path + dotted trail + departure-board digit flip) and **Waste** paper-plane-into-dustbin throw animation.
  - Real-time **Comments Drawer** and **Share Drawer** on every post and reel.
- **Explore Map & Ranked Leaderboard (`/explore`)**:
  - Interactive Leaflet map with custom score markers alongside a live-ranked leaderboard of destinations (Alleppey, Munnar, Varkala, Ladakh, Hampi, etc.) where every post or place vote dynamically moves the destination's score.
- **Full-Screen Vertical Reels (`/reels`)**:
  - Snap-scrolling vertical video feed with creator profile links, place badges, and animated voting/commenting/sharing.
- **Demo Login & Multi-Account Switcher (`Settings → Demo login`)**:
  - Switch instantaneously between **6 seed creator accounts** and **Guest traveller** on a single device with no password required.
  - Active account persists in `localStorage` (`roam-active-user`), shows a subtle top banner (`Demo mode: {name}`), and displays a `Demo: signed in as {name}` chip on `/profile`.
  - Includes **Log out** (switches back to Guest) and **Reset demo data** (restores funds, contributions, follows, notifications, wallet balances, and profile edits back to the seed state).
- **End-to-End Trip Funding, Wallets & Notifications (`/profile` & `/u/$handle`)**:
  - Each seed account starts with a **₹5,000** wallet balance (**₹2,000** for Guest).
  - Backing a trip deducts from the contributor's wallet, credits the fund's raised total, adds the contributor's real name and avatar to the **Supporters Wall**, lists the contribution under **Trips I fueled (Funded by me)** on the contributor's profile, and sends a real-time notification to the creator's notification bell.
  - Follows persist per account and send follower notifications to the target creator.
                   
---           

## 👥 Demo Accounts (`Settings → Demo login`)

Open **Profile (`/profile`) → Settings gear (`⚙️`)** (or click **Settings** in the desktop sidebar footer, or tap the top **Demo mode** banner) to switch accounts with one tap:

| Name                | Handle           | Initial Wallet | Seed Trip Funds                                                                                                                                            |
| :------------------ | :--------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Anu Joseph**      | `@chai.nomad`    | `₹5,000`       | **3 Funds**: _Spiti Valley High Passes Exploration_ (`₹18.4k / ₹30k`), _Munnar Tea Trail_ (`₹8.2k / ₹8k` · Funded), _Varkala Cliff Sunset_ (`₹2.8k / ₹5k`) |
| **Rahul Nair**      | `@roamwithrahul` | `₹5,000`       | **2 Funds**: _Western Ghats Monsoon Bike Odyssey_ (`₹15.6k / ₹22k`), _Vembanad Lake Kayaking_ (`₹12k / ₹12k` · Funded)                                     |
| **Meera Menon**     | `@monsoon.meera` | `₹5,000`       | **0 Funds** (Great for testing the _"Plan your first trip fund"_ empty state)                                                                              |
| **Arjun Das**       | `@arjun.wanders` | `₹5,000`       | **1 Fund**: _Lost Temples of Hampi Photo Book_ (`₹9.2k / ₹15k`)                                                                                            |
| **Fathima Rasheed** | `@fathima.fly`   | `₹5,000`       | **1 Fund**: _Hampta Pass Snow Trek Film_ (`₹19.5k / ₹25k`)                                                                                                 |
| **Jerin Thomas**    | `@jerin.on.road` | `₹5,000`       | **0 Funds**                                                                                                                                                |
| **Guest traveller** | `@guest`         | `₹2,000`       | Default local account; fuels trips as `"Anonymous traveller"` by default                                                                                   |

---

## 🧪 End-to-End Demo Walkthrough

1. **Sign in as Rahul**: Open **Settings (`⚙️`) → Demo login** and tap **Rahul Nair (`@roamwithrahul`)**.
2. **Follow & Fuel Anu**: Visit **Anu Joseph's** profile (`/u/chai.nomad`). Note that **Follow** and **Fuel the trip** are visible (and **Edit profile** is not). Tap **Follow**, then tap **Fuel this trip** on _Spiti Valley High Passes Exploration_ and confirm **₹500**.
   - The fund's progress bar and **Supporters Wall** update immediately with Rahul's name and avatar.
   - Rahul's wallet balance drops from `₹5,000` to `₹4,500`, and the contribution appears in Rahul's **Trips I fueled** list on `/profile`.
3. **Switch to Anu**: Open **Settings (`⚙️`)** and tap **Anu Joseph (`@chai.nomad`)**.
   - Anu's notification bell shows **2 unread notifications** (_"Rahul started following you"_ and _"Rahul fueled ₹500 on Spiti Valley High Passes Exploration"_). Tapping the bell opens the **Notifications** sheet and marks them as read.
   - Anu's own profile (`/profile`) shows **Edit profile** (no Follow or Fuel buttons) and **Received ₹29,900** across her trip funds.
4. **Switch to Guest**: Open **Settings (`⚙️`)** and tap **Log out** (or select **Guest traveller**), then fuel any creator's fund using the `"Anonymous traveller"` default name.

---

## 🛠️ Tech Stack       

- **Framework**: [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + Lucide Icons + Vaul Drawers + Sonner Toasts
- **Maps**: Leaflet (`leaflet`)
- **State & Persistence**: `useSyncExternalStore` reactive store (`src/lib/store.ts`) backed by `localStorage`

---

## 📦 Getting Started

```bash                                                                 
cd exact-screenshot-clone-main
bun install
bun run dev
```

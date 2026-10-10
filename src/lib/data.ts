import backwaters from "@/assets/backwaters.jpg";
import hills from "@/assets/hills.jpg";
import beach from "@/assets/beach.jpg";
import temple from "@/assets/temple.jpg";
import food from "@/assets/food.jpg";
import trek from "@/assets/trek.jpg";
import fort from "@/assets/fort.jpg";
import waterfall from "@/assets/waterfall.jpg";

export const photos = { backwaters, hills, beach, temple, food, trek, fort, waterfall };

export type Place = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  baseScore: number;
  image: string;
};
export type Creator = { handle: string; name: string; live?: boolean };
export type Post = {
  id: string;
  creator: string;
  placeId: string;
  caption: string;
  image?: string;
  video?: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  shares: number;
  views: number;
};

export const places: Place[] = [
  {
    id: "alleppey",
    name: "Alleppey Backwaters",
    region: "Kerala",
    lat: 9.4981,
    lng: 76.3388,
    baseScore: 94,
    image: backwaters,
  },
  {
    id: "munnar",
    name: "Munnar",
    region: "Kerala",
    lat: 10.0889,
    lng: 77.0595,
    baseScore: 92,
    image: hills,
  },
  {
    id: "varkala",
    name: "Varkala Cliff",
    region: "Kerala",
    lat: 8.7379,
    lng: 76.7163,
    baseScore: 89,
    image: beach,
  },
  {
    id: "kochi",
    name: "Fort Kochi",
    region: "Kerala",
    lat: 9.9658,
    lng: 76.2421,
    baseScore: 86,
    image: food,
  },
  {
    id: "athirappilly",
    name: "Athirappilly Falls",
    region: "Kerala",
    lat: 10.2851,
    lng: 76.5698,
    baseScore: 88,
    image: waterfall,
  },
  {
    id: "wayanad",
    name: "Wayanad",
    region: "Kerala",
    lat: 11.6854,
    lng: 76.132,
    baseScore: 85,
    image: hills,
  },
  {
    id: "kovalam",
    name: "Kovalam",
    region: "Kerala",
    lat: 8.4004,
    lng: 76.9787,
    baseScore: 80,
    image: beach,
  },
  {
    id: "thekkady",
    name: "Thekkady",
    region: "Kerala",
    lat: 9.6031,
    lng: 77.1615,
    baseScore: 79,
    image: waterfall,
  },
  {
    id: "guruvayur",
    name: "Guruvayur Temple",
    region: "Kerala",
    lat: 10.5946,
    lng: 76.0411,
    baseScore: 77,
    image: temple,
  },
  {
    id: "kumarakom",
    name: "Kumarakom",
    region: "Kerala",
    lat: 9.6175,
    lng: 76.4301,
    baseScore: 82,
    image: backwaters,
  },
  {
    id: "vagamon",
    name: "Vagamon",
    region: "Kerala",
    lat: 9.6862,
    lng: 76.9052,
    baseScore: 81,
    image: hills,
  },
  {
    id: "bekal",
    name: "Bekal Fort",
    region: "Kerala",
    lat: 12.3925,
    lng: 75.0332,
    baseScore: 74,
    image: beach,
  },
  {
    id: "hampi",
    name: "Hampi",
    region: "Karnataka",
    lat: 15.335,
    lng: 76.46,
    baseScore: 90,
    image: temple,
  },
  {
    id: "madurai",
    name: "Meenakshi Temple",
    region: "Tamil Nadu",
    lat: 9.9195,
    lng: 78.1193,
    baseScore: 87,
    image: temple,
  },
  {
    id: "jaipur",
    name: "Hawa Mahal",
    region: "Rajasthan",
    lat: 26.9239,
    lng: 75.8267,
    baseScore: 88,
    image: fort,
  },
  {
    id: "goa",
    name: "Palolem, Goa",
    region: "Goa",
    lat: 15.01,
    lng: 74.0232,
    baseScore: 84,
    image: beach,
  },
  {
    id: "manali",
    name: "Manali",
    region: "Himachal",
    lat: 32.2432,
    lng: 77.1892,
    baseScore: 86,
    image: trek,
  },
  {
    id: "ladakh",
    name: "Leh Ladakh",
    region: "Ladakh",
    lat: 34.1526,
    lng: 77.5771,
    baseScore: 93,
    image: trek,
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    region: "Uttarakhand",
    lat: 30.0869,
    lng: 78.2676,
    baseScore: 83,
    image: trek,
  },
  {
    id: "kodaikanal",
    name: "Kodaikanal",
    region: "Tamil Nadu",
    lat: 10.2381,
    lng: 77.4892,
    baseScore: 78,
    image: hills,
  },
];

export const creators: Creator[] = [
  { handle: "chai.nomad", name: "Anu Joseph", live: true },
  { handle: "roamwithrahul", name: "Rahul Nair", live: true },
  { handle: "backpackbinu", name: "Binu Thomas" },
  { handle: "meera.maps", name: "Meera K" },
  { handle: "trekkingtess", name: "Tess Mathew", live: true },
  { handle: "foodiefaiz", name: "Faiz Ali" },
];

const V = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";

const raw: [string, string, string, string, number][] = [
  [
    "chai.nomad",
    "alleppey",
    "Woke up on a houseboat. Never going back to alarms 🛶",
    backwaters,
    12400,
  ],
  ["roamwithrahul", "munnar", "Tea, mist and zero network. Perfect Sunday.", hills, 9800],
  ["meera.maps", "varkala", "Cliff cafés at sunset hit different 🌅", beach, 15100],
  ["foodiefaiz", "kochi", "Parotta + beef fry at 11pm, Fort Kochi style 🔥", food, 8700],
  [
    "trekkingtess",
    "ladakh",
    "4,800m and still climbing. Legs said no, heart said yes.",
    trek,
    21000,
  ],
  ["backpackbinu", "athirappilly", "The Niagara of India is LOUD. Go in monsoon.", waterfall, 7600],
  ["meera.maps", "jaipur", "Pink city sunrise before the crowds 🩷", fort, 11200],
  ["chai.nomad", "hampi", "Boulders, ruins and the best sunset point in the south.", temple, 6400],
  ["roamwithrahul", "kumarakom", "Slow canoe through the village canals.", backwaters, 5300],
  ["foodiefaiz", "goa", "Fish thali under a palm tree. That's it. That's the post.", food, 9100],
  ["trekkingtess", "manali", "Hampta Pass day 2. Snow everywhere.", trek, 13800],
  ["backpackbinu", "madurai", "Every inch of this gopuram tells a story.", temple, 4900],
  ["chai.nomad", "wayanad", "Chembra peak heart lake trek ✅", hills, 6800],
  ["meera.maps", "kovalam", "Lighthouse beach, warm water, no plans.", beach, 5700],
  [
    "roamwithrahul",
    "thekkady",
    "Bamboo rafting in Periyar. Spotted an elephant herd!",
    waterfall,
    7200,
  ],
];

export const seedPosts: Post[] = raw.map(([creator, placeId, caption, image, up], i) => ({
  id: `p${i + 1}`,
  creator,
  placeId,
  caption,
  image,
  upvotes: up,
  downvotes: Math.round(up * 0.04),
  comments: Math.round(up * 0.03),
  shares: Math.round(up * 0.02),
  views: up * 9,
}));

export const seedReels: Post[] = [
  ["ForBiggerEscapes.mp4", "trekkingtess", "ladakh", "Road trip energy only 🏍️", backwaters],
  ["ForBiggerJoyrides.mp4", "roamwithrahul", "munnar", "Hairpin bends to the clouds", hills],
  ["ForBiggerFun.mp4", "chai.nomad", "varkala", "Golden hour, every hour", beach],
  ["ForBiggerMeltdowns.mp4", "foodiefaiz", "kochi", "Night food crawl in Kochi", food],
].map(([v, creator, placeId, caption, image], i) => ({
  id: `r${i + 1}`,
  creator,
  placeId,
  caption,
  image,
  video: V + v,
  upvotes: 5000 + i * 1700,
  downvotes: 120 + i * 30,
  comments: 240 + i * 50,
  shares: 90 + i * 20,
  views: 60000 + i * 21000,
}));

export const formatCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

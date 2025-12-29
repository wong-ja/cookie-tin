# Hackmas-HackMars-2.0: 🍪 Cookie Tin

This project was created for the [Hackmas-HackMars-2.0](https://hackmars-2.devpost.com/) 2025 hackathon.

---

## Track Selection

### (Own Choice) 🎄 Christmas-themed project

**Cookie Tin** is designed to help users track overconsumption and overspending during the happy holiday season. Built for speed and transparency, it turns the "stress of shopping" into a manageable and interactive experience.

### Team Members (Solo Project)

1. Juana Wong - [wong-ja](https://github.com/wong-ja)

### Deployment

Deployed [here]()

---

## Problem Description

### Christmas holiday shopping. Easy-to-forget consequences. 

Christmas holiday shopping often leads to "Holiday Amnesia" -- where we lose track of the cumulative effect of multiple purchases and spending sprees.


🍪 **Cookie Tin** 🍪 tracks:
- 🍫 **overconsumption** (through food barcodes) -- to help you stay on top of your holiday health goals
- 🎁 **overspending** (through $-budgets) -- to help you manage your expenses with a set holiday budget


---

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Scanning:** Html5-QRCode API
- **Database:** LocalStorage 
  - Privacy-focused, no account needed

---

## Features

### 1. The "Tin" Engine
- **Multi-Year Sessions:** Archive previous holiday sessions (eg. "Christmas 2024") and start fresh for 2025.
- **Smart Budgets:** Set a monetary limit and monitor your spending spree, as the UI transitions from **Emerald Green** to **Code Red**.

### 2. Cookie Scanner
- **Barcode Scanner:** Uses the **Open Food Facts API** to identify snacks and foods you've purchased.
- **Nutrition Awareness:** Displays calorie information before you log the item.

### 3. Visual Dashboard
- **History Tracking:** Revisit previous holiday sessions to compare spending habits over time.
- **Holiday Aesthetics:** A simple, warm "Cookie-themed" app to match the festive holiday spirit!

---

## Installation & Setup

1. Clone the app and install

```
git clone https://github.com/wong-ja/cookie-tin.git
```

```
npm install
```

2. Run the app

```
npm run dev
```

- access the app on `http://localhost:3000/`

---

## Next Steps:



---

App idea:
- simple, aesthetically nice app
- input constraints (eg. select/specify constraints for this holiday season)
  - select holidays (with default/inbuilt date ranges)
  - custom range (date picker)
  - budget (number limit)
- users will input what they paid for ($ amounts), or foods purchased (barcode/nutrition scanner)
- quick analysis of overconsumption or overspending
- cute holiday-themed graphics for ranges [in the clear & good / tricky... careful... reaching the limit / code RED! stop now!]
- dashboard to track previous sessions?

### User

Anyone who shops for holiday season.

### Solution (what it does + why it matters)

Helps people become more transparent, accountable, financially responsible. For independent users or big families celebrating the wintry holiday season.

---

## Demo Video (3–5 min)

show the user journey and working features.

---

## Usage / Installation / Tech Stack / Etc.

...

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

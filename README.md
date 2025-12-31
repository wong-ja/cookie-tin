# Hackmas-HackMars-2.0: 🍪 Cookie Tin

This project was created for the [Hackmas-HackMars-2.0](https://hackmars-2.devpost.com/) 2025 hackathon.

---

App idea:
- input constraints (eg. select/specify constraints for this holiday season)
  - select holidays (with default/inbuilt date ranges)
  - custom range (date picker)
  - budget (number limit)
- users will input what they paid for ($ amounts), or foods purchased (barcode/nutrition scanner)
- quick analysis of overconsumption or overspending
- cute holiday-themed graphics for ranges [in the clear & good / tricky... careful... reaching the limit / code RED! stop now!]
- dashboard to track previous sessions?


---

## Track Selection

### (Own Choice) 🎄 Christmas-themed project

**Cookie Tin** is designed to help users track overconsumption and overspending during the happy holiday season. Built for speed and transparency, it turns the "stress of shopping" into a manageable and interactive experience.

### Team Members (Solo Project)

1. Juana Wong - [wong-ja](https://github.com/wong-ja)


---

## Demo Video (3–5 min)

### Deployment 

> Deployed [here]()

### Demo 

> show the user journey and working features.

---

## Problem Description

### Christmas holiday shopping. Easy-to-forget consequences. 

Christmas holiday shopping often leads to "Holiday Amnesia" -- where we lose track of the cumulative effect of multiple purchases and spending sprees.

***Cookie Tin** helps people become more transparent, accountable, fiscally responsible. For individuals & families celebrating and spending for the wintry holiday season.*

🍪 **Cookie Tin** 🍪 tracks:
- 🍫 **overconsumption** (through food barcodes) -- to help you stay on top of your holiday health goals
- 🎁 **overspending** (through $-budgets) -- to help you manage your expenses with a set holiday budget


---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Scanning:** Html5-QRCode API
- **Feedback/Haptics**: Canvas-Confetti & Web Vibration API
- **Database:** LocalStorage (Browser)
  - Privacy-focused, no user data collected/stored, no account needed

---

## Features
- **Multi-Year Sessions:** Archive previous holiday sessions (eg. "Christmas 2025") and start fresh for every upcoming holiday (eg. Christmas 2026).
- **Dual-Limit Budgeting:** Set monetary and calorie limits, and monitor your spending spree with responsive UI transitions as you add items to the session.
- **Holiday Counntdown**: Automatic & daily countdowns as you get closer to the selected holiday.
- **Barcode Scanning:** Uses the **Open Food Facts API** to identify snacks and foods you've purchased.
- **Nutrition Awareness:** Displays calorie information before you log the item.
- **Haptic Feedback**: Generates a randomized "Success" celebration with physical vibration and festive UI patterns, or a warning "Puzzle" if new items exceed the holiday limits.
- **Guilt Guard**: Generates a warning "Puzzle" that users must solve, if they want to add new items that exceed the holiday budget/calorie limits. 
- **History Tracking:** Manage multiple "Tins" at once with the ability to archive, revisit, or delete past holiday sessions, and to compare spending habits over time.
- **Holiday Aesthetics:** A simple, warm "Cookie-themed" app to match the festive holiday spirit!
- **Visual Progress Insights**: Dynamic progress bars that shift from festive to warning, as you approach your tin's capacity.
- **Social Media Sharing**: Export your holiday "Report Card" to social media platforms!

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

- [ ] Track spending for specific individuals or groups, with "Gift Receipts" and "Lists" 
- [ ] Shared Tins to sync group/family spending budgets between multiple family members or individuals (using cloud database)
- [x] Share **Cookie Tins** & export session data to social media platforms
- [ ] ...


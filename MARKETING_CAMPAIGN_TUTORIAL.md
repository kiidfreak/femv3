# 🎯 Faith Connect: Marketing Campaign & Monetization Tutorial

Welcome to the **Faith Connect Growth Engine**. This guide is designed for the marketing team to understand how to leverage our "Campaigns & Rewards" system to drive platform engagement, improve visual quality, and build sustainable monetization tiers.

---

## 📈 The Marketing Journey: From Dull to Dynamic

Currently, many profiles are "dull" (missing images and banners). Our goal is to use gamification to spark a "Visual Renaissance" on the platform.

### 🏁 Phase 1: The "Visual Identity" Push (Current)
We reward users for basic setup to make the platform look beautiful.
*   **Actions:** Login, Add Profile Picture, Add Business Banner, Add Offering Images (Products/Services).
*   **The Hook:** Points are earned for every "dull" spot filled.
*   **The Reward:** Temporary "Featured" status or "Verified" badges.

### 💰 Phase 2: Monetization & Premium Tiers
Once engagement is high, we transition to these revenue-generating models:
1.  **Professional Media Services (The "Professional Photo" Charge):**
    *   Businesses can pay a fee for a Faith Connect photographer/editor to visit and take professional shots.
    *   *System Reward:* Verified businesses with "Pro-Photos" get a special **"Ultra-HD"** badge and 2x higher search priority.
2.  **Featured Listing Tiers:**
    *   **Bronze:** Earned via points (Free).
    *   **Silver:** Paid ($X/mo) - Top of category search.
    *   **Gold:** Paid ($Y/mo) - Homepage rotation + Category search + Newsletter shoutout.
    *   **Infinite:** Exclusive to high-trust partners (Invitational).

### 🏆 Phase 3: The "2026 Wrapped" Engagement
At the end of the year, we generate a high-shareability "Wrapped" card for businesses and users:
*   *"You were in the Top 5% of trusted businesses!"*
*   *"3,400 community members discovered your services this year."*
*   *"You saved the community $5,000 via platform discounts."*

---

## 🛠️ How to Create a Campaign (Step-by-Step)

Marketers can manage everything via the **Django Admin Panel** (`/admin/api/campaign/`).

### 1. Define the Campaign Header
*   **Name:** Give it a punchy title like *"The New Year Glow-Up"*.
*   **Description:** Explain the goal (e.g., *"Make your profile shine by adding 5 product images"*).
*   **Dates:** Set a start and end date (urgency drives action!).

### 2. Add "Fuel" (Campaign Actions)
Select from the pre-configured action types (I've just added the image-specific ones):
*   `add_profile_pic`: Rewards users for adding their personal avatar.
*   `add_offering_pic`: Rewards businesses for adding images to their products/services.
*   `login`: A "Daily Streak" reward for coming back to the platform.
*   `add_banner`: Rewards for the main header image.

### 3. Set the "Prize" (Rewards)
Define what happens when they reach target points:
*   **Bronze (100 pts):** Automated "Rising Star" Badge.
*   **Gold (500 pts):** Automatically appear in the "Featured Businesses" section for 7 days.

---

## 💡 Pro-Tips for the Marketing Group

1.  **Nudge the "Dull" Profiles:** Run a campaign specifically titled *"Goodbye Dullness"* targeting users without images.
2.  **Scarcity Works:** Limit "Featured" rewards in the campaign settings so only the first 50 businesses to finish get the spot.
3.  **Cross-Promotion:** Link "Church Verification" with high points. A business that is both "Church Verified" and has "High Points" becomes our **Gold Standard**.

---

## 🚀 Strategy: 2026 Vision

*   **Free:** Members who login and share the platform.
*   **Points-Based (Freemium):** Business owners who do the work to look good.
*   **Monetized:** Businesses that value time over effort and pay for "Pro" features (featured slots, professional photos).

*This MD file serves as your tutorial and strategic roadmap.* 🎯

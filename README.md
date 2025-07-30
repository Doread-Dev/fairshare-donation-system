# 🍽️ FairShare – Smart Donation Distribution System

A back-end-driven platform designed to optimize the distribution of food donations based on real-time inventory analysis, family needs, and area-level priorities. Built during a 24-hour hackathon, this project won 1st Place and was endorsed by top software firms and government officials.

> ⚠️ This project is licensed under the [CC BY-NC 4.0](./LICENSE) license. Commercial use is not allowed without explicit permission from the author.
---

## 🎯 Objective

> Build an intelligent donation management system that reduces waste, detects shortages/surpluses, and distributes items fairly across registered families using data and logic-based automation.

---

## ⚙️ Core Features

- 📦 **Real-time Inventory Tracking**  
  Track all food items, quantities, and expiration dates. Each material has a status: Shortage, Normal, or Surplus.

- 🧠 **Smart Distribution Algorithm**  
  Suggests fair allocation of donations based on:
  - Family size
  - Special needs
  - Area distribution balance
  - Surplus/shortage flags

- 📝 **Donations & Beneficiaries Management**  
  Add and manage incoming donations and families (including vulnerabilities and needs).

- 📊 **Reports & Analytics**  
  View monthly donation trends, surplus frequency, and distribution summaries. Export as PDF/Excel.

- 🔔 **Smart Alerts**  
  Automatic alerts for shortages, surpluses, and expiring items. Integrated with real-time notifications using Socket.IO.

- 👤 **Role-based Access**  
  Admin/Volunteer roles with secure login via JWT.

---

## 🧭 User Workflow (Step-by-Step Usage)

1. **Account Initialization**  
   Since this is an institutional system, you must first create your **admin account** manually via Postman:  
   `POST http://localhost:5000/api/auth/register`

   ```json
   {
     "name": "userName",
     "email": "userName@example.com",
     "password": "password",
     "role": "admin"
   }
   ```

2. **Initial System Configuration (Settings Page)**  
   - Navigate to the **Settings Page**
   - Add the list of materials you expect to receive (e.g., rice, milk, oil).
   - For each material, define the **average monthly need** (e.g., 1000 kg of rice).  
     This allows the system to calculate **shortages and surpluses** accurately.

3. **User Management**  
   - Still within **Settings > User Management**, create accounts for other **Admins or Volunteers** who will use the system.

4. **Register Beneficiary Families**  
   - Go to the **Families Page**
   - Click **Add Family** to register beneficiaries, including:
     - Family size
     - Area
     - Special needs (e.g., disability, baby formula, chronic illness)

5. **Add New Donations**  
   - Go to the **Donations Page**
   - Choose the material donated, quantity, and date
   - These donations will update your inventory automatically

6. **Review Inventory Status**  
   - Go to the **Inventory Page** to see current stock levels and material status:
     - ✅ Normal
     - ❗ Surplus
     - ⚠️ Shortage
   - You can click **Propose Redistribution** next to any material to go directly to Smart Distribution  
     Or navigate manually to the **Smart Distribution Page**

7. **Run Smart Distribution**  
   - Choose the material to distribute
   - Select a **Distribution Strategy**:
     - **Equal**: All families receive equal amounts
     - **Priority-Based** (recommended): Based on:
       - Family size → larger families get more
       - Vulnerability index → more vulnerable families prioritized
       - Distribution history → families not recently served get priority
   - Review the automatically generated table of proposed distributions
   - Click **Execute Distribution** to complete

8. **Monitor Reports**  
   - Go to the **Reports Page**
   - Export full system reports (Excel or PDF) based on any time range
   - Includes received/distributed amounts, shortages/surpluses, and more

9. **Use Dashboard for Daily Operations**  
   - View key statistics: Total Donations, Registered Families, etc.
   - Review latest **Alerts** (shortages/surpluses) in the bottom table
   - Each alert has an action button
   - Real-time notifications pop up immediately via **Socket.IO**

> All past alerts can be reviewed via the **Notifications** icon in the top bar

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose  
- **Auth:** JWT Authentication, Role-based Access  
- **Real-time:** Socket.IO  
- **Tools:** Postman, dotenv, nodemon

---

## 🧠 AI & Logic Highlights

- Rule-based logic calculates fairness scores for each family
- Supported strategies:
  - Equal distribution
  - Size-based
  - Priority-based (vulnerability scoring)
- Future-ready for AI/ML extension

---

## 🏆 Achievements

- 🥇 1st Place – Byets4Future Hackathon (2025)  
- 👥 Evaluated by Tradinos, L1, and endorsed by the Minister of Communications  
- 🛠️ Completed full REST API backend with real-time alerts and integration-ready frontend

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/fairshare-donation-system
npm install
npm run dev
```

Create a `.env` file:

```
# Server port
PORT=5000

# MongoDB connection - must be local for now due to known sync issues with cloud deployments
MONGODB_URI=mongodb://localhost:27017/fairshare

# JWT secret key for authentication
JWT_SECRET=SuperP@ssw0rdJWT

# Log level (can be: dev, combined, short, tiny, etc.)
LOG_LEVEL=dev

# Allowed CORS origins (typically your front-end app)
CORS_ORIGINS=http://localhost:5173

```

---

## 💰 Commercial Licensing

If you're interested in using this project for commercial purposes, please contact me to discuss licensing options.


## 📫 Contact

- GitHub: [@Doread-Dev](https://github.com/Doread-Dev)
- LinkedIn: [linkedin.com/in/haydara-al-bisomy](https://www.linkedin.com/in/haydara-al-bisomy)
- Email: haydara.bisomy@gmail.com


> “A fair system saves more than just resources — it restores trust.”

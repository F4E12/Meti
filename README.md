# 🧵 Meti - Personalized Batik Tailoring Platform

<p align="start">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/LOGO_text.png" width="300" alt="Logo" />
</p>

**Meti** is a full-stack web application that allows customers to design their own cultural apparel, connect with talented local tailors, and place custom orders with precise body measurements. By combining AI-powered tailoring and 3D design tools, Meti makes fashion more personal, local, and interactive.

---

## 🌐 Short Demo

> https://youtu.be/ShYTD1M3whM

<a href="https://youtu.be/ShYTD1M3whM">
  <img src="https://img.youtube.com/vi/ShYTD1M3whM/0.jpg" alt="Short Demo" width="560" height="315" />
</a>

---

## 📖 Pitch Deck

> https://drive.google.com/file/d/14AwfeVlTbTeeQanCUPGCR3ZfA8tOH-rL/view?usp=sharing

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/), [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service/)
- **AI/ML**:
  - [MediaPipe Pose Landmark](https://developers.google.com/mediapipe) for body measurement detection
  - Python backend for AI measurement and pattern extraction
- **3D Sandbox**: [Three.js](https://threejs.org/), HTML Canvas

---

## 📁 Features

### 🧵 3D Design

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/2025-07-25%2019-24-09.gif" alt="3D Sandbox" width="70%" />
</p>

- Interactive sandbox to design custom apparel
- Custom Batik pattern editor using **Three.js** and **HTML Canvas**
- Extract dominant colors from uploaded images and customize palette
- **Computer Vision** detects and modifies Batik pattern colors dynamically

---

### 🔐 Authentication

<p style="display: flex; justify-content: left;">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/login.jpg" height="300" />
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/register.jpg" height="300" />
</p>

- Secure user login and registration
- Integrated with Supabase Auth

---

### 💬 Real-Time Chat with Translation

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/2025-07-25%2020-17-39.gif" alt="Real-Time Chat" width="70%" />
</p>

- Real-time communication between customers and tailors
- Built-in translation powered by **Azure OpenAI** for multilingual conversations (supports Indonesian dialects)

---

### 🌟 Featured Weavers

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/fw.jpg" alt="Featured Weavers" width="70%" />
</p>

- Browse unique Batik patterns from local weavers
- Select patterns to start designing custom T-shirts

---

### 📏 AI Body Measurement

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/2025-07-25%2019-28-56.gif" alt="AI Body Measurement" width="70%" />
</p>

- AI-assisted body measurement using **MediaPipe Pose Landmark Detection**
- Requires an object reference (e.g., a 500 Rupiah coin)
- Measurements extracted:
  - Right Arm Length
  - Left Arm Length
  - Shoulder Width
  - Upper Body Height
  - Hip Width

---

### 📦 Orders

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/all_orders.jpg" alt="Orders" width="70%" />
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/order_details.jpg" alt="Orders" width="70%" />
</p>

- Place and manage custom clothing orders
- View real-time order status

---

### 👤 User Profile

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/pofile.jpg" alt="User Profile" width="70%" />
</p>

- Manage user information
- Editable profile fields

---

### 🧵 Tailors

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/tailors_img.jpg" alt="Tailors Directory" width="70%" />
</p>

- View list of available tailors
- Direct messaging and collaboration with tailors

---

### 🛠️ Tailor Workspace

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/2025-07-25%2019-38-29.gif" alt="Tailor Workspace" width="70%" />
</p>

- Tailor dashboard to manage customer designs and orders
- AI-powered Batik pattern extraction from photos
- Convert extracted Batik into editable vector-style design templates

---

### 🏠 Homepage

<p align="center">
  <img src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/github_gif/home.jpg" alt="Homepage" height="300" />
</p>

- Introduction to Meti
- Featured weavers & community highlights
- Batik gallery & promo banners

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/F4E12/meti.git
cd meti
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env.local` file and add your keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
AZURE_OPENAI_KEY=
AZURE_OPENAI_ENDPOINT=
```

### 4. Run the App

```bash
npm run dev
```

---

## 🧠 Running the Flask AI API

The AI features are powered by a separate Flask API.

### 📂 Location

The Flask app is located in:

```
AI/APP/
```

### 📦 1. Install Python Dependencies

Make sure you're inside the `AI/APP/` directory:

```bash
cd AI/APP
pip install -r requirements.txt
```

### ▶️ 2. Run the API Server

Start the Flask app:

```bash
python app.py
```

By default, it runs at:

```
http://127.0.0.1:5000
```

Make sure this backend is running when using the main application, especially for all AI services.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and create a pull request.

---

# 🧵 Meti - Personalized Batik Tailoring Platform

Meti is a full-stack web application that allows customers to design their own Batik T-shirts, connect with tailors, and place custom orders with precision body measurements. The app combines creative tools with AI-assisted tailoring to make fashion more personal, local, and interactive.

---

## 🌐 Live Demo

> Coming Soon...

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/), [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service/)
- **AI/ML**: Pose Landmark Detection using [MediaPipe](https://developers.google.com/mediapipe)
- **Scripting**: Python for body measurement logic and processing

---

## 📁 Features

### 🧵 3D Design

- Sandbox to design custom Batik T-shirts
- Interactive Batik pattern editor

### 🔐 Auth

- Secure user authentication (Login/Register)

### 💬 Chat

- Real-time communication between customers and tailors

### 🌟 Featured Weavers

- Browse and choose Batik designs from local weavers
- Start custom T-shirt design from selected patterns

### 📏 Measure

- AI-based body measurement using camera (MediaPipe Pose Landmark)
- Measurements include:

  - Right Arm Length
  - Left Arm Length
  - Shoulder Width
  - Upper Body Height
  - Hip Width

### 📦 Orders

- Place orders for custom-designed shirts
- Track order status

### 🛍️ Product

- View detailed Batik products available for direct purchase

### 👤 Profile

- User profile with editable info

### 🧵 Tailors

- List of available tailors
- Chat and collaborate with tailors

### 🛠️ Workspace (for Tailors)

- Tailor dashboard to manage orders and designs
- Add new orders and communicate with customers

### 🏠 Homepage

- Introduction to **Meti**
- Highlighted weavers
- Batik shirt design gallery
- Promotions & local artisan spotlight

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

The AI feature are powered by a separate Flask API.

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
http://localhost:5000
```

Make sure this backend is running when using the main application, especially for all AI services.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and create a pull request.

---

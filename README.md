<div align="center" style="margin-top: 20px;">
    <div style="
        width:128px;
        height:128px;
        border-radius: 25px;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        overflow: hidden;
        margin: 0 auto;
    ">
        <img src="/pictures/retail_suite.png" style="width: 50%; height: 50%; object-fit: cover; border-radius: 25px;">
    </div>
    <h2>Retail Suite</h2>
</div>

# 🛍️ Retail Suite

**Retail Suite** is a Modern Vue-powered retail and POS experience for ERPNext/Frappe system designed for small and medium retail business.
.
---

# Technology
**Vue.js & Tailwind CSS**  **frontend**
**Frappe / ERPNext** **backend**
<h2 align="center">
  📫 Connect with me
  <img src="https://media.giphy.com/media/WUlplcMpOCEmTGBtBW/giphy.gif" width="30">
</h2>

<p align="center">
  <a href="http://linkedin.com/in/ahmed-abukhatwa-641a76251" target="_blank">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/linkedin/linkedin-original.svg"
         alt="LinkedIn"
         width="42" />
  </a>

  <a href="https://wa.me/201010871072" target="_blank">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
         alt="WhatsApp"
         width="42" />
  </a>

  <a href="mailto:ahmedabukhatwa1@gmail.com" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968534.png"
         alt="Gmail"
         width="42" />
  </a>
</p>

---

## Main Features
## Modern Retail & POS Experience

- Dark / Light Mode support with modern Vue-powered POS interface
- Mobile barcode scanning with real-time cart updates
- QR code and barcode generation
- Fast POS operations (orders, checkout, returns, refunds)
- Multiple payment methods (Cash, Card, Bank Transfer)
- Keyboard shortcuts for faster cashier workflow
- Fully responsive mobile-friendly POS experience

### Shift & Cashier Management
- Opening and closing shift workflows
- Payment reconciliation screen
- Shift dashboard with quick Shift performance insights
- Shift scheduling and cashier assignment
- Receipt settings and cashier notifications

### Retail Operations
- Stock in / stock out tracking
- Inventory transfer workflows
- Purchase receipt management
- Batch and serial number support
- Customer and supplier management

### Analytics & Reporting
- Sales analytics and expense reports
- Cash flow and financial summaries
- Accounts receivable and payable tracking
- Period closing and financial cycle overview

### Customer Experience
- Customer-facing online ordering page

---

## Built on ERPNext

Retail Suite leverages the powerful backend capabilities of ERPNext, including:
- Inventory Management
- Accounting
- HR & Staff Management
- CRM
- Stock & Warehouse Management

---

## 🖼️ Screenshots
<h2 align="center">POS – Quick Pay Screen</h2>
<p align="center">
  <img src="/pictures/posimage.png" alt="POS Screen" width="900">
</p>
<h2 align="center">Mobile Web Scanner</h2>
<p align="center">
  <img src="/pictures/product_scanner_mockup.png" alt="Mobile Web Scanner" width="250">
</p>

<h2 align="center">Returns & Refunds</h2>
<p align="center">
  <img src="/pictures/returnimage.png" alt="Return Screen" width="900">
</p>

<h2 align="center">Payment & Reconciliation</h2>
<p align="center">
  <img src="/pictures/payimage.png" alt="Reconciliation Screen" width="900">
</p>

<h2 align="center">Inventory Management (Barcode)</h2>
<p align="center">
  <img src="/pictures/barcodeimage.png" alt="Inventory Screen" width="900">
</p>

<h2 align="center">Finance Module</h2>
<p align="center">
  <img src="/pictures/bsimage.png" alt="Finance Screen" width="900">
</p>

<h2 align="center">System & User Settings</h2>
<p align="center">
  <img src="/pictures/settingimage.png" alt="Settings Screen" width="900">
</p>

---

## 🧰 Tech Stack

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Frappe](https://img.shields.io/badge/Frappe-0089FF?style=for-the-badge&logo=frappe&logoColor=white)
![ERPNext](https://img.shields.io/badge/ERPNext-0089FF?style=for-the-badge&logo=erpnext&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)

- **Frontend:** Vue.js + Tailwind CSS
- **Backend:** Frappe / ERPNext
- **Database:** MariaDB
- Designed for small & medium retail businesses

---

## 📄 License

MIT License

---

## 🌟 Show Your Support

If you find this project useful, please give it a ⭐ on GitHub!

### 🛠️ Development Setup — Retail Suite

## 1. Install Dependencies

```bash
cd ~/Music/frappe-bench-v15/apps/retail/retail-suite
npm install
```

---

## 2. Create `.env` File

Create a `.env` file inside `retail-suite/`:

```env
VITE_FRAPPE_HOST=192.168.8.5
VITE_FRAPPE_URL_LOCAL=https://192.168.8.5:81
VITE_VUE_URL=https://192.168.8.5:5173
VITE_ENV=development
VITE_SITE_NAME=site.com
VITE_SOCKET_URL=http://192.168.8.5:9000
SOCKET_PORT=9000
VITE_CERTS_DIR=/home/frappe/Music/frappe-bench-v15/certs
```

> ⚠️ Replace `site.com` with your actual Frappe site name.

---

## 3. SSL Certificates

`vite.config.js` reads certs from the path defined in `VITE_CERTS_DIR`.

Make sure these files exist:
```
{VITE_CERTS_DIR}/{VITE_FRAPPE_HOST}+1-key.pem
{VITE_CERTS_DIR}/{VITE_FRAPPE_HOST}+1.pem
```

Example:
```
/home/frappe/Music/frappe-bench-v15/certs/192.168.8.5+1-key.pem
/home/frappe/Music/frappe-bench-v15/certs/192.168.8.5+1.pem
```

If missing, generate them with [mkcert](https://github.com/FiloSottile/mkcert):
```bash
cd /home/frappe/Music/frappe-bench-v15/certs
mkcert 192.168.8.5 localhost
```

---

## 4. Run Dev Server

```bash
npm run dev
```

Dev server will be available at:
```
https://192.168.8.5:5173/
```

---

## 5. Login First

Before opening the app, log in to Frappe first:

```
https://192.168.8.5:81/login
```

Then open the app:
```
https://192.168.8.5:5173/
```

> The app relies on a Frappe session cookie — it must exist before the app loads.

---

## 6. Build for Production

```bash
npm run build
```

Output will be placed in:
```
../retail/public/retail_suite/
```

## 1. Install Dependencies

```bash
cd ~/Music/frappe-bench-v15/apps/retail/retail-suite
npm install
```

---

## 2. Create `.env` File

في نفس المجلد `retail-suite/` أنشئ ملف `.env`:

```env
VITE_FRAPPE_HOST=192.168.8.5
VITE_FRAPPE_URL_LOCAL=https://192.168.8.5:81
VITE_VUE_URL=https://192.168.8.5:5173
VITE_ENV=development
VITE_SITE_NAME=site.com
VITE_SOCKET_URL=http://192.168.8.5:9000
SOCKET_PORT=9000
VITE_CERTS_DIR=/home/frappe/Music/frappe-bench-v15/certs
```

> ⚠️ غيّر `site.com` باسم الـ site الفعلي عندك (نفس اللي في Frappe).

---

## 3. SSL Certificates

الـ `vite.config.js` بيقرأ الـ certs من المسار في `VITE_CERTS_DIR`.

تأكد إن الملفات دي موجودة:
```
{VITE_CERTS_DIR}/{VITE_FRAPPE_HOST}+1-key.pem
{VITE_CERTS_DIR}/{VITE_FRAPPE_HOST}+1.pem
```

مثال:
```
/home/frappe/Music/frappe-bench-v15/certs/192.168.8.5+1-key.pem
/home/frappe/Music/frappe-bench-v15/certs/192.168.8.5+1.pem
```

لو مش موجودة، أنشئها بـ [mkcert](https://github.com/FiloSottile/mkcert):
```bash
cd /home/frappe/Music/frappe-bench-v15/certs
mkcert 192.168.8.5 localhost
```

---

## 4. Run Dev Server

```bash
npm run dev
```

Dev server هيشتغل على:
```
https://192.168.8.5:5173/
```

---

## 5. Login أول مرة

قبل ما تفتح التطبيق، سجّل دخول على Frappe أولاً:

```
https://192.168.8.5:81/login
```

بعدين افتح:
```
https://192.168.8.5:5173/
```

> السبب: التطبيق بيعتمد على Frappe session cookie، ولازم تكون موجودة قبل ما يشتغل.

---

## 6. Build for Production

```bash
npm run build
```

الـ output هيتحط في:
```
../retail/public/retail_suite/
```


## 🚀 Production Deployment

### 1. Build the Vue App
```bash
npm run build
```
Output will be at: `../retail/public/retail_suite/`

### 2. Link Assets to Frappe
```bash
cd /path/to/frappe-bench
bench build --app retail
bench clear-cache
```

### 3. Configure Nginx

Open your site's nginx config:
```bash
sudo nano /etc/nginx/conf.d/frappe-bench-v15.conf
```

Add these two blocks **before** `location /` inside your site's server block (port 81):

```nginx
location /retail_suite {
    alias /path/to/frappe-bench/sites/assets/retail/retail_suite/;
    try_files $uri $uri/ /retail_suite/index.html;
    index index.html;
}

location /pos {
    alias /path/to/frappe-bench/sites/assets/retail/retail_suite/;
    try_files $uri /retail_suite/index.html;
    index index.html;
}

location /socket.io {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Frappe-Site-Name dms.com;

    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_pass http://frappe-bench-v15-socketio-server;
}
```

### 4. Reload Nginx
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Access the App
```bash
https://your-server-ip:81/pos
```

> **Note:** Make sure you are logged in to Frappe (`/app`) before accessing `/pos`,
> as authentication is handled by Frappe's session.

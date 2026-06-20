# 💼 Recruitment Management System

A full-stack Recruitment Management System that enables administrators to manage job postings and applicants while allowing candidates to browse jobs and apply with their resumes.

🌐 **Live Demo:** https://kp-job-portal.onrender.com

---

## 📌 Overview

This project is a recruitment management platform built using Node.js, Express.js, MongoDB Atlas, EJS, Bootstrap, and Cloudinary. It provides secure admin authentication, job management, applicant tracking, resume uploads, and an analytics dashboard.

---

## ✨ Features

### Candidate

* Browse available jobs
* Search jobs by title, company, or location
* View detailed job information
* Apply for jobs online
* Upload PDF resumes
* Duplicate application prevention

### Admin

* Secure admin login
* Add, edit, and delete jobs
* View applicants for each job
* View uploaded resumes
* Select or reject applicants
* Delete applications
* Dashboard with recruitment statistics
* Applicant count for each job

---

## 🛠 Tech Stack

### Frontend

* EJS
* Bootstrap 5
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### File Storage

* Cloudinary
* Multer

### Authentication

* Express Session
* bcrypt.js

### Deployment

* Render

---

## 📸 Screenshots

* Home Page
* Jobs Page
* Apply Job Page
* Admin Dashboard
* Applicants Page

> Add screenshots inside a `/screenshots` folder and update this section.

---

## 🚀 Installation

```bash
git clone https://github.com/KP247/job-portal.git

cd job-portal

npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

Run the application:

```bash
node app.js
```

Open:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
job-portal/

├── config/
├── middleware/
├── models/
├── views/
├── app.js
├── package.json
└── README.md
```

---

## 🎯 Key Functionalities

* Role-based admin access
* Job posting management
* Resume upload using Cloudinary
* Applicant tracking
* Dashboard analytics
* Duplicate application prevention
* Responsive user interface

---

## 🔮 Future Improvements

* Company logo upload
* Job filters
* Email notifications
* CSV export
* Interview scheduling

---

## 👨‍💻 Author

**Krishan Pal Singh**

GitHub: https://github.com/KP247

---

## 📄 License

This project is developed for educational and portfolio purposes.

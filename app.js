const auth = require("./middleware/auth");

const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

require("dotenv").config();

const Job = require("./models/Job");

const Application = require("./models/Application");

const multer = require("multer");
const storage = require("./config/cloudinary");
const upload = multer({ storage });

const session = require("express-session");

const express = require("express");

const mongoose = require("mongoose");

const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET || "jobportal_secret_key",
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {

    res.locals.isAdmin = req.session.isAdmin || false;

    res.locals.message = req.session.message;

    delete req.session.message;

    next();

});

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI)

.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

app.get("/add-job", auth, (req, res) => {
    res.render("add-job");
});

app.get("/jobs", async (req, res) => {

    const search = req.query.search || "";

    const jobs = await Job.find({
    $or: [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
    ]
}).lean();

for (let job of jobs) {

    const applicantCount = await Application.countDocuments({
        jobId: job._id
    });

    job.applicantCount = applicantCount;

}

   const totalJobs = await Job.countDocuments();

    console.log("Total Jobs:", totalJobs);

res.render("jobs", {
    jobs,
    totalJobs,
    search
});

});

app.get("/admin/login", (req, res) => {
    res.render("login");
});
app.post("/add-job", auth, async (req, res) => {

   const job = new Job({

    title: req.body.title,

    company: req.body.company,

    location: req.body.location,

    description: req.body.description,

    salary: req.body.salary,

    jobType: req.body.jobType,

    experience: req.body.experience

});

    await job.save();

    res.redirect("/jobs");
});

app.get("/edit-job/:id", auth, async (req, res) => {

    const job = await Job.findById(req.params.id);

  res.render("edit-job", {
    job
});

});

app.post("/update-job/:id", auth, async (req, res) => {

    await Job.findByIdAndUpdate(
        req.params.id,
        {
     title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    description: req.body.description,
    salary: req.body.salary,
    jobType: req.body.jobType,
    experience: req.body.experience
        }
    );

    res.redirect("/jobs");

});

app.post("/delete-job/:id", auth, async (req, res) => {

    await Job.findByIdAndDelete(req.params.id);

    res.redirect("/jobs");

});

app.get("/", (req, res) => {
    res.render("home");
});



app.post("/admin/login", async (req, res) => {

    const { username, password } = req.body;

    const admin =
        await Admin.findOne({ username });

    if(!admin){
        return res.send("Invalid Username");
    }

    const isMatch =
        await bcrypt.compare(
            password,
            admin.password
        );

    if(!isMatch){
        return res.send("Invalid Password");
    }

    req.session.isAdmin = true;

    res.redirect("/jobs");

});

app.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/admin/login");
    });

});


const PORT = process.env.PORT || 3000;


app.get("/apply/:id", async (req, res) => {

    const job = await Job.findById(req.params.id);

    res.render("apply-job", {
        job
    });

});

app.post(
    "/apply/:id",
    upload.single("resume"),
    async (req, res) => {
console.log("Job ID:", req.params.id);
console.log("Email:", req.body.email);
        const existingApplication =
    await Application.findOne({

        jobId: req.params.id,

        email: req.body.email

    });

if (existingApplication) {

    req.session.message = {
        type: "warning",
        text: "You have already applied for this job."
    };

    return res.redirect("/jobs");
}

        try {

            if (!req.file) {
                return res.status(400).send("Please upload a resume.");
            }

            const application = new Application({
                jobId: req.params.id,
                applicantName: req.body.applicantName,
                email: req.body.email,
                phone: req.body.phone,
                resume: req.file.path
            });

           await application.save();

            req.session.message = {
                type: "success",
                text: "Application submitted successfully."
            };

            res.redirect("/jobs");

        } catch (err) {
            console.error(err);
            res.status(500).send("Error submitting application.");
        }
    }
);



app.get("/applications/:jobId", auth, async (req, res) => {

    const job = await Job.findById(req.params.jobId);

    const applications = await Application.find({
        jobId: req.params.jobId
    });

    res.render("applications", {
        job,
        applications
    });

});

app.post("/application/status/:id", auth, async (req, res) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        res.redirect("/applications/" + application.jobId);

    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating status");
    }
});

app.get("/admin/dashboard", auth, async (req, res) => {

    const totalJobs = await Job.countDocuments();

    const totalApplications = await Application.countDocuments();

    const selected = await Application.countDocuments({
        status: "Selected"
    });

    const pending = await Application.countDocuments({
        status: "Pending"
    });

    const rejected = await Application.countDocuments({
        status: "Rejected"
    });

    const recentApplications = await Application.find()
        .populate("jobId")
        .sort({ appliedAt: -1 })
        .limit(5);

    res.render("dashboard", {
        totalJobs,
        totalApplications,
        selected,
        pending,
        rejected,
        recentApplications
    });

});

app.post("/application/delete/:id", auth, async (req, res) => {

    const application = await Application.findById(req.params.id);

    if (!application) {
        return res.redirect("/jobs");
    }

    const jobId = application.jobId;

    await Application.findByIdAndDelete(req.params.id);

    req.session.message = {
        type: "success",
        text: "Application deleted successfully."
    };

    res.redirect("/applications/" + jobId);

});


app.listen(PORT, () => {
    console.log(`Server Started on Port ${PORT}`);
});
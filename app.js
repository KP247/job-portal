const auth = require("./middleware/auth");

const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

require("dotenv").config();

const Job = require("./models/Job");


const session = require("express-session");

const express = require("express");

const mongoose = require("mongoose");

const app = express();


app.use(
    session({
        secret: "jobportal_secret_key",
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {

    res.locals.isAdmin = req.session.isAdmin || false;

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
    });

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
        location: req.body.location
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
            location: req.body.location
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

app.get("/create-admin", async (req, res) => {

    const existingAdmin = await Admin.findOne({
        username: "admin"
    });

    if(existingAdmin){
        return res.send("Admin Already Exists");
    }

    const hashedPassword =
        await bcrypt.hash("admin123", 10);

    const admin = new Admin({
        username: "admin",
        password: hashedPassword
    });

    await admin.save();

    res.send("Admin Created Successfully");

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

app.listen(PORT, () => {
    console.log(`Server Started on Port ${PORT}`);
});
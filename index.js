const express = require("express");
const cors = require("cors");
const validateUser = require("./middleware/validateUser");

const app = express();

// Middleware setup
app.use(express.json()); // JSON body parsing
app.use(cors()); // Enable CORS

// Basic route
app.get("/", (req, res) => {
  console.log("Received GET request on /");
  res.send("Hello");
});

// Login route
app.post("/login", validateUser, (req, res) => {
  const user = req.user; // User details from the middleware
  console.log("Here is the main user", { user });

  res.json({
    success: true,
    message: "User authenticated successfully",
    UserID: user.UserID,
    Email: user.email,
    Role: user.role,
    Name: user.userName,
    CustomerID: user.CustomerID,
    CompanyName: user.CompanyName,
  });
});

// Include role-specific routes
app.use("/admin", require("./routes/admin")); // Admin routes
app.use("/customer", require("./routes/customer")); // Dealer routes

module.exports = app;

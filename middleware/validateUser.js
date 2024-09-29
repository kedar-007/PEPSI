const catalyst = require("zcatalyst-sdk-node");

const validateUser = async (req, res, next) => {
  const { Email, Password } = req.body;

  // Check if email and password are provided
  if (!Email || !Password) {
    console.log("Email or password not provided.");
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email)) {
    console.log("Invalid email format.");
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const capp = catalyst.initialize(req);
    const zcql = capp.zcql(); // Initialize ZCQL

    // Use ZCQL to query the Users table
    const query = `SELECT * FROM Users WHERE Email = '${Email}'`;
    const queryResp = await zcql.executeZCQLQuery(query).catch(() => null);

    // Handle user not found
    if (queryResp == null || queryResp.length === 0) {
      console.log("User not found.");
      return res.status(404).json({ error: "User not found" });
    }

    const user = queryResp[0]; // Assuming the first record is the user
    // Validate password
    if (user.Users.Password !== Password) {
      console.log("Invalid password.");
      return res.status(401).json({ error: "Invalid password" });
    }

    let UserID = user.Users.ROWID;
    let CustomerID = null;
    let CompanyName = null;

    console.log("Role:", user.Users.Role);

    // Check the role and fetch the ROWID from the specific table if needed
    if (user.Users.Role) {
      const role = user.Users.Role.toUpperCase();

      if (role === "CUSTOMER") {
        // Fetch the ROWID from the Customers table
        const customerQuery = `SELECT ROWID,CompanyName FROM Customers WHERE UserID = '${UserID}'`;
        const customerQueryResp = await zcql
          .executeZCQLQuery(customerQuery)
          .catch(() => null);

        if (customerQueryResp == null || customerQueryResp.length === 0) {
          console.log("Customer not found.");
          return res.status(404).json({ error: "Customer not found" });
        }
        console.log("Customer Response", customerQueryResp);
        const customer = customerQueryResp[0];

        CustomerID = customer.Customers.ROWID;
        CompanyName = customer.Customers.CompanyName;

        // Attach customer details to the request object
        req.user = {
          UserID,
          CustomerID,
          role: "CUSTOMER",
          email: user.Users.Email,
          userName: user.Users.Name || "User",
          CompanyName,
        };
      } else if (role === "ADMIN") {
        // Handle the ADMIN role
        req.user = {
          UserID,
          role: "ADMIN",
          email: user.Users.Email,
          userName: user.Users.Name || "Admin",
          UserID,
        };
      } else {
        console.log("Invalid role provided.");
        return res.status(400).json({ error: "Invalid role" });
      }
    } else {
      // If the role is not set, treat as an undefined role
      console.log("Role not provided.");
      return res.status(400).json({ error: "Role not provided" });
    }

    console.log(`User authenticated: ${user.Users.Name}`);
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("User validation failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = validateUser;

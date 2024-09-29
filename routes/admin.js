const catalyst = require("zcatalyst-sdk-node");
const controller = require("../controllers/admin");
const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

router.use(fileUpload());

// ==================== User Routes ====================

// Create a User with Customer Role
router.post("/user", async (req, res) => {
  const capp = catalyst.initialize(req);
  const userData = req.body;
  try {
    let newUser = await controller.createUserWithCustomerRole(capp, userData);
    return res.status(201).json({ success: true, User: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Customer Routes ====================

// Get all customers
router.get("/customers", async (req, res) => {
  const capp = catalyst.initialize(req);
  try {
    let customers = await controller.getAllCustomers(capp);
    return res.status(200).json({ success: true, customers });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer by ID
router.get("/customer/:customerId", async (req, res) => {
  const capp = catalyst.initialize(req);
  const customerId = req.params.customerId;
  try {
    let customer = await controller.getCustomerById(capp, customerId);
    return res.status(200).json({ success: true, customer });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update customer by ID
router.put("/customer/:customerId", async (req, res) => {
  const capp = catalyst.initialize(req);
  const customerId = req.params.customerId;
  const updateData = req.body;
  try {
    let updatedCustomer = await controller.updateCustomer(capp, customerId, updateData);
    return res.status(200).json({ success: true, customer: updatedCustomer });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a customer
router.delete("/customer/:customerId", async (req, res) => {
  const capp = catalyst.initialize(req);
  const customerId = req.params.customerId;
  try {
    await controller.deleteCustomer(capp, customerId);
    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Invoice Routes ====================

// Create a new invoice for a customer, with optional PDF upload
router.post("/invoice", async (req, res) => {
  const capp = catalyst.initialize(req);
  const invoiceData = req.body;

  // Check if a file is uploaded
  const file = req.files ? req.files.file : null;

  try {
    // If there's a file, save it temporarily
    if (file) {
      const filePath = `/tmp/${file.name}`;
      await file.mv(filePath);
      invoiceData.filePath = filePath;
      invoiceData.folderId = process.env.INVOICE_FOLDER_ID; // Make sure to set your folder ID in environment variables
    }

    let newInvoice = await controller.createInvoice(capp, invoiceData);
    return res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all invoices for customers
router.get("/invoices", async (req, res) => {
  const capp = catalyst.initialize(req);
  try {
    let invoices = await controller.getAllInvoices(capp);
    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get invoice by ID
router.get("/invoice/:invoiceId", async (req, res) => {
  const capp = catalyst.initialize(req);
  const invoiceId = req.params.invoiceId;
  try {
    let invoice = await controller.getInvoiceById(capp, invoiceId);
    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update invoice by ID
router.put("/invoice/:invoiceId", async (req, res) => {
  const capp = catalyst.initialize(req);
  const invoiceId = req.params.invoiceId;
  const updateData = req.body;
  try {
    let updatedInvoice = await controller.updateInvoice(capp, invoiceId, updateData);
    return res.status(200).json({ success: true, invoice: updatedInvoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an invoice
router.delete("/invoice/:invoiceId", async (req, res) => {
  const capp = catalyst.initialize(req);
  const invoiceId = req.params.invoiceId;
  try {
    await controller.deleteInvoice(capp, invoiceId);
    return res.status(200).json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Export the router
module.exports = router;

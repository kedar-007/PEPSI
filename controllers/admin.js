const catalyst = require("zcatalyst-sdk-node");
const fs = require("fs");

// Create a new user with Customer Role
exports.createUserWithCustomerRole = async (capp, userData) => {
  const {
    Name,
    Email,
    Phone,
    Password,
    Status,
    Role,
    Address,
    CompanyName,
  } = userData;

  try {
    // Step 1: Insert into the Users table
    const userRowData = {
      Name,
      Email,
      Phone,
      Password,
      Status,
      Role,
    };

    const usersTable = capp.datastore().table("Users");
    const userRow = await usersTable.insertRow(userRowData).catch(() => null);

    if (userRow == null) {
      throw new Error("Failed to create user in Users table");
    }

    const UserID = userRow.ROWID;

    // Step 2: Insert into the Customers table
    const customerTable = capp.datastore().table("Customers");
    const customerRowData = {
      UserID,
      Name,
      CompanyName,
      Email,
      Address,
      Phone,
    };

    const customerRow = await customerTable.insertRow(customerRowData).catch(() => null);

    if (customerRow == null) {
      throw new Error("Failed to create customer in Customers table");
    }

    // Return the user details and the associated customer entry
    return {
      UserID,
      Name,
      Email,
      CustomerID: customerRow.ROWID,
      Role,
    };
  } catch (error) {
    console.error("Error creating user with customer role:", error);
    throw error;
  }
};

// Upload an Invoice PDF
exports.uploadInvoice = async (capp, filePath, folderId) => {
  const filestore = capp.filestore();
  const folder = filestore.folder(folderId);

  const config = {
    code: fs.createReadStream(filePath),
    name: filePath.split("/").pop(),
  };

  try {
    const fileObject = await folder.uploadFile(config);
    console.log("File uploaded successfully:", fileObject);
    return fileObject;
  } catch (error) {
    console.error("Failed to upload invoice:", error);
    throw new Error("Failed to upload invoice");
  }
};

// Create an Invoice for a Customer
exports.createInvoice = async (capp, invoiceData) => {
  const {
    customerId,
    amount,
    invoiceDate,
    description,
    filePath,
    folderId,
  } = invoiceData;

  let fileObject = null;

  try {
    // Step 1: Upload the invoice PDF if filePath is provided
    if (filePath) {
      fileObject = await exports.uploadInvoice(capp, filePath, folderId);
    }

    // Step 2: Insert into the Invoices table
    const invoicesTable = capp.datastore().table("Invoices");
    const invoiceRowData = {
      customerId,
      amount,
      invoiceDate,
      description,
      fileUrl: fileObject ? fileObject.file_location : null,
    };

    const invoiceRow = await invoicesTable.insertRow(invoiceRowData).catch(() => null);

    if (invoiceRow == null) {
      throw new Error("Failed to create invoice");
    }

    return invoiceRow;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// Get All Invoices
exports.getAllInvoices = async (capp) => {
  const zcql = capp.zcql();
  const query = `SELECT * FROM Invoices`;
  const queryResp = await zcql.executeZCQLQuery(query).catch(() => null);

  if (queryResp == null) {
    throw new Error("Failed to fetch invoices");
  }

  return queryResp.map((item) => item.Invoices);
};

// Fetch Invoice by ID
exports.getInvoiceById = async (capp, invoiceId) => {
  const zcql = capp.zcql();
  const query = `SELECT * FROM Invoices WHERE ROWID = '${invoiceId}'`;
  const queryResp = await zcql.executeZCQLQuery(query).catch(() => null);

  if (queryResp == null || queryResp.length === 0) {
    throw new Error("Invoice not found");
  }

  return queryResp[0].Invoices;
};

// Delete an Invoice
exports.deleteInvoice = async (capp, invoiceId) => {
  const datastore = capp.datastore();
  const table = datastore.table("Invoices");
  try {
    const res = await table.deleteRow(invoiceId);
    return res;
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    throw new Error("Failed to delete invoice");
  }
};

// Get All Customers
exports.getAllCustomers = async (capp) => {
  const zcql = capp.zcql();
  const query = `SELECT * FROM Customers`;
  const queryResp = await zcql.executeZCQLQuery(query).catch(() => null);

  if (queryResp == null) {
    throw new Error("Failed to fetch customers");
  }

  return queryResp.map((item) => item.Customers);
};

// Fetch Customer by ID
exports.getCustomerById = async (capp, customerId) => {
  const zcql = capp.zcql();
  const query = `SELECT * FROM Customers WHERE ROWID = '${customerId}'`;
  const queryResp = await zcql.executeZCQLQuery(query).catch(() => null);

  if (queryResp == null || queryResp.length === 0) {
    throw new Error("Customer not found");
  }

  return queryResp[0].Customers;
};

// Update Customer by ID
exports.updateCustomer = async (capp, customerId, updateData) => {
  const datastore = capp.datastore();
  const table = datastore.table("Customers");

  let updatedRowData = {
    ROWID: customerId,
    ...updateData,
  };

  try {
    let updatedRow = await table.updateRow(updatedRowData);
    return updatedRow;
  } catch (error) {
    console.error("Failed to update customer:", error);
    throw new Error("Failed to update customer");
  }
};

// Delete a Customer by ID
exports.deleteCustomer = async (capp, customerId) => {
  const datastore = capp.datastore();
  const table = datastore.table("Customers");
  try {
    const res = await table.deleteRow(customerId);
    return res;
  } catch (error) {
    console.error("Failed to delete customer:", error);
    throw new Error("Failed to delete customer");
  }
};

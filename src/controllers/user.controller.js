const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create user function is to be used by admin only, the registration is for public
const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ error: "Email, name, and password are required" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    const { password: pwd, ...userwithoutPassword } = user;
    res.status(201).json(userwithoutPassword);
  } catch (error) {
    console.error("Error details:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    console.log("some error happening:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    console.log("an update request received-------------->:", req);
    const { id } = req.params;
    const { name, email } = req.body;

    if (!id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
const changPassword = async (req, res) => {
  try {
    if (!req.body.id || !req.body.oldPassword || !req.body.newPassword) {
      return res
        .status(400)
        .json({ error: "id, oldPassword and newPassword are required" });
    }

    if (req.body.newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long " });
    }
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.body.id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not Found !" });
    }
    if (user.password !== req.body.oldPassword) {
      return res.status(400).json({ error: "Incorrect old password" });
    }
    const newPassword = req.body.newPassword;
    await prisma.user.update({
      where: { id: parseInt(req.body.id) },
      data: { password: newPassword },
    });
    res.json({ message: "Password changed successfully!" });
  } catch (err) {
    console.error("Error in changing password:", err);
    res.status(500).json({ error: err.message });
  }
};
const getPaginatedUsers = async (req, res) => {
  try {
    let { page = 1, size = 10 } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const skip = (page - 1) * size;
    const take = size;

    const users = await prisma.user.findMany({
      skip,
      take,
    });

    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / size);

    res.json({
      page,
      size,
      totalUsers,
      totalPages,
      users,
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: err.message });
  }
};
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ error: "Email query parameter is required" });
    }
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: err.message });
  }
};

// Search users by name or email
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const users = await prisma.user.findMany();

    const result = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );

    res.json(result);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { searchUsers };

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  removeUser,
  updateUser,
  changPassword,
  getPaginatedUsers,
  getUserByEmail,
  searchUsers,
};

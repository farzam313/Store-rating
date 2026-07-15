// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  console.log(
    "Registration Request Received::: HAHAHAHHAHAHHAHAH ::::",
    req.body
  );

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password and name are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the default user role
    const userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!userRole) {
      return res.status(500).json({
        message: "Default user role not found. Please run database seeds.",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
        roles: {
          create: [
            {
              role: {
                connect: { id: userRole.id },
              },
            },
          ],
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      { userId: newUser.id.toString(), email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: password_, ...newUserObj } = newUser;
    const roles = (newUserObj.roles || []).map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
      description: ur.role.description || null,
    }));

    const userWithoutPassword = { ...newUserObj, roles };

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are Required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const { password: password_, ...userObj } = user;

    
    const roles = (userObj.roles || []).map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
      description: ur.role.description || null,
    }));

    const userWithoutPassword = { ...userObj, roles };
    // console.log(userWithoutPassword);

    res.json({
      message: "Login Successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error Logging out User:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const roles = (user.roles || []).map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
      description: ur.role.description || null,
    }));

    const { password: password_, roles: roles_, ...userPublic } = user;
    res.json({ user: { ...userPublic, roles } });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ error: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error("Error refreshing token:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

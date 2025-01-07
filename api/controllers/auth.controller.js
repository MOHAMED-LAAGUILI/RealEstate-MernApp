import bcrypt from "bcrypt";
import prisma from "../prisma/prisma.js";
import Joi from 'joi'; 
import jwt from 'jsonwebtoken';

export const registerController = async (req, res) => {
  try {
    // Destructure input fields
    const { username, email, password } = req.body;

    // Define validation schema
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
      }),
      email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format',
      }),
      password: Joi.string().min(8).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
      }),
    });

    // Validate input
    const { error } = schema.validate({ username, email, password }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((err) => err.message),
      });
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'Email is already registered'
          : 'Username is already taken',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Send success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error in registerController:', error);

    // Handle errors
    return res.status(500).json({
      success: false,
      message: `Internal server error ${error}`,
    });
  }
};


export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Define validation schema
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format',
      }),
      password: Joi.string().min(8).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
      }),
    });

    // Validate input
    const { error } = schema.validate({ email, password }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((err) => err.message),
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
// Token expires in 7 days
const JWT_SECRET = process.env.JWT_SECRET
const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
  expiresIn: '7d'
});

// Set cookie to expire in 7 days
const age = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.DEV_MODE === "production" ? true : false,
  maxAge: age
});

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Include token for client-side authentication
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (e) {
    console.error('Error in loginController:', e);

    return res.status(500).json({
      success: false,
      message: `Internal server error ${e}`,
    });
  }
};
export const logoutController = async (req, res) => {
  try {
    // Clear token (in a real-world app, you may need to handle token invalidation)
    res.clearCookie('token'); // If token is stored as an HTTP-only cookie

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Error in logoutController:', error);

    return res.status(500).json({
      success: false,
      message: `Internal server error ${error}`,
    });
  }
};

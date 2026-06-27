import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Register hit - body:', req.body);
    const { name, email, password, role, storeId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    console.log('Creating user...');
    const user = new User({
      name,
      email,
      passwordHash: password,
      role: role || 'cashier',
      ...(storeId && { storeId }),
    });

    console.log('Saving user...');
    await user.save();
    console.log('User saved:', user._id);

    const token = generateToken({
      userId: (user._id as any).toString(),
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('REGISTER ERROR:', error.message);
    console.error('REGISTER STACK:', error.stack);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const token = generateToken({
      userId: (user._id as any).toString(),
      role: user.role,
    });
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Advertiser = require('../models/advertiser');
const Publisher = require('../models/publisher');
const BodyShop = require('../models/bodyShop');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, contactNumber, type, ...additionalDetails } = req.body;

        if (!name || !email || !password || !type) {
            return res.status(400).json({ success: false, message: 'All required fields (name, email, password, type) must be provided.' });
        }

        const validTypes = ['Admin', 'Advertiser', 'Publisher', 'BodyShop'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid user type. Allowed types are Admin, Advertiser, Publisher, or BodyShop.' });
        }

        const existingUser = await Promise.any([
            Admin.findOne({ email }),
            Advertiser.findOne({ email }),
            Publisher.findOne({ email }),
            BodyShop.findOne({ email }),
        ]);

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already registered. Please use a different email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user;
        switch (type) {
            case 'Admin':
                user = await Admin.create({ name, email, password: hashedPassword, contactNumber });
                break;
            case 'Advertiser':
                user = await Advertiser.create({
                    name,
                    email,
                    password: hashedPassword,
                    contactNumber,
                    ...additionalDetails,
                });
                break;
            case 'Publisher':
                user = await Publisher.create({
                    name,
                    email,
                    password: hashedPassword,
                    contactNumber,
                    vehicleDetails: additionalDetails.vehicleDetails,
                });
                break;
            case 'BodyShop':
                user = await BodyShop.create({
                    name,
                    email,
                    password: hashedPassword,
                    contactNumber,
                    ...additionalDetails,
                });
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid user type.' });
        }

        const token = jwt.sign({ id: user._id, type }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            type,
        });
    } catch (error) {
        console.error('Error during user registration:', error.message);

        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email is already registered. Please use a different email.' });
        }

        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password, type } = req.body;

        if (!email?.trim() || !password?.trim() || !type?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'All fields (email, password, type) are required.',
            });
        }

        const userModels = {
            Admin,
            Advertiser,
            Publisher,
            BodyShop,
        };

        const UserModel = userModels[type];
        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type. Allowed types are Admin, Advertiser, Publisher, or BodyShop.',
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please check your credentials or register.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Please check your email and password.',
            });
        }

        const token = jwt.sign(
            { id: user._id, type },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            type,
        });
    } catch (error) {
        console.error('Error during user login:', error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
};

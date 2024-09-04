const Appointment = require("../models/appointment");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    require('fs').mkdir(uploadPath, { recursive: true }, (err) => cb(err, uploadPath));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleImageUpload = async (imageFile) => {
  try {
    const result = await cloudinary.uploader.upload(imageFile.path, {
      width: 500,
      height: 500,
      crop: "scale",
    });
    return result.secure_url;
  } catch (error) {
    console.error(error);
    throw new Error("Error uploading image");
  }
};

const createAppointment = async (req, res) => {
  const {
    category, description, categoryTime, addsOn, availableDate
  } = req.body;

  const categoryImage = req.file;

  if (!categoryImage) {
    return res.status(400).json({ error: "Category image is required" });
  }

  try {
    const imageUrl = await handleImageUpload(categoryImage);

    // Parse JSON strings to appropriate formats
    let parsedAddsOn = [];
    let parsedAvailableDate = [];
    
    try {
      parsedAddsOn = JSON.parse(addsOn).map(item => ({
        title: item.title, 
        time: item.time
      }));
    } catch (error) {
      throw new Error("Invalid format for 'addsOn'");
    }
    
    try {
      parsedAvailableDate = JSON.parse(availableDate).map(dateStr => new Date(dateStr));
    } catch (error) {
      throw new Error("Invalid format for 'availableDate'");
    }

    // Validate `addsOn` fields
    for (const item of parsedAddsOn) {
      if (!item.title || !item.time) {
        throw new Error("Each 'addsOn' item must have 'title' and 'time'");
      }
    }

    // Validate `availableDate` fields
    if (parsedAvailableDate.some(date => isNaN(date.getTime()))) {
      throw new Error("Each 'availableDate' item must be a valid date");
    }

    const appointment = await Appointment.create({
      categoryImage: imageUrl,
      category,
      description,
      categoryTime,
      addsOn: parsedAddsOn,
      availableDate: parsedAvailableDate,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "An error occurred when creating the appointment" });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment does not exist" });
    }

    const { category, description, categoryTime, addsOn, availableDate } = req.body;
    let categoryImage = appointment.categoryImage;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        crop: "scale",
      });
      categoryImage = result.secure_url;
    }

    // Parse JSON strings to appropriate formats
    let parsedAddsOn = [];
    let parsedAvailableDate = [];
    
    try {
      parsedAddsOn = JSON.parse(addsOn).map(item => ({
        title: item.title, 
        time: item.time
      }));
    } catch (error) {
      throw new Error("Invalid format for 'addsOn'");
    }
    
    try {
      parsedAvailableDate = JSON.parse(availableDate).map(dateStr => new Date(dateStr));
    } catch (error) {
      throw new Error("Invalid format for 'availableDate'");
    }

    // Validate `addsOn` fields
    for (const item of parsedAddsOn) {
      if (!item.title || !item.time) {
        throw new Error("Each 'addsOn' item must have 'title' and 'time'");
      }
    }

    // Validate `availableDate` fields
    if (parsedAvailableDate.some(date => isNaN(date.getTime()))) {
      throw new Error("Each 'availableDate' item must be a valid date");
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        categoryImage, 
        category, 
        description, 
        categoryTime, 
        addsOn: parsedAddsOn, 
        availableDate: parsedAvailableDate 
      },
      { new: true }
    );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "An error occurred while updating the appointment" });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    } else {
      res.status(200).json(appointments);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching appointments" });
  }
};

const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "This appointment does not exist" });
    } else {
      res.status(200).json(appointment);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching the appointment" });
  }
};

const getAppointmentsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date); 
    const appointments = await Appointment.find({
      availableDate: { $gte: date },
    });

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for the specified date" });
    } else {
      res.status(200).json(appointments);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching appointments for the date" });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: "Appointment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the appointment" });
  }
};

module.exports = {
  createAppointment,
  updateAppointment,
  getAppointment,
  getAppointments,
  getAppointmentsByDate,
  deleteAppointment,
};

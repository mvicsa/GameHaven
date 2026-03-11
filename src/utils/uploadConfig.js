const multer = require('multer');
const fs = require('fs');
const path = require('path');

// إعداد الـ multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // مسار لحفظ الملفات
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // تسمية فريدة
  }
});

const fileFilter = (req, file, cb) => {
  // فلترة أنواع الملفات (اختياري)
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // حد حجم الملف 5MB (يمكن تعديله)
});

// وظيفة لتخزين الملف وإرجاع المسار
async function saveFile(file) {
  try {
    if (!file || !file.path) {
      throw new Error('No file provided');
    }

    const newPath = file.path; // المسار اللي خلاه الـ multer
    return newPath; // رجوع المسار كـ string
  } catch (err) {
    console.error('Error saving file:', err);
    throw err;
  }
}

module.exports = { upload, saveFile };
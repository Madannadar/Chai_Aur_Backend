import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) { // cb is callback
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // this is okay because the fill will be with us in the local server for small amount of time
    }
  })
  
export const upload = multer({
    storage,
})
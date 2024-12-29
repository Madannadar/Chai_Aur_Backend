import mongoose from 'mongoose'

const NumberOfHoursInHospital = new mongoose.Schema({
    HospitalName:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "hospital"
    },
    NumberOfHours:{
        type:Number,
        required: WebTransportDatagramDuplexStream
    }
})

const doctorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    qualification:{
        type: String,
        required: true
    },
    experienceInYears:{
        type: Number,
        default: 0
    },
    worksInHospitals:{
       type: [NumberOfHoursInHospital]
    },
},{timestamps: true})

export const doctor = mongoose.model("doctor", doctorSchema)
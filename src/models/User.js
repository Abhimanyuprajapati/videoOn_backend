import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
fullName:{
    type: String,
    required: true,
},
email:{
    type: String,
    required: true,
    unique: true,
},
password:{
    type: String,
    required: true,
    minlength: 8,
},
bio:{
    type: String,
    default: "",
},
profilePic:{
    type: String,
    default: "",
},
nativeLanguage:{
    type: String,
    default: "",
},
learningLanguage:{
    type: String,
    default: "",
},
location:{
    type: String,
    default: "",
},
isOnBoarded:{
    type: Boolean,
    default: false,
},
friends:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
],
},
{timestamps: true}
);

// pre hook to hash password before saving
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) {
        return next(); // If password is not modified, skip hashing
    }
    // Hash the password here
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }catch (error) {
        console.error("Error hashing password:", error);
        next(error); // Pass the error to the next middleware
    }
})

// match the password 
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


const User = mongoose.model("User",userSchema);

export default User;


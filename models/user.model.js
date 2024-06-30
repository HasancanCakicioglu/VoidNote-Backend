import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true,unique: true},
  verified: { type: Boolean, default: false },
  verificationCode: { type: String, default: undefined },
  verificationCodeExpires: { type: Date, default: undefined},
  profilePhotoUrl: { type: String, default: 'https://cdn-icons-png.freepik.com/256/552/552848.png?semt=ais_hybrid' },
  authMethod: { type: String, default: 'email' },
  passwordResetCode: { type: String, default: undefined },
  passwordResetCodeExpires: { type: Date, default: undefined },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
  },
  notes: [
    { _id: { type: mongoose.Schema.Types.ObjectId }, title: { type: String } }
  ],
  trees: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId},
      parent_id: { type: mongoose.Schema.Types.ObjectId, required: false, },
      title: { type: String , required: true },
    }
  ],
  todos: [
    { _id: mongoose.Schema.Types.ObjectId, title: String }
  ],
  calendars: [
    { _id: mongoose.Schema.Types.ObjectId, title: String }
  ]
}, { timestamps: true });



const User = mongoose.model('User', userSchema);

export default User;

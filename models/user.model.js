import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePhotoUrl: { type: String, default: 'https://cdn-icons-png.freepik.com/256/552/552848.png?semt=ais_hybrid' },
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

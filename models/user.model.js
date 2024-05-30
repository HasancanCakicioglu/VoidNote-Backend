import mongoose from 'mongoose';

// Define treeNoteChildrenSchema first
const treeNoteChildrenSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  title: { type: String },
  children: [this]
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePhotoUrl: { type: String ,default : 'https://cdn-icons-png.freepik.com/256/552/552848.png?semt=ais_hybrid'},
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
  },
  notes: [
    { _id: { type: mongoose.Schema.Types.ObjectId }, title: { type: String } }
  ],
  treeNotes: [
    treeNoteChildrenSchema
  ],
  todos: [
    { _id: mongoose.Schema.Types.ObjectId, title: String }
  ],
  calendar: [
    { _id: mongoose.Schema.Types.ObjectId, title: String }
  ]
}, { timestamps: true });



const User = mongoose.model('User', userSchema);

export default User;

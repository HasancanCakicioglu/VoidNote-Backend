import mongoose from 'mongoose';

// Alt Todos Şeması
const subTodoSchema = new mongoose.Schema({
    content: { type: String , default: ''},
    completed: { type: Boolean, default: false },
    priority: { type: Number, default: 1 } // 1: Low, 2: Medium, 3: High
}, { timestamps: true });

// Todo Şeması
const todoSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, default: ''},
    completedJobs: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    todos: [subTodoSchema]
}, { timestamps: true });

// Modelleri oluştur
const SubTodo = mongoose.model('SubTodo', subTodoSchema);
const Todo = mongoose.model('Todo', todoSchema);

export { Todo,SubTodo };
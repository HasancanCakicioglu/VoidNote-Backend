import mongoose from 'mongoose';
import styleSchema from './style.model.js';

// Alt Todos Şeması
const subTodoSchema = new mongoose.Schema({
    content: { type: String , default: ''},
    styleModel: styleSchema,
    completed: { type: Boolean, default: false },
    priority: { type: Number, default: 1 } // 1: Low, 2: Medium, 3: High
}, { timestamps: true });

// Todo Şeması
const todoSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, default: ''},
    done: { type: Boolean, default: false },
    todos: [subTodoSchema]
}, { timestamps: true });

// Modelleri oluştur
const SubTodo = mongoose.model('SubTodo', subTodoSchema);
const Todo = mongoose.model('Todo', todoSchema);

export { Todo,SubTodo };
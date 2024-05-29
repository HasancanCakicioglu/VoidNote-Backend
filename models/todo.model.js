import mongoose from 'mongoose';

// Alt Todos Şeması
const subTodoSchema = new mongoose.Schema({
    content: { type: String, required: true },
    styleModel: styleSchema,
    completed: { type: Boolean, default: false },
    priority: { type: Number, default: 1 } // 1: Low, 2: Medium, 3: High
}, { timestamps: true });

// Todo Şeması
const todoSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
    todos: [subTodoSchema]
}, { timestamps: true });

// Modelleri oluştur
const SubTodo = mongoose.model('SubTodo', subTodoSchema);
const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
import mongoose from 'mongoose';

const styleSchema = new mongoose.Schema({
    font: {
        type: Map,
        of: [[Number]],
        required: false
    },
    color:{
        type: Map,
        of: [[Number]],
        required: false
    },
    background:{
        type: Map,
        of: [[Number]],
        required: false
    },
    size:{
        type: Map,
        of: [[Number]],
        required: false
    },
    
},{ _id: false });


export default styleSchema;
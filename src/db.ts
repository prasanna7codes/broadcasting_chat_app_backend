import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const data = new Schema ({
    roomId : {type :String},
    messages: [{ type: String }],
    password: { type : String }
})


const DataModel = mongoose.model('chatdatas', data)


export {DataModel}
import mongoose from "mongoose";



const CarModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true,
}
)


export default mongoose.model('CarModel', CarModelSchema)
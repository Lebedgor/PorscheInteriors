import mongoose from "mongoose";


const InteriorSchema = new mongoose.Schema({
  name: {
    type: String,
    requered: true,
  },
  description: {
    type: String,
    default: '',
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    requered: true,
  },
  image: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    requered: true,
  },
  tags: {
    type: String,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  sortOrder: {
    type: Number,
    default: 0,
  }
},
{
  timestamps: true,
}
)


export default mongoose.model('Interior', InteriorSchema);
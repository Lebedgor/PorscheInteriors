import mongoose from 'mongoose';


const ImageSchema = new mongoose.Schema({
  interior_id: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
}
)

export default mongoose.model('Images', ImageSchema)
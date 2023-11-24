import mongoose from "mongoose"


const ArticleSchema = new mongoose.Schema(
{
title: {
  type: String,
  required: true,
  unique: true,
},
description: {
  type: String,
  required: true,
},
image: {
  type: String,
  required: true,
},
tags: {
  type: String,
},
// userId: {
//   type: String,
//   required: true,
// },
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
viewsCount: {
  type: Number,
  default: 0,
},
},
{
  timestamps: true
}
)

export default mongoose.model('Article', ArticleSchema);
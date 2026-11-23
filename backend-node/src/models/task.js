const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    priority: { type: Number, required: true, default: 5, min: 1, max: 10 }, // priority is an integer between 1 and 10
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['open', 'done'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);

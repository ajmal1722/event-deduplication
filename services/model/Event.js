import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true }, // ensure dedup persistence
    type: String,
    payload: Object,
    processedBy: String,
    processedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', eventSchema);
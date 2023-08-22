import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {}

const reportSchema = new Schema<IReport>({});

export default mongoose.model<IReport>('Report', reportSchema);

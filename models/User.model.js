import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  id: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  token:{ type: String, required: true },
  MyreferalCode: { type: String },
  date: String,
  today_earning: [
    {
      date: String,
      records: [
        {
          time: String,
          amount: Number,
          from_id: String
        }
      ]
    }
  ]
});

const User = mongoose.model('User', userSchema);
export default User;

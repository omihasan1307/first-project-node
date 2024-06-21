import {
  StudentModel,
  TGuardian,
  TLocalGuardian,
  TStudent,
  TUserName,
} from './student/student.interface';
import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import config from '..';

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First name is Required'],
    trim: true,
    maxlength: [20, 'Max Allowed length is 20'],
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return firstNameStr === value;
      },
      message: '{VALUE} is not in capitilize ',
    },
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last name is Required'],
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid',
    },
  },
});

const guardianSchema = new Schema<TGuardian>({
  fatherName: { type: String, required: [true, 'Father name is Required'] },
  fatherContactNo: {
    type: String,
    required: [true, 'Father contact number is Required'],
  },
  fatherOcupation: {
    type: String,
    required: [true, 'Father occupation is Required'],
  },
  motherName: { type: String, required: [true, 'Mother name is Required'] },
  motherContactNo: {
    type: String,
    required: [true, 'Mother contact number is Required'],
  },
  motherOcupation: {
    type: String,
    required: [true, 'Mother occupation is Required'],
  },
});

const localGuardianSchema = new Schema<TLocalGuardian>({
  name: { type: String, required: [true, 'Local guardian name is Required'] },
  occupation: {
    type: String,
    required: [true, 'Local guardian occupation is Required'],
  },
  contactNo: {
    type: String,
    required: [true, 'Local guardian contact number is Required'],
  },
  address: {
    type: String,
    required: [true, 'Local guardian address is Required'],
  },
});

const studentSchema = new Schema<TStudent, StudentModel>(
  {
    id: { type: String, required: [true, 'ID is Required'], unique: true },
    password: {
      type: String,
      required: [true, 'Pssword is Required'],
      unique: true,
    },
    name: {
      type: userNameSchema,
      required: [true, 'Name is Required'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'others'],
        message: '{VALUE} is not valid',
      },
      required: [true, 'Gender is Required'],
    },
    dateOfBirth: { type: String },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: '{VALUE} is not a Valid Email Type',
      },
    },
    contactNo: { type: String, required: [true, 'Contact number is Required'] },
    emergencyContactNo: {
      type: String,
      required: [true, 'Emergency contact number is Required'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not valid',
      },
    },
    presentAddress: {
      type: String,
      required: [true, 'Present address is Required'],
    },
    permanentAddress: {
      type: String,
      required: [true, 'Permanent address is Required'],
    },
    guardian: {
      type: guardianSchema,
      required: [true, 'Guardian information is Required'],
    },
    localGuardian: {
      type: localGuardianSchema,
      required: [true, 'Local guardian information is Required'],
    },
    profileImg: { type: String },
    isActive: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);

// virutal
studentSchema.virtual('fullname').get(function () {
  return `${this.name.firstName} ${this.name.middleName} ${this.name.lastName}`;
});

// mongoose middleware
studentSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

studentSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// query middleware
studentSchema.pre('find', async function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
studentSchema.pre('findOne', async function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// aggregate Middleware
studentSchema.pre('aggregate', async function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  // this.find({ isDeleted: { $ne: true } });
  next();
});

studentSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};

// studentSchema.methods.isUserExits = async function (id: string) {
//   const existingUser = await Student.findOne({ id });
//   return existingUser;
// };

export const Student = model<TStudent, StudentModel>('Student', studentSchema);

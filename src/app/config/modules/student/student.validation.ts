import { z } from 'zod';
import validator from 'validator';

const userNameSchema = z.object({
  firstName: z
    .string()
    .max(20, { message: 'Max Allowed length is 20' })
    .refine(
      (value) => {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return firstNameStr === value;
      },
      { message: '{VALUE} is not in capitalize' },
    ),
  middleName: z.string().optional(),
  lastName: z.string().refine((value) => validator.isAlpha(value), {
    message: '{VALUE} is not valid',
  }),
});

const guardianSchema = z.object({
  fatherName: z.string(),
  fatherContactNo: z.string(),
  fatherOcupation: z.string(),
  motherName: z.string(),
  motherContactNo: z.string(),
  motherOcupation: z.string(),
});

const localGuardianSchema = z.object({
  name: z.string(),
  occupation: z.string(),
  contactNo: z.string(),
  address: z.string(),
});

const studentValidationSchema = z.object({
  id: z.string(),
  password: z.string(),
  name: userNameSchema,
  gender: z.enum(['male', 'female', 'others']),
  dateOfBirth: z.string().optional(),
  email: z.string().email({ message: '{VALUE} is not a Valid Email Type' }),
  contactNo: z.string(),
  emergencyContactNo: z.string(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  presentAddress: z.string(),
  permanentAddress: z.string(),
  guardian: guardianSchema,
  localGuardian: localGuardianSchema,
  profileImg: z.string().optional(),
  isActive: z.enum(['active', 'blocked']).default('active'),
  isDeleted: z.boolean(),
});

export default studentValidationSchema;

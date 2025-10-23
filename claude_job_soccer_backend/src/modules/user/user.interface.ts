import { Model, Types } from "mongoose";

export enum UserType {
  CANDIDATE = "candidate",
  EMPLOYER = "employer",
  ADMIN = "admin",
}
export enum CandidateRole {
  PROFESSIONAL_PLAYER = "Professional Player",
  AMATEUR_PLAYER = "Amateur Player",
  HIGH_SCHOOL = "High School",
  COLLEGE_UNIVERSITY = "College/University",
  ON_FIELD_STAFF = "On field staff",
  OFFICE_STAFF = "Office Staff",
}
export enum EmployerRole {
  PROFESSIONAL_CLUB = "Professional Club",
  ACADEMY = "Academy",
  AMATEUR_CLUB = "Amateur Club",
  CONSULTING_COMPANY = "Consulting Company",
  HIGH_SCHOOL = "High School",
  COLLEGE_UNIVERSITY = "College/University",
  AGENT = "Agent",
}
export type TBaseUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: CandidateRole | EmployerRole;
  profileImage?: string;
  profileId: string;
  userType: UserType;
  isVerified: boolean;
  isDeleted?: boolean;
  authId: Types.ObjectId;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
} & Model<TBaseUser>;

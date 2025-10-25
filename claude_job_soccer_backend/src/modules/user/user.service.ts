import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { CandidateRole, EmployerRole } from "./user.interface";

import { QueryBuilder } from "../../shared/builder/QueryBuilder";
import { unlinkFileSync } from "../../shared/util/unlinkFile";

// Import OpenAI service
import { generateProfileScore } from "../../shared/openai";

// Import video helpers
import {
  validateVideos,
  validatePlayerVideos,
  processVideos,
  processPlayerVideos,
  cleanupUploadedFiles,
} from "../../shared/util/videoHelper";

// Import Candidate DTOs
import { AmateurPlayerCanDto } from "../candidate/amateurPlayerCan/amateurPlayerCan.dto";
import { ProfessionalPlayerCanDto } from "../candidate/professionalPlayerCan/professionalPlayerCan.dto";
import { OnFieldStaffCanDto } from "../candidate/onFieldStaffCan/onFieldStaffCan.dto";
import { OfficeStaffCanDto } from "../candidate/officeStaffCan/officeStaffCan.dto";
import { HighSchoolCanDto } from "../candidate/highSchoolCan/highSchoolCan.dto";
import { CollegeOrUniversityCanDto } from "../candidate/collegeOrUniversityCan/collegeOrUniversityCan.dto";

// Import Candidate Models
import { AmateurPlayerCan } from "../candidate/amateurPlayerCan/amateurPlayerCan.model";
import { ProfessionalPlayerCan } from "../candidate/professionalPlayerCan/professionalPlayerCan.model";
import { OnFieldStaffCan } from "../candidate/onFieldStaffCan/onFieldStaffCan.model";
import { OfficeStaffCan } from "../candidate/officeStaffCan/officeStaffCan.model";
import { HighSchoolCan } from "../candidate/highSchoolCan/highSchoolCan.model";
import { CollegeOrUniversity } from "../candidate/collegeOrUniversityCan/collegeOrUniversityCan.model";

// Import Employer DTOs
import { AcademyEmpDto } from "../employer/academyEmp/academyEmp.dto";
import { AgentEmpDto } from "../employer/agentEmp/agentEmp.dto";
import { AmateurClubEmpDto } from "../employer/amateurClubEmp/amateurClubEmp.dto";
import { CollegeOrUniversityEmpDto } from "../employer/collegeOrUniversityEmp/collegeOrUniversityEmp.dto";
import { ConsultingCompanyEmpDto } from "../employer/consultingCompanyEmp/consultingCompanyEmp.dto";
import { HighSchoolEmpDto } from "../employer/highSchoolEmp/highSchoolEmp.dto";
import { ProfessionalClubEmpDto } from "../employer/professionalClubEmp/professionalClubEmp.dto";

// Import Employer Models
import { AcademyEmp } from "../employer/academyEmp/academyEmp.model";
import { AgentEmp } from "../employer/agentEmp/agentEmp.model";
import { AmateurClubEmp } from "../employer/amateurClubEmp/amateurClubEmp.model";
import { CollegeOrUniversityEmp } from "../employer/collegeOrUniversityEmp/collegeOrUniversityEmp.model";
import { ConsultingCompanyEmp } from "../employer/consultingCompanyEmp/consultingCompanyEmp.model";
import { HighSchoolEmp } from "../employer/highSchoolEmp/highSchoolEmp.model";

import { ProfessionalClubEmp } from "../employer/professionalClubEmp/professionalClubEmp.model";

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(["firstName", "lastName", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { result, meta };
};
const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  // Cache the freshly retrieved user data.
  return user;
};
const updateUser = async (id: string, updateData: any) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (updateData.image && user.profileImage) {
    unlinkFileSync(user.profileImage);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User update failed");
  }
  return updatedUser;
};
const updateUserActivationStatus = async (
  id: string,
  status: "active" | "delete"
) => {
  console.log(status);
  console.log(id);

  const user = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true }
  );
  console.log(user);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};
const updateUserRole = async (id: string, role: "USER" | "ADMIN") => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true }
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

const getMe = async (userId: string) => {
  // If not cached, query the database using lean with virtuals enabled.
  const user = await User.findById(userId).populate("address").lean({
    virtuals: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};

const addUserProfile = async (payload: {
  userId: string;
  data: any;
  videoFiles?: Express.Multer.File[];
  videoMetadata?: any[];
  videoTitles?: string[];
}) => {
  const { userId, data, videoFiles = [], videoMetadata, videoTitles } = payload;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  // Check if user already has a profile
  if (user.profileId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User already has a profile. Use update instead."
    );
  }

  let validatedData: any;
  let profileModel: any;
  let profileId: string;

  // Handle Candidate Profiles
  if (user.userType === "candidate") {
    switch (user.role) {
      case CandidateRole.AMATEUR_PLAYER:
        // Validate player videos if provided
        if (videoFiles.length > 0) {
          const validation = await validatePlayerVideos(
            videoFiles,
            "Amateur Player"
          );
          if (!validation.isValid) {
            await cleanupUploadedFiles(videoFiles);
            throw new AppError(StatusCodes.BAD_REQUEST, validation.error!);
          }
          // Process player videos
          const processedVideos = await processPlayerVideos(
            videoFiles,
            videoTitles || []
          );
          data.videos = processedVideos;
        }

        validatedData =
          AmateurPlayerCanDto.createAmateurPlayerCanDto.parse(data);
        const amateurPlayer = await AmateurPlayerCan.create(validatedData);
        profileId = amateurPlayer._id.toString();
        break;

      case CandidateRole.PROFESSIONAL_PLAYER:
        // Validate player videos if provided
        if (videoFiles.length > 0) {
          const validation = await validatePlayerVideos(
            videoFiles,
            "Professional Player"
          );
          if (!validation.isValid) {
            await cleanupUploadedFiles(videoFiles);
            throw new AppError(StatusCodes.BAD_REQUEST, validation.error!);
          }
          // Process player videos
          const processedVideos = await processPlayerVideos(
            videoFiles,
            videoTitles || []
          );
          data.videos = processedVideos;
        }

        validatedData =
          ProfessionalPlayerCanDto.createProfessionalPlayerCanDto.parse(data);
        const professionalPlayer = await ProfessionalPlayerCan.create(
          validatedData
        );
        profileId = professionalPlayer._id.toString();
        break;

      case CandidateRole.ON_FIELD_STAFF:
        // Validate staff videos if provided
        if (videoFiles.length > 0) {
          if (!videoMetadata) {
            await cleanupUploadedFiles(videoFiles);
            throw new AppError(
              StatusCodes.BAD_REQUEST,
              "Video metadata (videoMeta) is required for staff profiles"
            );
          }

          const validation = await validateVideos(
            data.position,
            videoMetadata,
            videoFiles
          );
          if (!validation.isValid) {
            await cleanupUploadedFiles(videoFiles);
            throw new AppError(StatusCodes.BAD_REQUEST, validation.error!);
          }

          // Process staff videos
          const processedVideos = await processVideos(
            videoFiles,
            videoMetadata
          );
          data.videos = processedVideos;
        }

        validatedData = OnFieldStaffCanDto.createOnFieldStaffCanDto.parse(data);
        const onFieldStaff = await OnFieldStaffCan.create(validatedData);
        profileId = onFieldStaff._id.toString();
        break;

      case CandidateRole.HIGH_SCHOOL:
        // Videos are required for High School players
        if (videoFiles.length === 0) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "High School players must upload exactly 2 Highlights videos"
          );
        }

        const highSchoolValidation = await validatePlayerVideos(
          videoFiles,
          "High School"
        );
        if (!highSchoolValidation.isValid) {
          await cleanupUploadedFiles(videoFiles);
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            highSchoolValidation.error!
          );
        }

        // Process player videos
        const highSchoolVideos = await processPlayerVideos(
          videoFiles,
          videoTitles || []
        );
        data.videos = highSchoolVideos;

        validatedData = HighSchoolCanDto.createHighSchoolCanDto.parse(data);
        const highSchool = await HighSchoolCan.create(validatedData);
        profileId = highSchool._id.toString();
        break;

      case CandidateRole.COLLEGE_UNIVERSITY:
        // Videos are required for College/University players
        if (videoFiles.length === 0) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "College/University players must upload exactly 2 Highlights videos"
          );
        }

        const collegeValidation = await validatePlayerVideos(
          videoFiles,
          "College/University"
        );
        if (!collegeValidation.isValid) {
          await cleanupUploadedFiles(videoFiles);
          throw new AppError(StatusCodes.BAD_REQUEST, collegeValidation.error!);
        }

        // Process player videos
        const collegeVideos = await processPlayerVideos(
          videoFiles,
          videoTitles || []
        );
        data.videos = collegeVideos;

        validatedData =
          CollegeOrUniversityCanDto.createCollegeOrUniversityCanDto.parse(data);
        const collegeOrUniversity = await CollegeOrUniversity.create(
          validatedData
        );
        profileId = collegeOrUniversity._id.toString();
        break;

      case CandidateRole.OFFICE_STAFF:
        // Validate office staff videos if provided
        if (videoFiles.length > 0) {
          if (!videoMetadata) {
            await cleanupUploadedFiles(videoFiles);
            throw new AppError(
              StatusCodes.BAD_REQUEST,
              "Video metadata (videoMeta) is required for staff profiles"
            );
          }

          const validation = await validateVideos(
            data.position,
            videoMetadata,
            videoFiles
          );
          if (!validation.isValid) {
            await cleanupUploadedFiles(videoFiles);
            throw new AppError(StatusCodes.BAD_REQUEST, validation.error!);
          }

          // Process staff videos
          const processedVideos = await processVideos(
            videoFiles,
            videoMetadata
          );
          data.videos = processedVideos;
        }

        validatedData = OfficeStaffCanDto.createOfficeStaffCanDto.parse(data);
        const officeStaff = await OfficeStaffCan.create(validatedData);
        profileId = officeStaff._id.toString();
        break;

      default:
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Invalid candidate role: ${user.role}`
        );
    }
  }
  // Handle Employer Profiles
  else if (user.userType === "employer") {
    switch (user.role) {
      case EmployerRole.ACADEMY:
        validatedData = AcademyEmpDto.createAcademyEmpDto.parse(data);
        const academy = await AcademyEmp.create(validatedData);
        profileId = academy._id.toString();
        break;

      case EmployerRole.AGENT:
        validatedData = AgentEmpDto.createAgentEmpDto.parse(data);
        const agent = await AgentEmp.create(validatedData);
        profileId = agent._id.toString();
        break;

      case EmployerRole.AMATEUR_CLUB:
        validatedData = AmateurClubEmpDto.createAmateurClubEmpDto.parse(data);
        const amateurClub = await AmateurClubEmp.create(validatedData);
        profileId = amateurClub._id.toString();
        break;

      case EmployerRole.COLLEGE_UNIVERSITY:
        validatedData =
          CollegeOrUniversityEmpDto.createCollegeOrUniversityEmpDto.parse(data);
        const collegeOrUniversityEmp = await CollegeOrUniversityEmp.create(
          validatedData
        );
        profileId = collegeOrUniversityEmp._id.toString();
        break;

      case EmployerRole.CONSULTING_COMPANY:
        validatedData =
          ConsultingCompanyEmpDto.createConsultingCompanyEmpDto.parse(data);
        const consultingCompany = await ConsultingCompanyEmp.create(
          validatedData
        );
        profileId = consultingCompany._id.toString();
        break;

      case EmployerRole.HIGH_SCHOOL:
        validatedData = HighSchoolEmpDto.createHighSchoolEmpDto.parse(data);
        const highSchoolEmp = await HighSchoolEmp.create(validatedData);
        profileId = highSchoolEmp._id.toString();
        break;

      case EmployerRole.PROFESSIONAL_CLUB:
        validatedData =
          ProfessionalClubEmpDto.createProfessionalClubEmpDto.parse(data);
        const professionalClub = await ProfessionalClubEmp.create(
          validatedData
        );
        profileId = professionalClub._id.toString();
        break;

      default:
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Invalid employer role: ${user.role}`
        );
    }
  } else {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Admin users cannot have profiles"
    );
  }

  // Update user with profileId
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profileId },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update user with profile ID"
    );
  }

  // Generate AI profile score for candidates (non-blocking)
  if (user.userType === "candidate") {
    try {
      const profileScore = await generateProfileScore(
        validatedData,
        user.role as CandidateRole
      );
      
      // Update user with AI score
      await User.findByIdAndUpdate(userId, { profileAIScore: profileScore });
      
      // Update the returned user object
      updatedUser.profileAIScore = profileScore;
    } catch (error) {
      // Log error but don't fail the profile creation
      console.error("Error generating AI profile score:", error);
    }
  }

  return {
    user: updatedUser,
    profileId,
  };
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
  getMe,
  addUserProfile,
};

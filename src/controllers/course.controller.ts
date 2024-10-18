import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course from "../models/course.model";
import CourseContent from "../models/courseContent.model";
import Announcement from "../models/announcement.model";
import { NotificationController } from "../controllers/notification.controller";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const { createNotification } = new NotificationController();

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;
      const { title, objective, price, duration, lessonFormat } = req.body;

      const course = await Course.create({
        title,
        objective,
        price,
        instructorId,
        duration,
        lessonFormat,
      });

      return ResponseHandler.success(
        res,
        course,
        "Course created successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async createCourseContent(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;
      const { courseId } = req.params;
      const { title, objectives, link } = req.body;

      const files = req.files as Express.Multer.File[];

      const course = await Course.findById(courseId);
      if (
        !course ||
        !new mongoose.Types.ObjectId(course.instructorId).equals(instructorId)
      ) {
        return ResponseHandler.failure(
          res,
          "You are not authorized to add contents to this course",
          403,
        );
      }

      const Urls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content",
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }

      const courseContent = await CourseContent.create({
        courseId,
        title,
        objectives,
        link,
        files: Urls,
      });

      const curriculum = await CourseContent.find({ courseId });

      return ResponseHandler.success(
        res,
        curriculum,
        "Course curriculum updated successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getCourseCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 400);
      }

      const curriculum = await CourseContent.find({ courseId });

      return ResponseHandler.success(
        res,
        curriculum,
        "Course curriculum fetched successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;
      const { courseId } = req.params;
      const { title, details, courseList = [], sendEmail } = req.body;

      const validCourses = await Course.find({
        _id: { $in: courseList },
        instructorId: instructorId,
      });

      if (!validCourses.length) {
        return ResponseHandler.failure(res, "No valid courses found", 400);
      }

      const announcements = await Promise.all(
        validCourses.map((course) =>
          Announcement.create({
            title,
            details,
            courseIds: course._id,
          }),
        ),
      );

      if (sendEmail) {
        for (const course of validCourses) {
          const learners = course.learnerIds || [];

          for (const learnerId of learners) {
            await createNotification({
              userId: learnerId,
              courseId: course._id,
              message: `New announcement: ${title}`,
            });
          }
        }
      }

      return ResponseHandler.success(
        res,
        announcements,
        "Announcements created and notifications sent",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllAnnouncementsByCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 400);
      }

      const announcements = await Announcement.find({ courseId });

      return ResponseHandler.success(
        res,
        announcements,
        "Course announcements fetched successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}

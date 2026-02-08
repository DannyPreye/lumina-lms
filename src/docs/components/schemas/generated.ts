import { OpenAPIV3 } from "openapi-types";

export const GeneratedSchemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {
  // --- DASHBOARD SCHEMAS ---
  DashboardStudentResponse: {
    type: "object",
    properties: {
      profile: { $ref: "#/components/schemas/User" },
      enrollments: {
        type: "array",
        items: { $ref: "#/components/schemas/Enrollment" },
      },
      points: { $ref: "#/components/schemas/UserPoints" },
    },
  },
  DashboardInstructorResponse: {
    type: "object",
    properties: {
      courseStats: {
        type: "array",
        items: {
          type: "object",
          properties: {
            courseId: { type: "string" },
            courseName: { type: "string" },
            students: { type: "number" },
            completionRate: { type: "number" },
            avgRating: { type: "number" },
            views: { type: "number" },
          },
        },
      },
    },
  },
  DashboardAdminResponse: {
    type: "object",
    properties: {
      totalUsers: { type: "number" },
      certificatesIssued: { type: "number" },
      activeCategories: { type: "number" },
      announcements: { type: "number" },
      recentActivity: {
        type: "array",
        items: { $ref: "#/components/schemas/Activity" },
      },
    },
  },
  Activity: {
    type: "object",
    properties: {
      _id: { type: "string" },
      type: {
        type: "string",
        description:
          "Activity type (e.g. user_registered, certificate_issued)",
      },
      user: {
        oneOf: [ { $ref: "#/components/schemas/User" }, { type: "string" } ],
      },
      meta: { type: "object", additionalProperties: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  // --- CORE SCHEMAS ---
  User: {
    type: "object",
    properties: {
      _id: { type: "string" },
      email: { type: "string", format: "email" },
      roles: {
        type: "array",
        items: {
          type: "string",
          enum: [ "student", "instructor", "admin", "teaching_assistant" ],
        },
      },
      status: {
        type: "string",
        enum: [ "active", "suspended", "deactivated" ],
      },
      emailVerified: { type: "boolean" },
      lastLogin: { type: "string", format: "date-time" },
      preferences: {
        type: "object",
        properties: {
          emailNotifications: { type: "boolean" },
          pushNotifications: { type: "boolean" },
          theme: { type: "string", enum: [ "light", "dark", "auto" ] },
          language: { type: "string" },
          timezone: { type: "string" },
        },
      },
      studentProfile: { $ref: "#/components/schemas/StudentProfile" },
      instructorProfile: { $ref: "#/components/schemas/InstructorProfile" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  StudentProfile: {
    type: "object",
    properties: {
      _id: { type: "string" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      displayName: { type: "string" },
      avatar: { type: "string" },
      bio: { type: "string" },
      interests: { type: "array", items: { type: "string" } },
      socialLinks: {
        type: "object",
        properties: {
          linkedin: { type: "string" },
          twitter: { type: "string" },
          github: { type: "string" },
        },
      },
      enrolledCoursesCount: { type: "number" },
      completedCoursesCount: { type: "number" },
    },
  },
  InstructorProfile: {
    type: "object",
    properties: {
      _id: { type: "string" },
      user: { type: "string" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      displayName: { type: "string" },
      avatar: { type: "string" },
      bio: { type: "string" },
      title: { type: "string" },
      expertise: { type: "array", items: { type: "string" } },
      socialLinks: {
        type: "object",
        properties: {
          linkedin: { type: "string" },
          twitter: { type: "string" },
          github: { type: "string" },
          website: { type: "string" },
        },
      },
      averageRating: { type: "number" },
      totalStudents: { type: "number" },
      totalCourses: { type: "number" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Course: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      slug: { type: "string" },
      shortDescription: { type: "string" },
      fullDescription: { type: "string" },
      instructorId: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              _id: { type: "string" },
              email: { type: "string" },
              instructorProfile: { $ref: "#/components/schemas/InstructorProfile" },
              id: { type: "string" },
            },
          },
        ],
      },
      coInstructors: {
        type: "array",
        items: {
          oneOf: [
            { type: "string" },
            {
              type: "object",
              properties: {
                _id: { type: "string" },
                email: { type: "string" },
                instructorProfile: { $ref: "#/components/schemas/InstructorProfile" },
                id: { type: "string" },
              },
            },
          ],
        },
      },
      category: {
        oneOf: [
          { type: "string" },
          { $ref: "#/components/schemas/Category" },
        ],
      },
      subcategory: {
        oneOf: [
          { type: "string" },
          { $ref: "#/components/schemas/Category" },
        ],
      },
      tags: { type: "array", items: { type: "string" } },
      thumbnail: { type: "string" },
      coverImage: { type: "string" },
      previewVideo: { type: "string" },
      level: {
        type: "string",
        enum: [ "beginner", "intermediate", "advanced", "all_levels" ],
      },
      language: { type: "string" },
      pricing: {
        type: "object",
        properties: {
          type: { type: "string", enum: [ "free", "paid", "subscription" ] },
          amount: { type: "number" },
          currency: { type: "string" },
          discountPrice: { type: "number" },
          discountValidUntil: { type: "string", format: "date-time" },
        },
      },
      learningObjectives: { type: "array", items: { type: "string" } },
      requirements: { type: "array", items: { type: "string" } },
      targetAudience: { type: "array", items: { type: "string" } },
      certification: {
        type: "object",
        properties: {
          provided: { type: "boolean" },
          certificateTemplateId: { type: "string" },
          passingCriteria: {
            type: "object",
            properties: {
              minimumScore: { type: "number" },
              requiredLessons: { type: "number" },
              requiredAssignments: { type: "number" },
            },
          },
        },
      },
      settings: {
        type: "object",
        properties: {
          enrollmentType: {
            type: "string",
            enum: [ "open", "approval_required", "invitation_only" ],
          },
          maxStudents: { type: "number" },
          allowDiscussions: { type: "boolean" },
          allowPeerReview: { type: "boolean" },
          showProgressBar: { type: "boolean" },
        },
      },
      metadata: {
        type: "object",
        properties: {
          estimatedHours: { type: "number" },
          totalModules: { type: "number" },
          totalLessons: { type: "number" },
          totalQuizzes: { type: "number" },
          totalAssignments: { type: "number" },
          totalStudents: { type: "number" },
          averageRating: { type: "number" },
          totalReviews: { type: "number" },
          version: { type: "string" },
          lastUpdated: { type: "string", format: "date-time" },
        },
      },
      status: { type: "string", enum: [ "draft", "published", "archived" ] },
      publishedAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Module: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      order: { type: "number" },
      isLocked: { type: "boolean" },
      prerequisiteModuleIds: { type: "array", items: { type: "string" } },
      estimatedDuration: { type: "number" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Lesson: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      moduleId: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      order: { type: "number" },
      contentType: {
        type: "string",
        enum: [
          "video",
          "text",
          "quiz",
          "assignment",
          "discussion",
          "live_session",
          "interactive",
          "document",
          "embed",
        ],
      },
      videoContent: {
        type: "object",
        properties: {
          videoUrl: { type: "string" },
          videoDuration: { type: "number" },
          transcript: { type: "string" },
        },
      },
      textContent: {
        type: "object",
        properties: {
          body: { type: "string" },
          readingTime: { type: "number" },
        },
      },
      estimatedDuration: { type: "number" },
      isFree: { type: "boolean" },
      allowDownload: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Enrollment: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      courseId: { type: "string" },
      enrollmentType: {
        type: "string",
        enum: [ "self", "admin", "invitation", "purchase" ],
      },
      status: {
        type: "string",
        enum: [ "active", "completed", "dropped", "expired" ],
      },
      progress: {
        type: "object",
        properties: {
          completedLessons: { type: "array", items: { type: "string" } },
          completedModules: { type: "array", items: { type: "string" } },
          percentComplete: { type: "number" },
          lessonsProgress: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lessonId: { type: "string" },
                status: {
                  type: "string",
                  enum: [ "not_started", "in_progress", "completed" ],
                },
                timeSpent: { type: "number" },
                lastAccessedAt: { type: "string", format: "date-time" },
              },
            },
          },
          quizzesProgress: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quizId: { type: "string" },
                attempts: { type: "number" },
                bestScore: { type: "number" },
              },
            },
          },
        },
      },
      certificate: {
        type: "object",
        properties: {
          issued: { type: "boolean" },
          certificateId: { type: "string" },
          issuedAt: { type: "string", format: "date-time" },
          credentialUrl: { type: "string" },
        },
      },
      lastAccessedAt: { type: "string", format: "date-time" },
      enrolledAt: { type: "string", format: "date-time" },
    },
  },
  Quiz: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      type: {
        type: "string",
        enum: [ "practice", "graded", "survey", "final_exam" ],
      },
      settings: {
        type: "object",
        properties: {
          timeLimit: { type: "number" },
          passingScore: { type: "number" },
          maxAttempts: { type: "number" },
        },
      },
      totalPoints: { type: "number" },
      questionCount: { type: "number" },
      status: { type: "string", enum: [ "draft", "published", "archived" ] },
    },
  },
  QuizAttempt: {
    type: "object",
    properties: {
      _id: { type: "string" },
      quizId: { type: "string" },
      userId: { type: "string" },
      score: { type: "number" },
      passed: { type: "boolean" },
      timeSpent: { type: "number" },
      startedAt: { type: "string", format: "date-time" },
      submittedAt: { type: "string", format: "date-time" },
    },
  },
  Assignment: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      type: {
        type: "string",
        enum: [ "essay", "project", "code", "file_upload" ],
      },
      dueDate: { type: "string", format: "date-time" },
      totalPoints: { type: "number" },
    },
  },
  Submission: {
    type: "object",
    properties: {
      _id: { type: "string" },
      assignmentId: { type: "string" },
      status: { type: "string", enum: [ "submitted", "graded", "returned" ] },
      grade: {
        type: "object",
        properties: {
          score: { type: "number" },
          overallFeedback: { type: "string" },
        },
      },
    },
  },
  Notification: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      type: {
        type: "string",
        enum: [
          "course_update",
          "assignment_due",
          "quiz_graded",
          "discussion_reply",
          "live_session",
          "achievement",
          "announcement",
          "certificate_issued",
        ],
      },
      title: { type: "string" },
      message: { type: "string" },
      data: {
        type: "object",
        properties: {
          courseId: { type: "string" },
          lessonId: { type: "string" },
          assignmentId: { type: "string" },
          discussionId: { type: "string" },
        },
      },
      actionUrl: { type: "string" },
      priority: {
        type: "string",
        enum: [ "low", "normal", "high", "urgent" ],
      },
      channels: {
        type: "object",
        properties: {
          inApp: { type: "boolean" },
          email: { type: "boolean" },
          push: { type: "boolean" },
          sms: { type: "boolean" },
        },
      },
      status: { type: "string", enum: [ "unread", "read", "archived" ] },
      readAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Achievement: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      icon: { type: "string" },
      type: { type: "string", enum: [ "badge", "trophy", "certificate" ] },
      category: {
        type: "string",
        enum: [
          "course_completion",
          "streak",
          "score",
          "participation",
          "skill_mastery",
        ],
      },
      rarity: {
        type: "string",
        enum: [ "common", "rare", "epic", "legendary" ],
      },
      points: { type: "number" },
      criteria: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "course_complete",
              "lessons_complete",
              "quiz_score",
              "assignment_score",
              "discussion_posts",
              "login_streak",
              "custom",
            ],
          },
          threshold: { type: "number" },
          courseId: { type: "string" },
        },
      },
    },
  },
  LearningAnalytics: {
    type: "object",
    properties: {
      userId: { type: "string" },
      courseId: { type: "string" },
      date: { type: "string", format: "date-time" },
      metrics: {
        type: "object",
        properties: {
          timeSpent: { type: "number" },
          lessonsViewed: { type: "number" },
          quizzesTaken: { type: "number" },
          assignmentsSubmitted: { type: "number" },
          discussionPosts: { type: "number" },
        },
      },
      engagement: {
        type: "object",
        properties: {
          activeMinutes: { type: "number" },
          completedLessons: { type: "number" },
          lastSeen: { type: "string", format: "date-time" },
          completionRate: { type: "number" },
        },
      },
      performance: {
        type: "object",
        properties: {
          averageQuizScore: { type: "number" },
          averageAssignmentScore: { type: "number" },
        },
      },
      predictions: {
        type: "object",
        properties: {
          riskOfDropout: { type: "number" },
          estimatedCompletion: { type: "string", format: "date-time" },
        },
      },
    },
  },
  CourseAnalytics: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      period: { type: "string", enum: [ "daily", "weekly", "monthly" ] },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      enrollment: {
        type: "object",
        properties: {
          total: { type: "number" },
          new: { type: "number" },
          active: { type: "number" },
          completed: { type: "number" },
          dropped: { type: "number" },
        },
      },
      engagement: {
        type: "object",
        properties: {
          averageTimeSpent: { type: "number" },
          completionRate: { type: "number" },
          averageProgress: { type: "number" },
          dailyActiveUsers: { type: "number" },
          courseViews: { type: "number" },
        },
      },
      performance: {
        type: "object",
        properties: {
          averageQuizScore: { type: "number" },
          averageAssignmentScore: { type: "number" },
          passRate: { type: "number" },
        },
      },
      reviews: {
        type: "object",
        properties: {
          total: { type: "number" },
          new: { type: "number" },
          averageRating: { type: "number" },
        },
      },
      content: {
        type: "object",
        properties: {
          mostViewedLessons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lessonId: { type: "string" },
                views: { type: "number" },
              },
            },
          },
        },
      },
      revenue: {
        type: "object",
        properties: {
          totalRevenue: { type: "number" },
          averageRevenuePerStudent: { type: "number" },
        },
      },
    },
  },
  UserPoints: {
    type: "object",
    properties: {
      userId: { type: "string" },
      totalPoints: { type: "number" },
      level: { type: "number" },
      streak: {
        type: "object",
        properties: {
          current: { type: "number" },
          longest: { type: "number" },
          lastActivityDate: { type: "string", format: "date-time" },
        },
      },
    },
  },
  Leaderboard: {
    type: "object",
    properties: {
      type: { type: "string" },
      courseId: { type: "string" },
      rankings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            userId: { type: "string" },
            points: { type: "number" },
            position: { type: "number" },
          },
        },
      },
    },
  },
  Question: {
    type: "object",
    properties: {
      _id: { type: "string" },
      quizId: { type: "string" },
      type: {
        type: "string",
        enum: [
          "multiple_choice",
          "multiple_select",
          "true_false",
          "short_answer",
          "essay",
          "fill_blank",
          "matching",
          "ordering",
          "code",
        ],
      },
      question: { type: "string" },
      explanation: { type: "string" },
      points: { type: "number" },
      order: { type: "number" },
      difficulty: { type: "string", enum: [ "easy", "medium", "hard" ] },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            isCorrect: { type: "boolean" },
            order: { type: "number" },
          },
        },
      },
    },
  },
  Category: {
    type: "object",
    properties: {
      _id: { type: "string" },
      id: { type: "string" },
      name: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      icon: { type: "string" },
      parentId: { type: "string" },
      order: { type: "number" },
      isActive: { type: "boolean" },
      subcategories: {
        type: "array",
        items: { $ref: "#/components/schemas/Category" },
        description:
          "List of subcategories (populated if fetching parent categories)",
      },
    },
  },
  Review: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      userId: { type: "string" },
      rating: { type: "number" },
      title: { type: "string" },
      review: { type: "string" },
      status: {
        type: "string",
        enum: [ "pending", "approved", "flagged", "removed" ],
      },
    },
  },
  Announcement: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      moduleId: { type: "string" },
      lessonId: { type: "string" },
      authorId: { type: "string" },
      title: { type: "string" },
      content: { type: "string" },
      type: {
        type: "string",
        enum: [ "info", "warning", "urgent", "success" ],
      },
      targetAudience: {
        type: "string",
        enum: [ "all", "students", "instructors" ],
      },
      isPinned: { type: "boolean" },
    },
  },
  SystemSetting: {
    type: "object",
    properties: {
      key: { type: "string" },
      value: { type: "object" },
      category: {
        type: "string",
        enum: [ "general", "email", "payment", "ai", "security" ],
      },
    },
  },
  Certificate: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      courseId: { type: "string" },
      templateId: { type: "string" },
      certificateNumber: { type: "string" },
      credentialId: { type: "string" },
      recipientName: { type: "string" },
      courseName: { type: "string" },
      issueDate: { type: "string", format: "date-time" },
      status: { type: "string", enum: [ "active", "revoked" ] },
      certificateUrl: { type: "string" },
      verificationUrl: { type: "string" },
    },
  },
  CertificateTemplate: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      design: {
        type: "object",
        properties: {
          layout: { type: "string", enum: [ "portrait", "landscape" ] },
          templateUrl: { type: "string" },
        },
      },
      isDefault: { type: "boolean" },
    },
  },
  Reply: {
    type: "object",
    properties: {
      _id: { type: "string" },
      authorId: { type: "string" },
      body: { type: "string" },
      parentReplyId: { type: "string" },
      upvotes: { type: "number" },
      downvotes: { type: "number" },
      isAcceptedAnswer: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Discussion: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      lessonId: { type: "string" },
      type: { type: "string", enum: [ "forum", "q_and_a", "announcement" ] },
      title: { type: "string" },
      body: { type: "string" },
      authorId: { type: "string" },
      isPinned: { type: "boolean" },
      isLocked: { type: "boolean" },
      tags: { type: "array", items: { type: "string" } },
      views: { type: "number" },
      upvotes: { type: "number" },
      downvotes: { type: "number" },
      hasAcceptedAnswer: { type: "boolean" },
      acceptedAnswerId: { type: "string" },
      replies: {
        type: "array",
        items: { $ref: "#/components/schemas/Reply" },
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Cart: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            courseId: { $ref: "#/components/schemas/Course" },
            addedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  Wishlist: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      courses: {
        type: "array",
        items: { $ref: "#/components/schemas/Course" },
      },
    },
  },
  BlogPost: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      slug: { type: "string" },
      content: { type: "string" },
      excerpt: { type: "string" },
      authorId: { type: "string" },
      categoryId: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      featuredImage: { type: "string" },
      status: { type: "string", enum: [ "draft", "published", "archived" ] },
      views: { type: "number" },
      readingTime: { type: "number" },
      publishedAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Asset: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      fileName: { type: "string" },
      fileUrl: { type: "string" },
      publicId: { type: "string" },
      fileType: { type: "string" },
      fileSize: { type: "number" },
      folder: { type: "string" },
      mimeType: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Folder: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      name: { type: "string" },
      path: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  LiveSession: {
    type: "object",
    properties: {
      _id: { type: "string" },
      courseId: { type: "string" },
      instructorId: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              _id: { type: "string" },
              profile: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  displayName: { type: "string" },
                },
              },
            },
          },
        ],
      },
      title: { type: "string" },
      description: { type: "string" },
      agenda: { type: "string" },
      type: {
        type: "string",
        enum: [
          "lecture",
          "tutorial",
          "office_hours",
          "group_discussion",
          "webinar",
        ],
      },
      platform: {
        type: "string",
        enum: [ "zoom", "google_meet", "teams", "custom" ],
      },
      meetingUrl: { type: "string" },
      scheduledStart: { type: "string", format: "date-time" },
      scheduledEnd: { type: "string", format: "date-time" },
      status: {
        type: "string",
        enum: [ "scheduled", "ongoing", "completed", "cancelled" ],
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
};

import swaggerJSDoc from 'swagger-jsdoc';
import { OpenAPIV3 } from 'openapi-types';

const definition: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'Lumina Learning Platform API',
        version: '1.0.0',
        description: 'Complete API documentation for Lumina, a full-featured Learning Management System. Categorized by User Roles (Public, Student, Instructor, Admin).'
    },
    servers: [ { url: 'http://localhost:5000/api/v1' } ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            // --- CORE SCHEMAS ---
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    roles: { type: 'array', items: { type: 'string', enum: [ 'student', 'instructor', 'admin', 'teaching_assistant' ] } },
                    profile: {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            displayName: { type: 'string' },
                            avatar: { type: 'string' },
                            bio: { type: 'string' },
                            title: { type: 'string' },
                            timezone: { type: 'string' },
                            language: { type: 'string' }
                        }
                    },
                    contactInfo: {
                        type: 'object',
                        properties: {
                            phone: { type: 'string' },
                            socialLinks: {
                                type: 'object',
                                properties: {
                                    linkedin: { type: 'string' },
                                    twitter: { type: 'string' },
                                    github: { type: 'string' }
                                }
                            }
                        }
                    },
                    status: { type: 'string', enum: [ 'active', 'suspended', 'deactivated' ] },
                    emailVerified: { type: 'boolean' },
                    lastLogin: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Course: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    shortDescription: { type: 'string' },
                    fullDescription: { type: 'string' },
                    instructorId: { type: 'string' },
                    coInstructors: { type: 'array', items: { type: 'string' } },
                    category: { type: 'string', description: 'Reference to a Category ID' },
                    subcategory: { type: 'string', description: 'Reference to a Category ID' },
                    tags: { type: 'array', items: { type: 'string' } },
                    thumbnail: { type: 'string' },
                    coverImage: { type: 'string' },
                    previewVideo: { type: 'string' },
                    level: { type: 'string', enum: [ 'beginner', 'intermediate', 'advanced', 'all_levels' ] },
                    language: { type: 'string' },
                    pricing: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', enum: [ 'free', 'paid', 'subscription' ] },
                            amount: { type: 'number' },
                            currency: { type: 'string' },
                            discountPrice: { type: 'number' },
                            discountValidUntil: { type: 'string', format: 'date-time' }
                        }
                    },
                    learningObjectives: { type: 'array', items: { type: 'string' } },
                    requirements: { type: 'array', items: { type: 'string' } },
                    targetAudience: { type: 'array', items: { type: 'string' } },
                    certification: {
                        type: 'object',
                        properties: {
                            provided: { type: 'boolean' },
                            certificateTemplateId: { type: 'string' },
                            passingCriteria: {
                                type: 'object',
                                properties: {
                                    minimumScore: { type: 'number' },
                                    requiredLessons: { type: 'number' },
                                    requiredAssignments: { type: 'number' }
                                }
                            }
                        }
                    },
                    settings: {
                        type: 'object',
                        properties: {
                            enrollmentType: { type: 'string', enum: [ 'open', 'approval_required', 'invitation_only' ] },
                            maxStudents: { type: 'number' },
                            allowDiscussions: { type: 'boolean' },
                            allowPeerReview: { type: 'boolean' },
                            showProgressBar: { type: 'boolean' }
                        }
                    },
                    metadata: {
                        type: 'object',
                        properties: {
                            estimatedHours: { type: 'number' },
                            totalModules: { type: 'number' },
                            totalLessons: { type: 'number' },
                            totalQuizzes: { type: 'number' },
                            totalAssignments: { type: 'number' },
                            version: { type: 'string' }
                        }
                    },
                    status: { type: 'string', enum: [ 'draft', 'published', 'archived' ] },
                    publishedAt: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Module: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    courseId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    order: { type: 'number' },
                    isLocked: { type: 'boolean' },
                    prerequisiteModuleIds: { type: 'array', items: { type: 'string' } },
                    estimatedDuration: { type: 'number' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Lesson: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    courseId: { type: 'string' },
                    moduleId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    order: { type: 'number' },
                    contentType: { type: 'string', enum: [ 'video', 'text', 'quiz', 'assignment', 'discussion', 'live_session', 'interactive', 'document', 'embed' ] },
                    videoContent: {
                        type: 'object',
                        properties: {
                            videoUrl: { type: 'string' },
                            videoDuration: { type: 'number' },
                            transcript: { type: 'string' }
                        }
                    },
                    textContent: {
                        type: 'object',
                        properties: {
                            body: { type: 'string' },
                            readingTime: { type: 'number' }
                        }
                    },
                    estimatedDuration: { type: 'number' },
                    isFree: { type: 'boolean' },
                    allowDownload: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Enrollment: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    courseId: { type: 'string' },
                    enrollmentType: { type: 'string', enum: [ 'self', 'admin', 'invitation', 'purchase' ] },
                    status: { type: 'string', enum: [ 'active', 'completed', 'dropped', 'expired' ] },
                    progress: {
                        type: 'object',
                        properties: {
                            completedLessons: { type: 'array', items: { type: 'string' } },
                            completedModules: { type: 'array', items: { type: 'string' } },
                            percentComplete: { type: 'number' },
                            lessonsProgress: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        lessonId: { type: 'string' },
                                        status: { type: 'string', enum: [ 'not_started', 'in_progress', 'completed' ] },
                                        timeSpent: { type: 'number' },
                                        lastAccessedAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            },
                            quizzesProgress: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        quizId: { type: 'string' },
                                        attempts: { type: 'number' },
                                        bestScore: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    certificate: {
                        type: 'object',
                        properties: {
                            issued: { type: 'boolean' },
                            certificateId: { type: 'string' },
                            issuedAt: { type: 'string', format: 'date-time' },
                            credentialUrl: { type: 'string' }
                        }
                    },
                    lastAccessedAt: { type: 'string', format: 'date-time' },
                    enrolledAt: { type: 'string', format: 'date-time' }
                }
            },
            Quiz: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    courseId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string', enum: [ 'practice', 'graded', 'survey', 'final_exam' ] },
                    settings: {
                        type: 'object',
                        properties: {
                            timeLimit: { type: 'number' },
                            passingScore: { type: 'number' },
                            maxAttempts: { type: 'number' }
                        }
                    },
                    totalPoints: { type: 'number' },
                    questionCount: { type: 'number' },
                    status: { type: 'string', enum: [ 'draft', 'published', 'archived' ] }
                }
            },
            QuizAttempt: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    quizId: { type: 'string' },
                    userId: { type: 'string' },
                    score: { type: 'number' },
                    passed: { type: 'boolean' },
                    timeSpent: { type: 'number' },
                    startedAt: { type: 'string', format: 'date-time' },
                    submittedAt: { type: 'string', format: 'date-time' }
                }
            },
            Assignment: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    type: { type: 'string', enum: [ 'essay', 'project', 'code', 'file_upload' ] },
                    dueDate: { type: 'string', format: 'date-time' },
                    totalPoints: { type: 'number' }
                }
            },
            Submission: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    assignmentId: { type: 'string' },
                    status: { type: 'string', enum: [ 'submitted', 'graded', 'returned' ] },
                    grade: {
                        type: 'object',
                        properties: { score: { type: 'number' }, overallFeedback: { type: 'string' } }
                    }
                }
            },
            Notification: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    type: { type: 'string', enum: [ 'course_update', 'assignment_due', 'quiz_graded', 'discussion_reply', 'live_session', 'achievement', 'announcement', 'certificate_issued' ] },
                    title: { type: 'string' },
                    message: { type: 'string' },
                    data: {
                        type: 'object',
                        properties: {
                            courseId: { type: 'string' },
                            lessonId: { type: 'string' },
                            assignmentId: { type: 'string' },
                            discussionId: { type: 'string' }
                        }
                    },
                    actionUrl: { type: 'string' },
                    priority: { type: 'string', enum: [ 'low', 'normal', 'high', 'urgent' ] },
                    channels: {
                        type: 'object',
                        properties: {
                            inApp: { type: 'boolean' },
                            email: { type: 'boolean' },
                            push: { type: 'boolean' },
                            sms: { type: 'boolean' }
                        }
                    },
                    status: { type: 'string', enum: [ 'unread', 'read', 'archived' ] },
                    readAt: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Achievement: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    type: { type: 'string', enum: [ 'badge', 'trophy', 'certificate' ] },
                    category: { type: 'string', enum: [ 'course_completion', 'streak', 'score', 'participation', 'skill_mastery' ] },
                    rarity: { type: 'string', enum: [ 'common', 'rare', 'epic', 'legendary' ] },
                    points: { type: 'number' },
                    criteria: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', enum: [ 'course_complete', 'lessons_complete', 'quiz_score', 'assignment_score', 'discussion_posts', 'login_streak', 'custom' ] },
                            threshold: { type: 'number' },
                            courseId: { type: 'string' }
                        }
                    }
                }
            },
            LearningAnalytics: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    courseId: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    metrics: {
                        type: 'object',
                        properties: {
                            timeSpent: { type: 'number' },
                            lessonsViewed: { type: 'number' },
                            quizzesTaken: { type: 'number' },
                            assignmentsSubmitted: { type: 'number' },
                            discussionPosts: { type: 'number' }
                        }
                    },
                    performance: {
                        type: 'object',
                        properties: {
                            averageQuizScore: { type: 'number' },
                            averageAssignmentScore: { type: 'number' }
                        }
                    },
                    predictions: {
                        type: 'object',
                        properties: {
                            riskOfDropout: { type: 'number' },
                            estimatedCompletion: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            },
            CourseAnalytics: {
                type: 'object',
                properties: {
                    courseId: { type: 'string' },
                    period: { type: 'string', enum: [ 'daily', 'weekly', 'monthly' ] },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                    enrollment: {
                        type: 'object',
                        properties: {
                            total: { type: 'number' },
                            active: { type: 'number' },
                            completed: { type: 'number' }
                        }
                    },
                    engagement: {
                        type: 'object',
                        properties: {
                            averageTimeSpent: { type: 'number' },
                            completionRate: { type: 'number' }
                        }
                    }
                }
            },
            UserPoints: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    totalPoints: { type: 'number' },
                    level: { type: 'number' },
                    streak: {
                        type: 'object',
                        properties: {
                            current: { type: 'number' },
                            longest: { type: 'number' },
                            lastActivityDate: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            },
            Leaderboard: {
                type: 'object',
                properties: {
                    type: { type: 'string' },
                    courseId: { type: 'string' },
                    rankings: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                userId: { type: 'string' },
                                points: { type: 'number' },
                                position: { type: 'number' }
                            }
                        }
                    }
                }
            },
            Question: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    quizId: { type: 'string' },
                    type: { type: 'string', enum: [ 'multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching', 'ordering', 'code' ] },
                    question: { type: 'string' },
                    explanation: { type: 'string' },
                    points: { type: 'number' },
                    order: { type: 'number' },
                    difficulty: { type: 'string', enum: [ 'easy', 'medium', 'hard' ] },
                    options: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                text: { type: 'string' },
                                isCorrect: { type: 'boolean' },
                                order: { type: 'number' }
                            }
                        }
                    }
                }
            },
            Category: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    parentId: { type: 'string' },
                    order: { type: 'number' },
                    isActive: { type: 'boolean' }
                }
            },
            Review: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    courseId: { type: 'string' },
                    userId: { type: 'string' },
                    rating: { type: 'number' },
                    title: { type: 'string' },
                    review: { type: 'string' },
                    status: { type: 'string', enum: [ 'pending', 'approved', 'flagged', 'removed' ] }
                }
            },
            Announcement: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    courseId: { type: 'string' },
                    authorId: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    type: { type: 'string', enum: [ 'info', 'warning', 'urgent', 'success' ] },
                    targetAudience: { type: 'string', enum: [ 'all', 'students', 'instructors' ] },
                    isPinned: { type: 'boolean' }
                }
            },
            SystemSetting: {
                type: 'object',
                properties: {
                    key: { type: 'string' },
                    value: { type: 'object' },
                    category: { type: 'string', enum: [ 'general', 'email', 'payment', 'ai', 'security' ] }
                }
            },
            Certificate: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    courseId: { type: 'string' },
                    templateId: { type: 'string' },
                    certificateNumber: { type: 'string' },
                    credentialId: { type: 'string' },
                    recipientName: { type: 'string' },
                    courseName: { type: 'string' },
                    issueDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: [ 'active', 'revoked' ] },
                    certificateUrl: { type: 'string' },
                    verificationUrl: { type: 'string' }
                }
            },
            CertificateTemplate: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    design: {
                        type: 'object',
                        properties: {
                            layout: { type: 'string', enum: [ 'portrait', 'landscape' ] },
                            templateUrl: { type: 'string' }
                        }
                    },
                    isDefault: { type: 'boolean' }
                }
            },
            Reply: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    authorId: { type: 'string' },
                    body: { type: 'string' },
                    parentReplyId: { type: 'string' },
                    upvotes: { type: 'number' },
                    isAcceptedAnswer: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Discussion: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    courseId: { type: 'string' },
                    lessonId: { type: 'string' },
                    type: { type: 'string', enum: [ 'forum', 'q_and_a', 'announcement' ] },
                    title: { type: 'string' },
                    body: { type: 'string' },
                    authorId: { type: 'string' },
                    isPinned: { type: 'boolean' },
                    isLocked: { type: 'boolean' },
                    tags: { type: 'array', items: { type: 'string' } },
                    views: { type: 'number' },
                    upvotes: { type: 'number' },
                    hasAcceptedAnswer: { type: 'boolean' },
                    replies: { type: 'array', items: { $ref: '#/components/schemas/Reply' } },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Cart: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                courseId: { $ref: '#/components/schemas/Course' },
                                addedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            },
            Wishlist: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    courses: { type: 'array', items: { $ref: '#/components/schemas/Course' } }
                }
            },
            BlogPost: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    content: { type: 'string' },
                    excerpt: { type: 'string' },
                    authorId: { type: 'string' },
                    categoryId: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    featuredImage: { type: 'string' },
                    status: { type: 'string', enum: [ 'draft', 'published', 'archived' ] },
                    views: { type: 'number' },
                    readingTime: { type: 'number' },
                    publishedAt: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Asset: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    fileName: { type: 'string' },
                    fileUrl: { type: 'string' },
                    publicId: { type: 'string' },
                    fileType: { type: 'string' },
                    fileSize: { type: 'number' },
                    folder: { type: 'string' },
                    mimeType: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
        }
    },
    paths: {
        // ==========================================
        // AUTH MODULE
        // ==========================================
        '/auth/register': {
            post: {
                tags: [ 'Public' ],
                summary: 'User Registration',
                description: 'Register a new user and send a verification email.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'email', 'password', 'firstName', 'lastName', 'displayName' ],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 8 },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    displayName: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Registration successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                email: { type: 'string' },
                                                roles: { type: 'array', items: { type: 'string' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'User already exists or validation error' }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: [ 'Public' ],
                summary: 'User Login',
                description: 'Authenticate user and return access token. Refresh token is set in an HttpOnly cookie.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'email', 'password' ],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        accessToken: { type: 'string' },
                                        user: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                email: { type: 'string' },
                                                roles: { type: 'array', items: { type: 'string' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Invalid credentials' }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: [ 'Public' ],
                summary: 'User Logout',
                description: 'Clear the refresh token cookie.',
                responses: {
                    200: {
                        description: 'Logged out successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    }
                }
            }
        },
        '/auth/refresh-token': {
            post: {
                tags: [ 'Public' ],
                summary: 'Refresh Access Token',
                description: 'Use the refresh token cookie to get a new access token.',
                responses: {
                    200: {
                        description: 'New access token returned',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, accessToken: { type: 'string' } } } } }
                    },
                    401: { description: 'Invalid or missing refresh token' }
                }
            }
        },
        '/auth/verify-email': {
            post: {
                tags: [ 'Public' ],
                summary: 'Verify Email',
                description: 'Verify user email using the token sent during registration.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'token' ], properties: { token: { type: 'string' } } } } }
                },
                responses: {
                    200: {
                        description: 'Email verified successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    },
                    400: { description: 'Invalid or expired token' }
                }
            }
        },
        '/auth/forgot-password': {
            post: {
                tags: [ 'Public' ],
                summary: 'Forgot Password',
                description: 'Send a password reset link to the provided email.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'email' ], properties: { email: { type: 'string', format: 'email' } } } } }
                },
                responses: {
                    200: {
                        description: 'Reset link sent (or supposedly sent to prevent enumeration)',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    }
                }
            }
        },
        '/auth/reset-password': {
            post: {
                tags: [ 'Public' ],
                summary: 'Reset Password',
                description: 'Reset password using the token sent in the reset email.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'token', 'newPassword' ],
                                properties: {
                                    token: { type: 'string' },
                                    newPassword: { type: 'string', minLength: 8 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password reset successful',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    },
                    400: { description: 'Invalid or expired token' }
                }
            }
        },
        '/auth/google': {
            get: {
                tags: [ 'Public' ],
                summary: 'Google OAuth login',
                description: 'Redirects to Google for authentication.',
                responses: { 302: { description: 'Redirect to Google' } }
            }
        },
        '/auth/google/callback': {
            get: {
                tags: [ 'Public' ],
                summary: 'Google OAuth callback',
                description: 'Callback endpoint for Google OAuth redirection. Returns access token upon successful authentication.',
                responses: {
                    200: {
                        description: 'Authentication successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        accessToken: { type: 'string' },
                                        user: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                email: { type: 'string' },
                                                roles: { type: 'array', items: { type: 'string' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Authentication failed' }
                }
            }
        },

        // ==========================================
        // USERS MODULE
        // ==========================================
        '/users/profile': {
            get: {
                tags: [ 'User' ],
                summary: 'Get current user profile',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'Profile data retrieved',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } }
                    }
                }
            },
            patch: {
                tags: [ 'User' ],
                summary: 'Update current user profile',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', properties: { profile: { type: 'object' }, contactInfo: { type: 'object' }, preferences: { type: 'object' } } } } }
                },
                responses: {
                    200: {
                        description: 'Profile updated successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } }
                    }
                }
            }
        },
        '/users': {
            get: {
                tags: [ 'Admin' ],
                summary: 'List all users (Admin only)',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: [ 'active', 'suspended', 'deactivated' ] } },
                    { name: 'role', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    200: {
                        description: 'Users list retrieved',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/users/{id}': {
            get: {
                tags: [ 'Admin' ],
                summary: 'Get user by ID (Admin only)',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'User data retrieved',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } }
                    }
                }
            },
            delete: {
                tags: [ 'Admin' ],
                summary: 'Delete user (Admin only)',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'User deleted successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    }
                }
            }
        },
        '/users/{id}/roles': {
            patch: {
                tags: [ 'Admin' ],
                summary: 'Update user roles (Admin only)',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'roles' ], properties: { roles: { type: 'array', items: { type: 'string' } } } } } }
                },
                responses: {
                    200: {
                        description: 'Roles updated successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } }
                    }
                }
            }
        },
        '/users/{id}/status': {
            patch: {
                tags: [ 'Admin' ],
                summary: 'Update user status (Admin only)',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'status' ], properties: { status: { type: 'string', enum: [ 'active', 'suspended', 'deactivated' ] } } } } }
                },
                responses: {
                    200: {
                        description: 'Status updated successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } }
                    }
                }
            }
        },

        // ==========================================
        // COURSES MODULE
        // ==========================================
        '/courses/category/{categoryId}': {
            get: {
                tags: [ 'Public' ],
                summary: 'Get courses by category',
                description: 'Returns all published courses for a specific category or subcategory ID.',
                parameters: [ { name: 'categoryId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'Courses retrieved successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Course' } } } } } }
                    }
                }
            }
        },
        '/courses': {
            get: {
                tags: [ 'Public' ],
                summary: 'List courses with filters and pagination',
                description: 'Returns a paginated list of published courses. Supports filtering by category, level, pricing type, and keyword search.',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category or subcategory ID' },
                    { name: 'level', in: 'query', schema: { type: 'string', enum: [ 'beginner', 'intermediate', 'advanced', 'all_levels' ] } },
                    { name: 'pricingType', in: 'query', schema: { type: 'string', enum: [ 'free', 'paid', 'subscription' ] } },
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Keyword search in title and description' },
                    { name: 'sort', in: 'query', schema: { type: 'string', default: '-createdAt' }, description: 'Field to sort by (prefix with - for descending)' }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        courses: { type: 'array', items: { $ref: '#/components/schemas/Course' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: [ 'Instructor' ],
                summary: 'Create a new course',
                description: 'Initialize a course draft with basic info',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'title', 'shortDescription', 'fullDescription', 'category' ],
                                properties: {
                                    title: { type: 'string', example: 'Advanced Web Development with React' },
                                    shortDescription: { type: 'string', example: 'Master modern React patterns and performance optimization.' },
                                    fullDescription: { type: 'string', example: 'In this comprehensive course, you will learn how to build scalable applications using React, Redux, and modern hooks. We cover architectural patterns, performance bottlenecks, and automated testing.' },
                                    category: { type: 'string', example: 'Development' },
                                    subcategory: { type: 'string', example: 'Frontend' },
                                    level: { type: 'string', enum: [ 'beginner', 'intermediate', 'advanced', 'all_levels' ], example: 'advanced' },
                                    tags: { type: 'array', items: { type: 'string' }, example: [ 'React', 'JavaScript', 'Web Development' ] },
                                    pricing: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', enum: [ 'free', 'paid', 'subscription' ], example: 'paid' },
                                            amount: { type: 'number', example: 49.99 },
                                            currency: { type: 'string', example: 'USD' }
                                        }
                                    },
                                    learningObjectives: { type: 'array', items: { type: 'string' }, example: [ 'Understand advanced hook patterns', 'Implement custom middleware', 'Profile application performance' ] },
                                    requirements: { type: 'array', items: { type: 'string' }, example: [ 'Solid JavaScript knowledge', 'Basic React understanding' ] },
                                    settings: {
                                        type: 'object',
                                        properties: {
                                            enrollmentType: { type: 'string', enum: [ 'open', 'approval_required', 'invitation_only' ], example: 'open' },
                                            allowDiscussions: { type: 'boolean', example: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Course created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } } }
            }
        },
        '/courses/{slug}': {
            get: {
                tags: [ 'Public' ],
                summary: 'Get course details by slug',
                parameters: [ { name: 'slug', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } } }
            }
        },
        '/courses/{courseId}/structure': {
            get: {
                tags: [ 'Public' ],
                summary: 'Get course curriculum structure',
                description: 'Returns a hierarchical list of modules and their lessons',
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Module' } } } } } }
            }
        },
        '/courses/{courseId}/modules': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Add a new module to a course',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'title', 'order' ], properties: { title: { type: 'string' }, order: { type: 'number' } } } } }
                },
                responses: { 201: { description: 'Module added', content: { 'application/json': { schema: { $ref: '#/components/schemas/Module' } } } } }
            }
        },
        '/courses/{courseId}/modules/{moduleId}/lessons': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Add a new lesson to a module',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Lesson' } } }
                },
                responses: { 201: { description: 'Lesson added', content: { 'application/json': { schema: { $ref: '#/components/schemas/Lesson' } } } } }
            }
        },

        // ==========================================
        // ENROLLMENTS MODULE
        // ==========================================
        '/enrollments/enroll': {
            post: {
                tags: [ 'Student' ],
                summary: 'Enroll in a course',
                description: 'Enrolls the authenticated user into a published course.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'courseId' ], properties: { courseId: { type: 'string' } } } } }
                },
                responses: {
                    201: { description: 'Enrolled successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Enrollment' } } } } } },
                    400: { description: 'Course not published or already enrolled' },
                    404: { description: 'Course not found' }
                }
            }
        },
        '/enrollments/my-courses': {
            get: {
                tags: [ 'Student' ],
                summary: 'List user enrollments',
                description: 'Returns all courses the authenticated user is enrolled in. Supports filtering by status and pagination.',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: [ 'active', 'completed', 'dropped' ] } },
                    { name: 'type', in: 'query', schema: { type: 'string', description: 'Enrollment type (e.g., self, assigned)' } },
                    { name: 'sort', in: 'query', schema: { type: 'string', default: '-enrolledAt' } }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        enrollments: { type: 'array', items: { $ref: '#/components/schemas/Enrollment' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/enrollments/{courseId}/progress': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get course progress details',
                description: 'Returns the progress and enrollment details for a specific course.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Enrollment' } } } } } },
                    404: { description: 'Enrollment not found' }
                }
            }
        },
        '/enrollments/{courseId}/complete-lesson': {
            post: {
                tags: [ 'Student' ],
                summary: 'Mark lesson as completed',
                description: 'Updates the user progress by marking a specific lesson as complete.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'lessonId' ], properties: { lessonId: { type: 'string' } } } } }
                },
                responses: {
                    200: { description: 'Lesson completed', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Enrollment' } } } } } },
                    404: { description: 'Enrollment not found' }
                }
            }
        },

        // ==========================================
        // ASSESSMENTS MODULE
        // ==========================================
        '/assessments/quizzes': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Create a new quiz',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'courseId', 'title' ],
                                properties: {
                                    courseId: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    type: { type: 'string', enum: [ 'practice', 'graded', 'survey', 'final_exam' ] },
                                    settings: {
                                        type: 'object',
                                        properties: {
                                            timeLimit: { type: 'number' },
                                            passingScore: { type: 'number' },
                                            maxAttempts: { type: 'number' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Quiz created',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Quiz' } } } } }
                    }
                }
            }
        },
        '/assessments/quizzes/{quizId}': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get quiz details',
                description: 'Returns quiz metadata and questions. Answers are stripped for students.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'quizId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                quiz: { $ref: '#/components/schemas/Quiz' },
                                                questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/assessments/quizzes/{quizId}/questions': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Add a question to a quiz',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'quizId', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Question' } } }
                },
                responses: {
                    201: {
                        description: 'Question added',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Question' } } } } }
                    }
                }
            }
        },
        '/assessments/quizzes/{quizId}/publish': {
            patch: {
                tags: [ 'Instructor' ],
                summary: 'Publish a quiz',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'quizId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'Quiz published',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Quiz' } } } } }
                    }
                }
            }
        },
        '/assessments/attempts/start': {
            post: {
                tags: [ 'Student' ],
                summary: 'Start a quiz attempt',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'quizId', 'courseId' ], properties: { quizId: { type: 'string' }, courseId: { type: 'string' } } } } }
                },
                responses: {
                    201: {
                        description: 'Attempt started',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/QuizAttempt' } } } } }
                    }
                }
            }
        },
        '/assessments/attempts/{attemptId}/submit': {
            post: {
                tags: [ 'Student' ],
                summary: 'Submit quiz answers',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'attemptId', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, answer: { type: 'string' } } } } } } } }
                },
                responses: {
                    200: {
                        description: 'Quiz graded',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/QuizAttempt' } } } } }
                    }
                }
            }
        },
        '/assessments/assignments': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Create a new assignment',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'courseId', 'title', 'dueDate' ],
                                properties: {
                                    courseId: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    dueDate: { type: 'string', format: 'date-time' },
                                    totalPoints: { type: 'number' },
                                    lateSubmission: {
                                        type: 'object',
                                        properties: {
                                            allowed: { type: 'boolean' },
                                            penaltyPercentage: { type: 'number' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Assignment created',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Assignment' } } } } }
                    }
                }
            }
        },
        '/assessments/assignments/{assignmentId}/submit': {
            post: {
                tags: [ 'Student' ],
                summary: 'Submit an assignment',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    content: {
                                        type: 'object',
                                        properties: {
                                            text: { type: 'string' },
                                            links: { type: 'array', items: { type: 'string' } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Assignment submitted',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Submission' } } } } }
                    }
                }
            }
        },

        // ==========================================
        // DISCUSSIONS MODULE
        // ==========================================
        '/discussions': {
            post: {
                tags: [ 'Student' ],
                summary: 'Create a discussion thread',
                description: 'Initializes a new discussion thread in a specific course or lesson.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'courseId', 'title', 'body' ],
                                properties: {
                                    courseId: { type: 'string' },
                                    lessonId: { type: 'string' },
                                    title: { type: 'string' },
                                    body: { type: 'string' },
                                    type: { type: 'string', enum: [ 'forum', 'q_and_a' ] },
                                    tags: { type: 'array', items: { type: 'string' } }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Thread created',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Discussion' } } } } }
                    }
                }
            }
        },
        '/discussions/course/{courseId}': {
            get: {
                tags: [ 'Public' ],
                summary: 'List course discussions',
                description: 'Returns a paginated list of discussion threads associated with a specific course. Supports filtering by type, tag, and keyword search.',
                parameters: [
                    { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'type', in: 'query', schema: { type: 'string', enum: [ 'forum', 'q_and_a' ] } },
                    { name: 'tag', in: 'query', schema: { type: 'string' }, description: 'Filter by discussion tag' },
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Keyword search in title and body' },
                    { name: 'sortBy', in: 'query', schema: { type: 'string', enum: [ 'newest', 'popular' ], default: 'newest' } }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        discussions: { type: 'array', items: { $ref: '#/components/schemas/Discussion' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/discussions/{id}': {
            get: {
                tags: [ 'Public' ],
                summary: 'Get discussion details',
                description: 'Returns a full discussion thread including all replies.',
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Discussion' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Discussion not found' }
                }
            }
        },
        '/discussions/{id}/replies': {
            post: {
                tags: [ 'Student' ],
                summary: 'Add a reply to a discussion',
                description: 'Adds a new reply or nested comment to an existing discussion thread.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'body' ],
                                properties: {
                                    body: { type: 'string' },
                                    parentReplyId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Reply added',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Discussion' } } } } }
                    }
                }
            }
        },
        '/discussions/{id}/upvote': {
            post: {
                tags: [ 'Student' ],
                summary: 'Upvote a discussion',
                description: 'Increments the upvote count for a specific discussion thread.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'Discussion upvoted',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Discussion' } } } } }
                    }
                }
            }
        },
        '/discussions/{id}/accept-answer': {
            post: {
                tags: [ 'Student' ],
                summary: 'Accept an answer',
                description: 'Marks a specific reply as the accepted answer for a Q&A style discussion.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'replyId' ],
                                properties: { replyId: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Answer accepted',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Discussion' } } } } }
                    }
                }
            }
        },

        // ==========================================
        // LIVE SESSIONS MODULE
        // ==========================================
        '/live-sessions': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Schedule a live session',
                security: [ { bearerAuth: [] } ],
                responses: { 201: { description: 'Session scheduled' } }
            }
        },
        '/live-sessions/course/{courseId}': {
            get: {
                tags: [ 'Student' ],
                summary: 'List course live sessions',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'OK' } }
            }
        },

        // ==========================================
        // GAMIFICATION MODULE
        // ==========================================
        '/gamification/my-stats': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get user points and rank',
                description: 'Returns the authenticated user points, level, streak, and earned badges.',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                points: { $ref: '#/components/schemas/UserPoints' },
                                                badges: { type: 'array', items: { type: 'object', properties: { earnedAt: { type: 'string', format: 'date-time' }, achievementId: { $ref: '#/components/schemas/Achievement' } } } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/gamification/leaderboard/{type}': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get leaderboard rankings',
                description: 'Returns the leaderboard for a specific type (e.g., global, weekly). Can optionally be filtered by courseId.',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: [ 'global', 'weekly', 'monthly' ] } },
                    { name: 'courseId', in: 'query', schema: { type: 'string' }, description: 'Filter leaderboard by course' }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Leaderboard' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/gamification/award-points': {
            post: {
                tags: [ 'Admin' ],
                summary: 'Manually award points to a user',
                description: 'Allows an administrator to manually add points to a user account.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'userId', 'points', 'action' ],
                                properties: {
                                    userId: { type: 'string' },
                                    points: { type: 'number' },
                                    action: { type: 'string' },
                                    referenceId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Points awarded successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/UserPoints' } } } } }
                    }
                }
            }
        },

        // ==========================================
        // CERTIFICATES MODULE
        // ==========================================
        '/certificates/my-certificates': {
            get: {
                tags: [ 'Student' ],
                summary: 'List user certificates',
                description: 'Returns all academic certificates earned by the authenticated student.',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Certificate' } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/certificates/verify/{credentialId}': {
            get: {
                tags: [ 'Public' ],
                summary: 'Verify a certificate',
                description: 'Publicly verify the authenticity of a certificate using its unique credential ID.',
                parameters: [ { name: 'credentialId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'Verified successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Certificate' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Certificate not found' }
                }
            }
        },
        '/certificates/templates': {
            get: {
                tags: [ 'Instructor', 'Admin' ],
                summary: 'List certificate templates',
                description: 'Returns available certificate designs and templates.',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/CertificateTemplate' } }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: [ 'Admin' ],
                summary: 'Create certificate template',
                description: 'Administrators can define a new certificate design template.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificateTemplate' } } }
                },
                responses: {
                    201: {
                        description: 'Template created',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/CertificateTemplate' } } } } }
                    }
                }
            }
        },
        '/certificates/issue': {
            post: {
                tags: [ 'Instructor', 'Admin' ],
                summary: 'Manually issue a certificate',
                description: 'Instructors or admins can manually award a certificate to a student for a specific course.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'userId', 'courseId' ],
                                properties: {
                                    userId: { type: 'string' },
                                    courseId: { type: 'string' },
                                    templateId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Certificate issued',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Certificate' } } } } }
                    }
                }
            }
        },
        '/certificates/{id}/revoke': {
            patch: {
                tags: [ 'Admin' ],
                summary: 'Revoke a certificate',
                description: 'Administrators can revoke an issued certificate for academic integrity or administrative reasons.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'reason' ], properties: { reason: { type: 'string' } } } } }
                },
                responses: {
                    200: {
                        description: 'Certificate revoked',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Certificate' } } } } }
                    },
                    404: { description: 'Certificate not found' }
                }
            }
        },

        // ==========================================
        // NOTIFICATIONS MODULE
        // ==========================================
        '/notifications': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get user notifications',
                description: 'Returns a paginated list of notifications for the authenticated user. Supports filtering by status, type, and priority.',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: [ 'unread', 'read', 'archived' ] } },
                    { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Type of notification (e.g., course_update, achievement)' },
                    { name: 'priority', in: 'query', schema: { type: 'string', enum: [ 'low', 'normal', 'high', 'urgent' ] } }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/notifications/mark-all-read': {
            patch: {
                tags: [ 'Student' ],
                summary: 'Mark all notifications as read',
                description: 'Updates the status of all current unread notifications for the user to "read".',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    }
                }
            }
        },
        '/notifications/{id}/read': {
            patch: {
                tags: [ 'Student' ],
                summary: 'Mark specific notification as read',
                description: 'Updates the status of a single notification to "read".',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Notification' } } } } }
                    },
                    404: { description: 'Notification not found' }
                }
            }
        },
        '/notifications/{id}': {
            delete: {
                tags: [ 'Student' ],
                summary: 'Delete a notification',
                description: 'Permanently removes a notification from the user account.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    },
                    404: { description: 'Notification not found' }
                }
            }
        },

        // ==========================================
        // ANALYTICS MODULE
        // ==========================================
        '/analytics/my-performance/{courseId}': {
            get: {
                tags: [ 'Student' ],
                summary: 'Personal performance report',
                description: 'Returns learning analytics and performance predictions for the authenticated user in a specific course.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/LearningAnalytics' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/analytics/track': {
            post: {
                tags: [ 'Student' ],
                summary: 'Track user activity',
                description: 'Pings a learning metric (e.g., timeSpent) to be recorded in the analytics system.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: [ 'courseId', 'metric', 'value' ],
                                properties: {
                                    courseId: { type: 'string' },
                                    metric: { type: 'string', example: 'timeSpent' },
                                    value: { type: 'number', example: 30 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } }
                    }
                }
            }
        },
        '/analytics/course-stats/{courseId}': {
            get: {
                tags: [ 'Instructor' ],
                summary: 'Course-wide analytics report',
                description: 'Returns aggregated course statistics for a set period (daily, weekly, or monthly).',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'period', in: 'query', schema: { type: 'string', enum: [ 'daily', 'weekly', 'monthly' ], default: 'weekly' } }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/CourseAnalytics' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/analytics/course-stats/{courseId}/refresh': {
            post: {
                tags: [ 'Instructor' ],
                summary: 'Refresh course analytics',
                description: 'Manually triggers a new sync/recalculation of course-wide analytics data.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'Analytics refreshed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/CourseAnalytics' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // ==========================================
        // AI MODULE
        // ==========================================
        '/ai/sessions': {
            post: {
                tags: [ 'Student' ],
                summary: 'Start AI tutoring session',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'courseId', 'type' ], properties: { courseId: { type: 'string' }, type: { type: 'string', enum: [ 'tutor', 'study_assistant' ] } } } } }
                },
                responses: { 201: { description: 'AI Session created' } }
            }
        },

        // ==========================================
        // SYSTEM ADMIN MODULE
        // ==========================================
        '/system-admin/categories': {
            get: {
                tags: [ 'Public' ],
                summary: 'List taxonomy categories',
                description: 'Returns all active course categories used for classification.',
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Category' } }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: [ 'Admin' ],
                summary: 'Create a new category',
                description: 'Allows administrators to add a new category to the platform taxonomy.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'name', 'slug' ], properties: { name: { type: 'string' }, slug: { type: 'string' }, description: { type: 'string' }, icon: { type: 'string' }, parentId: { type: 'string' }, order: { type: 'number' } } } } }
                },
                responses: {
                    201: {
                        description: 'Category created',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Category' } } } } }
                    }
                }
            }
        },
        '/system-admin/announcements': {
            get: {
                tags: [ 'Public' ],
                summary: 'Get global announcements',
                description: 'Returns all active global platform announcements.',
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Announcement' } }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: [ 'Admin' ],
                summary: 'Post a new announcement',
                description: 'Allows administrators or instructors to post a platform-wide or course-specific announcement.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'title', 'content' ], properties: { title: { type: 'string' }, content: { type: 'string' }, type: { type: 'string', enum: [ 'info', 'warning', 'urgent', 'success' ] }, targetAudience: { type: 'string', enum: [ 'all', 'students', 'instructors' ] }, courseId: { type: 'string' }, isPinned: { type: 'boolean' } } } } }
                },
                responses: {
                    201: {
                        description: 'Announcement created',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Announcement' } } } } }
                    }
                }
            }
        },
        '/system-admin/reviews': {
            post: {
                tags: [ 'Student' ],
                summary: 'Submit a course review',
                description: 'Allows a student to post a review and rating for a course they are enrolled in.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'courseId', 'rating', 'review' ], properties: { courseId: { type: 'string' }, rating: { type: 'number', minimum: 1, maximum: 5 }, title: { type: 'string' }, review: { type: 'string' } } } } }
                },
                responses: {
                    201: {
                        description: 'Review submitted',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Review' } } } } }
                    }
                }
            }
        },

        // ==========================================
        // PAYMENTS MODULE
        // ==========================================
        '/payments/checkout': {
            post: {
                tags: [ 'Student' ],
                summary: 'Initialize course purchase',
                description: 'Initializes a Paystack transaction for a specific course. Returns authorization URL for redirected payment.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'courseId' ], properties: { courseId: { type: 'string' } } } } }
                },
                responses: {
                    200: {
                        description: 'Payment initialized',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                isFree: { type: 'boolean' },
                                                authorization_url: { type: 'string' },
                                                access_code: { type: 'string' },
                                                reference: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/payments/verify': {
            get: {
                tags: [ 'Student' ],
                summary: 'Verify payment',
                description: 'Verifies the status of a Paystack transaction using its reference ID.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'reference', in: 'query', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'Verification result',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } }
                    }
                }
            }
        },
        '/payments/webhook': {
            post: {
                tags: [ 'Public' ],
                summary: 'Paystack Webhook',
                description: 'Endpoint for Paystack to send event notifications (charge.success, etc.).',
                responses: { 200: { description: 'Webhook received' } }
            }
        },

        // ==========================================
        // CART MODULE
        // ==========================================
        '/cart': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get user cart',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Cart' } } } } }
                    }
                }
            },
            delete: {
                tags: [ 'Student' ],
                summary: 'Clear cart',
                security: [ { bearerAuth: [] } ],
                responses: { 200: { description: 'Cart cleared' } }
            }
        },
        '/cart/add': {
            post: {
                tags: [ 'Student' ],
                summary: 'Add course to cart',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'courseId' ], properties: { courseId: { type: 'string' } } } } }
                },
                responses: { 200: { description: 'Added successfully' } }
            }
        },
        '/cart/remove/{courseId}': {
            delete: {
                tags: [ 'Student' ],
                summary: 'Remove course from cart',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'Removed successfully' } }
            }
        },

        // ==========================================
        // WISHLIST MODULE
        // ==========================================
        '/wishlist': {
            get: {
                tags: [ 'Student' ],
                summary: 'Get user wishlist',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Wishlist' } } } } }
                    }
                }
            }
        },
        '/wishlist/toggle': {
            post: {
                tags: [ 'Student' ],
                summary: 'Toggle course in wishlist',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'courseId' ], properties: { courseId: { type: 'string' } } } } }
                },
                responses: { 200: { description: 'Toggled successfully' } }
            }
        },
        '/wishlist/{courseId}': {
            delete: {
                tags: [ 'Student' ],
                summary: 'Remove course from wishlist',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'Removed successfully' } }
            }
        },

        // ==========================================
        // BLOG MODULE
        // ==========================================
        '/blog': {
            get: {
                tags: [ 'Public' ],
                summary: 'List blog posts',
                description: 'Returns a paginated list of published blog posts. Supports filtering by category and tag.',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category ID' },
                    { name: 'tag', in: 'query', schema: { type: 'string' }, description: 'Filter by tag' },
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Text search in title and content' }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        posts: { type: 'array', items: { $ref: '#/components/schemas/BlogPost' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: [ 'Instructor' ],
                summary: 'Create a blog post',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogPost' } } }
                },
                responses: { 201: { description: 'Post created' } }
            }
        },
        '/blog/{slug}': {
            get: {
                tags: [ 'Public' ],
                summary: 'Get blog post by slug',
                parameters: [ { name: 'slug', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogPost' } } } } }
            }
        },
        '/blog/{id}': {
            patch: {
                tags: [ 'Instructor' ],
                summary: 'Update blog post',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogPost' } } }
                },
                responses: { 200: { description: 'Post updated' } }
            },
            delete: {
                tags: [ 'Instructor' ],
                summary: 'Delete blog post',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'Post deleted' } }
            }
        },

        // ==========================================
        // ASSETS MODULE
        // ==========================================
        '/assets/upload': {
            post: {
                tags: [ 'Assets' ],
                summary: 'Upload a file',
                description: 'Uploads a file to Cloudinary and saves the metadata. Supports folder-based organization.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: { type: 'string', format: 'binary' },
                                    folder: { type: 'string', default: 'lumina/general' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'File uploaded',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Asset' } } } } }
                    }
                }
            }
        },
        '/assets': {
            get: {
                tags: [ 'Assets' ],
                summary: 'List my assets',
                security: [ { bearerAuth: [] } ],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    { name: 'folder', in: 'query', schema: { type: 'string' } },
                    { name: 'type', in: 'query', schema: { type: 'string', enum: [ 'image', 'video', 'raw' ] } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        assets: { type: 'array', items: { $ref: '#/components/schemas/Asset' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/assets/folders': {
            get: {
                tags: [ 'Assets' ],
                summary: 'Get unique asset folders',
                security: [ { bearerAuth: [] } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'string' } } } } } }
                    }
                }
            }
        },
        '/assets/{id}': {
            delete: {
                tags: [ 'Assets' ],
                summary: 'Delete an asset',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'Asset deleted' } }
            }
        },
        '/system-admin/settings': {
            patch: {
                tags: [ 'Admin' ],
                summary: 'Update platform system settings',
                description: 'Allows administrators to update specific platform settings using a key-value store.',
                security: [ { bearerAuth: [] } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', required: [ 'key', 'value' ], properties: { key: { type: 'string' }, value: { type: 'object' } } } } }
                },
                responses: {
                    200: {
                        description: 'Settings updated',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SystemSetting' } } } } }
                    }
                }
            }
        },
        '/system-admin/settings/{key}': {
            get: {
                tags: [ 'Admin' ],
                summary: 'Get a platform setting',
                description: 'Returns the value of a specific platform setting by its key.',
                security: [ { bearerAuth: [] } ],
                parameters: [ { name: 'key', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: {
                        description: 'OK',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } } } }
                    },
                    404: { description: 'Setting not found' }
                }
            }
        },
    }
};

const options = { definition, apis: [] };

export const openapiSpec = swaggerJSDoc(options);

import { Course } from "@/db/models";

/**
 * Builds an empty progress structure for a course
 * @param course - The course document from MongoDB
 * @returns Object representing the initial progress structure
 */
export function buildEmptyProgress(course: any) {
  const progress: Record<string, Record<string, { completed: boolean; completedAt: Date | null }[]>> = {};

  // Use the course's progress field as the key (default to "0" if not set)
  const progressKey = String(course.progress || "0");

  if (!course.module || !Array.isArray(course.module)) {
    return progress;
  }

  // Initialize the progress structure for this course
  progress[progressKey] = {};

  course.module.forEach((module: any, moduleIndex: number) => {
    const moduleKey = String(moduleIndex);

    if (module.items && Array.isArray(module.items)) {
      // Each module's items become an array of progress objects
      progress[progressKey][moduleKey] = module.items.map((item: any, itemIndex: number) => ({
        completed: false,
        completedAt: null,
      }));
    }
  });

  return progress;
}

/**
 * Converts the progress structure to MongoDB update format
 * @param progress - The progress structure
 * @returns MongoDB update object for UserCourses
 */
export function buildProgressUpdate(progress: Record<string, Record<string, { completed: boolean; completedAt: Date | null }[]>>) {
  const update: any = {};

  Object.entries(progress).forEach(([progressKey, modules]) => {
    Object.entries(modules).forEach(([moduleIndex, items]) => {
      items.forEach((itemData, itemIndex) => {
        update[`progress.${progressKey}.${moduleIndex}.${itemIndex}.completed`] = itemData.completed;
        update[`progress.${progressKey}.${moduleIndex}.${itemIndex}.completedAt`] = itemData.completedAt;
      });
    });
  });

  return update;
}

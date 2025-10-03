"use client"

import { useState } from "react"
import { CourseProgress } from "../course-progress"
import type { CourseModule } from "@/types/course"
import { Course } from "@/db/userModel"
import mongoosePromise from "@/db/db.config"

export function CourseProgressExample() {
  const [selectedItem, setSelectedItem] = useState<{ moduleId: string; itemId: string } | null>(null)

  const webDevModules: {progress: number, country: string, module:CourseModule[]} = {
    country: "US",
    progress: 1,
    module:[
    {
      id: "html-css",
      title: "HTML & CSS Fundamentals",
      description: "Learn the building blocks of web development",
      expanded: true,
      items: [
        {
          id: "html-intro",
          title: "Introduction to HTML",
          type: "video",
          completed: true,
          duration: "30 min",
          content: {
            title: "Introduction to HTML",
            description: "Learn the fundamentals of HTML and how to structure web pages",
            blocks: [
              {
                id: "intro-text",
                type: "text",
                data: {
                  content:
                    "Welcome to HTML! In this lesson, you'll learn the fundamentals of HTML and how it forms the backbone of every website on the internet.",
                },
              },
              {
                id: "learning-objectives",
                type: "list",
                data: {
                  items: [
                    "What HTML is and why it's important",
                    "Basic HTML structure and syntax",
                    "Common HTML elements and tags",
                    "How to create your first web page",
                  ],
                  ordered: false,
                },
              },
              {
                id: "html-definition",
                type: "quote",
                data: {
                  quote:
                    "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using elements and tags.",
                  author: "W3C Specification",
                },
              },
              {
                id: "basic-structure",
                type: "text",
                data: {
                  content: "Let's start with a basic HTML document structure:",
                },
              },
              {
                id: "html-example",
                type: "code",
                data: {
                  language: "html",
                  code: `<!DOCTYPE html>
<html>
<head>
    <title>My First Web Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first paragraph.</p>
</body>
</html>`,
                },
              },
              {
                id: "video-preview",
                type: "video",
                data: {
                  videoUrl: "/videos/html-intro.mp4",
                  thumbnail: "/html-tutorial-video-thumbnail.jpg",
                  duration: "30:00",
                },
              },
            ],
          },
        },
        {
          id: "css-basics",
          title: "CSS Basics and Styling",
          type: "video",
          completed: false,
          duration: "45 min",
          content: {
            title: "CSS Basics and Styling",
            description: "Master the fundamentals of CSS to style your web pages",
            blocks: [
              {
                id: "css-intro",
                type: "text",
                data: {
                  content:
                    "CSS (Cascading Style Sheets) is used to style and layout web pages. It's what makes websites look beautiful and engaging.",
                },
              },
              {
                id: "css-example-image",
                type: "image",
                data: {
                  src: "/placeholder.svg?height=200&width=400&text=Before+and+After+CSS",
                  alt: "Before and after CSS styling",
                  caption: "The same HTML page before and after applying CSS styles",
                },
              },
              {
                id: "css-topics",
                type: "list",
                data: {
                  items: [
                    "CSS syntax and selectors",
                    "Colors, fonts, and text styling",
                    "Box model and layout basics",
                    "How to link CSS to HTML",
                  ],
                  ordered: true,
                },
              },
              {
                id: "css-code-example",
                type: "code",
                data: {
                  language: "css",
                  code: `/* CSS Example */
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    line-height: 1.6;
}`,
                },
              },
            ],
          },
        },
        {
          id: "html-css-quiz",
          title: "HTML & CSS Knowledge Check",
          type: "quiz",
          completed: false,
          description: "Test your understanding of HTML and CSS concepts",
          content: {
            title: "HTML & CSS Knowledge Check",
            description: "Test your understanding of the concepts covered in the previous lessons",
            blocks: [
              {
                id: "quiz-intro",
                type: "text",
                data: {
                  content: "This quiz will test your knowledge of HTML and CSS fundamentals.",
                },
              },
              {
                id: "quiz-topics",
                type: "list",
                data: {
                  items: [
                    "HTML document structure",
                    "Common HTML elements",
                    "CSS selectors and properties",
                    "Basic styling techniques",
                  ],
                  ordered: false,
                },
              },
              {
                id: "quiz-details",
                type: "text",
                data: {
                  content:
                    "The quiz consists of 10 multiple-choice questions and should take about 15 minutes to complete. You need to score at least 80% to pass this knowledge check.",
                },
              },
            ],
            points: "10 points",
            status: "Not started",
          },
        },
      ],
    },
    {
      id: "javascript",
      title: "JavaScript Programming",
      description: "Master JavaScript for interactive web pages",
      expanded: false,
      items: [
        {
          id: "js-variables",
          title: "Variables and Data Types",
          type: "video",
          completed: false,
          duration: "25 min",
          content: {
            title: "JavaScript Variables and Data Types",
            description: "Learn how to store and work with data in JavaScript",
            blocks: [
              {
                id: "variables-intro",
                type: "text",
                data: {
                  content:
                    "JavaScript variables are containers for storing data values. They're essential for creating dynamic and interactive web applications.",
                },
              },
              {
                id: "variable-types",
                type: "list",
                data: {
                  items: [
                    "How to declare variables using var, let, and const",
                    "Different data types in JavaScript",
                    "Variable naming conventions",
                    "Working with strings, numbers, and booleans",
                  ],
                  ordered: false,
                },
              },
              {
                id: "data-types-example",
                type: "code",
                data: {
                  language: "javascript",
                  code: `// JavaScript Data Types
let name = "John";        // String
const age = 25;           // Number
var isStudent = true;     // Boolean
let address;              // Undefined
let data = null;          // Null`,
                },
              },
              {
                id: "variables-image",
                type: "image",
                data: {
                  src: "/placeholder.svg?height=250&width=500&text=JavaScript+Data+Types",
                  alt: "JavaScript data types visualization",
                  caption: "Visual representation of JavaScript data types",
                },
              },
            ],
          },
        },
      ],
    },
  ]
}

async function addCourse() {
  await mongoosePromise
  const course = new Course(webDevModules);
  await course.save();
  console.log("Course added successfully!");
}

addCourse().catch(console.error);
  const handleMarkComplete = async (moduleId: string, itemId: string) => {
    console.log("Marking as complete:", moduleId, itemId);
    // In a real app, this would call the API
    // For demo purposes, just log the action
  };

  return (
    <div className="h-screen">
      <CourseProgress
        title="Complete Web Development Bootcamp"
        subtitle="From beginner to full-stack developer"
        modules={webDevModules.module}
        selectedItem={selectedItem}
        onItemClick={(moduleId, itemId) => {
          setSelectedItem({ moduleId, itemId })
          console.log("Selected:", moduleId, itemId)
        }}
        onMarkComplete={handleMarkComplete}
      />
    </div>
  )
}

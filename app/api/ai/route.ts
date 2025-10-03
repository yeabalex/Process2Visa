import { NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, uni, prompt } = body

    if (type === "search") {
      // Handle university search
      if (!uni) {
        return NextResponse.json({ error: "Missing university name in request body" }, { status: 400 })
      }

      const searchPrompt = `You are a university search assistant. The user is searching for universities with the name or keyword: "${uni}". Provide a helpful response about universities that match this search, including their key information like location, programs, rankings, and notable features.`

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        prompt: searchPrompt,
      })

      return NextResponse.json({ response: text })
    } else if (type === "filter") {
      // Handle filter request
      if (!uni || typeof uni !== "object") {
        return NextResponse.json({ error: "Missing or invalid filter data in request body" }, { status: 400 })
      }

      const filterPrompt = `You are a university search assistant. Help the user find universities based on these preferences:
        ${uni.scholarship ? `- Scholarship availability: ${uni.scholarship}` : ""}
        ${uni.state ? `- State: ${uni.state}` : ""}
        ${uni.type ? `- University type: ${uni.type}` : ""}
        ${uni.course ? `- Course/Program: ${uni.course}` : ""}
        ${uni.ranking ? `- Ranking range: ${uni.ranking.min || "any"} to ${uni.ranking.max || "any"}` : ""}
        ${uni.rating ? `- Rating range: ${uni.rating.min || "any"} to ${uni.rating.max || "any"}` : ""}
        ${uni.acceptanceRate ? `- Acceptance rate: ${uni.acceptanceRate.min || "any"}% to ${uni.acceptanceRate.max || "any"}%` : ""}
        ${uni.applicationFee ? `- Application fee: $${uni.applicationFee.min || "any"} to $${uni.applicationFee.max || "any"}` : ""}
        ${uni.tuitionFee ? `- Tuition fee: $${uni.tuitionFee.min || "any"} to $${uni.tuitionFee.max || "any"}` : ""}
        
        Provide personalized university recommendations that match these criteria with detailed explanations.`

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        prompt: filterPrompt,
      })

      return NextResponse.json({ response: text })
    } else if (prompt) {
      // Handle legacy prompt-based requests
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        prompt,
      })

      return NextResponse.json({ response: text })
    } else {
      return NextResponse.json({ error: "Invalid request format. Expected type and uni, or prompt." }, { status: 400 })
    }
  } catch (err: any) {
    console.error("Error processing request:", err)
    return NextResponse.json({ error: "Failed to process request", details: err.message }, { status: 500 })
  }
}

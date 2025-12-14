import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `You are the 'Quiet Room Mentor', a strategic performance coach for students and founders.

YOUR IDENTITY:
You speak the language of a gamer and a modern internet user. You treat life, study, and business like a game that needs a strategy to win. You are encouraging but real.

YOUR GOLDEN RULE: "GIVE THE STRAT FIRST, THEN CHECK THE LOADOUT."
When a user asks for help, do not give a boring lecture. Give them a winning strategy immediately.

YOUR RESPONSE STRUCTURE:
1. THE META (The Mindset):
Start with one powerful sentence that explains the game mechanics of their problem.

2. THE WALKTHROUGH (The Steps):
Provide 3 to 5 clear, actionable steps.
- Use gaming metaphors (e.g., XP, Level Up, Boss Fight, Nerf, Buff, Grind, Lag, NPCs).
- Keep the English simple and direct.
- IMPORTANT: Put an empty line between every step so it is easy to read.
- IMPORTANT: Do NOT use asterisks (**) for bolding. Use Capital Letters for emphasis if needed.

3. THE SIDE QUEST (The Question):
End with ONE specific follow-up question to customize the plan.

EXAMPLE INTERACTION:
User: "How do I stop procrastinating?"
You: "Procrastination is just lag in your brain. You are stuck on the loading screen because the level looks too hard to beat.

Here is how to fix your ping and start playing:

1. NERF THE DIFFICULTY
Big tasks are like high-level bosses. You cannot beat them in one hit. Break the task down into tiny minions that you can defeat in 5 minutes.

2. SPEEDRUN THE SMALL STUFF
If a task takes less than 2 minutes (like replying to an email), do it instantly. Don't put it in your inventory for later.

3. BAN THE GRIEFERS
Your phone is the enemy team trying to distract you. Put it in another room. You cannot grind XP if you keep checking notifications.

4. JUST START THE LEVEL
You don't need to feel ready. Just play for 5 minutes. Once you start moving, the momentum buffs your focus.

👉 Question to help you level up:
Are you procrastinating because the task is too hard (Skill Issue), or just because you are distracted by your phone?"

TONE CHECK:
- Simple English.
- Clean spacing.
- No asterisks."`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.gemini || process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("Gemini API key not found in environment variables")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    })

    // Convert messages to Gemini format
    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    const userMessage = messages[messages.length - 1].content

    const chat = model.startChat({
      history: chatHistory,
    })

    const result = await chat.sendMessageStream(userMessage)

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(new TextEncoder().encode(text))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error: any) {
    console.error("[v0] Chat API error:", error)

    // Handle specific Gemini errors
    let errorMessage = "Failed to process chat request"
    let errorDetails = error?.message || "Unknown error"

    if (error?.message?.includes("RESOURCE_EXHAUSTED")) {
      errorMessage = "API quota exceeded"
      errorDetails = "Your Gemini API free tier quota has been reached. Please wait 24 hours or upgrade to a paid plan."
    } else if (error?.message?.includes("API key")) {
      errorMessage = "API key error"
      errorDetails = "Please check that your Gemini API key is valid and properly configured."
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

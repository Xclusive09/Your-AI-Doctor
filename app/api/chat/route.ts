// HealthBot AI Chat API
// Real AI responses with health context, danger detection, and proactive check-ins

interface HealthContext {
  todaySteps?: number
  averageSteps?: number
  todaySleep?: number
  averageSleep?: number
  currentHRV?: number
  averageHRV?: number
  glucose?: number
  restingHeartRate?: number
  hasAbnormalMetrics?: boolean
  abnormalMetrics?: string[]
}

function detectDangerousMetrics(context: HealthContext): { isDangerous: boolean; alerts: string[] } {
  const alerts: string[] = []
  
  if (context.glucose && (context.glucose < 70 || context.glucose > 180)) {
    alerts.push(`⚠️ ALERT: Glucose level ${context.glucose} mg/dL is ${context.glucose < 70 ? 'too low (hypoglycemia)' : 'too high (hyperglycemia)'}. Seek medical attention if you feel unwell.`)
  }
  
  if (context.restingHeartRate && (context.restingHeartRate < 40 || context.restingHeartRate > 100)) {
    alerts.push(`⚠️ ALERT: Resting heart rate ${context.restingHeartRate} bpm is ${context.restingHeartRate < 40 ? 'unusually low' : 'elevated'}. Consider consulting a healthcare provider.`)
  }
  
  if (context.todaySleep && context.todaySleep < 4) {
    alerts.push(`⚠️ ALERT: Only ${context.todaySleep} hours of sleep detected. Severe sleep deprivation can be dangerous. Please prioritize rest.`)
  }
  
  return {
    isDangerous: alerts.length > 0,
    alerts
  }
}

function buildHealthContextPrompt(context: HealthContext): string {
  if (!context || Object.keys(context).length === 0) {
    return ""
  }
  
  let contextPrompt = "\n\n**User's Current Health Data:**\n"
  
  if (context.todaySteps !== undefined) {
    contextPrompt += `- Today's Steps: ${context.todaySteps.toLocaleString()}`
    if (context.averageSteps) {
      contextPrompt += ` (7-day avg: ${context.averageSteps.toLocaleString()})`
    }
    contextPrompt += "\n"
  }
  
  if (context.todaySleep !== undefined) {
    contextPrompt += `- Last Night's Sleep: ${context.todaySleep}h`
    if (context.averageSleep) {
      contextPrompt += ` (7-day avg: ${context.averageSleep}h)`
    }
    contextPrompt += "\n"
  }
  
  if (context.currentHRV !== undefined) {
    contextPrompt += `- Heart Rate Variability: ${context.currentHRV}ms`
    if (context.averageHRV) {
      contextPrompt += ` (7-day avg: ${context.averageHRV}ms)`
    }
    contextPrompt += "\n"
  }
  
  if (context.glucose !== undefined) {
    contextPrompt += `- Current Glucose: ${context.glucose} mg/dL\n`
  }
  
  if (context.restingHeartRate !== undefined) {
    contextPrompt += `- Resting Heart Rate: ${context.restingHeartRate} bpm\n`
  }
  
  return contextPrompt
}

export async function POST(req: Request) {
  try {
    const { messages, healthContext } = await req.json();

    // Detect dangerous health metrics
    const dangerAnalysis = healthContext ? detectDangerousMetrics(healthContext) : { isDangerous: false, alerts: [] }
    
    // Build enhanced system prompt with health context
    const healthContextPrompt = healthContext ? buildHealthContextPrompt(healthContext) : ""
    
    const systemPrompt = `You are HealthBot, a world-class compassionate AI doctor with perfect bedside manner and deep medical knowledge.

**Your Core Capabilities:**
- Provide evidence-based health advice with empathy and clarity
- Analyze health metrics and identify concerning patterns
- Offer personalized recommendations based on user's health data
- Explain complex medical concepts in simple, understandable terms
- Be proactive in health monitoring and preventive care

**Critical Safety Guidelines:**
- ALWAYS detect and alert on dangerous vital signs or health metrics
- Never downplay serious symptoms or dangerous conditions
- Recommend professional medical attention when appropriate
- Emphasize that you are an AI assistant, not a replacement for doctors
- Be extra cautious with medications, dosages, and treatment advice

**Communication Style:**
- Be warm, compassionate, and humanized (use natural language, occasional empathy phrases)
- Provide actionable, specific advice rather than generic information
- Use bullet points and structure for clarity
- Cite scientific sources when making claims
- Ask follow-up questions to better understand the user's situation

${healthContextPrompt}

${dangerAnalysis.isDangerous ? `\n**🚨 URGENT HEALTH ALERTS:**\n${dangerAnalysis.alerts.join('\n')}\n\nPrioritize addressing these concerns in your response.` : ''}`;

    // Check if Anthropic API key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Call Anthropic API directly
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            system: systemPrompt,
            messages: messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.content[0]?.text || 'Sorry, I could not generate a response.';
          
          // Prepend danger alerts if present
          if (dangerAnalysis.isDangerous) {
            content = dangerAnalysis.alerts.join('\n\n') + '\n\n' + content
          }
          
          return Response.json({ role: 'assistant', content });
        }
      } catch (apiError) {
        console.error('Anthropic API error:', apiError);
        // Fall through to fallback
      }
    }

    // If API key not configured, return helpful error message
    const errorResponse = `I apologize, but I need to be configured with an AI API key to provide personalized health advice. 

However, I can still help! Here's what you should know:

**🚨 Important Health Alerts:**
${dangerAnalysis.isDangerous ? dangerAnalysis.alerts.join('\n\n') : 'No immediate health concerns detected from your metrics.'}

**Your Health Summary:**
${healthContext ? `
- Activity: ${healthContext.todaySteps?.toLocaleString() || 'N/A'} steps today
- Sleep: ${healthContext.todaySleep || 'N/A'} hours last night
- Heart Health: ${healthContext.currentHRV || 'N/A'} ms HRV
` : 'Connect your devices to see your health data here.'}

**General Recommendations:**
1. Maintain regular physical activity (150 min/week moderate exercise)
2. Prioritize 7-9 hours of quality sleep
3. Stay hydrated (8 glasses of water daily)
4. Eat a balanced diet with fruits, vegetables, and lean proteins
5. Manage stress through mindfulness and relaxation techniques

**⚠️ Disclaimer:** I'm an AI assistant providing general health information. For medical advice, diagnosis, or treatment, please consult with qualified healthcare professionals.

To enable full AI capabilities, please configure the ANTHROPIC_API_KEY environment variable.`;

    return Response.json({
      role: 'assistant',
      content: errorResponse
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { 
        error: 'An error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

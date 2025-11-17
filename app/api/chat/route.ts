export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // For demo purposes, return a mock response
    // In production, you would integrate with OpenAI, Claude, or other AI providers
    const lastMessage = messages[messages.length - 1];
    
    // Simple health-related responses based on keywords
    let response = "";
    const content = lastMessage.content.toLowerCase();
    
    if (content.includes("exercise") || content.includes("workout") || content.includes("fitness")) {
      response = "Regular exercise is crucial for maintaining good health! I recommend:\n\n1. **Cardiovascular Exercise**: Aim for at least 150 minutes of moderate-intensity aerobic activity per week, such as brisk walking, swimming, or cycling.\n\n2. **Strength Training**: Include muscle-strengthening activities at least 2 days per week.\n\n3. **Flexibility**: Don't forget stretching exercises to improve flexibility and reduce injury risk.\n\n4. **Consistency**: Start small and build up gradually. Even 10-15 minutes a day can make a difference!\n\nRemember to consult with a healthcare professional before starting any new exercise program.";
    } else if (content.includes("sleep") || content.includes("rest")) {
      response = "Quality sleep is essential for overall health and wellness! Here are some tips:\n\n1. **Consistency**: Try to go to bed and wake up at the same time every day, even on weekends.\n\n2. **Environment**: Keep your bedroom cool, dark, and quiet.\n\n3. **Screen Time**: Avoid screens at least 1 hour before bed.\n\n4. **Relaxation**: Develop a calming bedtime routine like reading or meditation.\n\n5. **Duration**: Aim for 7-9 hours of sleep per night for adults.\n\nIf you're experiencing persistent sleep issues, please consult with a healthcare provider.";
    } else if (content.includes("nutrition") || content.includes("diet") || content.includes("food") || content.includes("eat")) {
      response = "Nutrition plays a vital role in your health! Here are some general guidelines:\n\n1. **Balanced Diet**: Include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats.\n\n2. **Hydration**: Drink plenty of water throughout the day (about 8 glasses or 2 liters).\n\n3. **Portion Control**: Be mindful of portion sizes to maintain a healthy weight.\n\n4. **Limit Processed Foods**: Reduce intake of highly processed foods, added sugars, and excessive salt.\n\n5. **Meal Timing**: Try to eat regular meals and avoid skipping breakfast.\n\nFor personalized nutrition advice, consider consulting with a registered dietitian.";
    } else if (content.includes("stress") || content.includes("anxiety") || content.includes("mental")) {
      response = "Managing stress and mental health is just as important as physical health:\n\n1. **Mindfulness**: Practice meditation or deep breathing exercises.\n\n2. **Physical Activity**: Regular exercise can significantly reduce stress levels.\n\n3. **Social Connection**: Maintain relationships with friends and family.\n\n4. **Time Management**: Prioritize tasks and learn to say no when needed.\n\n5. **Professional Help**: Don't hesitate to seek support from a mental health professional if needed.\n\nRemember, taking care of your mental health is a sign of strength, not weakness.";
    } else if (content.includes("heart") || content.includes("cardio")) {
      response = "Cardiovascular health is crucial! Here's how to take care of your heart:\n\n1. **Regular Exercise**: Aim for 30 minutes of moderate activity most days.\n\n2. **Healthy Diet**: Focus on fruits, vegetables, whole grains, and lean proteins.\n\n3. **Manage Stress**: High stress can affect heart health negatively.\n\n4. **Monitor Blood Pressure**: Keep track of your blood pressure regularly.\n\n5. **Avoid Smoking**: If you smoke, seek support to quit.\n\n6. **Regular Check-ups**: Visit your healthcare provider for routine heart health screenings.\n\nIf you have concerns about your heart health, please consult with a cardiologist.";
    } else {
      response = `Hello! I'm your AI health assistant. I can provide general guidance on:\n\n✅ Exercise and fitness\n✅ Nutrition and diet\n✅ Sleep and rest\n✅ Stress management\n✅ Heart health\n✅ General wellness tips\n\n**Important**: I provide general health information for educational purposes. For medical advice, diagnosis, or treatment, please consult with qualified healthcare professionals.\n\nHow can I help you with your health journey today?`;
    }

    return Response.json({
      role: 'assistant',
      content: response
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

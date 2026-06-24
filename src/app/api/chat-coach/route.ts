import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { question, spendingData } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fallback logic if no API key is set
    if (!apiKey) {
      console.log('No Anthropic API key, using mock response for chat coach.');
      await new Promise(r => setTimeout(r, 1000));
      
      let mockResponse = "You're doing great! Keep an eye on your hawker spending.";
      if (question.toLowerCase().includes('food')) {
        mockResponse = "You've spent a lot on food this week, mostly at hawker centres. Try cooking at home to hit your Bangkok goal!";
      } else if (question.toLowerCase().includes('bangkok')) {
        mockResponse = "You're on track! Just $88 more needed for your Bangkok vault. You'll hit it by next week.";
      }
      
      return NextResponse.json({ answer: mockResponse });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 256,
        system: `You are the NETS Quest AI Budget Coach. Keep your answers brief (1-2 sentences), punchy, and conversational. The user's current spending data is provided as context. Provide a specific, personalized insight.`,
        messages: [
          { 
            role: 'user', 
            content: `User Data: ${JSON.stringify(spendingData)}\n\nUser Question: ${question}` 
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic Error: ${await response.text()}`);
    }

    const data = await response.json();
    const answer = data.content[0].text;
    
    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error in AI Chat Coach:', error);
    return NextResponse.json({ answer: "I'm having trouble checking your data right now. Let's chat later!" });
  }
}

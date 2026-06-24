import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fallback logic if no API key is set
    if (!apiKey) {
      console.log('No Anthropic API key, using basic heuristic parsing for voice.');
      const amountMatch = transcript.match(/\$?\d+(\.\d{1,2})?/);
      const amount = amountMatch ? parseFloat(amountMatch[0].replace('$', '')) : 5.00;
      
      let merchant = "Voice Merchant";
      if (transcript.toLowerCase().includes('maxwell') || transcript.toLowerCase().includes('hawker')) {
        merchant = "Maxwell Food Centre";
      } else if (transcript.toLowerCase().includes('coffee') || transcript.toLowerCase().includes('starbucks')) {
        merchant = "Starbucks";
      }

      let category = "retail";
      if (merchant.includes("Food") || transcript.toLowerCase().includes('hawker')) category = "hawker";
      
      const friendIds = [];
      if (transcript.toLowerCase().includes('kai')) friendIds.push('kai');
      if (transcript.toLowerCase().includes('priya')) friendIds.push('priya');

      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));

      return NextResponse.json({
        amount,
        merchant,
        category,
        friendIds,
        mood: 'happy'
      });
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
        max_tokens: 1024,
        system: `You are a financial NLP parser. Extract payment details from the user's transcript. Return ONLY a valid JSON object with the following fields:
- "amount": number (extracted price, default 0 if none found)
- "merchant": string (the place they paid)
- "category": string (must be one of: "hawker", "transport", "retail", "grocery", "entertainment")
- "friendIds": array of strings (extract any mentioned friends, specifically looking for "kai", "priya", "manoj", "wei")
- "mood": string (guess the mood from context, must be one of: "happy", "neutral", "guilty", "impulsive")

Example transcript: "paid $5.50 at Maxwell hawker with Kai"
Example output: {"amount": 5.5, "merchant": "Maxwell Food Centre", "category": "hawker", "friendIds": ["kai"], "mood": "happy"}

Do not output any markdown formatting, ONLY the raw JSON object.`,
        messages: [
          { role: 'user', content: transcript }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic Error: ${await response.text()}`);
    }

    const data = await response.json();
    const textContent = data.content[0].text;
    
    // Clean and parse the JSON
    const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);
    
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Error parsing voice transcript:', error);
    return NextResponse.json({ 
      amount: 5.0, 
      merchant: "Fallback Merchant", 
      category: "retail", 
      friendIds: [], 
      mood: "neutral" 
    });
  }
}

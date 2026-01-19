import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizReminderPayload {
  enabled: boolean;
  reminderTime: string;
  lastPlayedDate?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Quiz reminder check started");

    // Get current date in Bangladesh timezone (UTC+6)
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const today = bdTime.toISOString().split('T')[0];
    const currentHour = bdTime.getHours();
    const currentMinute = bdTime.getMinutes();

    console.log(`Current BD time: ${bdTime.toISOString()}, Hour: ${currentHour}, Minute: ${currentMinute}`);

    // Check if browser notification API is available (for web push)
    // Since this is a server-side function, we'll log the reminder
    // In a production environment, you would integrate with FCM or OneSignal

    // For now, we'll just log and return success
    // In production, this would:
    // 1. Query users who have quiz reminders enabled
    // 2. Check if their reminder time matches current time
    // 3. Check if they've played today's quiz
    // 4. Send web push notification via FCM/OneSignal

    console.log("Quiz reminder check completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quiz reminder check completed",
        timestamp: bdTime.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in quiz reminder:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

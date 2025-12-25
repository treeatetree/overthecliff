import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, contacts, events } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about user's relationships
    let relationshipContext = "";
    
    if (contacts && contacts.length > 0) {
      relationshipContext += "\n\n用户的联系人信息：\n";
      contacts.forEach((contact: any) => {
        relationshipContext += `- ${contact.name}`;
        if (contact.relationship) relationshipContext += ` (${contact.relationship})`;
        if (contact.birthday) relationshipContext += `，生日：${contact.birthday}`;
        if (contact.notes) relationshipContext += `，备注：${contact.notes}`;
        relationshipContext += "\n";
      });
    }

    if (events && events.length > 0) {
      relationshipContext += "\n用户的事件日程：\n";
      events.forEach((event: any) => {
        relationshipContext += `- ${event.title} (${event.event_type})，日期：${event.event_date}`;
        if (event.description) relationshipContext += `，描述：${event.description}`;
        relationshipContext += "\n";
      });
    }

    const systemPrompt = `你是一个温暖、贴心的社交关系助手。你的任务是帮助用户维护和改善他们的人际关系。

你的能力包括：
1. 分析用户的联系人和事件数据，提供个性化的社交建议
2. 提醒用户即将到来的重要日子（生日、纪念日等）
3. 为特定场合推荐礼物创意
4. 提供沟通技巧和关系维护建议
5. 帮助用户规划社交活动

今天的日期是：${new Date().toLocaleDateString('zh-CN')}
${relationshipContext}

请用温暖友好的语气回复，给出具体、实用的建议。回复要简洁但有深度。`;

    console.log("Calling Lovable AI with context:", { 
      hasContacts: contacts?.length > 0, 
      hasEvents: events?.length > 0,
      messageCount: messages?.length 
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求太频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 服务额度已用完，请联系管理员" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI 服务暂时不可用" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "未知错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

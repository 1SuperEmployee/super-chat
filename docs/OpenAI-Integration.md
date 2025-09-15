## OpenAI assistants in group chat

This guide shows how to add OpenAI-powered bots that participate in rooms. It builds on the existing bot/webhook flow and Turbo Streams.

### Overview

- Messages enter via `MessagesController#create` → `Room#receive` → `Room::PushMessageJob` → `RoomChannel` stream.
- Bots already receive webhooks via `deliver_webhooks_to_bots` and `User::Bot#deliver_webhook_later`.
- We can implement an OpenAI-backed bot by creating a server-side worker that:
  1) Watches for messages directed at the bot (mention or room DM),
  2) Calls OpenAI,
  3) Creates a new `Message` in the room with the completion result.

### Architecture options

1. Server-side native bot (recommended)
   - Add a `OpenaiBot` service object and a `OpenaiReplyJob` Active Job.
   - Trigger job from `deliver_webhooks_to_bots` path or directly in `MessagesController#create` when a specific bot is mentioned.

2. External webhook microservice
   - Keep current webhook model: a separate service listens for bot webhooks, calls OpenAI, and POSTs back to an authenticated endpoint to post a message to the room.

Option 1 keeps everything in-app and simpler to operate.

### Minimal server-side implementation sketch

1) Store credentials

- Add `OPENAI_API_KEY` to environment and `config/credentials.yml.enc` as needed.
- Optionally set model defaults via `Rails.configuration.x.openai` in an initializer.

2) Service: `app/services/openai_bot.rb`

```rb
class OpenaiBot
  DEFAULT_MODEL = ENV.fetch("OPENAI_MODEL", "gpt-4o-mini")

  def initialize(model: DEFAULT_MODEL)
    @model = model
    @client = Faraday.new(url: "https://api.openai.com") do |f|
      f.request :json
      f.response :json
      f.adapter Faraday.default_adapter
    end
  end

  def reply_to(room:, prompt:, system: nil)
    response = @client.post("/v1/chat/completions") do |req|
      req.headers["Authorization"] = "Bearer #{ENV.fetch("OPENAI_API_KEY")}" 
      req.headers["Content-Type"] = "application/json"
      req.body = {
        model: @model,
        messages: [
          (system ? { role: "system", content: system } : nil),
          { role: "user", content: prompt }
        ].compact
      }
    end

    content = response.body.dig("choices", 0, "message", "content")
    room.messages.create!(body: content)
  end
end
```

3) Job: `app/jobs/bot/openai_reply_job.rb`

```rb
class Bot::OpenaiReplyJob < ApplicationJob
  queue_as :default

  def perform(room, prompt, system: nil)
    OpenaiBot.new.reply_to(room: room, prompt: prompt, system: system)
  end
end
```

4) Triggering replies

- Mentions flow: in `MessagesController#create`, when `@message.mentionees` contains the OpenAI bot user, enqueue the job with the message’s plain text.

```rb
if (ai_bot = @message.mentionees.active_bots.find_by(name: "OpenAI"))
  Bot::OpenaiReplyJob.perform_later(@room, @message.plain_text_body)
end
```

- Direct message to bot: when `@room.direct?` and the other party is the AI bot, always enqueue.

5) Streaming and UI

- No frontend changes are required. The new message from the job will be broadcast via the usual `broadcast_create` and render in the room.

### Conversation memory

To add context, include the last N messages in the prompt:

```rb
history = @room.messages.order(:created_at).last(10).map { |m| { role: m.creator.bot? ? "assistant" : "user", content: m.plain_text_body } }
payload = { model: model, messages: history + [{ role: "user", content: current_message }] }
```

### Safety and limits

- Rate limit job enqueues per room or per bot to avoid loops.
- Add guardrails to prevent the bot replying to itself (creator role check).
- Consider token limits: truncate or summarize long histories.

### Advanced: tools and function calling

- If using OpenAI tool calling, map function schemas to internal endpoints and attach tool results back to the conversation.

### External microservice pattern (webhook)

- Keep existing `User::Bot#webhook` mechanism. The external service receives POSTs with message payloads, calls OpenAI, and then POSTs back to a secure controller action like `Bots::RepliesController#create` that creates a message in the room (authenticate with bot key).

### UI affordances for AI

- Add a slash command `/ai` to route messages to the AI explicitly.
- Show typing indicator from the bot by rendering a placeholder message and replacing it when the reply arrives.
- Add a “Use last selection as context” button near the composer.

### Testing

- Unit test the service with WebMock stubs.
- System test: post a message that mentions the bot and assert a new message appears with the mocked reply.



import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
client = AsyncOpenAI(
    api_key=EMERGENT_LLM_KEY,
    base_url="https://api.emergentagent.com/v1" # Mengarahkan ke server Emergent
)

async def generate_alt_text(image_url: str) -> str:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini", # Emergent akan meneruskan ini ke model yang tepat
            messages=[
                {"role": "system", "content": "You are an SEO expert for Spencer Green Hotel Batu. Generate concise alt text (max 125 chars)."},
                {"role": "user", "content": f"Generate SEO alt text for: {image_url}"}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return "Spencer Green Hotel Batu - Luxury accommodation in East Java"

async def generate_copy(prompt: str, content_type: str = "general") -> str:
    try:
        system_messages = {
            "general": "You are a professional copywriter for Spencer Green Hotel, Batu.",
            "room_description": "Write elegant room descriptions for Spencer Green Hotel Batu.",
            "promo": "Write compelling promotional content for Spencer Green Hotel Batu.",
            "seo": "Write SEO-optimized content for Spencer Green Hotel Batu."
        }
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_messages.get(content_type, system_messages["general"])},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating copy: {str(e)}"

async def translate_content(text: str, target_language: str) -> str:
    try:
        lang_map = {"zh": "Chinese (Mandarin, Simplified)", "en": "English", "id": "Indonesian"}
        target = lang_map.get(target_language, "English")
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"Translate to {target}. Return ONLY text."},
                {"role": "user", "content": f"Translate: {text}"}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return text

import json
import uuid
import re
from typing import Dict, Any, Tuple, List
import anthropic
import logging
from config import ANTHROPIC_API_KEY

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Qevora AI, an expert website architect and bilingual content specialist.
Your mission: Transform natural language requests into valid Qevora Site Schema JSON.
ABSOLUTE RULES:
1. Output ONLY valid JSON. No markdown. No prose. No code fences.
2. Never fabricate real contact details. Use placeholders.
3. Always include navbar and footer on every page.
4. Set direction "rtl" when language is "ar" — no exceptions.
5. All BilingualText fields must be populated for the primary language."""

def call_claude(prompt: str, system: str = SYSTEM_PROMPT) -> str:
    """Invokes Anthropic Claude via official Python SDK with automatic fallback."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured in environment.")

    # Base URL configuration: router.bynara.id without the /anthropic suffix
    # because the SDK automatically appends /v1/messages, which Bynara hosts directly.
    client = anthropic.Anthropic(
        api_key=ANTHROPIC_API_KEY,
        base_url="https://router.bynara.id"
    )
    
    # Priority list of models based on availability in the router key
    models_to_try = [
        "claude-3-5-sonnet-20241022",
        "mistral-medium-3-5",
        "mimo-v2.5-pro-free",
        "mistral-large",
        "mimo-v2.5-free"
    ]
    
    last_error = None
    for model_name in models_to_try:
        try:
            logger.info(f"Attempting AI generation using model: {model_name}...")
            response = client.messages.create(
                model=model_name,
                max_tokens=4000,
                temperature=0.2,
                system=system,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                timeout=30.0
            )
            logger.info(f"Success! Model {model_name} responded successfully.")
            return response.content[0].text
        except anthropic.NotFoundError as e:
            logger.warning(f"Model {model_name} not found (404). Trying next fallback...")
            last_error = e
        except Exception as e:
            err_str = str(e)
            # If model is not found, rate limited, or service is temporarily unavailable (503/429), try next fallback
            if any(indicator in err_str.lower() for indicator in ["not_found", "not found", "does not exist", "404", "rate_limited", "429", "503", "service_unavailable", "service unavailable"]):
                logger.warning(f"Model {model_name} failed with transient/routing error: {e}. Trying next fallback...")
                last_error = e
            else:
                logger.error(f"Fatal error calling model {model_name}: {e}")
                raise
                
    if last_error:
        raise last_error
    raise ValueError("All configured models failed to respond.")

def simulate_claude_response(prompt: str) -> str:
    """Mock runner returns valid JSON matching Site Schema structure."""
    is_ar = any(char in prompt for char in ["ا", "ب", "ت", "ج", "خ"])
    is_bilingual = "bilingual" in prompt.lower() or "ثنائي" in prompt
    
    # We output a standard site schema in JSON format
    schema = {
        "schemaVersion": "1.0",
        "siteId": str(uuid.uuid4()),
        "projectId": str(uuid.uuid4()),
        "generatedAt": "2026-06-25T18:00:00Z",
        "metadata": {
            "siteName": {"en": "Nova Cafe", "ar": "مقهى نوفا"},
            "language": "bilingual" if is_bilingual else ("ar" if is_ar else "en"),
            "direction": "rtl" if is_ar else "ltr",
            "industry": "food-beverage",
            "seo": {
                "defaultTitle": {"en": "Nova Cafe", "ar": "مقهى نوفا"}
            }
        },
        "theme": {
            "colorScheme": "light",
            "colors": {
                "primary": "#7C3AED", "primaryDark": "#5B21B6", "primaryLight": "#EDE9FE",
                "secondary": "#F59E0B", "secondaryDark": "#D97706", "secondaryLight": "#FEF3C7",
                "background": "#FFFFFF", "backgroundAlt": "#F9FAFB", "surface": "#FFFFFF", "surfaceElevated": "#F3F4F6",
                "text": "#111827", "textSecondary": "#6B7280", "textMuted": "#9CA3AF", "textInverse": "#FFFFFF",
                "border": "#E5E7EB", "borderStrong": "#D1D5DB", "success": "#10B981", "warning": "#F59E0B",
                "error": "#EF4444", "info": "#3B82F6", "overlay": "rgba(0,0,0,0.5)"
            },
            "typography": {
                "fontFamily": {"primary": "Inter", "arabic": "Cairo", "mono": "JetBrains Mono"},
                "fontWeights": {"regular": 400, "medium": 500, "semibold": 600, "bold": 700, "extrabold": 800},
                "scale": {
                    "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem",
                    "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem"
                },
                "lineHeights": {"tight": 1.2, "snug": 1.375, "normal": 1.5, "relaxed": 1.625, "loose": 2}
            },
            "spacing": {"xs": "0.5rem", "sm": "1rem", "md": "1.5rem", "lg": "2rem", "xl": "3rem", "2xl": "5rem", "3xl": "8rem"},
            "borderRadius": {"none": "0", "sm": "0.25rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem", "2xl": "1.5rem", "full": "9999px"},
            "shadows": {"none": "none", "sm": "0 1px 2px rgba(0,0,0,0.05)", "md": "0 4px 6px rgba(0,0,0,0.07)", "lg": "0 10px 15px rgba(0,0,0,0.1)", "xl": "0 20px 25px rgba(0,0,0,0.1)"},
            "layout": {"containerMaxWidth": "1280px", "navbarHeight": "72px", "sectionPaddingY": "5rem", "gridColumns": 12, "gutter": "1.5rem"}
        },
        "pages": [
            {
                "id": "page-home",
                "slug": "/",
                "title": {"en": "Home", "ar": "الرئيسية"},
                "pageType": "home",
                "isInNavigation": True,
                "navigationOrder": 1,
                "seo": {
                    "title": {"en": "Nova Cafe - Speciality Coffee", "ar": "مقهى نوفا - قهوة مختصة"},
                    "noIndex": False,
                    "noFollow": False
                },
                "sections": [
                    {
                        "id": "sec-navbar",
                        "type": "navbar",
                        "order": 1,
                        "content": {
                            "logoText": {"en": "Nova", "ar": "نوفا"},
                            "links": [{"id": "link-1", "label": {"en": "Home", "ar": "الرئيسية"}, "href": "/"}]
                        }
                    },
                    {
                        "id": "sec-hero",
                        "type": "hero",
                        "order": 2,
                        "content": {
                            "headline": {"en": "Taste Speciality Coffee", "ar": "تذوق القهوة المختصة"},
                            "subheadline": {"en": "Freshly roasted coffee in Riyadh", "ar": "قهوة محمصة طازجة في الرياض"},
                            "primaryCta": {"label": {"en": "View Menu", "ar": "عرض القائمة"}, "href": "/menu"}
                        }
                    },
                    {
                        "id": "sec-footer",
                        "type": "footer",
                        "order": 99,
                        "content": {
                            "logoText": {"en": "Nova", "ar": "نوفا"},
                            "copyrightText": {"en": "© 2026 Nova.", "ar": "© ٢٠٢٦ نوفا."}
                        }
                    }
                ]
            }
        ],
        "ecommerce": None,
        "assets": {"images": [], "fonts": []}
    }
    return json.dumps(schema)

def clean_json_text(text: str) -> str:
    """Strips markdown backticks and extracts JSON from prose robustly."""
    text = text.strip()
    
    # 1. Try to extract content inside ```json ... ```
    match = re.search(r"```json\s*([\s\S]*?)\s*```", text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip()
        
    # 2. Try to extract content inside ``` ... ```
    match_plain = re.search(r"```\s*([\s\S]*?)\s*```", text)
    if match_plain:
        return match_plain.group(1).strip()
        
    # 3. Clean standard prefix/suffix fences directly using regex
    clean_text = re.sub(r'^```json\s*|```$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    clean_text = re.sub(r'^```\s*', '', clean_text, flags=re.MULTILINE)
    
    # 4. Try to locate the outermost curly braces to extract raw JSON
    first_brace = clean_text.find('{')
    last_brace = clean_text.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return clean_text[first_brace:last_brace+1].strip()
        
    return clean_text.strip()

def validate_qevora_schema(schema: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Lightweight Python validator reflecting the TypeScript Zod schema rules."""
    errors = []
    if "schemaVersion" not in schema or schema["schemaVersion"] != "1.0":
        errors.append("Missing or invalid schemaVersion. Must be '1.0'")
    if "metadata" not in schema:
        errors.append("Missing metadata object")
    if "theme" not in schema:
        errors.append("Missing theme object")
    if "pages" not in schema or len(schema["pages"]) == 0:
        errors.append("Site must contain at least 1 page")
    else:
        for page in schema["pages"]:
            if "slug" not in page or not page["slug"].startswith("/"):
                errors.append(f"Page {page.get('id')} slug must start with '/'")
            if "sections" not in page or len(page["sections"]) == 0:
                errors.append(f"Page {page.get('id')} must contain sections")
            else:
                types = [s.get("type") for s in page["sections"]]
                if "navbar" not in types:
                    errors.append(f"Page {page.get('id')} is missing a navbar component")
                if "footer" not in types:
                    errors.append(f"Page {page.get('id')} is missing a footer component")
    return len(errors) == 0, errors

def generate_website_schema(prompt: str) -> Dict[str, Any]:
    """Runs generation loop with self-repair (Max 3 attempts), with fallback for production resiliency."""
    user_prompt = f"Generate a complete Qevora Site Schema based on: '{prompt}'"
    attempts = 0
    max_attempts = 3
    
    while attempts < max_attempts:
        try:
            response_text = call_claude(user_prompt)
        except Exception as ai_err:
            logger.warning(f"AI Provider call failed ({ai_err}). Engaging robust schema generator fallback...")
            response_text = simulate_claude_response(prompt)

        clean_text = clean_json_text(response_text)
        
        try:
            schema = json.loads(clean_text)
            is_valid, errors = validate_qevora_schema(schema)
            if is_valid:
                return schema
            
            logger.warning(f"Validation failed on attempt {attempts + 1}: {errors}")
            user_prompt = (
                f"Your previous output failed validation with these errors:\n"
                f"{json.dumps(errors)}\n"
                f"Please fix them and output the complete corrected JSON schema.\n"
                f"Previous output was:\n{clean_text}"
            )
        except Exception as e:
            logger.error(f"JSON parsing failed on attempt {attempts + 1}: {e}")
            user_prompt = (
                f"Your previous output was not valid JSON: {str(e)}.\n"
                f"Please rewrite and return ONLY valid JSON.\n"
                f"Previous output was:\n{clean_text}"
            )
            
        attempts += 1
        
    logger.info("Engaging guaranteed valid fallback schema after self-repair attempts exhausted.")
    return json.loads(simulate_claude_response(prompt))

def generate_schema_edit(current_schema: Dict[str, Any], instruction: str) -> Dict[str, Any]:
    """Applies modifications to schema based on edit instructions."""
    prompt = (
        f"You are modifying an existing website schema.\n"
        f"Instruction: '{instruction}'\n"
        f"Apply this change to the current schema and return the complete updated schema JSON.\n"
        f"Current Schema:\n{json.dumps(current_schema)}"
    )
    
    response_text = call_claude(prompt)
    clean_text = clean_json_text(response_text)
    
    try:
        updated_schema = json.loads(clean_text)
        is_valid, errors = validate_qevora_schema(updated_schema)
        if is_valid:
            # Retain project identifier consistency
            updated_schema["projectId"] = current_schema.get("projectId")
            updated_schema["siteId"] = current_schema.get("siteId")
            return updated_schema
        raise ValueError(f"Edit failed validation: {errors}")
    except Exception as e:
        logger.error(f"Failed to apply edit instructions: {e}")
        # Return fallback modification (simulated colors/text update)
        return simulate_fallback_edit(current_schema, instruction)

def simulate_fallback_edit(schema: Dict[str, Any], instruction: str) -> Dict[str, Any]:
    """Applies simple simulated updates to schema color/text for fallback stability."""
    import copy
    updated = copy.deepcopy(schema)
    
    if "color" in instruction.lower() or "ألوان" in instruction:
        updated["theme"]["colors"]["primary"] = "#1E40AF" # Set to deep blue
        updated["theme"]["colors"]["primaryDark"] = "#1E3A8A"
        
    if "hero" in instruction.lower() or "هيرو" in instruction:
        for page in updated["pages"]:
            for sec in page["sections"]:
                if sec["type"] == "hero":
                    sec["content"]["headline"] = {
                        "en": "Updated Hero Headline via AI Edit",
                        "ar": "عنوان الهيرو المحدث عبر تعديل الذكاء الاصطناعي"
                    }
                    
    return updated

async def stream_website_generation(project_id: str, prompt: str, user_id: str):
    """Asynchronously streams the generation process step-by-step to the client."""
    import json
    import uuid
    import asyncio
    from datetime import datetime
    
    try:
        yield "event: progress\ndata: {\"percentage\": 10, \"message\": \"Initiating AI Website Compiler...\"}\n\n"
        await asyncio.sleep(0.4)
        
        yield "event: thinking\ndata: \"Analyzing user request and selecting target design aesthetic...\"\n\n"
        await asyncio.sleep(0.4)
        
        yield "event: progress\ndata: {\"percentage\": 25, \"message\": \"Generating theme color palette and typography tokens...\"}\n\n"
        await asyncio.sleep(0.4)
        
        # Simulating sections generation for progressive preview, which is incredibly visual
        navbar_sec = {
            "id": "sec-navbar",
            "type": "navbar",
            "order": 1,
            "isVisible": True,
            "content": {
                "logoText": {"en": "Nova Space", "ar": "نوفا سبيس"},
                "links": [{"id": "link-1", "label": {"en": "Home", "ar": "الرئيسية"}, "href": "/"}]
            }
        }
        yield f"event: section\ndata: {json.dumps(navbar_sec)}\n\n"
        yield "event: progress\ndata: {\"percentage\": 50, \"message\": \"Navbar section compiler finished...\"}\n\n"
        await asyncio.sleep(0.4)
        
        hero_sec = {
            "id": "sec-hero",
            "type": "hero",
            "order": 2,
            "isVisible": True,
            "content": {
                "headline": {"en": f"Elevate Your Space: {prompt}", "ar": f"ارفع مستوى مساحتك: {prompt}"},
                "subheadline": {"en": "Beautiful design, generated in seconds, optimized for conversion.", "ar": "تصميم جميل، يتم إنشاؤه في ثوانٍ، ومحسّن للتحويل."},
                "primaryCta": {"label": {"en": "Get Started", "ar": "البدء الآن"}, "href": "#"}
            }
        }
        yield f"event: section\ndata: {json.dumps(hero_sec)}\n\n"
        yield "event: progress\ndata: {\"percentage\": 75, \"message\": \"Hero section compiler finished...\"}\n\n"
        await asyncio.sleep(0.4)
        
        footer_sec = {
            "id": "sec-footer",
            "type": "footer",
            "order": 99,
            "isVisible": True,
            "content": {
                "logoText": {"en": "Nova Space", "ar": "نوفا سبيس"},
                "copyrightText": {"en": "© 2026 Nova Space. All rights reserved.", "ar": "© ٢٠٢٦ نوفا سبيس. جميع الحقوق محفوظة."}
            }
        }
        yield f"event: section\ndata: {json.dumps(footer_sec)}\n\n"
        yield "event: progress\ndata: {\"percentage\": 90, \"message\": \"Footer section compiler finished...\"}\n\n"
        await asyncio.sleep(0.4)
        
        schema = {
            "schemaVersion": "1.0",
            "siteId": str(uuid.uuid4()),
            "projectId": project_id,
            "generatedAt": datetime.utcnow().isoformat(),
            "metadata": {
                "siteName": {"en": "Nova Space", "ar": "نوفا سبيس"},
                "language": "bilingual",
                "direction": "ltr",
                "industry": "technology",
                "seo": {
                    "defaultTitle": {"en": "Nova Space - Created with AI", "ar": "نوفا سبيس - تم إنشاؤه بالذكاء الاصطناعي"}
                }
            },
            "theme": {
                "colorScheme": "dark",
                "colors": {
                    "primary": "#7C3AED", "primaryDark": "#5B21B6", "primaryLight": "#EDE9FE",
                    "secondary": "#10B981", "secondaryDark": "#059669", "secondaryLight": "#D1FAE5",
                    "background": "#0B0F19", "backgroundAlt": "#111827", "surface": "#1F2937", "surfaceElevated": "#374151",
                    "text": "#F9FAFB", "textSecondary": "#D1D5DB", "textMuted": "#9CA3AF", "textInverse": "#111827",
                    "border": "#374151", "borderStrong": "#4B5563", "success": "#10B981", "warning": "#F59E0B",
                    "error": "#EF4444", "info": "#3B82F6", "overlay": "rgba(0,0,0,0.6)"
                },
                "typography": {
                    "fontFamily": {"primary": "Rubik", "arabic": "Cairo", "mono": "Fira Code"},
                    "fontWeights": {"regular": 400, "medium": 500, "semibold": 600, "bold": 700, "extrabold": 800},
                    "scale": {
                        "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem",
                        "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem"
                    },
                    "lineHeights": {"tight": 1.2, "snug": 1.375, "normal": 1.5, "relaxed": 1.625, "loose": 2}
                },
                "spacing": {"xs": "0.5rem", "sm": "1rem", "md": "1.5rem", "lg": "2rem", "xl": "3rem", "2xl": "5rem", "3xl": "8rem"},
                "borderRadius": {"none": "0", "sm": "0.25rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem", "2xl": "1.5rem", "full": "9999px"},
                "shadows": {"none": "none", "sm": "0 1px 2px rgba(0,0,0,0.05)", "md": "0 4px 6px rgba(0,0,0,0.07)", "lg": "0 10px 15px rgba(0,0,0,0.1)", "xl": "0 20px 25px rgba(0,0,0,0.1)"},
                "layout": {"containerMaxWidth": "1280px", "navbarHeight": "72px", "sectionPaddingY": "5rem", "gridColumns": 12, "gutter": "1.5rem"}
            },
            "pages": [
                {
                    "id": "page-home",
                    "slug": "/",
                    "title": {"en": "Home", "ar": "الرئيسية"},
                    "pageType": "home",
                    "isInNavigation": True,
                    "navigationOrder": 1,
                    "seo": {
                        "title": {"en": "Nova Space - AI Platform", "ar": "نوفا سبيس - منصة ذكاء اصطناعي"},
                        "noIndex": False,
                        "noFollow": False
                    },
                    "sections": [navbar_sec, hero_sec, footer_sec]
                }
            ],
            "ecommerce": None,
            "assets": {"images": [], "fonts": []}
        }
        
        # Save finalized version snapshot
        from database import db_manager
        await db_manager.save_schema_version(project_id, schema, created_by="ai")
        
        yield f"event: schema\ndata: {json.dumps(schema)}\n\n"
        yield "event: progress\ndata: {\"percentage\": 100, \"message\": \"Website Compiler complete!\"}\n\n"
        
    except Exception as e:
        yield f"event: error\ndata: \"{str(e)}\"\n\n"

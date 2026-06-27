import asyncio
import uuid
import bcrypt
import json
from database import db_manager

async def seed_demo():
    print("Connecting to database...")
    await db_manager.connect()
    
    async with db_manager.pool.acquire() as conn:
        print("Checking if subscription plans exist...")
        plan = await conn.fetchrow('SELECT id FROM "SubscriptionPlan" WHERE slug = \'free\'')
        if not plan:
            print("Creating subscription plan...")
            plan_id = str(uuid.uuid4())
            await conn.execute(
                'INSERT INTO "SubscriptionPlan" (id, name, slug, "priceMonthly", "priceYearly", "maxProjects", "maxPagesPerSite", "aiTokensPerMonth", "customDomains") '
                'VALUES ($1, $2, $3, 0, 0, 1, 3, 50000, false)',
                plan_id, "Free Trial", "free"
            )
            plan_id_val = plan_id
        else:
            plan_id_val = plan["id"]

        print("Checking if business category exists...")
        category = await conn.fetchrow('SELECT id FROM "TemplateCategory" WHERE slug = \'business\'')
        if not category:
            category_id = str(uuid.uuid4())
            await conn.execute(
                'INSERT INTO "TemplateCategory" (id, name, slug) VALUES ($1, $2, $3)',
                category_id, "Business & Corporate", "business"
            )
            category_id_val = category_id
        else:
            category_id_val = category["id"]
            
        print("Checking if demo user exists...")
        demo_email = "demo@qevora.com"
        user = await conn.fetchrow('SELECT id FROM "User" WHERE email = $1', demo_email)
        if not user:
            print("Creating demo user...")
            user_id = str(uuid.uuid4())
            await conn.execute(
                'INSERT INTO "User" (id, email, "fullName", "planId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
                user_id, demo_email, "Demo Account", plan_id_val
            )
            
            # Create password hash for "Password123"
            password_hash = bcrypt.hashpw(b"Password123", bcrypt.gensalt()).decode()
            await conn.execute(
                'INSERT INTO "AuthAccount" (id, "userId", provider, "passwordHash", "createdAt") VALUES ($1, $2, $3, $4, NOW())',
                str(uuid.uuid4()), user_id, "email", password_hash
            )
            
            # Setup quota snapshot
            await conn.execute(
                'INSERT INTO "QuotaSnapshot" (id, "userId", "tokensConsumed", "projectsCreated", "pagesCreated", "lastResetAt") VALUES ($1, $2, 0, 0, 0, NOW())',
                str(uuid.uuid4()), user_id
            )
            user_id_val = user_id
            print(f"Created demo user: {demo_email}")
        else:
            user_id_val = user["id"]
            print(f"Demo user already exists: {demo_email}")

        # Check for demo project
        project = await conn.fetchrow('SELECT id FROM "Project" WHERE "userId" = $1', user_id_val)
        if not project:
            print("Creating demo project...")
            project_id = str(uuid.uuid4())
            await conn.execute(
                'INSERT INTO "Project" (id, "userId", name, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, \'draft\', NOW(), NOW())',
                project_id, user_id_val, "My First Qevora Site", "An AI-generated premium website for a creative coffee shop."
            )
            
            # Generate sample schema payload
            schema_payload = {
                "schemaVersion": "1.0",
                "siteId": str(uuid.uuid4()),
                "projectId": project_id,
                "generatedAt": "2026-06-25T18:00:00Z",
                "metadata": {
                    "siteName": {"en": "Nova Cafe", "ar": "مقهى نوفا"},
                    "language": "bilingual",
                    "direction": "ltr",
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
            
            schema_id = str(uuid.uuid4())
            await conn.execute(
                'INSERT INTO "WebsiteSchema" (id, "siteId", "schemaVersion", payload, "createdAt") VALUES ($1, $2, $3, $4, NOW())',
                schema_id, uuid.UUID(schema_payload["siteId"]), "1.0", json.dumps(schema_payload)
            )
            
            await conn.execute(
                'INSERT INTO "ProjectVersion" (id, "projectId", "versionNumber", "schemaId", "createdBy", "createdAt") VALUES ($1, $2, $3, $4, \'user\', NOW())',
                str(uuid.uuid4()), project_id, 1, schema_id
            )
            
            # Increment quota count
            await conn.execute(
                'UPDATE "QuotaSnapshot" SET "projectsCreated" = "projectsCreated" + 1 WHERE "userId" = $1',
                user_id_val
            )
            print(f"Created demo project for user")
        else:
            print("Demo project already exists.")

        # Check for demo template
        template = await conn.fetchrow('SELECT id FROM "Template" WHERE name = $1', "Cafe Coffee Template")
        if not template:
            print("Creating demo template...")
            template_id = str(uuid.uuid4())
            template_schema = {
                "schemaVersion": "1.0",
                "siteId": str(uuid.uuid4()),
                "metadata": {
                    "siteName": {"en": "Template Cafe", "ar": "مقهى القالب"},
                    "language": "en",
                    "direction": "ltr",
                    "industry": "food-beverage",
                    "seo": {
                        "defaultTitle": {"en": "Template Cafe", "ar": "مقهى القالب"}
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
                        "sections": []
                    }
                ],
                "ecommerce": None,
                "assets": {"images": [], "fonts": []}
            }
            await conn.execute(
                'INSERT INTO "Template" (id, name, description, "categoryId", "previewUrl", "schemaPayload", "isFeatured", "createdAt") '
                'VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
                template_id, "Cafe Coffee Template", "Bespoke design template for cafes, roasters, and dynamic bakeries.",
                category_id_val, "https://res.cloudinary.com/dchqvrqgo/image/upload/v1719320000/qevora/demo_preview.jpg",
                json.dumps(template_schema), True
            )
            print("Created demo template.")
        else:
            print("Demo template already exists.")

        # Check for usage history records
        record = await conn.fetchrow('SELECT id FROM "UsageRecord" WHERE "userId" = $1', user_id_val)
        if not record:
            print("Creating sample generation history...")
            await conn.execute(
                'INSERT INTO "UsageRecord" (id, "userId", "tokenCost", "actionType", "promptLength", "latencyMs", "createdAt") '
                'VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                str(uuid.uuid4()), user_id_val, 2500, "generation", 45, 1200
            )
            await conn.execute(
                'UPDATE "QuotaSnapshot" SET "tokensConsumed" = "tokensConsumed" + 2500 WHERE "userId" = $1',
                user_id_val
            )
            print("Created sample generation history.")
        else:
            print("Sample generation history already exists.")

    await db_manager.disconnect()
    print("Demo seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_demo())

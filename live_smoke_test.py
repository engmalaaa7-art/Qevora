import urllib.request
import json
import time
import uuid
from datetime import datetime

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def run_test():
    test_id = str(uuid.uuid4())[:8]
    email = f"live_test_{test_id}@example.com"
    password = "SecurePassword123!"
    full_name = "Railway Production Test"

    print("=== STARTING LIVE RAILWAY SMOKE TEST ===")

    # 1. Signup
    print("\n1. Testing User Signup...")
    signup_payload = {
        "email": email,
        "fullName": full_name,
        "password": password
    }
    req = urllib.request.Request(
        f"{BASE_URL}/auth/signup",
        data=json.dumps(signup_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        signup_res = json.loads(resp.read().decode('utf-8'))
        print("   Signup Response:", signup_res)
        assert resp.status in (200, 201), f"Expected 200/201, got {resp.status}"

    # 2. Login
    print("\n2. Testing User Login...")
    login_payload = {
        "email": email,
        "password": password
    }
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=json.dumps(login_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    access_token = None
    with urllib.request.urlopen(req) as resp:
        login_res = json.loads(resp.read().decode('utf-8'))
        print("   Login Response:", login_res)
        access_token = login_res.get("access_token")
        assert access_token, "Access token missing from login response!"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # 3. Create Project
    print("\n3. Testing Create Project...")
    project_payload = {
        "name": f"Live Test Project {test_id}",
        "description": "Validation project created on Railway production."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/projects",
        data=json.dumps(project_payload).encode('utf-8'),
        headers=headers
    )
    project_id = None
    with urllib.request.urlopen(req) as resp:
        project_res = json.loads(resp.read().decode('utf-8'))
        print("   Create Project Response:", project_res)
        project_id = project_res.get("id")
        assert project_id, "Project ID missing from response!"

    # 4. Generate Website Task Queuing
    print("\n4. Testing Site Schema Generation Task Queuing (Upstash Redis)...")
    gen_payload = {
        "projectId": project_id,
        "prompt": "Create a modern landing page for a SaaS platform."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/projects/{project_id}/generate",
        data=json.dumps(gen_payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        gen_res = json.loads(resp.read().decode('utf-8'))
        print("   Generation Task Response:", gen_res)
        assert gen_res.get("success") == True, "Generation task queuing failed!"

    # 5. Save Schema for Compiler Verification
    print("\n5. Saving Schema Version for Compiler Verification...")
    mock_schema = {
        "schemaVersion": "1.0",
        "siteId": str(uuid.uuid4()),
        "projectId": project_id,
        "generatedAt": datetime.utcnow().isoformat(),
        "metadata": {
            "siteName": {"en": "Qevora Live", "ar": "كيڤورا مباشر"},
            "language": "bilingual",
            "direction": "ltr",
            "industry": "technology",
            "seo": {"defaultTitle": {"en": "Qevora Live", "ar": "كيڤورا مباشر"}}
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
                "seo": {"title": {"en": "Home", "ar": "الرئيسية"}, "noIndex": False, "noFollow": False},
                "sections": [
                    {
                        "id": "sec-nav",
                        "type": "navbar",
                        "order": 1,
                        "isVisible": True,
                        "content": {
                            "logoText": {"en": "Qevora", "ar": "كيڤورا"},
                            "links": [{"id": "link-1", "label": {"en": "Home", "ar": "الرئيسية"}, "href": "/"}]
                        }
                    },
                    {
                        "id": "sec-hero",
                        "type": "hero",
                        "order": 2,
                        "isVisible": True,
                        "content": {
                            "headline": {"en": "Elevate Your Space", "ar": "ارفع مستوى مساحتك"},
                            "subheadline": {"en": "Beautiful design, generated in seconds.", "ar": "تصميم جميل، يتم إنشاؤه في ثوانٍ."},
                            "primaryCta": {"label": {"en": "Get Started", "ar": "البدء الآن"}, "href": "#"}
                        }
                    }
                ]
            }
        ],
        "ecommerce": None,
        "assets": {"images": [], "fonts": []}
    }
    req = urllib.request.Request(
        f"{BASE_URL}/projects/{project_id}/schema",
        data=json.dumps(mock_schema).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        schema_res = json.loads(resp.read().decode('utf-8'))
        print("   Save Schema Response:", schema_res)
        assert schema_res.get("success") == True, "Save schema failed!"

    # 6. Export ZIP (Node Renderer CLI execution inside live container)
    print("\n6. Testing Export ZIP (Node Renderer CLI execution in production container)...")
    req = urllib.request.Request(
        f"{BASE_URL}/projects/{project_id}/export/static",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            zip_data = resp.read()
            print(f"   Export ZIP size: {len(zip_data)} bytes")
            assert len(zip_data) > 0, "Exported ZIP is empty!"
            assert zip_data.startswith(b'PK'), "Downloaded file is not a valid ZIP archive!"
    except urllib.error.HTTPError as e:
        print("   Export HTTP Error detail:", e.read().decode('utf-8'))
        raise e

    # 7. Logout
    print("\n7. Testing User Logout...")
    req = urllib.request.Request(
        f"{BASE_URL}/auth/logout",
        data=b"",
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        logout_res = json.loads(resp.read().decode('utf-8'))
        print("   Logout Response:", logout_res)

    print("\n==================================================")
    print("🎉 ALL LIVE RAILWAY SMOKE TESTS PASSED 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    run_test()

import urllib.request
import json

token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9haG1lZHMtcHJvamVjdHMtOGM5MmE3NzAiLCJzdWIiOiJvd25lcjphaG1lZHMtcHJvamVjdHMtOGM5MmE3NzA6cHJvamVjdDpxZXZvcmEtYWk6ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJzY29wZSI6Im93bmVyOmFobWVkcy1wcm9qZWN0cy04YzkyYTc3MDpwcm9qZWN0OnFldm9yYS1haTplbnZpcm9ubWVudDpkZXZlbG9wbWVudCIsImF1ZCI6Imh0dHBzOi8vdmVyY2VsLmNvbS9haG1lZHMtcHJvamVjdHMtOGM5MmE3NzAiLCJvd25lciI6ImFobWVkcy1wcm9qZWN0cy04YzkyYTc3MCIsIm93bmVyX2lkIjoidGVhbV8xU1JMR0E5WkxzbnN6cTdVd2hTV3Q3VUciLCJwcm9qZWN0IjoicWV2b3JhLWFpIiwicHJvamVjdF9pZCI6InByal9QQ1c3SndwV3BZUmcwWVdnTjBkYUJHbmFoRXNKIiwiZW52aXJvbm1lbnQiOiJkZXZlbG9wbWVudCIsInBsYW4iOiJob2JieSIsInVzZXJfaWQiOiJWTDVZamNXWjdtdlh2UVNha2lJMGQwYngiLCJjbGllbnRfaWQiOiJjbF9IWXlPUEJOdEZNZkhoYVVuOUw0UVBmVFp6NlRQNDdicCIsIm5iZiI6MTc4MjUzMzE3NCwiaWF0IjoxNzgyNTMzMTc0LCJleHAiOjE3ODI1NzYzNzR9.EgCvQcKNjjcMSGFjJZFFwmyT_5E1vTCGdnlEsmz4VGAVBf9FlBHt7G0UbHK3-VBJgQ-OSekthEg6UkhKHWAoKRLeUiN33yaR2lr5I5NlG2Qg_zi6HnwqygUh-T-5hLyVkxs09XSHEpElk9u_0g5PHOKb0dC1pphZXQxZsjE_NZ1IhYHN5NjfTRoXWEIq0zLbyj7u1BY0Jesx2wrdW6mZmBJB3usEqEHpkrOcC4cxUCiOi2rGGHYnaz0Txuboshe3l1p2du8aQBcQr_MAcFv9j4JeuaQL9XCyGb2u74tPRFEUPEBuybh1wn_h4q0I8xqLEAtUj9Qk0pxziBy1DylF1A"
url = "https://api.vercel.com/v9/projects/prj_PCW7JwpWpYRg0YWgN0daBGnahEsJ?teamId=team_1SRLGA9ZLsnszq7UwhSWt7UG"

req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print("Project targets/sso:", data.get("ssoProtection"), data.get("passwordProtection"))
except Exception as e:
    if hasattr(e, 'read'):
        print("Error body:", e.read().decode('utf-8'))
    else:
        print("Error:", e)

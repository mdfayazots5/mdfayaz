# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.ts >> portfolio type 1 (System Dashboard) renders correctly
- Location: tests/portfolio.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Modules Shipped')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Modules Shipped')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: MF
        - heading "Mohammed Fayaz" [level=1] [ref=e8]
        - paragraph [ref=e9]: .NET Full Stack Developer
      - navigation [ref=e10]:
        - button "Dashboard" [ref=e11]:
          - img [ref=e12]
          - text: Dashboard
        - button "Skills Radar" [ref=e17]:
          - img [ref=e18]
          - text: Skills Radar
        - button "Projects" [ref=e21]:
          - img [ref=e22]
          - text: Projects
        - button "Activity Log" [ref=e25]:
          - img [ref=e26]
          - text: Activity Log
        - button "Contact" [ref=e28]:
          - img [ref=e29]
          - text: Contact
      - generic [ref=e33]: Available for hire
    - main [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "System Overview" [level=2] [ref=e39]
            - paragraph [ref=e40]: Real-time performance metrics
          - generic [ref=e42]: "LAST UPDATED: 9:45:23 PM"
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]:
              - generic [ref=e46]: 📦
              - generic [ref=e47]: +3 this year
            - paragraph [ref=e48]: Modules Delivered
            - heading "15+" [level=3] [ref=e49]
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: ⚡
              - generic [ref=e53]: vs baseline
            - paragraph [ref=e54]: Perf Improvement
            - heading "30–50%" [level=3] [ref=e55]
          - generic [ref=e56]:
            - generic [ref=e57]:
              - generic [ref=e58]: 👤
              - generic [ref=e59]: Peak load
            - paragraph [ref=e60]: Users Served
            - heading "2,000" [level=3] [ref=e61]
          - generic [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]: 🟢
              - generic [ref=e65]: Last 12 months
            - paragraph [ref=e66]: System Uptime
            - heading "99.8%" [level=3] [ref=e67]
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]:
              - heading "Skill Radar" [level=3] [ref=e71]
              - generic [ref=e72]: Proficiency %
            - img [ref=e76]:
              - generic [ref=e87]: ASP.NET Core
              - generic [ref=e88]: Angular
              - generic [ref=e89]: SQL Server
              - generic [ref=e90]: Architecture
              - generic [ref=e91]: Azure
              - generic [ref=e92]: AI Tools
          - generic [ref=e93]:
            - heading "Tech Usage Distribution" [level=3] [ref=e94]
            - generic [ref=e95]:
              - generic [ref=e97]:
                - generic [ref=e98]: ASP.NET Core
                - generic [ref=e99]: 90%
              - generic [ref=e103]:
                - generic [ref=e104]: SQL Server
                - generic [ref=e105]: 85%
              - generic [ref=e109]:
                - generic [ref=e110]: Angular
                - generic [ref=e111]: 80%
              - generic [ref=e115]:
                - generic [ref=e116]: Azure
                - generic [ref=e117]: 70%
              - generic [ref=e121]:
                - generic [ref=e122]: Redis
                - generic [ref=e123]: 65%
      - generic [ref=e126]:
        - generic [ref=e127]:
          - heading "Project Inventory" [level=2] [ref=e128]
          - paragraph [ref=e129]: Production-ready systems
        - generic [ref=e130]:
          - generic [ref=e131]:
            - generic [ref=e132]:
              - generic [ref=e133]:
                - generic [ref=e134]: 🏥
                - generic [ref=e135]: Healthcare ERP
              - heading "Healthcare Management System (HCM)" [level=4] [ref=e136]
              - paragraph [ref=e137]: Team Lead + Full Stack Developer
            - generic [ref=e138]:
              - paragraph [ref=e139]: End-to-end healthcare platform covering patient registration, doctor appointments, prescription management, and multi-location hospital administration.
              - generic [ref=e140]:
                - generic [ref=e141]: ASP.NET WebForms
                - generic [ref=e142]: SQL Server
                - generic [ref=e143]: Multi-location Admin
                - generic [ref=e144]: Role-Based Access
              - button "View System Specs" [ref=e145]:
                - text: View System Specs
                - img [ref=e146]
          - generic [ref=e148]:
            - generic [ref=e149]:
              - generic [ref=e150]:
                - generic [ref=e151]: 👥
                - generic [ref=e152]: HRMS / Recruitment
              - heading "Requisition & Onboarding System" [level=4] [ref=e153]
              - paragraph [ref=e154]: Full Stack Developer
            - generic [ref=e155]:
              - paragraph [ref=e156]: Complete end-to-end hiring and onboarding automation platform covering JD creation, multi-stage interviewing, offer management, and onboarding workflows.
              - generic [ref=e157]:
                - generic [ref=e158]: ASP.NET Core
                - generic [ref=e159]: Web API
                - generic [ref=e160]: Angular
                - generic [ref=e161]: JWT Auth
              - button "View System Specs" [ref=e162]:
                - text: View System Specs
                - img [ref=e163]
          - generic [ref=e165]:
            - generic [ref=e166]:
              - generic [ref=e167]:
                - generic [ref=e168]: ⚡
                - generic [ref=e169]: SaaS Platforms
              - heading "Coolzo & FamilyFirst Platform" [level=4] [ref=e170]
              - paragraph [ref=e171]: Full Stack Developer
            - generic [ref=e172]:
              - paragraph [ref=e173]: Dual SaaS platform development — Coolzo (AC services marketplace) and FamilyFirst, focusing on performance, scalability, and clean architecture.
              - generic [ref=e174]:
                - generic [ref=e175]: ASP.NET Core
                - generic [ref=e176]: Angular
                - generic [ref=e177]: Redis
                - generic [ref=e178]: Azure
              - button "View System Specs" [ref=e179]:
                - text: View System Specs
                - img [ref=e180]
      - generic [ref=e182]:
        - generic [ref=e183]:
          - heading "Activity Log" [level=2] [ref=e184]
          - paragraph [ref=e185]: Commit history & milestones
        - table [ref=e188]:
          - rowgroup [ref=e189]:
            - row "Date Type Description Project Impact" [ref=e190]:
              - columnheader "Date" [ref=e191]
              - columnheader "Type" [ref=e192]
              - columnheader "Description" [ref=e193]
              - columnheader "Project" [ref=e194]
              - columnheader "Impact" [ref=e195]
          - rowgroup [ref=e196]:
            - row "2024-11 Feature Redis caching layer — 40% query speedup Coolzo" [ref=e197]:
              - cell "2024-11" [ref=e198]
              - cell "Feature" [ref=e199]
              - cell "Redis caching layer — 40% query speedup" [ref=e200]
              - cell "Coolzo" [ref=e201]
              - cell [ref=e202]
            - row "2024-10 Lead Onboarded 2 developers on HRMS module HRMS" [ref=e210]:
              - cell "2024-10" [ref=e211]
              - cell "Lead" [ref=e212]
              - cell "Onboarded 2 developers on HRMS module" [ref=e213]
              - cell "HRMS" [ref=e214]
              - cell [ref=e215]
            - row "2024-09 Deploy Azure staging pipeline configured Coolzo" [ref=e223]:
              - cell "2024-09" [ref=e224]
              - cell "Deploy" [ref=e225]
              - cell "Azure staging pipeline configured" [ref=e226]
              - cell "Coolzo" [ref=e227]
              - cell [ref=e228]
            - row "2024-07 Award AI Marathon Award received Internal" [ref=e236]:
              - cell "2024-07" [ref=e237]
              - cell "Award" [ref=e238]
              - cell "AI Marathon Award received" [ref=e239]
              - cell "Internal" [ref=e240]
              - cell [ref=e241]
            - row "2024-05 Feature Consultancy portal launched HRMS" [ref=e249]:
              - cell "2024-05" [ref=e250]
              - cell "Feature" [ref=e251]
              - cell "Consultancy portal launched" [ref=e252]
              - cell "HRMS" [ref=e253]
              - cell [ref=e254]
            - row "2024-03 Feature Automated onboarding pipeline deployed HRMS" [ref=e262]:
              - cell "2024-03" [ref=e263]
              - cell "Feature" [ref=e264]
              - cell "Automated onboarding pipeline deployed" [ref=e265]
              - cell "HRMS" [ref=e266]
              - cell [ref=e267]
            - row "2023-12 Lead HCM delivered — 3-dev team coordination HCM" [ref=e275]:
              - cell "2023-12" [ref=e276]
              - cell "Lead" [ref=e277]
              - cell "HCM delivered — 3-dev team coordination" [ref=e278]
              - cell "HCM" [ref=e279]
              - cell [ref=e280]
            - row "2023-08 Feature Prescription → pharmacy workflow live HCM" [ref=e288]:
              - cell "2023-08" [ref=e289]
              - cell "Feature" [ref=e290]
              - cell "Prescription → pharmacy workflow live" [ref=e291]
              - cell "HCM" [ref=e292]
              - cell [ref=e293]
      - generic [ref=e305]:
        - generic [ref=e306]:
          - heading "Ready for Deployment?" [level=2] [ref=e307]
          - paragraph [ref=e308]: Currently open to new opportunities as a .NET Full Stack Developer. Let's build something scalable.
          - generic [ref=e309]:
            - generic [ref=e310]:
              - img [ref=e312]
              - generic [ref=e315]:
                - paragraph [ref=e316]: Email
                - generic [ref=e317]:
                  - paragraph [ref=e318]: mdfayazots5@gmail.com
                  - button "Copy Email" [ref=e319]:
                    - img [ref=e320]
            - generic [ref=e323]:
              - img [ref=e325]
              - generic [ref=e327]:
                - paragraph [ref=e328]: Phone
                - paragraph [ref=e329]: +91 70954 41960
        - generic [ref=e330]:
          - button "Download Resume" [ref=e331]:
            - img [ref=e332]
            - text: Download Resume
          - button "Connect on LinkedIn" [ref=e335]:
            - text: Connect on LinkedIn
            - img [ref=e336]
      - generic [ref=e340]:
        - paragraph [ref=e341]: © 2026 Mohammed Fayaz — Portfolio OS v1.0
        - generic [ref=e342]:
          - link "GitHub" [ref=e343] [cursor=pointer]:
            - /url: "#"
          - link "LinkedIn" [ref=e344] [cursor=pointer]:
            - /url: "#"
          - link "Source" [ref=e345] [cursor=pointer]:
            - /url: "#"
  - generic [ref=e346]:
    - generic [ref=e347]:
      - button "1" [ref=e348]
      - button "2" [ref=e349]
      - button "3" [ref=e350]
      - button "4" [ref=e351]
      - button "5" [ref=e352]
      - button "6" [ref=e353]
    - generic [ref=e354]: Portfolio Type 1
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('portfolio type 1 (System Dashboard) renders correctly', async ({ page }) => {
  4  |   // Wait for server to be ready
  5  |   await new Promise(r => setTimeout(r, 5000));
  6  |   
  7  |   // Go to the app
  8  |   await page.goto('/');
  9  | 
  10 |   // Wait for the main content to appear
  11 |   await page.waitForSelector('text=System Overview', { timeout: 15000 });
  12 | 
  13 |   // Check if the name "Mohammed Fayaz" is visible
  14 |   await expect(page.getByText('Mohammed Fayaz').first()).toBeVisible();
  15 | 
  16 |   // Check if "System Overview" is visible (specific to Type 1)
  17 |   await expect(page.getByRole('heading', { name: 'System Overview' })).toBeVisible();
  18 | 
  19 |   // Check if the sidebar navigation exists
  20 |   const sidebar = page.locator('aside');
  21 |   await expect(sidebar).toBeVisible();
  22 | 
  23 |   // Check for specific KPI cards (e.g., "Modules Shipped")
> 24 |   await expect(page.getByText('Modules Shipped')).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  25 | });
  26 | 
```
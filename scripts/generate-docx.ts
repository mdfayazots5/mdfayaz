import { Document, Packer, Paragraph, ImageRun, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = path.resolve(process.cwd(), "screenshots");
const OUTPUT_FILE = path.resolve(process.cwd(), "Portfolio_Visual_State_Audit.docx");

// List of pages to capture/group (in natural visual order)
const PAGES_METADATA = [
  { key: "about", title: "About Page", desc: "The main introduction section showcasing the profile, background, and summary." },
  { key: "work", title: "Projects / Work Page", desc: "The projects portfolio section showcasing work experience, cards, and professional mockups." },
  { key: "uses", title: "Uses Page", desc: "The 'Uses' page showing the developer's workstation configuration, software, and hardware setup." },
  { key: "faq", title: "FAQ Page", desc: "Frequently Asked Questions page displaying expanding/collapsing accordion items." },
  { key: "privacy", title: "Privacy Policy Page", desc: "Privacy policies, terms of service, and administrative user disclosures." },
  { key: "contact", title: "Contact Section", desc: "Interactive email/message contact form for inquiries." },
  { key: "admin-login", title: "Admin Login Page", desc: "Secure administrative login portal." },
  { key: "admin-dashboard", title: "Admin Dashboard Page", desc: "Back-office content management panel and project manager (requires authorization)." },
];

function createDocx() {
  console.log("Analyzing screenshots...");
  
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.error(`Error: Screenshots directory not found at ${SCREENSHOTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SCREENSHOTS_DIR);
  console.log(`Found ${files.length} screenshots in directory.`);

  const children: any[] = [];

  // 1. Cover / Title Page
  children.push(
    new Paragraph({
      text: "PORTFOLIO APPLICATION",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "VISUAL STATE AUDIT DOCUMENT",
          bold: true,
          size: 28, // 14pt (multiplied by 2 for docx size)
          color: "4B5563",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "", spacing: { before: 240, after: 240 } }), // spacing spacer
    new Paragraph({
      children: [
        new TextRun({
          text: "This document contains a comprehensive visual audit of all public and administrative screens. To support design review and QA, each page is captured across both Light and Dark themes, for Desktop (1440x900) and Mobile (390x844) devices.",
          italics: true,
          size: 22, // 11pt
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
    new Paragraph({
      children: [
        new TextRun({ text: "Generated on: ", bold: true }),
        new TextRun({ text: new Date().toLocaleDateString("en-US", { dateStyle: "long" }) }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Total Screens Documented: ", bold: true }),
        new TextRun({ text: `${files.length} screenshots` }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
    new PageBreak()
  );

  // 2. Add sections per Page
  for (const pageMeta of PAGES_METADATA) {
    children.push(
      new Paragraph({
        text: pageMeta.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: pageMeta.desc,
            color: "4B5563",
            size: 20,
          }),
        ],
        spacing: { after: 240 },
      })
    );

    // Filter screenshots for this specific page
    const pageFiles = files.filter(f => f.startsWith(`${pageMeta.key}-`));
    
    if (pageFiles.length === 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "No screenshots captured for this view.",
              color: "EF4444",
              italics: true,
            }),
          ],
        })
      );
    } else {
      // Group by theme
      for (const theme of ["light", "dark"]) {
        const themeHeaderAdded = false;
        
        // Find desktop and mobile for this theme
        const desktopFile = pageFiles.find(f => f.includes(`-${theme}-desktop.png`));
        const mobileFile = pageFiles.find(f => f.includes(`-${theme}-mobile.png`));

        if (desktopFile || mobileFile) {
          children.push(
            new Paragraph({
              text: `${theme.toUpperCase()} THEME`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 120 },
            })
          );
        }

        // Add Desktop Image
        if (desktopFile) {
          const imgPath = path.join(SCREENSHOTS_DIR, desktopFile);
          if (fs.existsSync(imgPath)) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Desktop View (1440x900):", bold: true, size: 20 }),
                ],
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: fs.readFileSync(imgPath),
                    type: "png",
                    transformation: {
                      width: 550, // width in pixels
                      height: 344, // height in pixels (16:10 or 1.6 ratio scaled)
                    },
                  }),
                ],
                spacing: { after: 180 },
              })
            );
          }
        }

        // Add Mobile Image
        if (mobileFile) {
          const imgPath = path.join(SCREENSHOTS_DIR, mobileFile);
          if (fs.existsSync(imgPath)) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Mobile View (390x844):", bold: true, size: 20 }),
                ],
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: fs.readFileSync(imgPath),
                    type: "png",
                    transformation: {
                      width: 220, // width in pixels
                      height: 476, // height in pixels (proportional to 390x844)
                    },
                  }),
                ],
                spacing: { after: 180 },
              })
            );
          }
        }
      }
    }

    // Add a page break between different routes to keep document highly neat
    children.push(new PageBreak());
  }

  // Define doc core structure
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(OUTPUT_FILE, buffer);
    console.log(`\nWord Document successfully written to: ${OUTPUT_FILE}`);
  }).catch((err) => {
    console.error("Error creating word document buffer:", err);
    process.exit(1);
  });
}

createDocx();

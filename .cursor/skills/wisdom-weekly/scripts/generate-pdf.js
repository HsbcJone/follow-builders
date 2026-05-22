const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function generatePDF(htmlPath) {
  const resolvedPath = path.resolve(htmlPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`文件不存在: ${resolvedPath}`);
    process.exit(1);
  }

  const outputDir = path.dirname(resolvedPath);
  const pdfPath = path.join(outputDir, "wisdom.pdf");

  console.log(`正在生成 PDF: ${resolvedPath}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    const fileUrl = `file://${resolvedPath}`;
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    console.log(`PDF 已生成: ${pdfPath}`);

    await generatePageImages(page, outputDir);
  } finally {
    await browser.close();
  }
}

async function generatePageImages(page, outputDir) {
  const pageCount = await page.evaluate(() => {
    return document.querySelectorAll(".page").length;
  });

  console.log(`共 ${pageCount} 页，正在生成 PNG 卡片...`);

  const imgWidth = 1080;
  const imgHeight = 1440;

  for (let i = 0; i < pageCount; i++) {
    const pageNum = String(i + 1).padStart(2, "0");
    const imgPath = path.join(outputDir, `page-${pageNum}.png`);

    const clip = await page.evaluate((index) => {
      const pages = document.querySelectorAll(".page");
      const el = pages[index];
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }, i);

    if (!clip) continue;

    await page.screenshot({
      path: imgPath,
      clip: {
        x: clip.x,
        y: clip.y,
        width: clip.width,
        height: clip.height,
      },
    });

    // 调整为小红书尺寸 1080x1440
    const sharp = getSharp();
    if (sharp) {
      const buffer = fs.readFileSync(imgPath);
      await sharp(buffer)
        .resize(imgWidth, imgHeight, { fit: "cover" })
        .png()
        .toFile(imgPath + ".tmp");
      fs.renameSync(imgPath + ".tmp", imgPath);
    }

    console.log(`  page-${pageNum}.png`);
  }

  console.log("PNG 卡片生成完成");
}

function getSharp() {
  try {
    return require("sharp");
  } catch {
    console.log(
      "  提示: 安装 sharp (npm i sharp) 可自动调整图片为小红书尺寸"
    );
    return null;
  }
}

const htmlFile = process.argv[2];
if (!htmlFile) {
  console.log("用法: node generate-pdf.js <html文件路径>");
  console.log("示例: node .cursor/skills/wisdom-weekly/scripts/generate-pdf.js output/week-01-naval-ravikant/wisdom.html");
  process.exit(1);
}

generatePDF(htmlFile).catch((err) => {
  console.error("生成失败:", err.message);
  process.exit(1);
});

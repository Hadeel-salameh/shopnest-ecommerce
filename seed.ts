
import "dotenv/config";
import { db } from "./src/db";
import { products } from "./src/db/schema";
import { eq } from "drizzle-orm";

// Pexels direct image URL
function pexelsImage(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;
}

// Images matched to the actual ShopNest products
const productImages = [
  { name: "سماعات رأس لاسلكية", id: 8000618 },
  { name: "ساعة ذكية رياضية", id: 32977239 },
  { name: "حذاء رياضي أنيق", id: 29603272 },
  { name: "حقيبة ظهر للاب توب", id: 5827881 },
  { name: "نظارات شمسية عصرية", id: 10538076 },
  { name: "مكنسة سيارة محمولة", id: 5233264 },
  { name: "شاحن باور بانك سريع", id: 37475677 },
  { name: "كاميرا مراقبة منزلية", id: 9795001 },
  { name: "ماوس لاسلكي مريح", id: 13870517 },
  { name: "لوحة مفاتيح ميكانيكية", id: 40975568 },
  { name: "مصباح مكتب LED ذكي", id: 31726764 },
  { name: "زجاجة مياه عزل حراري", id: 35915132 },
  { name: "جهاز تتبع اللياقة البدنية", id: 8032913 },
  { name: "حامل لابتوب قابل للتعديل", id: 14458078 },
  { name: "طقم سكاكين مطبخ احترافي", id: 6195958 },
  { name: "ماكينة حلاقة كهربائية", id: 10359950 },
  { name: "جهاز تنقية الهواء", id: 31726758 },
  { name: "مفرش مطاطي لليوجا", id: 8534799 },
  { name: "محول مقابس دولي", id: 32688515 },
  { name: "مكبر صوت بلوتوث مقاوم للماء", id: 374067 },
  { name: "حقيبة سفر صغيرة", id: 13872590 },
  { name: "حامل هاتف للسيارة", id: 11334986 },
  { name: "قلم تابلت ذكي", id: 5594347 },
  { name: "وسادة ميموري فوم للرقبة", id: 25210705 },
  { name: "محفظة رجالية جلدية", id: 13225343 },
];

async function main() {
  console.log("🌱 Starting ShopNest image update...");

  let updatedCount = 0;
  const missingProducts: string[] = [];

  try {
    for (const item of productImages) {
      const result = await db
        .update(products)
        .set({
          imageUrl: pexelsImage(item.id),
        })
        .where(eq(products.name, item.name))
        .returning({ id: products.id });

      if (result.length > 0) {
        updatedCount += result.length;

        console.log(
          `✅ ${item.name}: ${result.length} record(s) updated`
        );
      } else {
        missingProducts.push(item.name);
        console.log(`⚠️ Product not found: ${item.name}`);
      }
    }

    console.log("\n🎉 Image update completed!");
    console.log(`🖼️ Products with images: ${productImages.length - missingProducts.length}`);
    console.log(`📦 Updated database records: ${updatedCount}`);

    if (missingProducts.length > 0) {
      console.log("Products not found:", missingProducts);
    }
  } catch (error) {
    console.error("❌ Image update failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exitCode = 1;
});

const Push = require("pushover-notifications");
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const PORT = 3000;

const pushover = new Push({
  token: "ac8jh3ku2ust97s7j47oa7ug4h8r48", // Thay bằng API Token của bạn
  user: "u1pvc4wjjwefey9sqnrfx3axzijyzn", // Thay bằng User Key của bạn
});

function sendNotification(message) {
  const msg = {
    message: message,
    title: "THÔNG BÁO TỪ CHECK FLIP",
    sound: "magic",
    priority: 1,
  };

  pushover.send(msg, function (err, result) {
    if (err) {
      console.error("❌ Gửi thông báo thất bại:", err);
    } else {
      console.log("✅ Thông báo đã gửi:", result);
    }
  });
}

async function checkNearQuests() {
  try {
    const url = "https://flipsidecrypto.xyz/earn/near";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const hasNearOnboarding = $("span:contains('Near Onboarding')").length > 0;
    const hasJourneys = $("h2:contains('Journeys')").length > 0;
    const hasQuestsWithRewards =
      $("h2:contains('Quests with Rewards')").length > 0;
    if (hasQuestsWithRewards) {
      const hasSpecialDiv = $("div.flex.flex-col.p-4.pb-1.space-y-0").length;
      if (hasSpecialDiv == 1) {
        const hasStakeLink =
          $("a:contains('Stake $BRRR for BOOSTED Rewards')").length > 0;
        if (hasStakeLink == 1) {
        } else {
          sendNotification("🚀 Đã phát hiện thay đổi quest Near!");
        }
      } else {
        sendNotification("🚀 Đã phát hiện thay đổi quest Near!");
      }
    }
    if (hasNearOnboarding || hasJourneys) {
      console.log("🚀 Phát hiện thay đổi Near!");
      sendNotification("🚀 Đã phát hiện thay đổi Near!");
    } else {
      console.log("Near chưa có thay đổi");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra Near:", err.message);
  }
}

async function checkSeiQuests() {
  try {
    const url = "https://flipsidecrypto.xyz/earn/sei";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const hasQuestsWithRewards =
      $("h2:contains('Quests with Rewards')").length > 0;

    if (!hasQuestsWithRewards) {
      console.log("🚀 Phát hiện new QUEST SEI!");
      sendNotification("🚀 Đã phát hiện New Quest SEI!");
    } else {
      console.log("SEI chưa có thay đổi");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra SEI:", err.message);
  }
}

async function checkSeiDefiJourney() {
  try {
    const url = "https://flipsidecrypto.xyz/earn/journey/sei-defi-journey";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const bridgeAssetHeader =
      $("h2:contains('Bridge Assets to Sei EVM')").length > 0;
    const specialSpan = $("span:contains('49236.874222009556')").length > 0;

    if (bridgeAssetHeader && !specialSpan) {
      console.log("🚀 Phát hiện FIX LỖI QUEST SEI!");
      sendNotification("🚀 Phát hiện FIX LỖI QUEST SEI!");
    } else {
      console.log("SEI DeFi Journey chưa có thay đổi");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra SEI DeFi Journey:", err.message);
  }
}

// Hàm kiểm tra quest sẽ chạy khi có yêu cầu từ HTTP request
async function abc() {
  console.log("=== CHECKING Flipside Quests ===");

  sendNotification("🚀 Đang kiểm tra quests...");

  await checkNearQuests();
  await checkSeiQuests();
  await checkSeiDefiJourney();
}

// Endpoint để bắt đầu kiểm tra quests
app.get("/start-check", async (req, res) => {
  try {
    console.log("Truy cập vào endpoint để bắt đầu kiểm tra");
    await abc();
    res.send("Đã bắt đầu kiểm tra quests!");
  } catch (error) {
    console.error("Lỗi khi chạy kiểm tra:", error);
    res.status(500).send("Có lỗi xảy ra khi kiểm tra!");
  }
});

// Khởi động express server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

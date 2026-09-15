/// <reference types="@workadventure/iframe-api-typings" />

import { levelUp } from "@workadventure/quests";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log("MBS City Scripting API Extra ready");
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

function setPlayerNameOutline() {
  const roleColors: Record<string, { r: number; g: number; b: number }> = {
    staff: { r: 202, g: 177, b: 245 }, // Prioritize staff
    health: { r: 210, g: 221, b: 90 },
    social: { r: 125, g: 206, b: 187 },
    env: { r: 114, g: 152, b: 140 },
    expert: { r: 218, g: 183, b: 160 },
  };

  const outlineColor = WA.player.tags
    .map((tag) =>
      Object.entries(roleColors).find(([keyword]) => tag.includes(keyword))
    )
    .filter(
      (entry): entry is [string, { r: number; g: number; b: number }] => !!entry
    )
    .sort(([a], [b]) => (a === "staff" ? -1 : b === "staff" ? 1 : 0)) // Prioritize staff
    .find(Boolean)?.[1];

  if (outlineColor) {
    WA.player.setOutlineColor(outlineColor.r, outlineColor.g, outlineColor.b);
  }
}

WA.onInit().then(() => {
  setPlayerNameOutline();
});

WA.onInit().then(() => {
  WA.controls.disableInviteButton();
  if (!["editor"].some((tag) => WA.player.tags.includes(tag))) {
    WA.controls.disableMapEditor();
    WA.controls.disableRoomList();
  }
  WA.ui.actionBar.addButton({
    id: "map-btn",
    label: "map/خريطة",
    toolTip: "افتح خريطة مصغرة لمدينة MBS",
    callback: () => {
      WA.ui.modal.openModal({
        title: "Map",
        src: "https://p.interacty.me/df869c4e41ad37c8/iframe.html",
        allow: "",
        allowApi: true,
        position: "center",
        // Removed unsupported 'onClose' property
      });
    },
  });
});

async function incrementCompanionProgress() {
  try {
    const currentProgress = Number(WA.player.state.companionProgress) || 0;
    WA.player.state.companionProgress = currentProgress + 1;
    levelUp("companion", 1);
    console.log(
      `Companion progress incremented to: ${WA.player.state.companionProgress}`
    );
  } catch (error) {
    console.error("Error incrementing companion progress:", error);
  }
}
let companionProgress: number = Number(WA.player.state.companionProgress) || 0;
WA.onInit().then(() => {
  // Watch for changes to companionProgress using WA.player.onVariableChange
  WA.player.state
    .onVariableChange("companionProgress")
    .subscribe(async (value) => {
      companionProgress = value as number;

      try {
        if (companionProgress === 1) {
          await updateMemberTags("lvl1");
        } else if (companionProgress === 6) {
          await updateMemberTags("lvl2");
        } else if (companionProgress === 12) {
          await updateMemberTags("lvl3");
        }
      } catch (err) {
        console.error("Error updating member:", err);
      }
    });

  const API_BASE =
    "https://admin.workadventu.re/api/v1/worlds/innovation-diwan-2025";
  const MEMBER_ID = WA.player.id;
  const API_TOKEN =
    "7d26150312868440fc230d8abc3964b95521aed5e61809e53f53c385ac6b545c";

  // Function to update tags
  async function updateMemberTags(level: "lvl1" | "lvl2" | "lvl3") {
    const url = `${API_BASE}/members/${MEMBER_ID}`;

    // Fetch existing tags
    const getResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: API_TOKEN, // no Bearer prefix
        Accept: "application/json",
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(
        `GET request failed: ${getResponse.status} ${getResponse.statusText}\n${errorText}`
      );
    }

    const memberData = await getResponse.json();
    const existingTags: string[] = memberData.tags || [];

    // Filter out "lvl1", "lvl2", "lvl3" from existing tags
    const filteredTags = existingTags.filter(
      (tag) => !["lvl1", "lvl2", "lvl3"].includes(tag)
    );

    // Add the new level tag
    const updatedTags = [...filteredTags, level];

    // Update tags with PATCH
    const patchResponse = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: API_TOKEN, // no Bearer prefix
        Accept: "application/json",
        "Content-Type": "application/merge-patch+json",
      },
      body: JSON.stringify({ tags: updatedTags }),
    });

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      throw new Error(
        `PATCH request failed: ${patchResponse.status} ${patchResponse.statusText}\n${errorText}`
      );
    }

    const patchedData = await patchResponse.json();
    console.log("Updated member:", patchedData);
  }

  WA.onInit().then(() => {
    WA.player.state.onVariableChange("companionProgress").subscribe((value) => {
      if (value === 1) {
        WA.chat.sendChatMessage(
          "لقد ارتقى رفيقك إلى مستوى أعلى. يرجى تحديث الصفحة للوصول إلى الرفيق الجديد.",
          "Aila"
        );
      } else if (value === 6) {
        WA.chat.sendChatMessage(
          "لقد ارتقى رفيقك إلى مستوى أعلى. يرجى تحديث الصفحة للوصول إلى الرفيق الجديد.",
          "Aila"
        );
      } else if (value === 12) {
        WA.chat.sendChatMessage(
          "لقد ارتقى رفيقك إلى مستوى أعلى. يرجى تحديث الصفحة للوصول إلى الرفيق الجديد.",
          "Aila"
        );
      }
    });
  });
});

WA.onInit().then(() => {
  type AreaTeleport = {
    area: string;
    coords: { x: number; y: number }[];
  };

  const teleports: AreaTeleport[] = [
    {
      area: "toInnovatorRoom",
      coords: [
        { x: 4570, y: 753 },
        { x: 4680, y: 787 },
      ],
    },
    {
      area: "fromInnovatorRoom",
      coords: [
        { x: 2625, y: 879 },
        { x: 2745, y: 912 },
      ],
    },
    {
      area: "toResearchRoom1",
      coords: [
        { x: 320, y: 3192 },
        { x: 391, y: 3219 },
      ],
    },
    {
      area: "fromResearchRoom1",
      coords: [
        { x: 259, y: 1607 },
        { x: 330, y: 1634 },
      ],
    },
    {
      area: "toResearchRoom2",
      coords: [
        { x: 763, y: 2711 },
        { x: 834, y: 2738 },
      ],
    },
    {
      area: "fromResearchRoom2",
      coords: [
        { x: 554, y: 1278 },
        { x: 626, y: 1305 },
      ],
    },
    {
      area: "toResearchRoom3",
      coords: [
        { x: 1219, y: 3142 },
        { x: 1290, y: 3169 },
      ],
    },
    {
      area: "fromResearchRoom3",
      coords: [
        { x: 867, y: 1607 },
        { x: 938, y: 1634 },
      ],
    },
    {
      area: "toMentorRoom",
      coords: [
        { x: 4065, y: 2578 },
        { x: 4175, y: 2612 },
      ],
    },
    {
      area: "fromMentorRoom",
      coords: [
        { x: 2790, y: 1391 },
        { x: 2909, y: 1426 },
      ],
    },
    {
      area: "toPrayerRoom",
      coords: [
        { x: 2386, y: 3313 },
        { x: 2496, y: 3347 },
      ],
    },
    {
      area: "fromPrayerRoom",
      coords: [
        { x: 1511, y: 1067 },
        { x: 1630, y: 1102 },
      ],
    },
    {
      area: "toChallengeRoom",
      coords: [
        { x: 3586, y: 1106 },
        { x: 3677, y: 1150 },
      ],
    },
    {
      area: "fromChallengeRoom",
      coords: [
        { x: 2273, y: 1296 },
        { x: 2390, y: 1331 },
      ],
    },
  ];

  const areaLayerMap: Record<string, { show: string; hide: string }> = {
    toInnovatorRoom: {
      show: "foreground/hideFog/innovator",
      hide: "foreground/hideFog/city",
    },
    fromInnovatorRoom: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/innovator",
    },
    toResearchRoom1: {
      show: "foreground/hideFog/research",
      hide: "foreground/hideFog/city",
    },
    fromResearchRoom1: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/research",
    },
    toResearchRoom2: {
      show: "foreground/hideFog/research",
      hide: "foreground/hideFog/city",
    },
    fromResearchRoom2: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/research",
    },
    toResearchRoom3: {
      show: "foreground/hideFog/research",
      hide: "foreground/hideFog/city",
    },
    fromResearchRoom3: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/research",
    },
    toMentorRoom: {
      show: "foreground/hideFog/mentor",
      hide: "foreground/hideFog/city",
    },
    fromMentorRoom: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/mentor",
    },
    toPrayerRoom: {
      show: "foreground/hideFog/prayer",
      hide: "foreground/hideFog/city",
    },
    fromPrayerRoom: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/prayer",
    },
    toChallengeRoom: {
      show: "foreground/hideFog/challenge",
      hide: "foreground/hideFog/city",
    },
    fromChallengeRoom: {
      show: "foreground/hideFog/city",
      hide: "foreground/hideFog/challenge",
    },
  };

  function pickRandomCoord(
    coords: { x: number; y: number }[]
  ): { x: number; y: number } | undefined {
    if (!coords.length) return undefined;
    return coords[Math.floor(Math.random() * coords.length)];
  }

  teleports.forEach(({ area, coords }) => {
    WA.room.area.onEnter(area).subscribe(() => {
      const coord = pickRandomCoord(coords);
      if (coord) WA.player.teleport(coord.x, coord.y);

      // Handle fog layers
      const layerAction = areaLayerMap[area];
      if (layerAction) {
        WA.room.showLayer(layerAction.show);
        WA.room.hideLayer(layerAction.hide);
      }
    });
  });
});

// Quest 1 Logic
WA.onInit().then(() => {
  WA.room.area.onEnter("quest1").subscribe(() => {
    if (WA.player.state["quest1"] === "solved") {
      WA.chat.sendChatMessage(
        "رحلتك قد بدأت. آمل أن تتوافق أنت ورفيقك مع بعضكما البعض.",
        "عايدة"
      );
    } else {
      incrementCompanionProgress();
      WA.chat.sendChatMessage(
        "مرحبًا! تبدأ رحلة رفاقك الآن. يمكنك اختيار واحد من أربعة رفاق من القائمة. مع كل استكشاف ومهمة تحلها في MBS-City، يتطور رفيقك. حظًا سعيدًا! آمل أن تتوافق أنت ورفيقك مع بعضكما البعض.",
        "عايدة"
      );
      WA.player.state.quest1 = "solved";
    }
  });

  WA.room.area.onLeave("quest1").subscribe(() => {
    WA.chat.close();
  });
});

// Quest 2 logic
WA.onInit().then(() => {
  WA.player.state.onVariableChange("quest2").subscribe((newValue) => {
    if (newValue === "solved") {
      incrementCompanionProgress();
    }
  });
});

WA.onInit().then(() => {
  WA.room.area.onEnter("quest2").subscribe(() => {
    if (WA.player.state.quest2 === "solved") {
      handleQuest2Solved();
    } else {
      handleQuest2Start();
    }
  });
});

function handleQuest2Solved() {
  WA.chat.sendChatMessage(
    "شكراً لمساعدتك في تلبية احتياجات مرضى السكري في وقت سابق!",
    "أخصائية التغذية أمل"
  );
}

function handleQuest2Start() {
  const playerName: string = WA.player.name || "Player";
  WA.chat.sendChatMessage(
    `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
    "أخصائية التغذية أمل"
  );

  const triggerMessage = WA.ui.displayActionMessage({
    message: "اضغط على [مفتاح المسافة] للمساعدة في تلبية احتياجات مرضى السكري.",
    callback: async () => {
      const coWebsite = await WA.nav.openCoWebSite(
        "https://komponentab.github.io/Innovation-Diwan-2025/balancedMeal.html",
        true,
        "",
        70,
        1,
        true,
        true
      );
      triggerMessage.remove();
      setupQuest2LeaveHandler(coWebsite);
    },
  });
  WA.room.area.onLeave("quest2").subscribe({
    next: () => {
      triggerMessage.remove();
    },
  });
}

function setupQuest2LeaveHandler(coWebsite: any) {
  WA.room.area.onLeave("quest2").subscribe({
    next: () => {
      WA.chat.close();
      coWebsite.close();
    },
  });
}

// Quest 3 logic
WA.onInit().then(() => {
  WA.room.area.onEnter("quest3").subscribe({
    next: () => {
      const playerName: string = WA.player.name;
      if (WA.player.state["quest3"] === "solved") {
        WA.chat.sendChatMessage(
          `شكراً على مساعدتك ${playerName}!`,
          "الحلاق فهد"
        );
      } else if (WA.player.state["quest3"] === "started") {
        WA.chat.sendChatMessage(
          "لا بد أنني أضعت مقصّي على طاولة في مكان قريب.",
          "الحلاق فهد"
        );
      } else {
        WA.chat.sendChatMessage(
          `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
          "الحلاق فهد"
        );
        const triggerMessage = WA.ui.displayActionMessage({
          message: "اضغط على [مفتاح المسافة] للتحدث إلى باربر.",
          callback: () => {
            WA.chat.sendChatMessage(
              "لا بد أنني أضعت مقصّي على طاولة في مكان قريب.",
              "الحلاق فهد"
            );
            WA.player.state.quest3 = "started";
            WA.room.showLayer("background/furnitures/scissor");
            WA.room.onEnterLayer("background/furnitures/scissor").subscribe({
              next: () => {
                WA.player.state.quest3 = "solved";
                WA.chat.sendChatMessage(
                  "شكراً على العثور على مقصاتي",
                  "الحلاق فهد"
                );
                WA.room.hideLayer("background/furnitures/scissor");
                incrementCompanionProgress();
              },
            });
          },
        });

        WA.room.area.onLeave("quest3").subscribe({
          next: () => {
            triggerMessage.remove();
          },
        });
      }
    },
  });
  WA.room.area.onLeave("quest3").subscribe({
    next: () => {
      WA.chat.close();
    },
  });
});

WA.onInit().then(() => {
  const layer = "background/furnitures/scissor";
  const quest3 = WA.player.state.quest3;

  // Hide when quest3 is null/undefined/solved
  if (quest3 === null || quest3 === undefined || quest3 === "solved") {
    WA.room.hideLayer(layer);
  }

  // When quest3 is started: show + listen
  if (quest3 === "started") {
    WA.room.showLayer(layer);

    const sub = WA.room.onEnterLayer(layer).subscribe({
      next: () => {
        WA.player.state.quest3 = "solved";
        WA.chat.sendChatMessage("شكراً على العثور على مقصاتي", "الحلاق فهد");
        WA.room.hideLayer(layer);
        incrementCompanionProgress();

        // prevent multiple triggers
        sub.unsubscribe?.();
      },
    });
  }
});

// Quest 4 logic

WA.onInit().then(() => {
  WA.player.state.onVariableChange("quest4").subscribe((newValue) => {
    if (newValue === "solved") {
      incrementCompanionProgress();
    }
  });
});

WA.onInit().then(() => {
  WA.room.area.onEnter("quest4").subscribe(() => {
    if (WA.player.state.quest4 === "solved") {
      handleQuest4Solved();
    } else {
      handleQuest4Start();
    }
  });
});

function handleQuest4Solved() {
  WA.chat.sendChatMessage("شكراً لمساعدتكم في حالات الطوارئ!", "ياسر المسعف");
}

function handleQuest4Start() {
  const playerName: string = WA.player.name || "Player";
  WA.chat.sendChatMessage(
    `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
    "ياسر المسعف"
  );

  const triggerMessage = WA.ui.displayActionMessage({
    message: "اضغط على [مفتاح المسافة] للمساعدة في حل حالات الطوارئ.",
    callback: async () => {
      const coWebsite = await WA.nav.openCoWebSite(
        "https://komponentab.github.io/Innovation-Diwan-2025/paramedic.html",
        true,
        "",
        70,
        1,
        true,
        true
      );
      triggerMessage.remove();
      setupQuest4LeaveHandler(coWebsite);
    },
  });
  WA.room.area.onLeave("quest4").subscribe({
    next: () => {
      triggerMessage.remove();
    },
  });
}

function setupQuest4LeaveHandler(coWebsite: any) {
  WA.room.area.onLeave("quest4").subscribe({
    next: () => {
      WA.chat.close();
      coWebsite.close();
    },
  });
}

// Quest 5 logic

WA.onInit().then(() => {
  WA.room.area.onEnter("quest5").subscribe(() => {
    if (WA.player.state["quest5"] !== "solved") {
      WA.chat.sendChatMessage(
        "مرحبًا بك في غرفة البحث! هنا يمكنك استكشاف الأفكار الجديدة.",
        "عايدة"
      );
      WA.player.state.quest5 = "solved";
      incrementCompanionProgress();
    }
  });

  WA.room.area.onLeave("quest5").subscribe(() => {
    WA.chat.close();
  });
});

// Quest 8 Logic
WA.onInit().then(() => {
  WA.player.state.onVariableChange("quest8").subscribe((newValue) => {
    if (newValue === "solved") {
      incrementCompanionProgress();
    }
  });
});

WA.onInit().then(() => {
  WA.room.area.onEnter("quest8").subscribe(() => {
    if (WA.player.state.quest8 === "solved") {
      handleQuest8Solved();
    } else {
      handleQuest8Start();
    }
  });
});

function handleQuest8Solved() {
  WA.chat.sendChatMessage(
    "شكراً لمساعدتك في اختيار الأحذية سابقاً!",
    "الحاج رامي"
  );
}

function handleQuest8Start() {
  const playerName: string = WA.player.name || "Player";
  WA.chat.sendChatMessage(
    `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
    "الحاج رامي"
  );

  const triggerMessage = WA.ui.displayActionMessage({
    message:
      "اضغط على [مفتاح المسافة] للمساعدة في العثور على الأحذية المطابقة.",
    callback: async () => {
      const coWebsite = await WA.nav.openCoWebSite(
        "https://komponentab.github.io/Innovation-Diwan-2025/organizedShelf.html",
        true,
        "",
        70,
        1,
        true,
        true
      );
      triggerMessage.remove();
      setupQuest8LeaveHandler(coWebsite);
    },
  });
  WA.room.area.onLeave("quest8").subscribe({
    next: () => {
      triggerMessage.remove();
    },
  });
}

function setupQuest8LeaveHandler(coWebsite: any) {
  WA.room.area.onLeave("quest8").subscribe({
    next: () => {
      WA.chat.close();
      coWebsite.close();
    },
  });
}

// Quest 9 Logic

WA.onInit().then(() => {
  const trashTiles = [
    { x: 23, y: 26 },
    { x: 19, y: 61 },
    { x: 96, y: 22 },
    { x: 56, y: 52 },
  ];

  // Helper to generate a unique key for each trash tile
  const getTrashKey = (x: number, y: number) => `trash_${x}_${y}_collected`;

  if (
    WA?.room?.onEnterLayer &&
    WA?.player?.getPosition &&
    WA?.room?.setTiles &&
    WA?.chat?.sendChatMessage &&
    WA?.player?.state
  ) {
    // On player join, remove trash tiles already collected
    trashTiles.forEach(({ x, y }) => {
      const trashKey = getTrashKey(x, y);
      if (WA.player.state[trashKey]) {
        WA.room.setTiles([
          {
            x,
            y,
            tile: null,
            layer: "background/furnitures/trash",
          },
        ]);
      }
    });

    WA.room.onEnterLayer("background/furnitures/trash").subscribe(async () => {
      try {
        const position = await WA.player.getPosition();
        const playerX = position.x;
        const playerY = position.y;
        const tileX = Math.floor(playerX / 32);
        const tileY = Math.floor(playerY / 32);

        // Find nearby trash tile (within 1 tile distance)
        const nearbyTrash = trashTiles.find(
          ({ x, y }) => Math.abs(tileX - x) <= 1 && Math.abs(tileY - y) <= 1
        );

        if (nearbyTrash) {
          const trashKey = getTrashKey(nearbyTrash.x, nearbyTrash.y);
          // Check if player already collected this trash
          if (!WA.player.state[trashKey]) {
            WA.room.setTiles([
              {
                x: nearbyTrash.x,
                y: nearbyTrash.y,
                tile: null,
                layer: "background/furnitures/trash",
              },
            ]);
            WA.player.state[trashKey] = true;

            // Count how many trash have been collected
            const collectedCount = trashTiles.filter(
              ({ x, y }) => WA.player.state[getTrashKey(x, y)]
            ).length;

            if (collectedCount === trashTiles.length) {
              WA.chat.sendChatMessage(
                "رائع! لقد جمعت كل القمامة! لقد حصلت على نقاط خبرة.",
                "عايدة"
              );
              console.log("Level up placeholder: All trash collected!");
              incrementCompanionProgress();
            } else {
              WA.chat.sendChatMessage(
                `لقد التقطت بعض القمامة! (${collectedCount} من 4)`,
                "عايدة"
              );
            }
          }
        }
      } catch (error) {
        console.error("Error handling trash pickup:", error);
      }
    });
  } else {
    console.warn("WA API not available for trash pickup feature.");
  }
});

// Quest 10 Logic
WA.onInit().then(() => {
  WA.player.state.onVariableChange("quest10").subscribe((newValue) => {
    if (newValue === "solved") {
      incrementCompanionProgress();
    }
  });
});

WA.onInit().then(() => {
  WA.room.area.onEnter("quest10").subscribe(() => {
    if (WA.player.state.quest10 === "solved") {
      handleQuest10Solved();
    } else {
      handleQuest10Start();
    }
  });
});

function handleQuest10Solved() {
  WA.chat.sendChatMessage(
    "شكراً لمساعدتي في العثور على غرفة الصلاة",
    "عمر الحارس"
  );
}

function handleQuest10Start() {
  const playerName: string = WA.player.name || "Player";
  WA.chat.sendChatMessage(
    `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
    "عمر الحارس"
  );

  const triggerMessage = WA.ui.displayActionMessage({
    message: "اضغط على [مفتاح المسافة] للمساعدة في العثور على مكان للانسحاب.",
    callback: async () => {
      const coWebsite = await WA.nav.openCoWebSite(
        "https://komponentab.github.io/Innovation-Diwan-2025/guidingLight.html",
        true,
        "",
        70,
        1,
        true,
        true
      );
      triggerMessage.remove();
      setupQuest10LeaveHandler(coWebsite);
    },
  });
  WA.room.area.onLeave("quest10").subscribe({
    next: () => {
      triggerMessage.remove();
    },
  });
}

function setupQuest10LeaveHandler(coWebsite: any) {
  WA.room.area.onLeave("quest10").subscribe({
    next: () => {
      WA.chat.close();
      coWebsite.close();
    },
  });
}

// Quest 11 Logic
WA.onInit().then(() => {
  WA.player.state.onVariableChange("quest11").subscribe((newValue) => {
    if (newValue === "solved") {
      incrementCompanionProgress();
    }
  });
});

WA.onInit().then(() => {
  WA.room.area.onEnter("quest11").subscribe(() => {
    if (WA.player.state.quest11 === "solved") {
      handleQuest11Solved();
    } else {
      handleQuest11Start();
    }
  });
});

function handleQuest11Solved() {
  WA.chat.sendChatMessage(
    "شكراً لمساعدتك في إصلاح الأنابيب سابقاً!",
    "نور المهندس"
  );
}

function handleQuest11Start() {
  const playerName: string = WA.player.name || "Player";
  WA.chat.sendChatMessage(
    `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
    "نور المهندس"
  );

  const triggerMessage = WA.ui.displayActionMessage({
    message: "اضغط على [مفتاح المسافة] للمساعدة في إصلاح الأنابيب المتسربة",
    callback: async () => {
      const coWebsite = await WA.nav.openCoWebSite(
        "https://komponentab.github.io/Innovation-Diwan-2025/waterSaver.html",
        true,
        "",
        70,
        1,
        true,
        true
      );
      triggerMessage.remove();
      setupQuest11LeaveHandler(coWebsite);
    },
  });
  WA.room.area.onLeave("quest11").subscribe({
    next: () => {
      triggerMessage.remove();
    },
  });
}

function setupQuest11LeaveHandler(coWebsite: any) {
  WA.room.area.onLeave("quest11").subscribe({
    next: () => {
      WA.chat.close();
      coWebsite.close();
    },
  });
}

// Quest 12 Logic
WA.onInit().then(() => {
  WA.player.state.onVariableChange("quest12").subscribe((newValue) => {
    if (newValue === "solved") {
      incrementCompanionProgress();
    }
  });
});

WA.onInit().then(() => {
  WA.room.area.onEnter("quest12").subscribe(() => {
    if (WA.player.state.quest12 === "solved") {
      handleQuest12Solved();
    } else {
      handleQuest12Start();
    }
  });
});

function handleQuest12Solved() {
  WA.chat.sendChatMessage(
    "شكراً لمساعدتكم في إيجاد أماكن للاعتكاف.",
    "ناصر الأكبر"
  );
}

function handleQuest12Start() {
  const playerName: string = WA.player.name || "Player";
  WA.chat.sendChatMessage(
    `مرحباً، ${playerName}! هل يمكنك مساعدتي من فضلك؟`,
    "ناصر الأكبر"
  );

  const triggerMessage = WA.ui.displayActionMessage({
    message: "اضغط على [مفتاح المسافة] للمساعدة في العثور على مكان للانسحاب.",
    callback: async () => {
      const coWebsite = await WA.nav.openCoWebSite(
        "https://komponentab.github.io/Innovation-Diwan-2025/retreat.html",
        true,
        "",
        70,
        1,
        true,
        true
      );
      triggerMessage.remove();
      setupQuest12LeaveHandler(coWebsite);
    },
  });
  WA.room.area.onLeave("quest12").subscribe({
    next: () => {
      triggerMessage.remove();
      WA.chat.close();
    },
  });
}

function setupQuest12LeaveHandler(coWebsite: any) {
  WA.room.area.onLeave("quest12").subscribe({
    next: () => {
      WA.chat.close();
      coWebsite.close();
    },
  });
}

// Quest 13 logic
WA.onInit().then(() => {
  WA.room.area.onEnter("quest13").subscribe(() => {
    if (WA.player.state["quest13"] !== "solved") {
      WA.chat.sendChatMessage(
        "مرحبًا بك في غرفة البحث! هنا يمكنك استكشاف الأفكار الجديدة.",
        "عايدة"
      );
      WA.player.state.quest13 = "solved";
      incrementCompanionProgress();
    }
  });
  WA.room.area.onLeave("quest13").subscribe(() => {
    WA.chat.close();
  });
});

export {};

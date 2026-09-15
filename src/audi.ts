/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: any = undefined;

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    WA.room.area.onEnter("clock").subscribe(() => {
      const today = new Date();
      const time = today.getHours() + ":" + today.getMinutes();
      currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });

    WA.room.area.onLeave("clock").subscribe(closePopup);

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log("Scripting API Extra ready");
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

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
    toolTip: "فتح خريطة مصغرة",
    callback: () => {
      WA.ui.modal.openModal({
        title: "Map",
        src: "https://p.interacty.me/1680ee9453ff480c/iframe.html",
        allow: "",
        allowApi: true,
        position: "center",
        // Removed unsupported 'onClose' property
      });
    },
  });
});

export {};

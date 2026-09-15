/// <reference types="@workadventure/iframe-api-typings" />

(function () {
  // Dynamically load the external script
  const script = document.createElement("script");

  script.onload = () => {
    console.log("External iframe API loaded.");
  };
  document.head.appendChild(script);

  function handleModuleCompletionEvents(
    completionMessage,
    messageNpc,
    workbookName,
    returnMessage
  ) {
    console.log("🚩 Completion Event Script loaded");
    WA.onInit().then(() => {
      console.log(workbookName + " geladen", messageNpc);
      const checkState = () => {
        try {
          const stateValue = WA.player.state[workbookName];
          if (stateValue === "solved") {
            WA.chat.sendChatMessage(returnMessage, messageNpc);
          }
        } catch (error) {}
      };
      checkState();
    });

    // Validate H5P and externalDispatcher
    if (!window.H5P || !H5P.externalDispatcher) {
      console.error("H5P or externalDispatcher is not available.");
      return;
    }

    let instance;

    // Wait for H5P to initialize and grab the instance
    H5P.externalDispatcher.on("initialized", () => {
      instance = H5P.instances && H5P.instances[0] ? H5P.instances[0] : null;
    });

    // Listen to xAPI events
    H5P.externalDispatcher.on("xAPI", (event) => {
      if (!instance) return;

      // Trigger only on full completion
      if (instance.getScore() === instance.getMaxScore()) {
        console.log(
          `🚩 COMPLETED: ${instance.getScore()} / ${instance.getMaxScore()} for ${workbookName}`
        );
        if (WA.player.state[workbookName] !== "solved") {
          WA.player.state[workbookName] = "solved";
          console.log(
            workbookName + "🚩 State variable has been changed to solved: "
          );
          WA.chat.sendChatMessage(completionMessage, messageNpc);

          console.log(
            "🚩 Completion message sent: " +
              completionMessage +
              " to " +
              messageNpc
          );
          setTimeout(async () => {
            const coWebsites = await WA.nav.getCoWebSites();
            for (const coWebsite of coWebsites) {
              coWebsite.close();
            }
            WA.chat.close();
          }, 10000); // Close all co-websites after 10 seconds
        }
      }
    });
  }
  window.handleModuleCompletionEvents = handleModuleCompletionEvents;
})();

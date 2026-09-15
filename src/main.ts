/// <reference types="@workadventure/iframe-api-typings" />

console.log('Script started successfully');

// Waiting for the API to be ready
WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ',WA.player.tags)
  
  WA.room.onEnterLayer("building1-zone").subscribe(() => {
    WA.room.hideLayer("building1-roof");
    WA.room.hideLayer("building1-walls");
    WA.room.hideLayer("building1-sign");
  });
  WA.room.onLeaveLayer("building1-zone").subscribe(() => {
    WA.room.showLayer("building1-roof");
    WA.room.showLayer("building1-walls");
    WA.room.showLayer("building1-sign");
  });

  WA.room.onEnterLayer("building2-zone").subscribe(() => {
    WA.room.hideLayer("building2-roof");
    WA.room.hideLayer("building2-walls");
    WA.room.hideLayer("building2-sign");
  });
  WA.room.onLeaveLayer("building2-zone").subscribe(() => {
    WA.room.showLayer("building2-roof");
    WA.room.showLayer("building2-walls");
    WA.room.showLayer("building2-sign");
  });

  WA.room.area.onEnter("building2-focus").subscribe(() => {
    WA.room.hideLayer("facade-furniture-bg");
    WA.room.hideLayer("facade-furniture-fg");
    WA.room.hideLayer("facade");
  });
  WA.room.area.onLeave("building2-focus").subscribe(() => {
    WA.room.showLayer("facade-furniture-bg");
    WA.room.showLayer("facade-furniture-fg");
    WA.room.showLayer("facade");
  });
}).catch(e => console.error(e));

export {};

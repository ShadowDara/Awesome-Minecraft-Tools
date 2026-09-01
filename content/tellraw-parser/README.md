## tellraw-parser

Eine kleine TypeScript-Library zum Parsen von Minecraft-tellraw-Commands nach strukturierte JSON-Objekte.

Installation
npm install tellraw-parser
Beispiel

Input:

tellraw @a {"text":"-----------------","bold":true}

tellraw @a ["",{"text":"[","color":"white"},{"text":"Start Normal Mode","bold":true,"italic":true,"color":"green","clickEvent":{"action":"suggest_command","command":"/trigger timer_trigger set 3"}},{"text":"]","color":"white"}]

Output:

```js
[
  {
    command: "tellraw",
    target: "@a",
    json: {
      text: "-----------------",
      bold: true,
    },
  },
  {
    command: "tellraw",
    target: "@a",
    json: [
      "",
      {
        text: "[",
        color: "white",
      },
      {
        text: "Start Normal Mode",
        bold: true,
        italic: true,
        color: "green",
        clickEvent: {
          action: "suggest_command",
          command: "/trigger timer_trigger set 3",
        },
      },
      {
        text: "]",
        color: "white",
      },
    ],
  },
];
```
